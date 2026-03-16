/*
 * ============================================================
 *  ENVIRONMENT CONFIGURATION — DEV vs PROD API ROUTING
 * ============================================================
 *
 *  Preview / Expo Go  (NODE_ENV = "development")
 *    → Auth routes (login, refresh, profile) are handled locally
 *      with mock dev credentials. No requests hit the live
 *      Cove API for these endpoints.
 *    → Dev credentials: miteshnaik@test.com / Test123!
 *
 *  Production / App Store  (NODE_ENV = "production")
 *    → All requests proxy to the live Cove API at
 *      https://www.cove-social.com/api/mobile
 *
 *  DO NOT change the production fallback URL or remove the
 *  NODE_ENV check without understanding the impact on both
 *  environments. This separation exists to prevent dev/preview
 *  builds from accidentally hitting the production API.
 * ============================================================
 */

export const IS_DEV = process.env.NODE_ENV !== "production";

export const COVE_API_BASE =
  process.env.EXPO_PUBLIC_COVE_API_URL || "https://www.cove-social.com/api/mobile";

export const DEV_AUTH = {
  EMAIL: "miteshnaik@test.com",
  PASSWORD: "Test123!",
  ACCESS_TOKEN: "dev-access-token-cove-local",
  REFRESH_TOKEN: "dev-refresh-token-cove-local",
  USER_ID: "dev-user-001",
} as const;

if (IS_DEV) {
  console.log("[ENV] Running in DEVELOPMENT mode — auth routes use local dev bypass");
  console.log(`[ENV] Dev login: ${DEV_AUTH.EMAIL}`);
} else {
  console.log(`[ENV] Running in PRODUCTION mode — proxying to ${COVE_API_BASE}`);
}
