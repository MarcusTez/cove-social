import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Platform,
  Image,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest, queryClient } from "@/lib/query-client";

const MAX_SHOW_COUNT = 4;

function getPromptKey(userId: string): string {
  return `profile_pic_prompt_shown_${userId}`;
}

async function getShowCount(userId: string): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(getPromptKey(userId));
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

async function incrementShowCount(userId: string): Promise<void> {
  try {
    const current = await getShowCount(userId);
    await AsyncStorage.setItem(getPromptKey(userId), String(current + 1));
  } catch {
    // silent fail
  }
}

async function markNeverShowAgain(userId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(getPromptKey(userId), String(MAX_SHOW_COUNT));
  } catch {
    // silent fail
  }
}

interface ProfilePicturePromptProps {
  userId: string;
  hasPhoto: boolean;
}

export function ProfilePicturePrompt({ userId, hasPhoto }: ProfilePicturePromptProps) {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const [visible, setVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUri, setUploadedUri] = useState<string | null>(null);

  useEffect(() => {
    if (hasPhoto || !userId) return;

    let cancelled = false;

    getShowCount(userId).then((count) => {
      if (!cancelled && count < MAX_SHOW_COUNT) {
        setVisible(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId, hasPhoto]);

  const handleDismiss = useCallback(() => {
    incrementShowCount(userId);
    setVisible(false);
  }, [userId]);

  const handlePickAndUpload = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]?.base64) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      const mimeType = asset.mimeType || "image/jpeg";
      const photoData = `data:${mimeType};base64,${asset.base64}`;
      await apiRequest("POST", "/api/mobile/profile/photos", {
        photoData,
        displayOrder: 0,
      });
      await markNeverShowAgain(userId);
      queryClient.invalidateQueries({ queryKey: ["/api/mobile/profile"] });
      setUploadedUri(asset.uri);
      setTimeout(() => {
        setVisible(false);
        setUploadedUri(null);
      }, 800);
    } catch {
      Alert.alert("Upload failed", "We couldn't save your photo. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [userId]);

  if (!visible) return null;

  const bottomPad = Math.max(insets.bottom, webBottomInset) + 24;
  const topPad = insets.top + webTopInset + 12;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { paddingBottom: bottomPad, paddingTop: topPad }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleDismiss}
            activeOpacity={0.6}
            testID="profile-pic-prompt-dismiss"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={18} color="#a3a3a3" />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.avatarPlaceholder}>
              {uploadedUri ? (
                <Image source={{ uri: uploadedUri }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person-outline" size={40} color="#d4d4d4" />
              )}
            </View>

            <Text style={styles.heading}>Add a profile picture</Text>

            <Text style={styles.body}>
              A profile picture helps personalise your account and makes it easier for others to recognise you. Choose a photo that represents you best.{"\n\n"}You can always change it later.
            </Text>

            <TouchableOpacity
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={handlePickAndUpload}
              disabled={uploading}
              activeOpacity={0.8}
              testID="profile-pic-prompt-upload"
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#fafafa" />
              ) : (
                <Text style={styles.uploadButtonText}>Choose a photo</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#F9F9F7",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 28,
  },
  closeButton: {
    position: "absolute",
    top: 18,
    right: 20,
    padding: 4,
  },
  content: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#f0f0ee",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    overflow: "hidden",
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  heading: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 22,
    color: "#171717",
    marginBottom: 14,
    textAlign: "center",
    lineHeight: 28,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#737373",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
    maxWidth: 300,
  },
  uploadButton: {
    backgroundColor: "#171717",
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    alignSelf: "stretch",
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#fafafa",
  },
});
