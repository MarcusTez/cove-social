import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from "react-native";

interface BlockModalProps {
  name: string;
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function BlockModal({ name, visible, onClose, onConfirm }: BlockModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={() => {}}>
          <Text style={styles.title}>Block {name}?</Text>
          <Text style={styles.description}>
            Blocking will remove this chat and you won't be introduced again.
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.8}
              testID="block-cancel"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.blockButton}
              onPress={onConfirm}
              activeOpacity={0.8}
              testID="block-confirm"
            >
              <Text style={styles.blockButtonText}>Block</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 20,
    color: "#171717",
    marginBottom: 12,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#737373",
    lineHeight: 22,
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#171717",
  },
  blockButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  blockButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#ffffff",
  },
});
