import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Pressable,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetch } from "expo/fetch";
import { Ionicons } from "@expo/vector-icons";

const CITIES = [
  "London",
  "New York",
  "San Francisco",
  "Sydney",
  "Toronto",
  "Dubai",
  "Amsterdam",
  "Lisbon",
  "Barcelona",
];

const GENDERS = ["Woman", "Man", "Non-binary", "Prefer not to say"];

function getProxyBase(): string {
  const host = process.env.EXPO_PUBLIC_DOMAIN;
  if (!host) throw new Error("EXPO_PUBLIC_DOMAIN is not set");
  return `https://${host}/api/mobile`;
}

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !city || !gender) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`${getProxyBase()}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          city,
          gender,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message = errorData?.error || "Something went wrong. Please try again.";
        setErrorMessage(message);
        return;
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  if (submitted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.successContent}>
          <Ionicons name="checkmark-circle-outline" size={64} color="#171717" />
          <Text style={styles.successTitle}>You're on the list</Text>
          <Text style={styles.successMessage}>
            We've sent a verification email to {email.trim()}. Please check your inbox and click the link to confirm.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.back()}
            activeOpacity={0.8}
            testID="back-to-login"
          >
            <Text style={styles.buttonText}>Back to login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + webTopInset + 8,
            paddingBottom: insets.bottom + webBottomInset + 20,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        style={styles.container}
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
            testID="back-button"
          >
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Join Cove</Text>
          <Text style={styles.subtitle}>
            Join our waitlist and we'll send you an invite when a spot opens up.
          </Text>

          <View style={styles.form}>
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor="#a3a3a3"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
                testID="register-email"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>City</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowCityPicker(true)}
                activeOpacity={0.7}
                disabled={isSubmitting}
                testID="register-city"
              >
                <Text style={city ? styles.pickerText : styles.pickerPlaceholder}>
                  {city || "Select your city"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#a3a3a3" />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Gender</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowGenderPicker(true)}
                activeOpacity={0.7}
                disabled={isSubmitting}
                testID="register-gender"
              >
                <Text style={gender ? styles.pickerText : styles.pickerPlaceholder}>
                  {gender || "Select your gender"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#a3a3a3" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={isSubmitting}
              testID="register-button"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fafafa" />
              ) : (
                <Text style={styles.buttonText}>Join waitlist</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By joining, you agree to our{" "}
              <Text
                style={styles.termsLink}
                onPress={() => Linking.openURL("https://cove-social.com/terms").catch(() => {})}
                accessibilityRole="link"
                testID="terms-link"
              >
                Terms of Service
              </Text>{" "}
              and{" "}
              <Text
                style={styles.termsLink}
                onPress={() => Linking.openURL("https://cove-social.com/privacy").catch(() => {})}
                accessibilityRole="link"
                testID="privacy-link"
              >
                Privacy Policy
              </Text>
            </Text>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Already have an account?</Text>
              <TouchableOpacity
                onPress={() => router.back()}
                testID="go-to-login"
              >
                <Text style={styles.switchLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* VERSION: when bumping the app version, update this string AND app.json > "version" */}
        <Text style={styles.versionText}>v1.1.8</Text>
      </ScrollView>

      <Modal
        visible={showCityPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCityPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowCityPicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select city</Text>
            <FlatList
              data={CITIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalOption, city === item && styles.modalOptionSelected]}
                  onPress={() => {
                    setCity(item);
                    setShowCityPicker(false);
                  }}
                  testID={`city-option-${item.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <Text style={[styles.modalOptionText, city === item && styles.modalOptionTextSelected]}>
                    {item}
                  </Text>
                  {city === item ? <Ionicons name="checkmark" size={20} color="#171717" /> : null}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showGenderPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowGenderPicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select gender</Text>
            <FlatList
              data={GENDERS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalOption, gender === item && styles.modalOptionSelected]}
                  onPress={() => {
                    setGender(item);
                    setShowGenderPicker(false);
                  }}
                  testID={`gender-option-${item.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <Text style={[styles.modalOptionText, gender === item && styles.modalOptionTextSelected]}>
                    {item}
                  </Text>
                  {gender === item ? <Ionicons name="checkmark" size={20} color="#171717" /> : null}
                </TouchableOpacity>
              )}
            />
          </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
    alignSelf: "flex-start",
  },
  backArrow: {
    fontFamily: "Inter_400Regular",
    fontSize: 18,
    color: "#171717",
  },
  backText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#171717",
  },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 32,
    color: "#171717",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#737373",
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#171717",
  },
  input: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#171717",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#F9F9F7",
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#F9F9F7",
  },
  pickerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#171717",
  },
  pickerPlaceholder: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#a3a3a3",
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#dc2626",
  },
  button: {
    backgroundColor: "#171717",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#fafafa",
  },
  termsText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#737373",
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    textDecorationLine: "underline" as const,
    color: "#737373",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  switchText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#737373",
  },
  switchLink: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#171717",
    textDecorationLine: "underline" as const,
  },
  successContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  successTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    color: "#171717",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  successMessage: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#737373",
    textAlign: "center",
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "60%",
  },
  modalTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "#171717",
    textAlign: "center",
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  modalOptionSelected: {
    backgroundColor: "#f5f5f5",
  },
  modalOptionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#171717",
  },
  modalOptionTextSelected: {
    fontFamily: "Inter_500Medium",
  },
  versionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "center",
    paddingVertical: 16,
  },
});
