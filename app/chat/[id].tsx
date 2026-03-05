import { useState, useRef } from "react";
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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { BlockModal } from "@/components/BlockModal";

interface Message {
  id: number;
  text: string;
  sender: "me" | "them";
  timestamp: string;
}

const MOCK_CONTACTS: Record<
  string,
  { name: string; photoUrl: string }
> = {
  "1": {
    name: "Lena",
    photoUrl:
      "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsaW5nfGVufDF8fHx8MTc3MjQ1NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  "2": {
    name: "Marcus",
    photoUrl:
      "https://images.unsplash.com/photo-1764084051711-45a3b7c84c06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBjYXN1YWwlMjBwb3J0cmFpdCUyMGhhcHB5fGVufDF8fHx8MTc3MjQ1NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  "3": {
    name: "Sofia",
    photoUrl:
      "https://images.unsplash.com/photo-1758599543120-4e462429a4d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0JTIwb3V0ZG9vcnxlbnwxfHx8fDE3NzI0NTc0Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  "4": {
    name: "James",
    photoUrl:
      "https://images.unsplash.com/photo-1762708550141-2688121b9ebd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMGNyZWF0aXZlJTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyNDU3NDc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  "5": {
    name: "Aisha",
    photoUrl:
      "https://images.unsplash.com/photo-1771430905474-11adef6fe314?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0JTIwbGlmZXN0eWxlfGVufDF8fHx8MTc3MjQ1NzQ3OHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
};

const MOCK_MESSAGES: Message[] = [
  {
    id: 1,
    text: "Hey! Love your intro profile \u2013 that Sunday ritual sounds perfect \u2600\uFE0F",
    sender: "them",
    timestamp: "9:15 AM",
  },
  {
    id: 2,
    text: "Thanks! Yeah it's my favourite part of the week honestly",
    sender: "me",
    timestamp: "9:18 AM",
  },
  {
    id: 3,
    text: "I saw you mentioned the comedy night \u2013 any recommendations?",
    sender: "them",
    timestamp: "9:20 AM",
  },
  {
    id: 4,
    text: "Oh definitely! There's this new place in Shoreditch that does open mic nights. Really intimate vibe",
    sender: "me",
    timestamp: "9:22 AM",
  },
  {
    id: 5,
    text: "That sounds great. Would love to check it out sometime",
    sender: "them",
    timestamp: "9:25 AM",
  },
  {
    id: 6,
    text: "For sure! They do it every Thursday. Let me know if you fancy going",
    sender: "me",
    timestamp: "9:28 AM",
  },
  {
    id: 7,
    text: "Perfect timing actually \u2013 I'm free this Thursday",
    sender: "them",
    timestamp: "10:30 AM",
  },
];

function MessageBubble({ message }: { message: Message }) {
  const isMe = message.sender === "me";

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
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            isMe ? styles.bubbleTextMe : styles.bubbleTextThem,
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.bubbleTime,
            isMe ? styles.bubbleTimeMe : styles.bubbleTimeThem,
          ]}
        >
          {message.timestamp}
        </Text>
      </View>
    </View>
  );
}

export default function ChatThreadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messageText, setMessageText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const contact = MOCK_CONTACTS[id || "1"] || MOCK_CONTACTS["1"];
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const handleSend = () => {
    if (messageText.trim()) {
      setMessageText("");
    }
  };

  const handleBlock = () => {
    setShowBlockModal(false);
    router.back();
  };

  const handleReport = () => {
    setShowMenu(false);
    Alert.alert("Report submitted", "Thank you for reporting. We'll review this.");
  };

  const handleViewProfile = () => {
    setShowMenu(false);
    router.push(`/profile/${id}`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
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
            <Image source={{ uri: contact.photoUrl }} style={styles.headerAvatar} />
          </TouchableOpacity>
          <Text style={styles.headerName}>{contact.name}</Text>

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
                    <Text style={styles.dropdownItemText}>View intro profile</Text>
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
                    <Text style={styles.dropdownItemTextDestructive}>Report user</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        <FlatList
          data={[...MOCK_MESSAGES].reverse()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          inverted
          keyboardDismissMode="interactive"
        />

        <View
          style={[
            styles.composer,
            { paddingBottom: Math.max(insets.bottom, webBottomInset) + 8 },
          ]}
        >
          <TextInput
            style={styles.composerInput}
            value={messageText}
            onChangeText={setMessageText}
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
        name={contact.name}
        visible={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlock}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
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
  headerName: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: "#171717",
    flex: 1,
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
});
