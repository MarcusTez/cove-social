/*
 * ============================================================
 *  ENVIRONMENT CONFIGURATION — DEV vs PROD API ROUTING
 * ============================================================
 *
 *  Development  (NODE_ENV = "development", i.e. Replit / Expo Go)
 *    → ALL routes proxy to the dev Cove API.
 *    → URL read from EXPO_PUBLIC_COVE_API_URL (required — the server
 *      will throw on startup if it is not set, preventing silent
 *      fallback to the production API).
 *    → Dev API: https://e4af2c56-d31e-4016-b6f4-4605cbfaf1bf-00-9jq2nkbugewe.worf.replit.dev/api/mobile
 *    → Set EXPO_PUBLIC_COVE_API_URL in Replit's environment variables
 *      (development scope) to that URL.
 *
 *  Production  (NODE_ENV = "production", i.e. App Store builds)
 *    → ALL routes proxy to the live prod Cove API.
 *    → URL is hardcoded below — EXPO_PUBLIC_COVE_API_URL is
 *      intentionally ignored in production so it can never be
 *      accidentally overridden by an env var.
 *
 *  DO NOT add a fallback to the prod URL for development.
 *  DO NOT change the prod URL below without a deliberate decision.
 * ============================================================
 */

const PROD_COVE_API = "https://www.cove-social.com/api/mobile";

export const IS_DEV = process.env.NODE_ENV === "development";

function resolveCoveApiBase(): string {
  if (!IS_DEV) {
    return PROD_COVE_API;
  }
  const devUrl = process.env.EXPO_PUBLIC_COVE_API_URL;
  if (!devUrl) {
    throw new Error(
      "[ENV] EXPO_PUBLIC_COVE_API_URL is not set.\n" +
      "In development, this variable is required to point to the dev Cove API.\n" +
      "Set it in Replit's environment variables (development scope) to:\n" +
      "https://e4af2c56-d31e-4016-b6f4-4605cbfaf1bf-00-9jq2nkbugewe.worf.replit.dev/api/mobile"
    );
  }
  return devUrl;
}

export const COVE_API_BASE = resolveCoveApiBase();

if (IS_DEV) {
  console.log(`[ENV] DEVELOPMENT — proxying all routes to dev Cove API: ${COVE_API_BASE}`);
} else {
  console.log(`[ENV] PRODUCTION — proxying all routes to prod Cove API: ${COVE_API_BASE}`);
}
