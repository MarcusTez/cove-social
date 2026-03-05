import type { Request, Response } from "express";
import { db } from "./db";
import { conversations, conversationParticipants, messages } from "../shared/schema";
import { eq, and, desc, lt, ne, gt, sql, count } from "drizzle-orm";

const userIdCache = new Map<string, { userId: string; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

const COVE_API_BASE = process.env.EXPO_PUBLIC_COVE_API_URL || "https://e4af2c56-d31e-4016-b6f4-4605cbfaf1bf-00-9jq2nkbugewe.worf.replit.dev/api/mobile";

export async function validateTokenAndGetUserId(authHeader: string | undefined): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);

  const cached = userIdCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.userId;
  }

  try {
    const res = await fetch(`${COVE_API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
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

export function extractUserIdFromTokenUnsafe(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    return payload.sub || payload.userId || payload.id || null;
  } catch {
    return null;
  }
}

export async function getConversations(req: Request, res: Response) {
  const userId = await validateTokenAndGetUserId(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const convRows = await db
      .select({
        convId: conversations.id,
        matchId: conversations.matchId,
        lastMessageAt: conversations.lastMessageAt,
        convCreatedAt: conversations.createdAt,
        myLastReadAt: conversationParticipants.lastReadAt,
      })
      .from(conversationParticipants)
      .innerJoin(conversations, eq(conversations.id, conversationParticipants.conversationId))
      .where(eq(conversationParticipants.userId, userId))
      .orderBy(desc(conversations.lastMessageAt));

    if (convRows.length === 0) {
      return res.json([]);
    }

    const conversationIds = convRows.map((r) => r.convId);

    const allPartners = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          sql`${conversationParticipants.conversationId} IN (${sql.join(conversationIds.map(id => sql`${id}`), sql`, `)})`,
          ne(conversationParticipants.userId, userId)
        )
      );

    const partnerMap = new Map(allPartners.map((p) => [p.conversationId, p]));

    const lastMessages = await Promise.all(
      conversationIds.map(async (convId) => {
        const [msg] = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, convId))
          .orderBy(desc(messages.createdAt))
          .limit(1);
        return { convId, msg: msg || null };
      })
    );
    const lastMsgMap = new Map(lastMessages.map((lm) => [lm.convId, lm.msg]));

    const unreadCounts = await Promise.all(
      convRows.map(async (row) => {
        const conditions = [
          eq(messages.conversationId, row.convId),
          ne(messages.senderId, userId),
        ];
        if (row.myLastReadAt) {
          conditions.push(gt(messages.createdAt, row.myLastReadAt));
        }
        const [result] = await db
          .select({ count: count() })
          .from(messages)
          .where(and(...conditions));
        return { convId: row.convId, count: result?.count ?? 0 };
      })
    );
    const unreadMap = new Map(unreadCounts.map((u) => [u.convId, u.count]));

    const results = convRows.map((row) => {
      const partner = partnerMap.get(row.convId);
      const lastMsg = lastMsgMap.get(row.convId);
      return {
        id: row.convId,
        matchId: row.matchId,
        partner: partner
          ? {
              userId: partner.userId,
              displayName: partner.displayName,
              photoUrl: partner.photoUrl,
            }
          : null,
        lastMessage: lastMsg
          ? {
              content: lastMsg.content,
              senderId: lastMsg.senderId,
              createdAt: lastMsg.createdAt.toISOString(),
            }
          : null,
        unreadCount: unreadMap.get(row.convId) ?? 0,
        lastMessageAt: row.lastMessageAt?.toISOString() || null,
        createdAt: row.convCreatedAt.toISOString(),
      };
    });

    res.json(results);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
}

export async function getMessages(req: Request, res: Response) {
  const userId = await validateTokenAndGetUserId(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;
  const cursor = req.query.cursor as string | undefined;
  const limit = Math.min(parseInt(req.query.limit as string) || 30, 100);

  try {
    const [participant] = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, id),
          eq(conversationParticipants.userId, userId)
        )
      );

    if (!participant) {
      return res.status(403).json({ error: "Not a participant in this conversation" });
    }

    let query = db
      .select()
      .from(messages)
      .where(
        cursor
          ? and(
              eq(messages.conversationId, id),
              lt(messages.createdAt, new Date(cursor))
            )
          : eq(messages.conversationId, id)
      )
      .orderBy(desc(messages.createdAt))
      .limit(limit + 1);

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
        createdAt: m.createdAt.toISOString(),
      })),
      nextCursor: hasMore
        ? messageList[messageList.length - 1].createdAt.toISOString()
        : null,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
}

export async function createConversation(req: Request, res: Response) {
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
    const existing = await db
      .select({ convId: conversationParticipants.conversationId })
      .from(conversationParticipants)
      .innerJoin(conversations, eq(conversations.id, conversationParticipants.conversationId))
      .where(
        and(
          eq(conversations.matchId, matchId),
          eq(conversationParticipants.userId, userId)
        )
      );

    if (existing.length > 0) {
      const [conv] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, existing[0].convId));
      return res.json({ id: conv.id, matchId: conv.matchId, created: false });
    }

    const [conv] = await db
      .insert(conversations)
      .values({ matchId })
      .returning();

    await db.insert(conversationParticipants).values([
      {
        conversationId: conv.id,
        userId,
        displayName: userName || "You",
        photoUrl: userPhotoUrl || null,
      },
      {
        conversationId: conv.id,
        userId: partnerId,
        displayName: partnerName,
        photoUrl: partnerPhotoUrl || null,
      },
    ]);

    res.status(201).json({ id: conv.id, matchId: conv.matchId, created: true });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
}

export async function sendMessage(req: Request, res: Response) {
  const userId = await validateTokenAndGetUserId(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;
  const { content, clientMessageId } = req.body;

  if (!content || !clientMessageId) {
    return res.status(400).json({ error: "content and clientMessageId are required" });
  }

  try {
    const [participant] = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, id),
          eq(conversationParticipants.userId, userId)
        )
      );

    if (!participant) {
      return res.status(403).json({ error: "Not a participant" });
    }

    const [existingMsg] = await db
      .select()
      .from(messages)
      .where(
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
        duplicate: true,
      });
    }

    const [msg] = await db
      .insert(messages)
      .values({
        conversationId: id,
        senderId: userId,
        clientMessageId,
        content,
      })
      .returning();

    await db
      .update(conversations)
      .set({ lastMessageAt: msg.createdAt, updatedAt: msg.createdAt })
      .where(eq(conversations.id, id));

    res.status(201).json({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      clientMessageId: msg.clientMessageId,
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
      duplicate: false,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
}

export async function markConversationRead(req: Request, res: Response) {
  const userId = await validateTokenAndGetUserId(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;

  try {
    const result = await db
      .update(conversationParticipants)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(conversationParticipants.conversationId, id),
          eq(conversationParticipants.userId, userId)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(403).json({ error: "Not a participant" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking read:", error);
    res.status(500).json({ error: "Failed to mark as read" });
  }
}
