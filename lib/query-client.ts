import { fetch } from "expo/fetch";
import { QueryClient, QueryFunction } from "@tanstack/react-query";

let _accessToken: string | null = null;
let _refreshHandler: (() => Promise<boolean>) | null = null;
let _authFailureHandler: (() => void) | null = null;
let _pendingRefresh: Promise<boolean> | null = null;

export function setAccessToken(token: string | null): string | null {
  const prev = _accessToken;
  _accessToken = token;
  return prev;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

export function setRefreshHandler(fn: (() => Promise<boolean>) | null): void {
  _refreshHandler = fn;
}

export function setAuthFailureHandler(fn: (() => void) | null): void {
  _authFailureHandler = fn;
}

export function getApiUrl(): string {
  let host = process.env.EXPO_PUBLIC_DOMAIN;

  if (!host) {
    throw new Error("EXPO_PUBLIC_DOMAIN is not set");
  }

  let url = new URL(`https://${host}`);

  return url.href;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (_accessToken) {
    headers["Authorization"] = `Bearer ${_accessToken}`;
  }
  return headers;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

async function executeRefresh(): Promise<boolean> {
  if (!_refreshHandler) return false;
  if (_pendingRefresh) return _pendingRefresh;
  _pendingRefresh = _refreshHandler().finally(() => {
    _pendingRefresh = null;
  });
  return _pendingRefresh;
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);

  const makeRequest = () =>
    fetch(url.toString(), {
      method,
      headers: {
        ...getAuthHeaders(),
        ...(data ? { "Content-Type": "application/json" } : {}),
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

  let res = await makeRequest();

  if (res.status === 401 && _refreshHandler) {
    const refreshed = await executeRefresh();
    if (refreshed) {
      res = await makeRequest();
    } else {
      _authFailureHandler?.();
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join("/") as string, baseUrl);

    const makeRequest = () =>
      fetch(url.toString(), {
        headers: getAuthHeaders(),
        credentials: "include",
      });

    let res = await makeRequest();

    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }

      if (_refreshHandler) {
        const refreshed = await executeRefresh();
        if (refreshed) {
          res = await makeRequest();
        } else {
          _authFailureHandler?.();
        }
      }
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
