import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode, useRef } from "react";
import { Platform, AppState, AppStateStatus } from "react-native";
import { fetch } from "expo/fetch";
import * as SecureStore from "expo-secure-store";
import {
  setAccessToken,
  getAccessToken,
  queryClient,
  setRefreshHandler,
  setAuthFailureHandler,
} from "@/lib/query-client";
import { connectSocket, disconnectSocket } from "@/lib/socket";

const REFRESH_TOKEN_KEY = "cove_refresh_token";

const REFRESH_RETRY_DELAYS_MS = [500, 1000, 2000];

function getProxyBase(): string {
  const host = process.env.EXPO_PUBLIC_DOMAIN;
  if (!host) {
    throw new Error("EXPO_PUBLIC_DOMAIN is not set. Cannot connect to the API.");
  }
  return `https://${host}/api/mobile`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface CoveUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  londonAreas: string[];
  personalityWords: string[];
  regularRituals: string[];
  thisWeekActivities: string[];
  valuesLifestyle: string[];
  lifestylePreferences: string[];
  upcomingPlans: string[];
  socialWeekStyle: string;
  relationshipStatus: string;
  lifeStageCareer: string[];
  lifeStageSituation: string[];
  lifeStageGoals: string[];
  friendshipValues: string[];
  friendshipPractical: string[];
  problemReasons: string[];
  instagramHandle: string;
  linkedinUrl: string;
  commitmentLevel: string;
  selectedPlan: string;
  subscriptionStatus: string;
  planInterval: string;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  accountStatus: string;
  matchingOptIn: boolean;
  pauseUntil: string | null;
  adminHold: boolean;
  inviteCode: string;
  createdAt: string;
}

interface AuthContextValue {
  user: CoveUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionError: string | null;
  clearSessionError: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function storeRefreshToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch {
      // silent fail
    }
  } else {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  }
}

async function getRefreshToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  } else {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }
}

async function removeRefreshToken(): Promise<void> {
  if (Platform.OS === "web") {
    try {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // silent fail
    }
  } else {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
}

function validateMembershipStatus(user: CoveUser): void {
  if (user.accountStatus !== "active") {
    throw new Error("Your account is not active. Please contact support to reactivate your account.");
  }

  if (user.subscriptionStatus !== "active" && user.subscriptionStatus !== "trialing") {
    throw new Error("Your membership is inactive. Please renew your subscription at cove-social.com to continue.");
  }

  if (user.currentPeriodEnd) {
    const periodEnd = new Date(user.currentPeriodEnd);
    if (periodEnd.getTime() < Date.now()) {
      throw new Error("Your billing period has expired. Please update your payment method at cove-social.com to continue.");
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CoveUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const clearSessionError = useCallback(() => {
    setSessionError(null);
  }, []);

  const silentTokenRefresh = useCallback(async (): Promise<boolean> => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return false;

    for (let attempt = 0; attempt <= REFRESH_RETRY_DELAYS_MS.length; attempt++) {
      try {
        const res = await fetch(`${getProxyBase()}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) {
          if (res.status === 400 || res.status === 401 || res.status === 403) {
            await removeRefreshToken();
          }
          setAccessToken(null);
          return false;
        }

        const data = await res.json();
        setAccessToken(data.accessToken);
        await storeRefreshToken(data.refreshToken);
        return true;
      } catch {
        const delay = REFRESH_RETRY_DELAYS_MS[attempt];
        if (delay !== undefined) {
          await sleep(delay);
        } else {
          setAccessToken(null);
          return false;
        }
      }
    }

    setAccessToken(null);
    return false;
  }, []);

  const attemptRefresh = useCallback(async (): Promise<boolean> => {
    const tokenOk = await silentTokenRefresh();
    if (!tokenOk) return false;

    try {
      const accessToken = getAccessToken();
      const profileRes = await fetch(`${getProxyBase()}/profile`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();

        try {
          validateMembershipStatus(profileData);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Your session could not be restored.";
          setAccessToken(null);
          await removeRefreshToken();
          setSessionError(message);
          return false;
        }

        setSessionError(null);
        setUser(profileData);
        connectSocket(profileData.id);
        return true;
      }

      if (profileRes.status === 401 || profileRes.status === 403) {
        await removeRefreshToken();
      }
      setAccessToken(null);
      return false;
    } catch {
      setAccessToken(null);
      return false;
    }
  }, [silentTokenRefresh]);

  useEffect(() => {
    attemptRefresh().finally(() => setIsLoading(false));
  }, [attemptRefresh]);

  useEffect(() => {
    setRefreshHandler(silentTokenRefresh);
    setAuthFailureHandler(() => {
      setAccessToken(null);
      removeRefreshToken();
      disconnectSocket();
      queryClient.clear();
      setUser(null);
    });

    return () => {
      setRefreshHandler(null);
      setAuthFailureHandler(null);
    };
  }, [silentTokenRefresh]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      if (
        (prevState === "background" || prevState === "inactive") &&
        nextState === "active"
      ) {
        attemptRefresh();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [attemptRefresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${getProxyBase()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      const message = errorData?.error || "Login failed";
      throw new Error(message);
    }

    const data = await res.json();

    if (!data.user.hasActiveAccess) {
      throw new Error("You don't have an active membership. Please visit cove-social.com to get access.");
    }

    setAccessToken(data.accessToken);
    await storeRefreshToken(data.refreshToken);
    queryClient.clear();
    setSessionError(null);
    setUser(data.user);
    connectSocket(data.user.id);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = await getRefreshToken();
    const token = getAccessToken();

    try {
      await fetch(`${getProxyBase()}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // silent fail - still clear local state
    }

    disconnectSocket();
    setAccessToken(null);
    await removeRefreshToken();
    queryClient.clear();
    setSessionError(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    sessionError,
    clearSessionError,
    login,
    logout,
  }), [user, isLoading, sessionError, clearSessionError, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
