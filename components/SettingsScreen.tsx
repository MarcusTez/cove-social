import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/query-client";

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

type DeleteStep = "none" | "warning" | "confirm";
type FormView = "none" | "contact" | "safety";

export function SettingsScreen({ visible, onClose, subscriptionStatus }: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;
  const { logout, user } = useAuth();
  const [deleteStep, setDeleteStep] = useState<DeleteStep>("none");
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [formView, setFormView] = useState<FormView>("none");
  const [formEmail, setFormEmail] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirmed = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
    }
    setIsLoggingOut(false);
    setShowLogoutConfirm(false);
    onClose();
  };

  const handleCloseDelete = () => {
    setDeleteStep("none");
    setConfirmText("");
  };

  const handleDeleteConfirmed = async () => {
    setIsDeleting(true);
    try {
      await apiRequest("DELETE", "/api/mobile/profile");
    } catch {
    }
    setIsDeleting(false);
    setDeleteStep("none");
    setConfirmText("");
    onClose();
    await logout();
  };

  const openForm = (type: FormView) => {
    setFormEmail(user?.email || "");
    setFormSubject("");
    setFormMessage("");
    setFormView(type);
  };

  const closeForm = () => {
    setFormView("none");
    setFormEmail("");
    setFormSubject("");
    setFormMessage("");
  };

  const handleSubmitForm = async () => {
    if (!formEmail.trim() || !formSubject.trim() || !formMessage.trim()) {
      Alert.alert("Missing fields", "Please fill in all fields before submitting.");
      return;
    }
    setIsSubmittingForm(true);
    try {
      const recipient = "hello@cove-social.com";
      const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(formSubject.trim())}&body=${encodeURIComponent(formMessage.trim() + "\n\nFrom: " + formEmail.trim())}`;
      await Linking.openURL(mailtoUrl);
      Alert.alert(
        formView === "safety" ? "Report submitted" : "Message sent",
        formView === "safety"
          ? "Thank you for your report. Our team will review this promptly."
          : "Thank you for reaching out. We'll get back to you soon.",
      );
      closeForm();
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleClose = () => {
    setDeleteStep("none");
    setConfirmText("");
    setFormView("none");
    onClose();
  };

  if (formView !== "none") {
    const isSafety = formView === "safety";
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={closeForm}>
        <View
          style={[
            styles.container,
            {
              paddingTop: insets.top + webTopInset,
              paddingBottom: Math.max(insets.bottom, webBottomInset) + 12,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isSafety ? "Report a Safety Issue" : "Contact Support"}
            </Text>
            <TouchableOpacity onPress={closeForm} style={styles.closeButton} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#171717" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {isSafety && (
              <Text style={styles.formDescription}>
                Your safety is our priority. Please share details about any concerning behavior or violations of our community guidelines.
              </Text>
            )}

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Email</Text>
              <TextInput
                style={styles.formInput}
                value={formEmail}
                onChangeText={setFormEmail}
                placeholder="your@email.com"
                placeholderTextColor="#a3a3a3"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Subject</Text>
              <TextInput
                style={styles.formInput}
                value={formSubject}
                onChangeText={setFormSubject}
                placeholder={isSafety ? "Brief description of the issue" : "How can we help?"}
                placeholderTextColor="#a3a3a3"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>{isSafety ? "Details" : "Message"}</Text>
              <TextInput
                style={styles.formTextArea}
                value={formMessage}
                onChangeText={setFormMessage}
                placeholder={isSafety ? "Please provide as much detail as possible..." : "Tell us more about your issue..."}
                placeholderTextColor="#a3a3a3"
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.formSubmitButton}
              onPress={handleSubmitForm}
              activeOpacity={0.8}
              disabled={isSubmittingForm}
            >
              {isSubmittingForm ? (
                <ActivityIndicator color="#fafafa" />
              ) : (
                <Text style={styles.formSubmitText}>
                  {isSafety ? "Submit report" : "Send message"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  if (showLogoutConfirm) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={() => setShowLogoutConfirm(false)}>
        <View
          style={[
            styles.container,
            {
              paddingTop: insets.top + webTopInset,
              paddingBottom: Math.max(insets.bottom, webBottomInset) + 12,
            },
          ]}
        >
          <View style={styles.logoutContent}>
            <Text style={styles.logoutTitle}>Log out?</Text>
            <Text style={styles.logoutSubtitle}>
              Are you sure you want to log out of your account?
            </Text>
          </View>

          <View style={styles.deleteActions}>
            <TouchableOpacity
              style={styles.logoutConfirmButton}
              onPress={handleLogoutConfirmed}
              disabled={isLoggingOut}
              activeOpacity={0.7}
              testID="confirm-logout-button"
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.logoutConfirmText}>Log out</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowLogoutConfirm(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  if (deleteStep === "warning") {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={handleCloseDelete}>
        <View
          style={[
            styles.container,
            {
              paddingTop: insets.top + webTopInset,
              paddingBottom: Math.max(insets.bottom, webBottomInset) + 12,
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.deleteContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.warningIconContainer}>
              <Ionicons name="warning" size={32} color="#dc2626" />
            </View>

            <Text style={styles.deleteTitle}>Delete your account?</Text>
            <Text style={styles.deleteSubtitle}>
              This will permanently delete your account, profile, and all messages. This action cannot be undone.
            </Text>

            <View style={styles.deleteInfoCard}>
              <Text style={styles.deleteInfoTitle}>What will be deleted:</Text>
              <Text style={styles.deleteInfoItem}>• Your profile and photos</Text>
              <Text style={styles.deleteInfoItem}>• All your messages and conversations</Text>
              <Text style={styles.deleteInfoItem}>• Your membership and subscription</Text>
              <Text style={styles.deleteInfoItem}>• All your account data</Text>
            </View>
          </ScrollView>

          <View style={styles.deleteActions}>
            <TouchableOpacity
              style={styles.continueDeleteButton}
              onPress={() => setDeleteStep("confirm")}
              activeOpacity={0.7}
            >
              <Text style={styles.continueDeleteText}>Continue to delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCloseDelete}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  if (deleteStep === "confirm") {
    const isDeleteTyped = confirmText.trim().toUpperCase() === "DELETE";
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={handleCloseDelete}>
        <View
          style={[
            styles.container,
            {
              paddingTop: insets.top + webTopInset,
              paddingBottom: Math.max(insets.bottom, webBottomInset) + 12,
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.deleteContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.warningIconContainer}>
              <Ionicons name="warning" size={32} color="#dc2626" />
            </View>

            <Text style={styles.deleteTitle}>Are you absolutely sure?</Text>
            <Text style={styles.deleteSubtitle}>
              This is your final chance to change your mind. Once confirmed, your account will be permanently deleted.
            </Text>

            <Text style={styles.confirmLabel}>Type "DELETE" to confirm</Text>
            <TextInput
              style={styles.confirmInput}
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="DELETE"
              placeholderTextColor="#a3a3a3"
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </ScrollView>

          <View style={styles.deleteActions}>
            <TouchableOpacity
              style={[styles.finalDeleteButton, !isDeleteTyped && styles.finalDeleteButtonDisabled]}
              onPress={handleDeleteConfirmed}
              disabled={!isDeleteTyped || isDeleting}
              activeOpacity={0.7}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.finalDeleteText}>Delete my account permanently</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCloseDelete}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
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
          <TouchableOpacity onPress={handleClose} style={styles.closeButton} activeOpacity={0.7}>
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
              {subscriptionStatus === "active" || subscriptionStatus === "setup_complete" ? "Active" : subscriptionStatus || "—"}
            </Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.sectionSpacer} />
          <Text style={styles.sectionTitle}>Safety</Text>

          <SettingsRow label="Community guidelines" onPress={() => {}} />
          <View style={styles.divider} />

          <SettingsRow label="Contact support" onPress={() => openForm("contact")} />
          <View style={styles.divider} />

          <SettingsRow label="Report a safety issue" onPress={() => openForm("safety")} />
          <View style={styles.divider} />

          <View style={styles.sectionSpacer} />
          <Text style={styles.sectionTitle}>Account</Text>

          <SettingsRow label="Log out" onPress={handleLogout} />
          <View style={styles.divider} />

          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => Linking.openURL("https://cove-social.com/terms")} activeOpacity={0.6}>
              <Text style={styles.footerLinkText}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>·</Text>
            <TouchableOpacity onPress={() => Linking.openURL("https://cove-social.com/privacy")} activeOpacity={0.6}>
              <Text style={styles.footerLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setDeleteStep("warning")} activeOpacity={0.6}>
            <Text style={styles.footerDeleteText}>Delete account</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>v1.1.6</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F7",
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
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    gap: 8,
  },
  footerLinkText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#737373",
  },
  footerDot: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#737373",
  },
  footerDeleteText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#737373",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  formDescription: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#737373",
    lineHeight: 24,
    marginBottom: 24,
  },
  formField: {
    marginBottom: 24,
  },
  formLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#737373",
    marginBottom: 8,
  },
  formInput: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#171717",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
  },
  formTextArea: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#171717",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    minHeight: 180,
  },
  formActions: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  formSubmitButton: {
    backgroundColor: "#171717",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center" as const,
  },
  formSubmitText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#fafafa",
  },
  deleteContent: {
    paddingHorizontal: 20,
    paddingTop: 48,
    alignItems: "center",
  },
  warningIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  deleteTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 26,
    color: "#171717",
    textAlign: "center",
    marginBottom: 12,
  },
  deleteSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#737373",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  deleteInfoCard: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  deleteInfoTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#171717",
    marginBottom: 12,
  },
  deleteInfoItem: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#737373",
    lineHeight: 24,
  },
  deleteActions: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  continueDeleteButton: {
    borderWidth: 1,
    borderColor: "#dc2626",
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
  },
  continueDeleteText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#dc2626",
  },
  cancelButton: {
    backgroundColor: "#171717",
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#fafafa",
  },
  confirmLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#171717",
    alignSelf: "flex-start",
    marginBottom: 12,
    marginTop: 8,
  },
  confirmInput: {
    width: "100%",
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#171717",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
  },
  finalDeleteButton: {
    backgroundColor: "#f5c6c6",
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
  },
  finalDeleteButtonDisabled: {
    opacity: 0.5,
  },
  finalDeleteText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#dc2626",
  },
  versionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "center",
    paddingVertical: 16,
  },
  logoutContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  logoutTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 26,
    color: "#171717",
    textAlign: "center",
    marginBottom: 12,
  },
  logoutSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#737373",
    textAlign: "center",
    lineHeight: 22,
  },
  logoutConfirmButton: {
    backgroundColor: "#6b7280",
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center" as const,
  },
  logoutConfirmText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#ffffff",
  },
});
