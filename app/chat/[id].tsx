import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { BlockModal } from "@/components/BlockModal";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useSocket, generateClientMessageId } from "@/lib/socket";
import { apiRequest, queryClient } from "@/lib/query-client";

interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  clientMessageId: string;
  content: string;
  createdAt: string;
  pending?: boolean;
}

interface ConversationData {
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

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MessageBubble({
  message,
  isMe,
}: {
  message: MessageItem;
  isMe: boolean;
}) {
  return (
    <View
      style={[
        styles.bubbleRow,
        isMe ? styles.bubbleRowMe : styles.bubbleRowThem,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleThem,
          message.pending && styles.bubblePending,
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            isMe ? styles.bubbleTextMe : styles.bubbleTextThem,
          ]}
        >
          {message.content}
        </Text>
        <Text
          style={[
            styles.bubbleTime,
            isMe ? styles.bubbleTimeMe : styles.bubbleTimeThem,
          ]}
        >
          {message.pending ? "Sending..." : formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}

export default function ChatThreadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const socket = useSocket();
  const [messageText, setMessageText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localMessages, setLocalMessages] = useState<MessageItem[]>([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const { data: conversationsData } = useQuery<ConversationData[]>({
    queryKey: ["/api/mobile/conversations"],
  });

  const conversation = conversationsData?.find((c) => c.id === id);
  const contact = conversation?.partner;

  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingMessages,
  } = useInfiniteQuery<{ messages: MessageItem[]; nextCursor: string | null }>({
    queryKey: ["/api/mobile/conversations", id, "messages"],
    queryFn: async ({ pageParam }) => {
      const url = pageParam
        ? `/api/mobile/conversations/${id}/messages?cursor=${pageParam}&limit=30`
        : `/api/mobile/conversations/${id}/messages?limit=30`;
      const res = await apiRequest("GET", url);
      return await res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!id,
  });

  const serverMessages =
    messagesData?.pages.flatMap((page) => page.messages) ?? [];

  const allMessages = [...localMessages, ...serverMessages].reduce<
    MessageItem[]
  >((acc, msg) => {
    if (!acc.find((m) => m.clientMessageId === msg.clientMessageId)) {
      acc.push(msg);
    }
    return acc;
  }, []);

  allMessages.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  useEffect(() => {
    if (!socket || !id) return;

    socket.emit("join_conversation", id);

    const handleNewMessage = (msg: MessageItem) => {
      if (msg.conversationId !== id) return;

      setLocalMessages((prev) => {
        const filtered = prev.filter(
          (m) => m.clientMessageId !== msg.clientMessageId
        );
        return [...filtered, msg];
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/mobile/conversations"],
      });
    };

    const handleMessageAck = (ack: MessageItem & { duplicate: boolean }) => {
      setLocalMessages((prev) =>
        prev.map((m) =>
          m.clientMessageId === ack.clientMessageId
            ? { ...ack, pending: false }
            : m
        )
      );
    };

    const handleTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === id && data.userId !== user?.id) {
        setIsPartnerTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsPartnerTyping(false);
        }, 3000);
      }
    };

    const handleStopTyping = (data: {
      conversationId: string;
      userId: string;
    }) => {
      if (data.conversationId === id && data.userId !== user?.id) {
        setIsPartnerTyping(false);
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message:ack", handleMessageAck);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.emit("leave_conversation", id);
      socket.off("new_message", handleNewMessage);
      socket.off("message:ack", handleMessageAck);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, id, user?.id]);

  useEffect(() => {
    if (!id) return;

    apiRequest("PATCH", `/api/mobile/conversations/${id}/read`).catch(() => {});

    queryClient.invalidateQueries({
      queryKey: ["/api/mobile/conversations"],
    });
  }, [id]);

  const handleSend = useCallback(() => {
    if (!messageText.trim() || !socket || !id || !user) return;

    const content = messageText.trim();
    const clientMessageId = generateClientMessageId();

    setMessageText("");

    const optimisticMessage: MessageItem = {
      id: clientMessageId,
      conversationId: id,
      senderId: user.id,
      clientMessageId,
      content,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setLocalMessages((prev) => [...prev, optimisticMessage]);

    socket.emit("send_message", {
      conversationId: id,
      content,
      clientMessageId,
    });

    socket.emit("stop_typing", id);
  }, [messageText, socket, id, user]);

  const handleTextChange = useCallback(
    (text: string) => {
      setMessageText(text);
      if (!socket || !id) return;

      if (text.length > 0) {
        socket.emit("typing", id);
      } else {
        socket.emit("stop_typing", id);
      }
    },
    [socket, id]
  );

  const handleBlock = () => {
    setShowBlockModal(false);
    router.back();
  };

  const handleReport = () => {
    setShowMenu(false);
    Alert.alert(
      "Report submitted",
      "Thank you for reporting. We'll review this."
    );
  };

  const handleViewProfile = () => {
    setShowMenu(false);
    if (conversation?.matchId) {
      router.push(`/profile/${conversation.matchId}`);
    }
  };

  const handleDeleteConversation = async () => {
    if (!id || isDeleting) return;
    setIsDeleting(true);
    try {
      await apiRequest("DELETE", `/api/mobile/conversations/${id}`);
      queryClient.invalidateQueries({
        queryKey: ["/api/mobile/conversations"],
      });
      setShowDeleteModal(false);
      router.back();
    } catch {
      Alert.alert("Error", "Failed to delete conversation. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View
        style={[styles.container, { paddingTop: insets.top + webTopInset }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
            testID="chat-back"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleViewProfile} activeOpacity={0.7}>
            {contact?.photoUrl ? (
              <Image
                source={{ uri: contact.photoUrl }}
                style={styles.headerAvatar}
              />
            ) : (
              <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder]}>
                <Text style={styles.headerAvatarText}>
                  {contact?.displayName?.charAt(0) || "?"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.headerNameContainer}>
            <Text style={styles.headerName}>
              {contact?.displayName || "Chat"}
            </Text>
            {isPartnerTyping && (
              <Text style={styles.typingIndicator}>typing...</Text>
            )}
          </View>

          <View>
            <TouchableOpacity
              onPress={() => setShowMenu(!showMenu)}
              style={styles.menuButton}
              activeOpacity={0.7}
              testID="chat-menu"
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#171717" />
            </TouchableOpacity>

            {showMenu && (
              <>
                <Pressable
                  style={StyleSheet.absoluteFill}
                  onPress={() => setShowMenu(false)}
                />
                <View style={styles.dropdown}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={handleViewProfile}
                    activeOpacity={0.6}
                    testID="menu-view-profile"
                  >
                    <Text style={styles.dropdownItemText}>View profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setShowMenu(false);
                      setShowBlockModal(true);
                    }}
                    activeOpacity={0.6}
                    testID="menu-block"
                  >
                    <Text style={styles.dropdownItemText}>Block user</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={handleReport}
                    activeOpacity={0.6}
                    testID="menu-report"
                  >
                    <Text style={styles.dropdownItemText}>
                      Report user
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setShowMenu(false);
                      setShowDeleteModal(true);
                    }}
                    activeOpacity={0.6}
                    testID="menu-delete-conversation"
                  >
                    <Text style={styles.dropdownItemTextDestructive}>
                      Delete conversation
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        {isLoadingMessages ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#737373" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={allMessages}
            keyExtractor={(item) => item.clientMessageId || item.id}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isMe={item.senderId === user?.id}
              />
            )}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            inverted
            keyboardDismissMode="interactive"
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator
                  size="small"
                  color="#737373"
                  style={{ marginVertical: 16 }}
                />
              ) : null
            }
            ListHeaderComponent={
              isPartnerTyping ? (
                <View style={[styles.bubbleRow, styles.bubbleRowThem]}>
                  <View style={[styles.bubble, styles.bubbleThem]}>
                    <Text style={[styles.bubbleText, styles.bubbleTextThem]}>
                      ...
                    </Text>
                  </View>
                </View>
              ) : null
            }
          />
        )}

        <View
          style={[
            styles.composer,
            {
              paddingBottom: Math.max(insets.bottom, webBottomInset) + 8,
            },
          ]}
        >
          <TextInput
            style={styles.composerInput}
            value={messageText}
            onChangeText={handleTextChange}
            placeholder="Message..."
            placeholderTextColor="#a3a3a3"
            multiline={false}
            testID="message-input"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !messageText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!messageText.trim()}
            activeOpacity={0.8}
            testID="send-button"
          >
            <Ionicons name="send" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <BlockModal
        name={contact?.displayName || "this user"}
        visible={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlock}
      />

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <Pressable
          style={styles.deleteModalOverlay}
          onPress={() => setShowDeleteModal(false)}
        >
          <Pressable style={styles.deleteModalContent} onPress={() => {}}>
            <Text style={styles.deleteModalTitle}>Delete conversation?</Text>
            <Text style={styles.deleteModalDescription}>
              Your conversation with {contact?.displayName || "this user"} will
              be permanently deleted. This action cannot be undone.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteModalCancelButton}
                onPress={() => setShowDeleteModal(false)}
                activeOpacity={0.7}
                testID="delete-cancel"
              >
                <Text style={styles.deleteModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalDeleteButton}
                onPress={handleDeleteConversation}
                activeOpacity={0.7}
                disabled={isDeleting}
                testID="delete-confirm"
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.deleteModalDeleteText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F9F9F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    gap: 10,
    zIndex: 10,
  },
  backButton: {
    padding: 6,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e5e5e5",
  },
  headerAvatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d4d4d4",
  },
  headerAvatarText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#ffffff",
  },
  headerNameContainer: {
    flex: 1,
  },
  headerName: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: "#171717",
  },
  typingIndicator: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#737373",
  },
  menuButton: {
    padding: 6,
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: 38,
    width: 190,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    overflow: "hidden",
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
      },
    }),
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownItemText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#171717",
  },
  dropdownItemTextDestructive: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#dc2626",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  bubbleRow: {
    flexDirection: "row",
  },
  bubbleRowMe: {
    justifyContent: "flex-end",
  },
  bubbleRowThem: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bubbleMe: {
    backgroundColor: "#171717",
  },
  bubbleThem: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  bubblePending: {
    opacity: 0.7,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextMe: {
    fontFamily: "Inter_400Regular",
    color: "#fafafa",
  },
  bubbleTextThem: {
    fontFamily: "Inter_400Regular",
    color: "#171717",
  },
  bubbleTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 4,
  },
  bubbleTimeMe: {
    color: "rgba(250, 250, 250, 0.7)",
  },
  bubbleTimeThem: {
    color: "#737373",
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#ffffff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e5e5",
    gap: 10,
  },
  composerInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#171717",
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  deleteModalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
  },
  deleteModalTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "#171717",
    marginBottom: 10,
  },
  deleteModalDescription: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#525252",
    lineHeight: 20,
    marginBottom: 24,
  },
  deleteModalButtons: {
    flexDirection: "row" as const,
    gap: 12,
  },
  deleteModalCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  deleteModalCancelText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#171717",
  },
  deleteModalDeleteButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#dc2626",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  deleteModalDeleteText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#ffffff",
  },
});
