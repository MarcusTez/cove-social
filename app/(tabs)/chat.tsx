import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Chat {
  id: number;
  name: string;
  photoUrl: string;
  lastMessage: string;
  timestamp: string;
  unread?: boolean;
}

const MOCK_CHATS: Chat[] = [
  {
    id: 1,
    name: "Lena",
    photoUrl:
      "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsaW5nfGVufDF8fHx8MTc3MjQ1NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    lastMessage: "Perfect timing actually \u2013 I'm free this Thursday",
    timestamp: "10:30 AM",
    unread: true,
  },
  {
    id: 2,
    name: "Marcus",
    photoUrl:
      "https://images.unsplash.com/photo-1764084051711-45a3b7c84c06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBjYXN1YWwlMjBwb3J0cmFpdCUyMGhhcHB5fGVufDF8fHx8MTc3MjQ1NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    lastMessage: "That coffee ritual sounds amazing",
    timestamp: "Yesterday",
    unread: false,
  },
  {
    id: 3,
    name: "Sofia",
    photoUrl:
      "https://images.unsplash.com/photo-1758599543120-4e462429a4d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0JTIwb3V0ZG9vcnxlbnwxfHx8fDE3NzI0NTc0Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    lastMessage: "Would love to hear more about your side project!",
    timestamp: "Yesterday",
    unread: false,
  },
  {
    id: 4,
    name: "James",
    photoUrl:
      "https://images.unsplash.com/photo-1762708550141-2688121b9ebd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMGNyZWF0aXZlJTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyNDU3NDc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    lastMessage: "The Picturehouse always has great picks",
    timestamp: "1 Mar",
    unread: false,
  },
  {
    id: 5,
    name: "Aisha",
    photoUrl:
      "https://images.unsplash.com/photo-1771430905474-11adef6fe314?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0JTIwbGlmZXN0eWxlfGVufDF8fHx8MTc3MjQ1NzQ3OHww&ixlib=rb-4.1.0&q=80&w=1080",
    lastMessage: "Your dinner party sounds lovely",
    timestamp: "28 Feb",
    unread: false,
  },
];

function ChatRow({ chat, onPress }: { chat: Chat; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.chatRow}
      onPress={onPress}
      activeOpacity={0.6}
      testID={`chat-${chat.name}`}
    >
      <Image source={{ uri: chat.photoUrl }} style={styles.avatar} />
      <View style={styles.chatContent}>
        <View style={styles.chatTopRow}>
          <Text
            style={[styles.chatName, chat.unread && styles.chatNameUnread]}
            numberOfLines={1}
          >
            {chat.name}
          </Text>
          <View style={styles.chatMeta}>
            {chat.unread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>1</Text>
              </View>
            )}
            <Text
              style={[
                styles.chatTimestamp,
                chat.unread && styles.chatTimestampUnread,
              ]}
            >
              {chat.timestamp}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.chatMessage,
            chat.unread && styles.chatMessageUnread,
          ]}
          numberOfLines={1}
        >
          {chat.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const handleChatSelect = (chatId: number) => {
    router.push(`/chat/${chatId}`);
  };

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + webTopInset }]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
      </View>
      <FlatList
        data={MOCK_CHATS}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ChatRow chat={item} onPress={() => handleChatSelect(item.id)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        scrollEnabled={MOCK_CHATS.length > 0}
      />
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
