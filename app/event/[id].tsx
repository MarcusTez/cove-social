import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/query-client";
import { formatEventDateTime, type ApiEventResponse, type RsvpStatus } from "@/lib/api-events";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.85;

const OPEN_COLOR = "#22c55e";
const CLOSED_COLOR = "#737373";
const RSVPED_COLOR = "#6366f1";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery<ApiEventResponse>({
    queryKey: ["/api/mobile/events", id],
    enabled: !!id,
  });

  const event = data?.event;

  const rsvpMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/mobile/events/${id}/rsvp`);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/mobile/events", id] });
      qc.invalidateQueries({ queryKey: ["/api/mobile/events"] });
      Alert.alert("Thanks for your interest", "We'll be in touch by email.");
    },
    onError: (err: Error) => {
      const msg = err.message ?? "";
      if (msg.includes("409") || msg.toLowerCase().includes("already")) {
        Alert.alert("Already booked", "You've already RSVPed to this event.");
      } else if (msg.includes("400")) {
        Alert.alert("Booking closed", "This event is no longer accepting bookings.");
      } else {
        Alert.alert("Something went wrong", "Please try again.");
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <TouchableOpacity
          style={[styles.backButtonAbsolute, { top: insets.top + webTopInset + 12 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="#171717" />
        </TouchableOpacity>
        <ActivityIndicator size="large" color="#171717" />
      </View>
    );
  }

  if (isError || !event) {
    return (
      <View style={styles.centeredState}>
        <TouchableOpacity
          style={[styles.backButtonAbsolute, { top: insets.top + webTopInset + 12 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="#171717" />
        </TouchableOpacity>
        <Ionicons name="alert-circle-outline" size={40} color="#d4d4d4" />
        <Text style={styles.notFoundText}>Event not found</Text>
      </View>
    );
  }

  const rsvpStatus: RsvpStatus = event.rsvpStatus ?? null;
  const hasRsvped = rsvpStatus !== null;

  const canBook = event.isOpen && !hasRsvped && !rsvpMutation.isPending;
  const bookingDisabled = !canBook;

  const statusColor =
    rsvpStatus === "confirmed"
      ? OPEN_COLOR
      : rsvpStatus === "declined"
      ? CLOSED_COLOR
      : rsvpStatus === "pending"
      ? RSVPED_COLOR
      : event.isOpen
      ? OPEN_COLOR
      : CLOSED_COLOR;

  const statusLabel =
    rsvpStatus === "confirmed"
      ? "CONFIRMED"
      : rsvpStatus === "declined"
      ? "DECLINED"
      : rsvpStatus === "pending"
      ? "PENDING APPROVAL"
      : event.isOpen
      ? "BOOKING OPEN"
      : "BOOKING CLOSED";

  const bookButtonLabel = rsvpMutation.isPending
    ? "Requesting..."
    : rsvpStatus === "confirmed"
    ? "You're going"
    : rsvpStatus === "declined"
    ? "Declined"
    : rsvpStatus === "pending"
    ? "Requested"
    : "Request";

  const footerHint =
    rsvpStatus === "confirmed"
      ? "You're confirmed for this event."
      : rsvpStatus === "declined"
      ? "Your request was not approved this time."
      : rsvpStatus === "pending"
      ? "Thanks for your interest, we'll confirm by email."
      : null;

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
          {event.imageData ? (
            <Image
              source={{ uri: event.imageData }}
              style={[styles.heroImage, { height: IMAGE_HEIGHT }]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, styles.heroImagePlaceholder, { height: IMAGE_HEIGHT }]} />
          )}
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
          <Text style={styles.dateLine}>{formatEventDateTime(event.eventDatetime)}</Text>
          <Text style={styles.venue}>{event.address}</Text>

          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Event details</Text>
          <Text style={styles.bodyText}>{event.description}</Text>

          {rsvpStatus === "confirmed" && event.confirmedDetails ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>You're going</Text>
              <Text style={styles.bodyText}>{event.confirmedDetails}</Text>
            </>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.houseDetailsRow}>
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <Text style={styles.addressText}>{event.address}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {footerHint && (
          <Text style={styles.requestedHint}>{footerHint}</Text>
        )}
        <TouchableOpacity
          style={[
            styles.bookButton,
            bookingDisabled && styles.bookButtonDisabled,
          ]}
          onPress={() => !bookingDisabled && rsvpMutation.mutate()}
          activeOpacity={bookingDisabled ? 1 : 0.85}
          disabled={bookingDisabled}
        >
          {rsvpMutation.isPending ? (
            <ActivityIndicator size="small" color="#fafafa" />
          ) : (
            <Text style={styles.bookButtonText}>{bookButtonLabel}</Text>
          )}
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
  centeredState: {
    flex: 1,
    backgroundColor: "#F9F9F7",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  backButtonAbsolute: {
    position: "absolute",
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0ee",
    alignItems: "center",
    justifyContent: "center",
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
  heroImagePlaceholder: {
    backgroundColor: "#e5e5e5",
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
    marginBottom: 4,
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
  houseDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 0,
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
  bookButtonDisabled: {
    backgroundColor: "#a3a3a3",
  },
  bookButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#fafafa",
  },
  notFoundText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#737373",
  },
  requestedHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#a3a3a3",
    textAlign: "center",
    marginBottom: 8,
  },
});
