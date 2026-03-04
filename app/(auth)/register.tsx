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
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");

  const handleSubmit = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !confirmEmail.trim()) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      Alert.alert("Email mismatch", "The email addresses do not match.");
      return;
    }
    Alert.alert("Coming soon", "Registration will be connected to the backend API.");
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

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
            Complete the below to receive your invite code:
          </Text>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>First name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Alex"
                placeholderTextColor="#a3a3a3"
                autoCapitalize="words"
                autoCorrect={false}
                testID="register-first-name"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Last name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Smith"
                placeholderTextColor="#a3a3a3"
                autoCapitalize="words"
                autoCorrect={false}
                testID="register-last-name"
              />
            </View>

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
                testID="register-email"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm email</Text>
              <TextInput
                style={styles.input}
                value={confirmEmail}
                onChangeText={setConfirmEmail}
                placeholder="your@email.com"
                placeholderTextColor="#a3a3a3"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                testID="register-confirm-email"
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              activeOpacity={0.8}
              testID="register-button"
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By creating an account, you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
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
      </ScrollView>
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
    backgroundColor: "#ffffff",
  },
  button: {
    backgroundColor: "#171717",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
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
    textDecorationLine: "underline",
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
    textDecorationLine: "underline",
  },
});
