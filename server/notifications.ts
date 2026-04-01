import { db } from "./db";
import { pushTokens } from "../shared/schema";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

export async function sendExpoPushNotification(
  token: string,
  title: string,
  body: string,
  data: Record<string, string>
) {
  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to: token, title, body, data, sound: "default" }),
    });

    const responseBody = await response.json() as Record<string, unknown>;

    if (!response.ok) {
      console.error("[push] Expo push API HTTP error:", response.status, JSON.stringify(responseBody));
      return;
    }

    const result = (responseBody.data as Record<string, unknown>) ?? responseBody;
    const status = result.status as string | undefined;

    if (status === "ok") {
      console.log(`[push] Delivered OK — id=${result.id} token=${token.slice(0, 30)}...`);
    } else {
      console.error(`[push] Delivery failed — status=${status} message=${result.message} details=${JSON.stringify(result.details)} token=${token.slice(0, 30)}...`);
    }
  } catch (err) {
    console.error("Failed to send Expo push notification:", err);
  }
}

export async function eventConfirmedWebhook(req: Request, res: Response) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    console.error("WEBHOOK_SECRET environment variable is not set");
    return res.status(500).json({ error: "Webhook not configured" });
  }
  const provided = req.get("x-webhook-secret");
  if (!provided || provided !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { userId, eventId, eventName, eventDate } = req.body;

  if (!userId || !eventId || !eventName || !eventDate) {
    return res.status(400).json({ error: "userId, eventId, eventName, and eventDate are required" });
  }

  try {
    const [tokenRow] = await db
      .select()
      .from(pushTokens)
      .where(eq(pushTokens.userId, userId));

    if (tokenRow?.token) {
      await sendExpoPushNotification(
        tokenRow.token,
        "You're in!",
        `Your spot at ${eventName} is confirmed. Check the app now for event details, location, and what to expect.`,
        { eventId: String(eventId) }
      );
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Error sending event confirmation notification:", error);
    return res.status(500).json({ error: "Failed to send notification" });
  }
}
