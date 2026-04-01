import { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";
import { db } from "./db";
import { conversations, conversationParticipants, messages, pushTokens } from "../shared/schema";
import { eq, and, ne } from "drizzle-orm";
import { validateTokenAndGetUserId } from "./chat";
import { sendExpoPushNotification } from "./notifications";

let io: Server | null = null;

export function getIO(): Server | null {
  return io;
}

export function setupSocketIO(httpServer: HttpServer, allowedOrigins: Set<string>) {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (
          !origin ||
          allowedOrigins.has(origin) ||
          origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:")
        ) {
          callback(null, true);
        } else {
          callback(new Error("Origin not allowed"), false);
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io",
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    const userId = await validateTokenAndGetUserId(token ? `Bearer ${token}` : undefined);
    if (!userId) {
      return next(new Error("Authentication required"));
    }
    (socket as any).userId = userId;
    next();
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId as string;
    console.log(`Socket connected: user ${userId}`);

    socket.join(`user:${userId}`);

    socket.on("join_conversation", async (conversationId: string) => {
      try {
        const [participant] = await db
          .select()
          .from(conversationParticipants)
          .where(
            and(
              eq(conversationParticipants.conversationId, conversationId),
              eq(conversationParticipants.userId, userId)
            )
          );

        if (participant) {
          socket.join(`conversation:${conversationId}`);
        }
      } catch (error) {
        console.error("Error joining conversation room:", error);
      }
    });

    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on("send_message", async (data: {
      conversationId: string;
      content: string;
      clientMessageId: string;
    }) => {
      try {
        const { conversationId, content, clientMessageId } = data;

        const [participant] = await db
          .select()
          .from(conversationParticipants)
          .where(
            and(
              eq(conversationParticipants.conversationId, conversationId),
              eq(conversationParticipants.userId, userId)
            )
          );

        if (!participant) {
          socket.emit("message:error", { clientMessageId, error: "Not a participant" });
          return;
        }

        const [existingMsg] = await db
          .select()
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conversationId),
              eq(messages.clientMessageId, clientMessageId)
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
            duplicate: true,
          });
          return;
        }

        const [msg] = await db
          .insert(messages)
          .values({
            conversationId,
            senderId: userId,
            clientMessageId,
            content,
          })
          .returning();

        await db
          .update(conversations)
          .set({ lastMessageAt: msg.createdAt, updatedAt: msg.createdAt })
          .where(eq(conversations.id, conversationId));

        const messagePayload = {
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          clientMessageId: msg.clientMessageId,
          content: msg.content,
          createdAt: msg.createdAt.toISOString(),
        };

        socket.emit("message:ack", { ...messagePayload, duplicate: false });

        socket.to(`conversation:${conversationId}`).emit("new_message", messagePayload);

        const [senderParticipant] = await db
          .select()
          .from(conversationParticipants)
          .where(
            and(
              eq(conversationParticipants.conversationId, conversationId),
              eq(conversationParticipants.userId, userId)
            )
          );
        const senderName = senderParticipant?.displayName ?? "Someone";

        const partners = await db
          .select()
          .from(conversationParticipants)
          .where(
            and(
              eq(conversationParticipants.conversationId, conversationId),
              ne(conversationParticipants.userId, userId)
            )
          );

        for (const partner of partners) {
          io!.to(`user:${partner.userId}`).emit("conversation_updated", {
            conversationId,
            lastMessage: {
              content: msg.content,
              senderId: msg.senderId,
              createdAt: msg.createdAt.toISOString(),
            },
          });

          const conversationRoom = io!.sockets.adapter.rooms.get(`conversation:${conversationId}`);
          const partnerSockets = await io!.in(`user:${partner.userId}`).fetchSockets();
          const partnerInRoom = partnerSockets.some((s) =>
            conversationRoom?.has(s.id)
          );

          if (!partnerInRoom) {
            const [tokenRow] = await db
              .select()
              .from(pushTokens)
              .where(eq(pushTokens.userId, partner.userId));

            if (tokenRow?.token) {
              const preview = msg.content.length > 100 ? msg.content.slice(0, 97) + "..." : msg.content;
              await sendExpoPushNotification(
                tokenRow.token,
                senderName,
                preview,
                { conversationId }
              );
            }
          }
        }
      } catch (error) {
        console.error("Error handling send_message:", error);
        socket.emit("message:error", {
          clientMessageId: data.clientMessageId,
          error: "Failed to send message",
        });
      }
    });

    socket.on("mark_read", async (conversationId: string) => {
      try {
        await db
          .update(conversationParticipants)
          .set({ lastReadAt: new Date() })
          .where(
            and(
              eq(conversationParticipants.conversationId, conversationId),
              eq(conversationParticipants.userId, userId)
            )
          );
      } catch (error) {
        console.error("Error marking read:", error);
      }
    });

    socket.on("typing", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("typing", {
        conversationId,
        userId,
      });
    });

    socket.on("stop_typing", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("stop_typing", {
        conversationId,
        userId,
      });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: user ${userId}`);
    });
  });

  console.log("Socket.IO initialized");
  return io;
}
