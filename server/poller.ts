import { db } from "./db";
import { rsvpTracking, pushTokens, userTokens } from "../shared/schema";
import { eq, and } from "drizzle-orm";
import { COVE_API_BASE } from "./config";
import { sendExpoPushNotification } from "./notifications";

function extractRsvpStatus(eventData: unknown): string | null {
  if (!eventData || typeof eventData !== "object") return null;
  const d = eventData as Record<string, unknown>;

  if (typeof d.rsvpStatus === "string") return d.rsvpStatus;
  if (typeof d.userRsvpStatus === "string") return d.userRsvpStatus;
  if (typeof d.myRsvpStatus === "string") return d.myRsvpStatus;
  if (typeof d.status === "string") return d.status;

  if (d.myRsvp && typeof d.myRsvp === "object") {
    const rsvp = d.myRsvp as Record<string, unknown>;
    if (typeof rsvp.status === "string") return rsvp.status;
  }

  if (d.rsvp && typeof d.rsvp === "object") {
    const rsvp = d.rsvp as Record<string, unknown>;
    if (typeof rsvp.status === "string") return rsvp.status;
  }

  if (d.event && typeof d.event === "object") {
    return extractRsvpStatus(d.event);
  }

  return null;
}

function isConfirmed(status: string | null): boolean {
  if (!status) return false;
  const lower = status.toLowerCase();
  return lower === "confirmed" || lower === "approved" || lower === "accepted";
}

function parseTokensFromBody(body: unknown): { accessToken: string | null; refreshToken: string | null } {
  if (!body || typeof body !== "object") return { accessToken: null, refreshToken: null };
  const d = body as Record<string, unknown>;

  const accessToken =
    (typeof d.accessToken === "string" ? d.accessToken : null) ??
    (typeof d.access_token === "string" ? d.access_token : null) ??
    (typeof d.token === "string" ? d.token : null) ??
    (d.data && typeof d.data === "object" ? parseTokensFromBody(d.data).accessToken : null);

  const refreshToken =
    (typeof d.refreshToken === "string" ? d.refreshToken : null) ??
    (typeof d.refresh_token === "string" ? d.refresh_token : null) ??
    (d.data && typeof d.data === "object" ? parseTokensFromBody(d.data).refreshToken : null);

  return { accessToken, refreshToken };
}

function getUserIdFromJwt(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    return payload.sub ?? payload.userId ?? payload.id ?? payload.user_id ?? null;
  } catch {
    return null;
  }
}

async function tryRefreshToken(userId: string): Promise<string | null> {
  const [stored] = await db
    .select()
    .from(userTokens)
    .where(eq(userTokens.userId, userId));

  if (!stored?.refreshToken) {
    console.log(`[poller] No refresh token stored for user ${userId}`);
    return null;
  }

  console.log(`[poller] Attempting token refresh for user ${userId}`);

  try {
    const refreshUrl = `${COVE_API_BASE}/auth/refresh`;
    const resp = await fetch(refreshUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: stored.refreshToken }),
    });

    if (!resp.ok) {
      console.log(`[poller] Refresh failed for user ${userId}: status ${resp.status}`);
      return null;
    }

    const body = await resp.json();
    const { accessToken, refreshToken } = parseTokensFromBody(body);

    if (!accessToken) {
      console.log(`[poller] Refresh response missing access token for user ${userId}`);
      return null;
    }

    await db
      .insert(userTokens)
      .values({
        userId,
        accessToken,
        refreshToken: refreshToken ?? stored.refreshToken,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userTokens.userId,
        set: {
          accessToken,
          refreshToken: refreshToken ?? stored.refreshToken,
          updatedAt: new Date(),
        },
      });

    await db
      .update(rsvpTracking)
      .set({ userAuthToken: `Bearer ${accessToken}`, tokenExpired: false, updatedAt: new Date() })
      .where(
        and(
          eq(rsvpTracking.userId, userId),
          eq(rsvpTracking.lastKnownStatus, "pending")
        )
      );

    console.log(`[poller] Token refreshed successfully for user ${userId}`);
    return `Bearer ${accessToken}`;
  } catch (err) {
    console.error(`[poller] Error refreshing token for user ${userId}:`, err);
    return null;
  }
}

export async function pollRsvps(): Promise<void> {
  try {
    const pending = await db
      .select()
      .from(rsvpTracking)
      .where(
        and(
          eq(rsvpTracking.lastKnownStatus, "pending"),
          eq(rsvpTracking.tokenExpired, false)
        )
      );

    if (pending.length === 0) {
      console.log("[poller] No pending RSVPs to check");
      return;
    }

    console.log(`[poller] Checking ${pending.length} pending RSVP(s)`);

    for (const row of pending) {
      try {
        const eventUrl = `${COVE_API_BASE}/events/${row.eventId}`;
        let authToken = row.userAuthToken;

        let resp = await fetch(eventUrl, {
          headers: {
            Authorization: authToken,
            "Content-Type": "application/json",
          },
        });

        if (resp.status === 401) {
          console.log(`[poller] Got 401 for user ${row.userId}, event ${row.eventId} — trying token refresh`);
          const newToken = await tryRefreshToken(row.userId);

          if (!newToken) {
            console.log(`[poller] Could not refresh token for user ${row.userId} — marking expired`);
            await db
              .update(rsvpTracking)
              .set({ tokenExpired: true, updatedAt: new Date() })
              .where(eq(rsvpTracking.id, row.id));
            continue;
          }

          authToken = newToken;
          resp = await fetch(eventUrl, {
            headers: {
              Authorization: authToken,
              "Content-Type": "application/json",
            },
          });

          if (resp.status === 401) {
            console.log(`[poller] Still 401 after refresh for user ${row.userId} — marking expired`);
            await db
              .update(rsvpTracking)
              .set({ tokenExpired: true, updatedAt: new Date() })
              .where(eq(rsvpTracking.id, row.id));
            continue;
          }
        }

        if (!resp.ok) {
          console.log(`[poller] Skipping event ${row.eventId} — Cove API returned ${resp.status}`);
          continue;
        }

        const eventData = await resp.json();

        console.log(`[poller] Raw event response for ${row.eventId}: ${JSON.stringify(eventData).slice(0, 500)}`);

        const status = extractRsvpStatus(eventData);

        console.log(`[poller] user=${row.userId} event=${row.eventId} eventName="${row.eventName}" rsvpStatus=${status ?? "(not found)"}`);

        if (status && isConfirmed(status)) {
          const [tokenRow] = await db
            .select()
            .from(pushTokens)
            .where(eq(pushTokens.userId, row.userId));

          if (tokenRow?.token) {
            const eventName = row.eventName ?? "your event";
            await sendExpoPushNotification(
              tokenRow.token,
              "You're Confirmed!",
              `Your spot at ${eventName} is secured. Tap to see the event.`,
              { eventId: row.eventId }
            );
            console.log(`[poller] Push notification sent to user ${row.userId} for event ${row.eventId}`);
          } else {
            console.log(`[poller] No push token found for user ${row.userId} — skipping notification`);
          }

          await db
            .update(rsvpTracking)
            .set({ lastKnownStatus: "confirmed", updatedAt: new Date() })
            .where(eq(rsvpTracking.id, row.id));
        }
      } catch (err) {
        console.error(`[poller] Error checking RSVP for user ${row.userId}, event ${row.eventId}:`, err);
      }
    }
  } catch (err) {
    console.error("[poller] Fatal error in pollRsvps:", err);
  }
}

export function startRsvpPoller(): void {
  console.log("[poller] RSVP status poller started — interval: 15 minutes, initial run in 30s");
  setTimeout(pollRsvps, 30_000);
  setInterval(pollRsvps, 15 * 60 * 1000);
}
