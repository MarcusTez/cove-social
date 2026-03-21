import { useState } from "react";
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
import { MOCK_EVENTS, STATUS_COLORS, type Event } from "@/lib/events-data";

function EventCard({ event, onPress }: { event: Event; onPress: () => void }) {
  const statusColor = STATUS_COLORS[event.status];

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      <Image
        source={{ uri: event.imageUrl }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardCategory}>{event.category}</Text>
        <Text style={styles.cardTitle} numberOfLines={3}>
          {event.title}
        </Text>
        <Text style={styles.cardMeta}>
          {event.date}, {event.time}
        </Text>
        <Text style={styles.cardVenue} numberOfLines={1}>
          {event.venue}
        </Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {event.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"date" | null>(null);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + webTopInset },
      ]}
    >
      <View style={styles.filterBar}>
        <View style={styles.filterLeft}>
          <View style={styles.locationPill}>
            <Ionicons name="location-sharp" size={13} color="#fafafa" />
            <Text style={styles.locationPillText}>5 locations</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="navigate-outline" size={16} color="#171717" />
          </TouchableOpacity>
        </View>
        <View style={styles.filterRight}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              activeFilter === "date" && styles.filterPillActive,
            ]}
            onPress={() =>
              setActiveFilter(activeFilter === "date" ? null : "date")
            }
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === "date" && styles.filterPillTextActive,
              ]}
            >
              Date
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={16} color="#171717" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {MOCK_EVENTS.map((section) => (
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
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#171717",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 5,
  },
  locationPillText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#fafafa",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d4d4d4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9F9F7",
  },
  filterPill: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#d4d4d4",
    backgroundColor: "#F9F9F7",
  },
  filterPillActive: {
    backgroundColor: "#171717",
    borderColor: "#171717",
  },
  filterPillText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#171717",
  },
  filterPillTextActive: {
    color: "#fafafa",
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
  cardImage: {
    width: 112,
    height: 130,
    borderRadius: 6,
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
});
