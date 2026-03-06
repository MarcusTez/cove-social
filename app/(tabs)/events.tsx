import { View, Text, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + webTopInset }]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.heading}>Events are coming soon</Text>
          <Text style={styles.body}>
            We're curating a selection of interesting things happening across the city.
          </Text>
          <Text style={styles.body}>
            Soon you'll be able to discover what's going on and find people from Cove to experience it with.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F7",
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
  content: {
    paddingHorizontal: 20,
    paddingVertical: 48,
    alignItems: "center",
  },
  textContainer: {
    maxWidth: 320,
    alignItems: "center",
  },
  heading: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 24,
    color: "#171717",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 32,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#737373",
    textAlign: "center",
    lineHeight: 24,
    marginTop: 8,
  },
});
