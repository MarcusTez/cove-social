import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { Platform } from "react-native";
import { fetch } from "expo/fetch";
import * as SecureStore from "expo-secure-store";
import { setAccessToken, getAccessToken, queryClient } from "@/lib/query-client";

const REFRESH_TOKEN_KEY = "cove_refresh_token";

const API_BASE = process.env.EXPO_PUBLIC_COVE_API_URL;
if (!API_BASE) {
  throw new Error("EXPO_PUBLIC_COVE_API_URL is not set. Cannot connect to the Cove API.");
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CoveUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const attemptRefresh = useCallback(async (): Promise<boolean> => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        await removeRefreshToken();
        setAccessToken(null);
        return false;
      }

      const data = await res.json();
      setAccessToken(data.accessToken);
      await storeRefreshToken(data.refreshToken);

      const profileRes = await fetch(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${data.accessToken}` },
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData);
        return true;
      }

      setAccessToken(null);
      await removeRefreshToken();
      return false;
    } catch {
      setAccessToken(null);
      await removeRefreshToken();
      return false;
    }
  }, []);

  useEffect(() => {
    attemptRefresh().finally(() => setIsLoading(false));
  }, [attemptRefresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
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
    setAccessToken(data.accessToken);
    await storeRefreshToken(data.refreshToken);
    queryClient.clear();
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = await getRefreshToken();
    const token = getAccessToken();

    try {
      await fetch(`${API_BASE}/auth/logout`, {
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

    setAccessToken(null);
    await removeRefreshToken();
    queryClient.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }), [user, isLoading, login, logout]);

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
