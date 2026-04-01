import { db } from "./db";
import { rsvpTracking, pushTokens } from "../shared/schema";
import { eq, and } from "drizzle-orm";
import { COVE_API_BASE } from "./config";
import { sendExpoPushNotification } from "./notifications";

function extractRsvpStatus(eventData: unknown): string | null {
  if (!eventData || typeof eventData !== "object") return null;
  const d = eventData as Record<string, unknown>;

  if (typeof d.rsvpStatus === "string") return d.rsvpStatus;
  if (typeof d.userRsvpStatus === "string") return d.userRsvpStatus;
  if (typeof d.myRsvpStatus === "string") return d.myRsvpStatus;

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

async function pollRsvps(): Promise<void> {
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
        const resp = await fetch(eventUrl, {
          headers: {
            Authorization: row.userAuthToken,
            "Content-Type": "application/json",
          },
        });

        if (resp.status === 401) {
          console.log(`[poller] Token expired for user ${row.userId}, event ${row.eventId} — marking expired`);
          await db
            .update(rsvpTracking)
            .set({ tokenExpired: true, updatedAt: new Date() })
            .where(eq(rsvpTracking.id, row.id));
          continue;
        }

        if (!resp.ok) {
          console.log(`[poller] Skipping event ${row.eventId} — Cove API returned ${resp.status}`);
          continue;
        }

        const eventData = await resp.json();
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
