import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";

const COVE_API_BASE = process.env.EXPO_PUBLIC_COVE_API_URL || "https://e4af2c56-d31e-4016-b6f4-4605cbfaf1bf-00-9jq2nkbugewe.worf.replit.dev/api/mobile";

async function proxyToCove(req: Request, res: Response) {
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
  app.post("/api/mobile/blocks", proxyToCove);
  app.get("/api/mobile/matching-preferences", proxyToCove);
  app.put("/api/mobile/matching-preferences", proxyToCove);
  app.get("/api/mobile/subscription", proxyToCove);

  const httpServer = createServer(app);

  return httpServer;
}
