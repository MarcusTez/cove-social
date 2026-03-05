import { useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useSocket } from "@/lib/socket";
import { queryClient } from "@/lib/query-client";

interface ConversationItem {
  id: string;
  matchId: string;
  partner: {
    userId: string;
    displayName: string;
    photoUrl: string | null;
  } | null;
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  lastMessageAt: string | null;
  createdAt: string;
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { day: "numeric", month: "short" });
  }
}

function ChatRow({
  conversation,
  onPress,
}: {
  conversation: ConversationItem;
  onPress: () => void;
}) {
  const hasUnread = conversation.unreadCount > 0;
  const partner = conversation.partner;
  const lastMessage = conversation.lastMessage;

  return (
    <TouchableOpacity
      style={styles.chatRow}
      onPress={onPress}
      activeOpacity={0.6}
      testID={`chat-${partner?.displayName}`}
    >
      {partner?.photoUrl ? (
        <Image source={{ uri: partner.photoUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarPlaceholderText}>
            {partner?.displayName?.charAt(0) || "?"}
          </Text>
        </View>
      )}
      <View style={styles.chatContent}>
        <View style={styles.chatTopRow}>
          <Text
            style={[styles.chatName, hasUnread && styles.chatNameUnread]}
            numberOfLines={1}
          >
            {partner?.displayName || "Unknown"}
          </Text>
          <View style={styles.chatMeta}>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {conversation.unreadCount > 99
                    ? "99+"
                    : conversation.unreadCount}
                </Text>
              </View>
            )}
            {lastMessage && (
              <Text
                style={[
                  styles.chatTimestamp,
                  hasUnread && styles.chatTimestampUnread,
                ]}
              >
                {formatTimestamp(lastMessage.createdAt)}
              </Text>
            )}
          </View>
        </View>
        <Text
          style={[
            styles.chatMessage,
            hasUnread && styles.chatMessageUnread,
          ]}
          numberOfLines={1}
        >
          {lastMessage?.content || "No messages yet"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const socket = useSocket();

  const {
    data: conversations,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<ConversationItem[]>({
    queryKey: ["/api/mobile/conversations"],
  });

  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mobile/conversations"] });
    };

    socket.on("conversation_updated", handleConversationUpdated);

    return () => {
      socket.off("conversation_updated", handleConversationUpdated);
    };
  }, [socket]);

  const handleChatSelect = useCallback(
    (conversationId: string) => {
      router.push(`/chat/${conversationId}`);
    },
    [router]
  );

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + webTopInset }]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#737373" />
        </View>
      ) : !conversations || conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>
            Start a conversation from your introductions
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatRow
              conversation={item}
              onPress={() => handleChatSelect(item.id)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          scrollEnabled={conversations.length > 0}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    color: "#171717",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: "#171717",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#737373",
    textAlign: "center",
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e5e5e5",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d4d4d4",
  },
  avatarPlaceholderText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "#ffffff",
  },
  chatContent: {
    flex: 1,
    minWidth: 0,
  },
  chatTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#171717",
    flex: 1,
  },
  chatNameUnread: {
    fontFamily: "Inter_600SemiBold",
  },
  chatMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 8,
  },
  unreadBadge: {
    backgroundColor: "#171717",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  unreadBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "#ffffff",
  },
  chatTimestamp: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#737373",
  },
  chatTimestampUnread: {
    color: "#171717",
    fontFamily: "Inter_500Medium",
  },
  chatMessage: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#737373",
  },
  chatMessageUnread: {
    color: "#171717",
    fontFamily: "Inter_500Medium",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e5e5e5",
    marginLeft: 76,
  },
});
