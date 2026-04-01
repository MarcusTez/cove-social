/*
 * ============================================================
 *  API ROUTES — DEV / PROD ENVIRONMENT SPLIT
 * ============================================================
 *
 *  Development  (NODE_ENV = "development", i.e. Replit / Expo Go)
 *    → ALL /api/mobile/* routes proxy to the dev Cove API.
 *    → URL is set via EXPO_PUBLIC_COVE_API_URL env var.
 *    → Dev API: https://e4af2c56-d31e-4016-b6f4-4605cbfaf1bf-00-9jq2nkbugewe.worf.replit.dev/api/mobile
 *
 *  Production  (NODE_ENV = "production", i.e. App Store builds)
 *    → ALL /api/mobile/* routes proxy to the prod Cove API.
 *    → URL is hardcoded in server/config.ts.
 *
 *  The only routes NOT proxied are the local chat endpoints
 *  (/api/mobile/conversations/*) which hit our own PostgreSQL DB.
 *
 *  See server/config.ts for the full environment configuration.
 * ============================================================
 */

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import {
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
  markConversationRead,
  deleteConversation,
  deleteMessage,
  registerPushToken,
} from "./chat";
import { setupSocketIO } from "./socket";
import { COVE_API_BASE } from "./config";
import { eventConfirmedWebhook } from "./notifications";
import { db } from "./db";
import { rsvpTracking } from "../shared/schema";
import { eq, and } from "drizzle-orm";

function getUserIdFromAuth(authHeader?: string): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const token = authHeader.slice(7);
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf8")
    );
    return (
      payload.sub ??
      payload.userId ??
      payload.id ??
      payload.user_id ??
      null
    );
  } catch {
    return null;
  }
}

async function refreshStoredAuthToken(
  userId: string,
  authHeader: string
): Promise<void> {
  try {
    await db
      .update(rsvpTracking)
      .set({ userAuthToken: authHeader, tokenExpired: false, updatedAt: new Date() })
      .where(
        and(
          eq(rsvpTracking.userId, userId),
          eq(rsvpTracking.lastKnownStatus, "pending")
        )
      );
  } catch {
  }
}

async function proxyToCove(req: Request, res: Response) {
  const path = req.path.replace("/api/mobile", "");
  const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
  const targetUrl = `${COVE_API_BASE}${path}${queryString ? `?${queryString}` : ""}`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization as string;
    }

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD" && req.body && Object.keys(req.body).length > 0) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();

    res.status(response.status);

    response.headers.forEach((value, key) => {
      const skip = ["transfer-encoding", "content-encoding", "content-length", "connection"];
      if (!skip.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    res.setHeader("Content-Type", "application/json");
    res.send(data);

    if (req.headers.authorization) {
      const userId = getUserIdFromAuth(req.headers.authorization as string);
      if (userId) {
        refreshStoredAuthToken(userId, req.headers.authorization as string).catch(() => {});
      }
    }
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(502).json({ error: "Failed to reach Cove API" });
  }
}

async function rsvpPost(req: Request, res: Response) {
  const eventId = req.params.id;
  const path = req.path.replace("/api/mobile", "");
  const targetUrl = `${COVE_API_BASE}${path}`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization as string;
    }

    const fetchOptions: RequestInit = {
      method: "POST",
      headers,
    };

    if (req.body && Object.keys(req.body).length > 0) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();

    res.status(response.status);
    response.headers.forEach((value, key) => {
      const skip = ["transfer-encoding", "content-encoding", "content-length", "connection"];
      if (!skip.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });
    res.setHeader("Content-Type", "application/json");
    res.send(data);

    if (response.ok && req.headers.authorization) {
      const userId = getUserIdFromAuth(req.headers.authorization as string);
      if (userId) {
        let eventName: string | null = null;
        try {
          const parsed = JSON.parse(data);
          eventName =
            parsed?.eventName ??
            parsed?.event?.name ??
            parsed?.name ??
            null;
        } catch {
        }

        db.insert(rsvpTracking)
          .values({
            userId,
            eventId,
            lastKnownStatus: "pending",
            userAuthToken: req.headers.authorization as string,
            eventName,
            tokenExpired: false,
          })
          .onConflictDoUpdate({
            target: [rsvpTracking.userId, rsvpTracking.eventId],
            set: {
              lastKnownStatus: "pending",
              userAuthToken: req.headers.authorization as string,
              eventName: eventName ?? rsvpTracking.eventName,
              tokenExpired: false,
              updatedAt: new Date(),
            },
          })
          .catch((err: unknown) => {
            console.error("[rsvp] Failed to track RSVP:", err);
          });

        console.log(`[rsvp] Tracking RSVP for user=${userId} event=${eventId}`);
      }
    }
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(502).json({ error: "Failed to reach Cove API" });
  }
}

async function rsvpDelete(req: Request, res: Response) {
  const eventId = req.params.id;
  const path = req.path.replace("/api/mobile", "");
  const targetUrl = `${COVE_API_BASE}${path}`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization as string;
    }

    const response = await fetch(targetUrl, { method: "DELETE", headers });
    const data = await response.text();

    res.status(response.status);
    response.headers.forEach((value, key) => {
      const skip = ["transfer-encoding", "content-encoding", "content-length", "connection"];
      if (!skip.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });
    res.setHeader("Content-Type", "application/json");
    res.send(data);

    if (response.ok && req.headers.authorization) {
      const userId = getUserIdFromAuth(req.headers.authorization as string);
      if (userId) {
        db.delete(rsvpTracking)
          .where(
            and(
              eq(rsvpTracking.userId, userId),
              eq(rsvpTracking.eventId, eventId)
            )
          )
          .catch((err: unknown) => {
            console.error("[rsvp] Failed to remove RSVP tracking:", err);
          });

        console.log(`[rsvp] Removed tracking for user=${userId} event=${eventId}`);
      }
    }
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(502).json({ error: "Failed to reach Cove API" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/mobile/waitlist", proxyToCove);
  app.post("/api/mobile/auth/login", proxyToCove);
  app.post("/api/mobile/auth/refresh", proxyToCove);
  app.post("/api/mobile/auth/logout", proxyToCove);
  app.get("/api/mobile/profile", proxyToCove);
  app.patch("/api/mobile/profile", proxyToCove);
  app.delete("/api/mobile/profile", proxyToCove);
  app.get("/api/mobile/profile/photos", proxyToCove);
  app.post("/api/mobile/profile/photos", proxyToCove);
  app.delete("/api/mobile/profile/photos/:id", proxyToCove);
  app.get("/api/mobile/profile/prompts", proxyToCove);
  app.post("/api/mobile/profile/prompts", proxyToCove);
  app.put("/api/mobile/profile/prompts/:id", proxyToCove);
  app.delete("/api/mobile/profile/prompts/:id", proxyToCove);
  app.get("/api/mobile/matches", proxyToCove);
  app.get("/api/mobile/matches/:matchId", proxyToCove);
  app.post("/api/mobile/blocks", proxyToCove);
  app.get("/api/mobile/matching-preferences", proxyToCove);
  app.put("/api/mobile/matching-preferences", proxyToCove);
  app.get("/api/mobile/subscription", proxyToCove);
  app.get("/api/mobile/events", proxyToCove);
  app.get("/api/mobile/events/:id", proxyToCove);
  app.post("/api/mobile/events/:id/rsvp", rsvpPost);
  app.delete("/api/mobile/events/:id/rsvp", rsvpDelete);

  app.post("/api/mobile/push-token", registerPushToken);
  app.post("/api/webhooks/event-confirmed", eventConfirmedWebhook);

  app.get("/api/mobile/conversations", getConversations);
  app.post("/api/mobile/conversations", createConversation);
  app.get("/api/mobile/conversations/:id/messages", getMessages);
  app.post("/api/mobile/conversations/:id/messages", sendMessage);
  app.delete("/api/mobile/conversations/:id/messages/:messageId", deleteMessage);
  app.patch("/api/mobile/conversations/:id/read", markConversationRead);
  app.delete("/api/mobile/conversations/:id", deleteConversation);

  const httpServer = createServer(app);

  const allowedOrigins = new Set<string>();
  if (process.env.REPLIT_DEV_DOMAIN) {
    allowedOrigins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
  }
  if (process.env.REPLIT_DOMAINS) {
    process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
      allowedOrigins.add(`https://${d.trim()}`);
    });
  }

  setupSocketIO(httpServer, allowedOrigins);

  return httpServer;
}
