var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "node:http";

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  conversationParticipants: () => conversationParticipants,
  conversations: () => conversations,
  insertConversationSchema: () => insertConversationSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertUserSchema: () => insertUserSchema,
  messages: () => messages,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, primaryKey, uniqueIndex, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull(),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var conversationParticipants = pgTable(
  "conversation_participants",
  {
    conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
    userId: varchar("user_id").notNull(),
    displayName: varchar("display_name").notNull(),
    photoUrl: text("photo_url"),
    lastReadAt: timestamp("last_read_at")
  },
  (table) => [
    primaryKey({ columns: [table.conversationId, table.userId] })
  ]
);
var messages = pgTable(
  "messages",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
    senderId: varchar("sender_id").notNull(),
    clientMessageId: varchar("client_message_id").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (table) => [
    uniqueIndex("messages_conversation_client_msg_idx").on(
      table.conversationId,
      table.clientMessageId
    ),
    index("messages_conversation_created_at_idx").on(
      table.conversationId,
      table.createdAt
    )
  ]
);
var insertConversationSchema = createInsertSchema(conversations).pick({
  matchId: true
});
var insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  senderId: true,
  clientMessageId: true,
  content: true
});

// server/db.ts
var pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});
var db = drizzle(pool, { schema: schema_exports });

// server/chat.ts
import { eq, and, desc, lt, ne, sql as sql2 } from "drizzle-orm";

// server/config.ts
var PROD_COVE_API = "https://www.cove-social.com/api/mobile";
var IS_DEV = process.env.NODE_ENV === "development";
function resolveCoveApiBase() {
  if (!IS_DEV) {
    return PROD_COVE_API;
  }
  const devUrl = process.env.EXPO_PUBLIC_COVE_API_URL;
  if (!devUrl) {
    throw new Error(
      "[ENV] EXPO_PUBLIC_COVE_API_URL is not set.\nIn development, this variable is required to point to the dev Cove API.\nSet it in Replit's environment variables (development scope) to:\nhttps://e4af2c56-d31e-4016-b6f4-4605cbfaf1bf-00-9jq2nkbugewe.worf.replit.dev/api/mobile"
    );
  }
  return devUrl;
}
var COVE_API_BASE = resolveCoveApiBase();
if (IS_DEV) {
  console.log(`[ENV] DEVELOPMENT \u2014 proxying all routes to dev Cove API: ${COVE_API_BASE}`);
} else {
  console.log(`[ENV] PRODUCTION \u2014 proxying all routes to prod Cove API: ${COVE_API_BASE}`);
}

// server/chat.ts
var userIdCache = /* @__PURE__ */ new Map();
var CACHE_TTL_MS = 5 * 60 * 1e3;
async function validateTokenAndGetUserId(authHeader) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const cached = userIdCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.userId;
  }
  try {
    const res = await fetch(`${COVE_API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const profile = await res.json();
    const userId = profile.id;
    if (!userId) return null;
    userIdCache.set(token, { userId, expiresAt: Date.now() + CACHE_TTL_MS });
    return userId;
  } catch {
    return null;
  }
}
var partnerPhotoCache = /* @__PURE__ */ new Map();
var PHOTO_CACHE_TTL_MS = 15 * 60 * 1e3;
async function fetchPartnerPhotosFromMatches(authHeader) {
  const photoMap = /* @__PURE__ */ new Map();
  try {
    const res = await fetch(`${COVE_API_BASE}/matches`, {
      headers: { Authorization: authHeader }
    });
    if (!res.ok) return photoMap;
    const data = await res.json();
    const matches = data.matches || data || [];
    for (const match of matches) {
      const partner = match.partner;
      if (!partner?.id || !partner.photos?.length) continue;
      const sorted = [...partner.photos].sort((a, b) => a.displayOrder - b.displayOrder);
      const primaryPhoto = sorted[0]?.photoData;
      if (primaryPhoto) {
        photoMap.set(partner.id, primaryPhoto);
        partnerPhotoCache.set(partner.id, { photoData: primaryPhoto, expiresAt: Date.now() + PHOTO_CACHE_TTL_MS });
      }
    }
  } catch (err) {
    console.error("Error fetching partner photos from matches:", err);
  }
  return photoMap;
}
async function getConversations(req, res) {
  const userId = await validateTokenAndGetUserId(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const convRows = await db.select({
      convId: conversations.id,
      matchId: conversations.matchId,
      lastMessageAt: conversations.lastMessageAt,
      convCreatedAt: conversations.createdAt,
      myLastReadAt: conversationParticipants.lastReadAt
    }).from(conversationParticipants).innerJoin(conversations, eq(conversations.id, conversationParticipants.conversationId)).where(eq(conversationParticipants.userId, userId)).orderBy(desc(conversations.lastMessageAt));
    if (convRows.length === 0) {
      return res.json([]);
    }
    const conversationIds = convRows.map((r) => r.convId);
    const allPartners = await db.select().from(conversationParticipants).where(
      and(
        sql2`${conversationParticipants.conversationId} IN (${sql2.join(conversationIds.map((id) => sql2`${id}`), sql2`, `)})`,
        ne(conversationParticipants.userId, userId)
      )
    );
    const partnerMap = new Map(allPartners.map((p) => [p.conversationId, p]));
    const lastMsgRows = await db.execute(sql2`
      SELECT DISTINCT ON (conversation_id)
        id, conversation_id, sender_id, client_message_id, content, created_at
      FROM messages
      WHERE conversation_id IN (${sql2.join(conversationIds.map((id) => sql2`${id}`), sql2`, `)})
      ORDER BY conversation_id, created_at DESC
    `);
    const lastMsgMap = /* @__PURE__ */ new Map();
    for (const row of lastMsgRows.rows) {
      const r = row;
      lastMsgMap.set(r.conversation_id, {
        id: r.id,
        conversationId: r.conversation_id,
        senderId: r.sender_id,
        clientMessageId: r.client_message_id,
        content: r.content,
        createdAt: new Date(r.created_at)
      });
    }
    const unreadRows = await db.execute(sql2`
      SELECT m.conversation_id, COUNT(*)::int AS unread_count
      FROM messages m
      INNER JOIN conversation_participants cp
        ON cp.conversation_id = m.conversation_id AND cp.user_id = ${userId}
      WHERE m.conversation_id IN (${sql2.join(conversationIds.map((id) => sql2`${id}`), sql2`, `)})
        AND m.sender_id != ${userId}
        AND (cp.last_read_at IS NULL OR m.created_at > cp.last_read_at)
      GROUP BY m.conversation_id
    `);
    const unreadMap = /* @__PURE__ */ new Map();
    for (const row of unreadRows.rows) {
      const r = row;
      unreadMap.set(r.conversation_id, r.unread_count);
    }
    const partnersNeedingPhotos = allPartners.filter(
      (p) => !p.photoUrl
    );
    let matchPhotos = /* @__PURE__ */ new Map();
    if (partnersNeedingPhotos.length > 0 && req.headers.authorization) {
      const cachedPhotos = /* @__PURE__ */ new Map();
      const needsFetch = partnersNeedingPhotos.some((p) => {
        const cached = partnerPhotoCache.get(p.userId);
        if (cached && cached.expiresAt > Date.now() && cached.photoData) {
          cachedPhotos.set(p.userId, cached.photoData);
          return false;
        }
        return true;
      });
      if (needsFetch) {
        matchPhotos = await fetchPartnerPhotosFromMatches(req.headers.authorization);
      }
      for (const [k, v] of cachedPhotos) {
        if (!matchPhotos.has(k)) matchPhotos.set(k, v);
      }
    }
    const results = convRows.map((row) => {
      const partner = partnerMap.get(row.convId);
      const lastMsg = lastMsgMap.get(row.convId);
      const resolvedPhotoUrl = partner?.photoUrl || (partner ? matchPhotos.get(partner.userId) : null) || null;
      return {
        id: row.convId,
        matchId: row.matchId,
        partner: partner ? {
          userId: partner.userId,
          displayName: partner.displayName,
          photoUrl: resolvedPhotoUrl
        } : null,
        lastMessage: lastMsg ? {
          content: lastMsg.content,
          senderId: lastMsg.senderId,
          createdAt: lastMsg.createdAt.toISOString()
        } : null,
        unreadCount: unreadMap.get(row.convId) ?? 0,
        lastMessageAt: row.lastMessageAt?.toISOString() || null,
        createdAt: row.convCreatedAt.toISOString()
      };
    });
    res.json(results);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
}
async function getMessages(req, res) {
  const userId = await validateTokenAndGetUserId(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params;
  const cursor = req.query.cursor;
  const limit = Math.min(parseInt(req.query.limit) || 30, 100);
  try {
    const [participant] = await db.select().from(conversationParticipants).where(
      and(
        eq(conversationParticipants.conversationId, id),
        eq(conversationParticipants.userId, userId)
      )
    );
    if (!participant) {
      return res.status(403).json({ error: "Not a participant in this conversation" });
    }
    let query = db.select().from(messages).where(
      cursor ? and(
        eq(messages.conversationId, id),
        lt(messages.createdAt, new Date(cursor))
      ) : eq(messages.conversationId, id)
    ).orderBy(desc(messages.createdAt)).limit(limit + 1);
    const results = await query;
    const hasMore = results.length > limit;
    const messageList = results.slice(0, limit);
    res.json({
      messages: messageList.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        clientMessageId: m.clientMessageId,
        content: m.content,
        createdAt: m.createdAt.toISOString()
      })),
      nextCursor: hasMore ? messageList[messageList.length - 1].createdAt.toISOString() : null
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
}
async function createConversation(req, res) {
  const userId = await validateTokenAndGetUserId(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { matchId, partnerId, partnerName, userName } = req.body;
  let { partnerPhotoUrl, userPhotoUrl } = req.body;
  if (partnerPhotoUrl && (partnerPhotoUrl.startsWith("data:") || partnerPhotoUrl.length > 500)) {
    partnerPhotoUrl = null;
  }
  if (userPhotoUrl && (userPhotoUrl.startsWith("data:") || userPhotoUrl.length > 500)) {
    userPhotoUrl = null;
  }
  if (!matchId || !partnerId || !partnerName) {
    return res.status(400).json({ error: "matchId, partnerId, and partnerName are required" });
  }
  try {
    const existing = await db.select({ convId: conversationParticipants.conversationId }).from(conversationParticipants).innerJoin(conversations, eq(conversations.id, conversationParticipants.conversationId)).where(
      and(
        eq(conversations.matchId, matchId),
        eq(conversationParticipants.userId, userId)
      )
    );
    if (existing.length > 0) {
      const [conv2] = await db.select().from(conversations).where(eq(conversations.id, existing[0].convId));
      return res.json({ id: conv2.id, matchId: conv2.matchId, created: false });
    }
    const [conv] = await db.insert(conversations).values({ matchId }).returning();
    await db.insert(conversationParticipants).values([
      {
        conversationId: conv.id,
        userId,
        displayName: userName || "You",
        photoUrl: userPhotoUrl || null
      },
      {
        conversationId: conv.id,
        userId: partnerId,
        displayName: partnerName,
        photoUrl: partnerPhotoUrl || null
      }
    ]);
    res.status(201).json({ id: conv.id, matchId: conv.matchId, created: true });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
}
async function sendMessage(req, res) {
  const userId = await validateTokenAndGetUserId(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params;
  const { content, clientMessageId } = req.body;
  if (!content || !clientMessageId) {
    return res.status(400).json({ error: "content and clientMessageId are required" });
  }
  try {
    const [participant] = await db.select().from(conversationParticipants).where(
      and(
        eq(conversationParticipants.conversationId, id),
        eq(conversationParticipants.userId, userId)
      )
    );
    if (!participant) {
      return res.status(403).json({ error: "Not a participant" });
    }
    const [existingMsg] = await db.select().from(messages).where(
      and(
        eq(messages.conversationId, id),
        eq(messages.clientMessageId, clientMessageId)
      )
    );
    if (existingMsg) {
      return res.json({
        id: existingMsg.id,
        conversationId: existingMsg.conversationId,
        senderId: existingMsg.senderId,
        clientMessageId: existingMsg.clientMessageId,
        content: existingMsg.content,
        createdAt: existingMsg.createdAt.toISOString(),
        duplicate: true
      });
    }
    const [msg] = await db.insert(messages).values({
      conversationId: id,
      senderId: userId,
      clientMessageId,
      content
    }).returning();
    await db.update(conversations).set({ lastMessageAt: msg.createdAt, updatedAt: msg.createdAt }).where(eq(conversations.id, id));
    res.status(201).json({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      clientMessageId: msg.clientMessageId,
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
      duplicate: false
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
}
async function deleteConversation(req, res) {
  const userId = await validateTokenAndGetUserId(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params;
  try {
    const [participant] = await db.select().from(conversationParticipants).where(
      and(
        eq(conversationParticipants.conversationId, id),
        eq(conversationParticipants.userId, userId)
      )
    );
    if (!participant) {
      return res.status(403).json({ error: "Not a participant in this conversation" });
    }
    await db.delete(messages).where(eq(messages.conversationId, id));
    await db.delete(conversationParticipants).where(eq(conversationParticipants.conversationId, id));
    await db.delete(conversations).where(eq(conversations.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
}
async function markConversationRead(req, res) {
  const userId = await validateTokenAndGetUserId(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params;
  try {
    const result = await db.update(conversationParticipants).set({ lastReadAt: /* @__PURE__ */ new Date() }).where(
      and(
        eq(conversationParticipants.conversationId, id),
        eq(conversationParticipants.userId, userId)
      )
    ).returning();
    if (result.length === 0) {
      return res.status(403).json({ error: "Not a participant" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking read:", error);
    res.status(500).json({ error: "Failed to mark as read" });
  }
}

// server/socket.ts
import { Server } from "socket.io";
import { eq as eq2, and as and2, ne as ne2 } from "drizzle-orm";
var io = null;
function setupSocketIO(httpServer, allowedOrigins) {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin) || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
          callback(null, true);
        } else {
          callback(new Error("Origin not allowed"), false);
        }
      },
      methods: ["GET", "POST"],
      credentials: true
    },
    path: "/socket.io"
  });
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    const userId = await validateTokenAndGetUserId(token ? `Bearer ${token}` : void 0);
    if (!userId) {
      return next(new Error("Authentication required"));
    }
    socket.userId = userId;
    next();
  });
  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`Socket connected: user ${userId}`);
    socket.join(`user:${userId}`);
    socket.on("join_conversation", async (conversationId) => {
      try {
        const [participant] = await db.select().from(conversationParticipants).where(
          and2(
            eq2(conversationParticipants.conversationId, conversationId),
            eq2(conversationParticipants.userId, userId)
          )
        );
        if (participant) {
          socket.join(`conversation:${conversationId}`);
        }
      } catch (error) {
        console.error("Error joining conversation room:", error);
      }
    });
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });
    socket.on("send_message", async (data) => {
      try {
        const { conversationId, content, clientMessageId } = data;
        const [participant] = await db.select().from(conversationParticipants).where(
          and2(
            eq2(conversationParticipants.conversationId, conversationId),
            eq2(conversationParticipants.userId, userId)
          )
        );
        if (!participant) {
          socket.emit("message:error", { clientMessageId, error: "Not a participant" });
          return;
        }
        const [existingMsg] = await db.select().from(messages).where(
          and2(
            eq2(messages.conversationId, conversationId),
            eq2(messages.clientMessageId, clientMessageId)
          )
        );
        if (existingMsg) {
          socket.emit("message:ack", {
            id: existingMsg.id,
            clientMessageId,
            conversationId,
            senderId: existingMsg.senderId,
            content: existingMsg.content,
            createdAt: existingMsg.createdAt.toISOString(),
            duplicate: true
          });
          return;
        }
        const [msg] = await db.insert(messages).values({
          conversationId,
          senderId: userId,
          clientMessageId,
          content
        }).returning();
        await db.update(conversations).set({ lastMessageAt: msg.createdAt, updatedAt: msg.createdAt }).where(eq2(conversations.id, conversationId));
        const messagePayload = {
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          clientMessageId: msg.clientMessageId,
          content: msg.content,
          createdAt: msg.createdAt.toISOString()
        };
        socket.emit("message:ack", { ...messagePayload, duplicate: false });
        socket.to(`conversation:${conversationId}`).emit("new_message", messagePayload);
        const partners = await db.select().from(conversationParticipants).where(
          and2(
            eq2(conversationParticipants.conversationId, conversationId),
            ne2(conversationParticipants.userId, userId)
          )
        );
        for (const partner of partners) {
          io.to(`user:${partner.userId}`).emit("conversation_updated", {
            conversationId,
            lastMessage: {
              content: msg.content,
              senderId: msg.senderId,
              createdAt: msg.createdAt.toISOString()
            }
          });
        }
      } catch (error) {
        console.error("Error handling send_message:", error);
        socket.emit("message:error", {
          clientMessageId: data.clientMessageId,
          error: "Failed to send message"
        });
      }
    });
    socket.on("mark_read", async (conversationId) => {
      try {
        await db.update(conversationParticipants).set({ lastReadAt: /* @__PURE__ */ new Date() }).where(
          and2(
            eq2(conversationParticipants.conversationId, conversationId),
            eq2(conversationParticipants.userId, userId)
          )
        );
      } catch (error) {
        console.error("Error marking read:", error);
      }
    });
    socket.on("typing", (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit("typing", {
        conversationId,
        userId
      });
    });
    socket.on("stop_typing", (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit("stop_typing", {
        conversationId,
        userId
      });
    });
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: user ${userId}`);
    });
  });
  console.log("Socket.IO initialized");
  return io;
}

// server/routes.ts
async function proxyToCove(req, res) {
  const path2 = req.path.replace("/api/mobile", "");
  const queryString = new URLSearchParams(req.query).toString();
  const targetUrl = `${COVE_API_BASE}${path2}${queryString ? `?${queryString}` : ""}`;
  try {
    const headers = {
      "Content-Type": "application/json"
    };
    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization;
    }
    const fetchOptions = {
      method: req.method,
      headers
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
async function registerRoutes(app2) {
  app2.post("/api/mobile/waitlist", proxyToCove);
  app2.post("/api/mobile/auth/login", proxyToCove);
  app2.post("/api/mobile/auth/refresh", proxyToCove);
  app2.post("/api/mobile/auth/logout", proxyToCove);
  app2.get("/api/mobile/profile", proxyToCove);
  app2.patch("/api/mobile/profile", proxyToCove);
  app2.delete("/api/mobile/profile", proxyToCove);
  app2.get("/api/mobile/profile/photos", proxyToCove);
  app2.post("/api/mobile/profile/photos", proxyToCove);
  app2.delete("/api/mobile/profile/photos/:id", proxyToCove);
  app2.get("/api/mobile/profile/prompts", proxyToCove);
  app2.post("/api/mobile/profile/prompts", proxyToCove);
  app2.put("/api/mobile/profile/prompts/:id", proxyToCove);
  app2.delete("/api/mobile/profile/prompts/:id", proxyToCove);
  app2.get("/api/mobile/matches", proxyToCove);
  app2.get("/api/mobile/matches/:matchId", proxyToCove);
  app2.post("/api/mobile/blocks", proxyToCove);
  app2.get("/api/mobile/matching-preferences", proxyToCove);
  app2.put("/api/mobile/matching-preferences", proxyToCove);
  app2.get("/api/mobile/subscription", proxyToCove);
  app2.get("/api/mobile/conversations", getConversations);
  app2.post("/api/mobile/conversations", createConversation);
  app2.get("/api/mobile/conversations/:id/messages", getMessages);
  app2.post("/api/mobile/conversations/:id/messages", sendMessage);
  app2.patch("/api/mobile/conversations/:id/read", markConversationRead);
  app2.delete("/api/mobile/conversations/:id", deleteConversation);
  const httpServer = createServer(app2);
  const allowedOrigins = /* @__PURE__ */ new Set();
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

// server/index.ts
import * as fs from "fs";
import * as path from "path";
var app = express();
var log = console.log;
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }
    const origin = req.header("origin");
    const isLocalhost = origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:");
    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    express.json({
      limit: "5mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: false, limit: "5mb" }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path2 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path2.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);
  const html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();
  log("Serving static Expo files with dynamic manifest routing");
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName
      });
    }
    next();
  });
  app2.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app2.use(express.static(path.resolve(process.cwd(), "static-build")));
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
}
(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);
  configureExpoAndLanding(app);
  const server = await registerRoutes(app);
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`express server serving on port ${port}`);
    }
  );
})();
