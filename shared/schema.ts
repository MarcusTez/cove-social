import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, primaryKey, uniqueIndex, index, pgEnum, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const conversations = pgTable("conversations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull(),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    conversationId: varchar("conversation_id")
      .notNull()
      .references(() => conversations.id),
    userId: varchar("user_id").notNull(),
    displayName: varchar("display_name").notNull(),
    photoUrl: text("photo_url"),
    lastReadAt: timestamp("last_read_at"),
  },
  (table) => [
    primaryKey({ columns: [table.conversationId, table.userId] }),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    conversationId: varchar("conversation_id")
      .notNull()
      .references(() => conversations.id),
    senderId: varchar("sender_id").notNull(),
    clientMessageId: varchar("client_message_id").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("messages_conversation_client_msg_idx").on(
      table.conversationId,
      table.clientMessageId
    ),
    index("messages_conversation_created_at_idx").on(
      table.conversationId,
      table.createdAt
    ),
  ]
);

export const pushTokenPlatformEnum = pgEnum("push_token_platform", ["ios", "android", "web"]);

export const pushTokens = pgTable("push_tokens", {
  userId: varchar("user_id").primaryKey(),
  token: text("token").notNull(),
  platform: pushTokenPlatformEnum("platform").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPushTokenSchema = createInsertSchema(pushTokens).pick({
  token: true,
  platform: true,
});

export type PushToken = typeof pushTokens.$inferSelect;
export type InsertPushToken = z.infer<typeof insertPushTokenSchema>;

export const insertConversationSchema = createInsertSchema(conversations).pick({
  matchId: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  senderId: true,
  clientMessageId: true,
  content: true,
});

export type Conversation = typeof conversations.$inferSelect;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export const userTokens = pgTable("user_tokens", {
  userId: varchar("user_id").primaryKey(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserToken = typeof userTokens.$inferSelect;

export const rsvpTracking = pgTable(
  "rsvp_tracking",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    eventId: varchar("event_id").notNull(),
    lastKnownStatus: varchar("last_known_status").notNull().default("pending"),
    userAuthToken: text("user_auth_token").notNull(),
    eventName: text("event_name"),
    tokenExpired: boolean("token_expired").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("rsvp_tracking_user_event_idx").on(table.userId, table.eventId),
  ]
);

export type RsvpTracking = typeof rsvpTracking.$inferSelect;
