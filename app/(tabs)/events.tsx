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

interface Event {
  id: string;
  category: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  status: "BOOKING OPEN" | "SOLD OUT" | "MEMBERS ONLY";
  imageUrl: string;
}

interface EventSection {
  label: string;
  events: Event[];
}

const MOCK_EVENTS: EventSection[] = [
  {
    label: "Today",
    events: [
      {
        id: "1",
        category: "Entertainment",
        title: "House Quiz",
        date: "Sat 21 Mar",
        time: "19:00",
        venue: "White City House",
        status: "BOOKING OPEN",
        imageUrl: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&q=80",
      },
      {
        id: "2",
        category: "Food & Drink",
        title: "Kurdish Newroz dinner by Nandine and Taste Cadets",
        date: "Sat 21 Mar",
        time: "19:00",
        venue: "Shoreditch House",
        status: "BOOKING OPEN",
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80",
      },
      {
        id: "3",
        category: "Music",
        title: "An evening with Jenevieve",
        date: "Sat 21 Mar",
        time: "20:30",
        venue: "180 House",
        status: "BOOKING OPEN",
        imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
      },
      {
        id: "4",
        category: "Party",
        title: "Late Nights at Mews: DJ Fat Tony",
        date: "Sat 21 Mar",
        time: "22:00",
        venue: "Soho Mews House Club",
        status: "BOOKING OPEN",
        imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80",
      },
    ],
  },
  {
    label: "Tomorrow",
    events: [
      {
        id: "5",
        category: "Wellness",
        title: "Sunday Morning Yoga Flow",
        date: "Sun 22 Mar",
        time: "09:00",
        venue: "Chiswick House",
        status: "BOOKING OPEN",
        imageUrl: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400&q=80",
      },
      {
        id: "6",
        category: "Food & Drink",
        title: "Sunday Roast with the Members",
        date: "Sun 22 Mar",
        time: "13:00",
        venue: "Notting Hill House",
        status: "MEMBERS ONLY",
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76594f0e243?w=400&q=80",
      },
    ],
  },
  {
    label: "This Week",
    events: [
      {
        id: "7",
        category: "Culture",
        title: "Private View: New Works by Hurvin Anderson",
        date: "Wed 25 Mar",
        time: "18:30",
        venue: "Electric House",
        status: "SOLD OUT",
        imageUrl: "https://images.unsplash.com/photo-1531913223931-b0d3198229ee?w=400&q=80",
      },
      {
        id: "8",
        category: "Talk",
        title: "An Evening with Bernardine Evaristo",
        date: "Thu 26 Mar",
        time: "19:00",
        venue: "Soho House",
        status: "BOOKING OPEN",
        imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80",
      },
    ],
  },
];

const STATUS_COLORS: Record<Event["status"], string> = {
  "BOOKING OPEN": "#22c55e",
  "SOLD OUT": "#ef4444",
  "MEMBERS ONLY": "#a855f7",
};

function EventCard({ event }: { event: Event }) {
  const statusColor = STATUS_COLORS[event.status];

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
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
              <EventCard key={event.id} event={event} />
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
