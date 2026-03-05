import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ProfileCard } from "@/components/ProfileCard";

interface MatchPhoto {
  id: string;
  userId: string;
  photoData: string;
  displayOrder: number;
  createdAt: string;
}

interface MatchPrompt {
  id: string;
  userId: string;
  promptQuestion: string;
  promptAnswer: string;
  displayOrder: number;
  createdAt: string;
}

interface MatchPartner {
  id: string;
  firstName: string;
  gender: string;
  londonAreas: string[];
  personalityWords: string[];
  regularRituals: string[];
  thisWeekActivities: string[];
  valuesLifestyle: string[];
  friendshipValues: string[];
  friendshipPractical: string[];
  socialWeekStyle: string;
  lifestylePreferences: string[];
  upcomingPlans: string[];
  lifeStageCareer: string[];
  lifeStageSituation: string[];
  lifeStageGoals: string[];
  relationshipStatus: string;
  instagramHandle: string;
  linkedinUrl: string;
  photos: MatchPhoto[];
  prompts: MatchPrompt[];
}

interface Match {
  id: string;
  weekOf: string;
  score: number;
  overlapTags: string[];
  status: string;
  createdAt: string;
  partner: MatchPartner;
}

interface MatchesResponse {
  matches: Match[];
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery<MatchesResponse>({
    queryKey: ["/api/mobile/matches"],
  });

  const matches = data?.matches ?? [];
  const hasIntroductions = matches.length > 0;

  const handleMessage = (matchId: string) => {
  };

  const handleViewProfile = (matchId: string) => {
    router.push(`/profile/${matchId}`);
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { paddingTop: insets.top + webTopInset },
        ]}
      >
        <ActivityIndicator size="large" color="#171717" />
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { paddingTop: insets.top + webTopInset },
        ]}
      >
        <View style={styles.emptyContent}>
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptySubtitle}>
            We couldn't load your introductions.{"\n"}Pull down to try again.
          </Text>
        </View>
      </View>
    );
  }

  if (!hasIntroductions) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.emptyContainer,
          { paddingTop: insets.top + webTopInset },
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
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
      </ScrollView>
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
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <Text style={styles.title}>This week's introductions</Text>
      <Text style={styles.subtitle}>
        We introduce slowly and with care.{"\n"}What unfolds is up to you.
      </Text>

      <View style={styles.cardsContainer}>
        {matches.map((match) => {
          const partner = match.partner;
          const firstPhoto = partner.photos?.length
            ? [...partner.photos].sort((a, b) => a.displayOrder - b.displayOrder)[0]
            : undefined;
          const sortedPrompts = partner.prompts?.length
            ? [...partner.prompts].sort((a, b) => a.displayOrder - b.displayOrder)
            : [];
          return (
            <ProfileCard
              key={match.id}
              name={partner.firstName}
              photoUrl={firstPhoto?.photoData}
              location="London"
              thisWeekActivities={partner.thisWeekActivities}
              regularRituals={partner.regularRituals}
              prompts={sortedPrompts}
              overlapTags={match.overlapTags}
              onMessage={() => handleMessage(match.id)}
              onViewProfile={() => handleViewProfile(match.id)}
            />
          );
        })}
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
