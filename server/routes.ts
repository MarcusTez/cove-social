import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import {
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
  markConversationRead,
  deleteConversation,
} from "./chat";
import { setupSocketIO } from "./socket";
import { COVE_API_BASE, IS_DEV, DEV_AUTH } from "./config";

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
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(502).json({ error: "Failed to reach Cove API" });
  }
}

const DEV_USER = {
  id: DEV_AUTH.USER_ID,
  firstName: "Mitesh",
  lastName: "Naik",
  email: DEV_AUTH.EMAIL,
  gender: "male",
  londonAreas: ["Shoreditch"],
  personalityWords: ["Curious", "Adventurous"],
  regularRituals: ["Morning coffee"],
  thisWeekActivities: ["Working out"],
  valuesLifestyle: ["Growth"],
  lifestylePreferences: ["Active"],
  upcomingPlans: ["Weekend brunch"],
  socialWeekStyle: "balanced",
  relationshipStatus: "single",
  lifeStageCareer: ["Tech"],
  lifeStageSituation: ["Professional"],
  lifeStageGoals: ["Career growth"],
  friendshipValues: ["Honesty"],
  friendshipPractical: ["Reliable"],
  problemReasons: [],
  instagramHandle: "",
  linkedinUrl: "",
  commitmentLevel: "high",
  selectedPlan: "premium",
  subscriptionStatus: "active",
  planInterval: "monthly",
  currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  canceledAt: null,
  accountStatus: "active",
  matchingOptIn: true,
  pauseUntil: null,
  adminHold: false,
  inviteCode: "DEV001",
  createdAt: new Date().toISOString(),
  hasActiveAccess: true,
};

function registerDevAuthRoutes(app: Express) {
  app.post("/api/mobile/auth/login", (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (email === DEV_AUTH.EMAIL && password === DEV_AUTH.PASSWORD) {
      console.log("[DEV] Login successful for dev user");
      return res.json({
        accessToken: DEV_AUTH.ACCESS_TOKEN,
        refreshToken: DEV_AUTH.REFRESH_TOKEN,
        user: DEV_USER,
      });
    }
    return res.status(401).json({ error: "Invalid email or password" });
  });

  app.post("/api/mobile/auth/refresh", (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (refreshToken === DEV_AUTH.REFRESH_TOKEN) {
      console.log("[DEV] Token refresh successful for dev user");
      return res.json({
        accessToken: DEV_AUTH.ACCESS_TOKEN,
        refreshToken: DEV_AUTH.REFRESH_TOKEN,
      });
    }
    return res.status(401).json({ error: "Invalid refresh token" });
  });

  app.get("/api/mobile/profile", (req: Request, res: Response) => {
    const auth = req.headers.authorization;
    if (auth === `Bearer ${DEV_AUTH.ACCESS_TOKEN}`) {
      return res.json(DEV_USER);
    }
    return res.status(401).json({ error: "Unauthorized" });
  });

  app.post("/api/mobile/auth/logout", (_req: Request, res: Response) => {
    console.log("[DEV] Logout for dev user");
    return res.json({ success: true });
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  if (IS_DEV) {
    registerDevAuthRoutes(app);
  }

  app.post("/api/mobile/waitlist", proxyToCove);
  if (!IS_DEV) {
    app.post("/api/mobile/auth/login", proxyToCove);
    app.post("/api/mobile/auth/refresh", proxyToCove);
    app.post("/api/mobile/auth/logout", proxyToCove);
    app.get("/api/mobile/profile", proxyToCove);
  }
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

  app.get("/api/mobile/conversations", getConversations);
  app.post("/api/mobile/conversations", createConversation);
  app.get("/api/mobile/conversations/:id/messages", getMessages);
  app.post("/api/mobile/conversations/:id/messages", sendMessage);
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
