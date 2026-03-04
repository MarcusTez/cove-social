import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
  subscriptionStatus?: string;
}

function SettingsRow({
  label,
  onPress,
  destructive,
}: {
  label: string;
  onPress?: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.6}
      disabled={!onPress}
    >
      <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={destructive ? "#dc2626" : "#a3a3a3"} />
    </TouchableOpacity>
  );
}

export function SettingsScreen({ visible, onClose, subscriptionStatus }: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          onClose();
          await logout();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete account",
      "This action is permanent and cannot be undone. All your data will be deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Linking.openURL("mailto:support@cove-social.com?subject=Delete%20my%20account");
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + webTopInset,
            paddingBottom: Math.max(insets.bottom, webBottomInset),
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color="#171717" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Membership</Text>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Membership status</Text>
            <Text style={styles.statusValue}>
              {subscriptionStatus === "active" ? "Active" : subscriptionStatus || "—"}
            </Text>
          </View>
          <View style={styles.divider} />

          <SettingsRow label="Manage subscription" onPress={() => {}} />
          <View style={styles.divider} />

          <View style={styles.sectionSpacer} />
          <Text style={styles.sectionTitle}>Safety</Text>

          <SettingsRow label="Community guidelines" onPress={() => {}} />
          <View style={styles.divider} />

          <SettingsRow label="Contact support" onPress={() => {
            Linking.openURL("mailto:support@cove-social.com");
          }} />
          <View style={styles.divider} />

          <SettingsRow label="Report a safety issue" onPress={() => {
            Linking.openURL("mailto:safety@cove-social.com?subject=Safety%20Issue%20Report");
          }} />
          <View style={styles.divider} />

          <View style={styles.sectionSpacer} />
          <Text style={styles.sectionTitle}>Account</Text>

          <SettingsRow label="Log out" onPress={handleLogout} />
          <View style={styles.divider} />

          <SettingsRow label="Delete account" onPress={handleDeleteAccount} destructive />
          <View style={styles.divider} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  headerTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    color: "#171717",
  },
  closeButton: {
    padding: 6,
    marginRight: -6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 20,
    color: "#171717",
    marginBottom: 16,
  },
  sectionSpacer: {
    height: 16,
  },
  statusRow: {
    paddingVertical: 12,
  },
  statusLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#737373",
    marginBottom: 4,
  },
  statusValue: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#171717",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  rowLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#171717",
  },
  rowLabelDestructive: {
    color: "#dc2626",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e5e5e5",
  },
});
