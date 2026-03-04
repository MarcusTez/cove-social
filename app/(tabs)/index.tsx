import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileCard } from "@/components/ProfileCard";

const MOCK_PROFILES = [
  {
    id: 1,
    name: "Lena",
    photoUrl:
      "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsaW5nfGVufDF8fHx8MTc3MjQ1NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    location: "London",
    thisWeek: "A couple of runs + a comedy night, and one good dinner.",
    favoriteSong: "Fred again.. – adore u",
    interests: [
      "Dinner out",
      "Pilates/Yoga",
      "Running",
      "Comedy nights",
      "Networking",
      "Park walks",
    ],
    regularRituals: [
      "Yoga",
      "Running",
      "Gym",
      "Pub quiz",
      "Cooking",
      "Dance",
      "Founder life",
      "Networking",
    ],
    promptQuestion: "A small ritual I care about…",
    promptAnswer:
      "Sunday morning run, coffee, then a museum or a bookshop wander.",
    matchReasons: [
      "Personal growth is non-negotiable",
      "I want friends who challenge me",
      "Movement is my meditation",
      "I optimize everything (sleep, diet, routine)",
      "Give me dinner parties over nightclubs",
    ],
  },
  {
    id: 2,
    name: "Marcus",
    photoUrl:
      "https://images.unsplash.com/photo-1764084051711-45a3b7c84c06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBjYXN1YWwlMjBwb3J0cmFpdCUyMGhhcHB5fGVufDF8fHx8MTc3MjQ1NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    location: "London",
    thisWeek:
      "Writing sessions in the morning, gallery hop, probably a late jazz night.",
    favoriteSong: "Khruangbin – Time (You and I)",
    interests: [
      "Jazz",
      "Art galleries",
      "Writing",
      "Coffee shops",
      "Vinyl records",
      "Live music",
    ],
    regularRituals: [
      "Morning pages",
      "Gallery visits",
      "Jazz nights",
      "Poetry",
      "Photography",
      "Coffee ritual",
      "Reading",
      "Writing",
    ],
    promptQuestion: "A small ritual I care about…",
    promptAnswer:
      "Early morning coffee on the balcony with a notebook, no phone.",
    matchReasons: [
      "I need culture like I need air",
      "Fashion/art/music is my love language",
      "I collect experiences, not things",
      "Quality time over large groups",
      "Aesthetics matter to me",
    ],
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [hasIntroductions] = useState(true);

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const handleMessage = (profileId: number) => {
    // Will be connected to backend API later
  };

  const handleViewProfile = (profileId: number) => {
    // Will navigate to full profile later
  };

  if (!hasIntroductions) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { paddingTop: insets.top + webTopInset },
        ]}
      >
        <View style={styles.emptyContent}>
          <Text style={styles.emptyTitle}>
            Your introductions are being prepared
          </Text>
          <Text style={styles.emptySubtitle}>
            We introduce members thoughtfully, not endlessly.{"\n"}Your next
            curated introductions will arrive soon.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: insets.top + webTopInset + 8,
          paddingBottom: 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>This week's introductions</Text>
      <Text style={styles.subtitle}>
        We introduce slowly and with care.{"\n"}What unfolds is up to you.
      </Text>

      <View style={styles.cardsContainer}>
        {MOCK_PROFILES.map((profile) => (
          <ProfileCard
            key={profile.id}
            name={profile.name}
            photoUrl={profile.photoUrl}
            location={profile.location}
            thisWeek={profile.thisWeek}
            favoriteSong={profile.favoriteSong}
            interests={profile.interests}
            regularRituals={profile.regularRituals}
            promptQuestion={profile.promptQuestion}
            promptAnswer={profile.promptAnswer}
            matchReasons={profile.matchReasons}
            onMessage={() => handleMessage(profile.id)}
            onViewProfile={() => handleViewProfile(profile.id)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerTitle}>
          Deliberate connections are rare. We treat them that way.
        </Text>
        <Text style={styles.footerText}>
          No algorithms pushing volume. No endless feeds. Just considered
          introductions and the space to begin.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    color: "#171717",
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#737373",
    lineHeight: 24,
    marginBottom: 24,
  },
  cardsContainer: {
    gap: 20,
    marginBottom: 32,
  },
  footer: {
    marginBottom: 20,
  },
  footerTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 22,
    color: "#171717",
    lineHeight: 30,
    marginBottom: 12,
  },
  footerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#737373",
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#fafafa",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyContent: {
    alignItems: "center",
  },
  emptyTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    color: "#171717",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 36,
  },
  emptySubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#737373",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
  },
});
