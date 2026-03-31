import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  groupEventsByDate,
  formatEventDateTime,
  type ApiEvent,
  type ApiEventsResponse,
  type RsvpStatus,
} from "@/lib/api-events";

const OPEN_COLOR = "#22c55e";
const CLOSED_COLOR = "#737373";
const RSVPED_COLOR = "#6366f1";
const CONFIRMED_COLOR = "#22c55e";

function EventCard({ event, onPress }: { event: ApiEvent; onPress: () => void }) {
  const rsvpStatus: RsvpStatus = event.rsvpStatus ?? null;

  const statusColor =
    rsvpStatus === "confirmed"
      ? CONFIRMED_COLOR
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
      ? "REQUESTED"
      : event.isOpen
      ? "BOOKING OPEN"
      : "BOOKING CLOSED";

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.cardImageContainer}>
        {event.imageData ? (
          <Image
            source={{ uri: event.imageData }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardCategory}>{event.category}</Text>
        <Text style={styles.cardTitle} numberOfLines={3}>
          {event.title}
        </Text>
        <Text style={styles.cardMeta}>{formatEventDateTime(event.eventDatetime)}</Text>
        <Text style={styles.cardVenue} numberOfLines={1}>
          {event.address}
        </Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={[styles.cardImage, styles.skeleton]} />
      <View style={styles.cardContent}>
        <View style={[styles.skeletonLine, { width: 60, height: 12, marginBottom: 6 }]} />
        <View style={[styles.skeletonLine, { width: "85%", height: 14, marginBottom: 4 }]} />
        <View style={[styles.skeletonLine, { width: "70%", height: 14, marginBottom: 6 }]} />
        <View style={[styles.skeletonLine, { width: "60%", height: 13, marginBottom: 4 }]} />
        <View style={[styles.skeletonLine, { width: "50%", height: 13, marginBottom: 8 }]} />
        <View style={[styles.skeletonLine, { width: 90, height: 11 }]} />
      </View>
    </View>
  );
}

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const { data, isLoading, isError, refetch, isRefetching } = useQuery<ApiEventsResponse>({
    queryKey: ["/api/mobile/events"],
  });

  const sections = data ? groupEventsByDate(data.events) : [];

  const handleRefresh = () => {
    refetch();
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + webTopInset },
      ]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
        }
      >
        {isLoading && (
          <>
            <View style={styles.section}>
              <View style={[styles.skeletonLine, { width: 80, height: 22, marginBottom: 12, marginTop: 8 }]} />
              <SkeletonCard />
              <SkeletonCard />
            </View>
            <View style={styles.section}>
              <View style={[styles.skeletonLine, { width: 100, height: 22, marginBottom: 12, marginTop: 8 }]} />
              <SkeletonCard />
            </View>
          </>
        )}

        {isError && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={40} color="#d4d4d4" />
            <Text style={styles.errorText}>Couldn't load events</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()} activeOpacity={0.7}>
              <Text style={styles.retryButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !isError && sections.length === 0 && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No upcoming events</Text>
          </View>
        )}

        {sections.map((section) => (
          <View key={section.label} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.label}</Text>
            {section.events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => router.push(`/event/${event.id}`)}
              />
            ))}
          </View>
        ))}
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  section: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 22,
    color: "#171717",
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 12,
  },
  cardImageContainer: {
    flexShrink: 0,
  },
  cardImage: {
    width: 112,
    height: 130,
    borderRadius: 6,
    backgroundColor: "#e5e5e5",
  },
  cardImagePlaceholder: {
    backgroundColor: "#e5e5e5",
  },
  cardContent: {
    flex: 1,
    paddingTop: 2,
    justifyContent: "flex-start",
  },
  cardCategory: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#737373",
    marginBottom: 3,
    textTransform: "capitalize",
  },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#171717",
    lineHeight: 20,
    marginBottom: 6,
  },
  cardMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#525252",
    marginBottom: 2,
  },
  cardVenue: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#525252",
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.3,
  },
  skeleton: {
    backgroundColor: "#e5e5e5",
  },
  skeletonLine: {
    backgroundColor: "#e5e5e5",
    borderRadius: 4,
    marginBottom: 2,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#737373",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d4d4d4",
  },
  retryButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#171717",
  },
});
