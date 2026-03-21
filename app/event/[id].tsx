import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { findEventById, STATUS_COLORS } from "@/lib/events-data";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.85;

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const event = findEventById(id);

  if (!event) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + webTopInset }]}>
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + webTopInset + 12 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="#171717" />
        </TouchableOpacity>
        <Text style={styles.notFoundText}>Event not found</Text>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[event.status];
  const isSoldOut = event.status === "SOLD OUT";

  const handleBook = () => {
    if (isSoldOut) {
      Alert.alert("Join Waitlist", "You'll be notified if a spot becomes available.");
    } else {
      Alert.alert("Booking confirmed", `You're booked for ${event.title}.`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: event.imageUrl }}
            style={[styles.heroImage, { height: IMAGE_HEIGHT }]}
            resizeMode="cover"
          />
          <View
            style={[
              styles.imageOverlay,
              { paddingTop: insets.top + webTopInset + 8 },
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={22} color="#fafafa" />
            </TouchableOpacity>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{event.category}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.dateLine}>
            {event.date}, {event.time}–{event.endTime}
          </Text>
          <Text style={styles.venue}>{event.venue}</Text>

          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {event.status}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Ionicons name="ticket-outline" size={16} color="#525252" />
            <Text style={styles.priceText}>{event.price}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Event details</Text>
          {event.description.map((para, i) => (
            <Text key={i} style={[styles.bodyText, i > 0 && styles.bodyTextSpaced]}>
              {para}
            </Text>
          ))}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Cancellation policy</Text>
          <Text style={styles.bodyText}>{event.cancellationPolicy}</Text>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.houseDetailsRow} activeOpacity={0.6}>
            <Text style={styles.sectionTitle}>House details</Text>
            <Ionicons name="chevron-forward" size={18} color="#171717" />
          </TouchableOpacity>
          <Text style={styles.addressText}>{event.address}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.bookButton, isSoldOut && styles.bookButtonSoldOut]}
          onPress={handleBook}
          activeOpacity={0.85}
        >
          <Text style={styles.bookButtonText}>
            {isSoldOut ? "Join Waitlist" : "Book"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F7",
  },
  scroll: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
  },
  heroImage: {
    width: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBadge: {
    position: "absolute",
    bottom: 12,
    left: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryBadgeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#fafafa",
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 24,
    color: "#171717",
    lineHeight: 32,
    marginBottom: 6,
  },
  dateLine: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#525252",
    marginBottom: 2,
  },
  venue: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#525252",
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  priceText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#525252",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e5e5e5",
    marginVertical: 20,
  },
  sectionTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 20,
    color: "#171717",
    marginBottom: 10,
  },
  bodyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#404040",
    lineHeight: 22,
  },
  bodyTextSpaced: {
    marginTop: 12,
  },
  houseDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },
  addressText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#525252",
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "#F9F9F7",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e5e5",
  },
  bookButton: {
    backgroundColor: "#171717",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
  },
  bookButtonSoldOut: {
    backgroundColor: "#525252",
  },
  bookButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#fafafa",
  },
  notFound: {
    flex: 1,
    backgroundColor: "#F9F9F7",
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#737373",
  },
});
