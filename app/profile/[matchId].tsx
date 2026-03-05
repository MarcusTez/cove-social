import { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

interface MatchPhoto {
  id: string;
  photoData: string;
  displayOrder: number;
}

interface MatchPrompt {
  id: string;
  promptQuestion: string;
  promptAnswer: string;
  displayOrder: number;
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

interface MatchDetail {
  id: string;
  weekOf: string;
  score: number;
  overlapTags: string[];
  status: string;
  createdAt: string;
  partner: MatchPartner;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function PublicProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const { data: match, isLoading, isError } = useQuery<MatchDetail>({
    queryKey: ["/api/mobile/matches", matchId],
    enabled: !!matchId,
  });

  const partner = match?.partner;
  const photos = partner?.photos
    ? [...partner.photos].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];
  const prompts = partner?.prompts
    ? [...partner.prompts].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];

  const handlePhotoTap = (locationX: number) => {
    if (photos.length <= 1) return;
    if (locationX < SCREEN_WIDTH / 2) {
      setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    } else {
      setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    }
  };

  const handleMessage = () => {
    if (partner?.id) {
      router.replace(`/chat/${partner.id}`);
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#171717" />
      </View>
    );
  }

  if (isError || !partner) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButtonStatic, { top: insets.top + 8 }]}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#171717" />
        </TouchableOpacity>
        <Text style={styles.errorTitle}>Profile unavailable</Text>
        <Text style={styles.errorSubtitle}>
          We couldn't load this profile. Please try again later.
        </Text>
      </View>
    );
  }

  const currentPhoto = photos[currentPhotoIndex];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => handlePhotoTap(e.nativeEvent.locationX)}
          style={styles.photoContainer}
        >
          {currentPhoto ? (
            <Image
              source={{ uri: currentPhoto.photoData }}
              style={styles.photo}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Ionicons name="person" size={64} color="#a3a3a3" />
            </View>
          )}

          {photos.length > 1 && (
            <View style={[styles.photoIndicators, { top: insets.top + 12 }]}>
              {photos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.photoIndicator,
                    index === currentPhotoIndex
                      ? styles.photoIndicatorActive
                      : styles.photoIndicatorInactive,
                  ]}
                />
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { top: insets.top + 8 }]}
            activeOpacity={0.7}
            testID="profile-back"
          >
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.nameSection}>
            <Text style={styles.name}>{partner.firstName}</Text>
            <Text style={styles.meta}>London</Text>
            {partner.gender && <Text style={styles.meta}>{partner.gender}</Text>}
          </View>

          {prompts.map((prompt, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionLabel}>{prompt.promptQuestion}</Text>
              <Text style={styles.sectionValue}>{prompt.promptAnswer}</Text>
            </View>
          ))}

          {partner.thisWeekActivities && partner.thisWeekActivities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>This week I'm probably...</Text>
              <View style={styles.tagsContainer}>
                {partner.thisWeekActivities.map((activity, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{activity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {partner.regularRituals && partner.regularRituals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Regular rituals</Text>
              <View style={styles.tagsContainer}>
                {partner.regularRituals.map((ritual, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{ritual}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {partner.upcomingPlans && partner.upcomingPlans.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Upcoming plans</Text>
              <View style={styles.tagsContainer}>
                {partner.upcomingPlans.map((plan, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{plan}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.ctaContainer,
          {
            paddingBottom: Math.max(
              insets.bottom,
              Platform.OS === "web" ? 34 : 16
            ),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleMessage}
          activeOpacity={0.8}
          testID="profile-message"
        >
          <Text style={styles.ctaButtonText}>Message {partner.firstName}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#fafafa",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  photoContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#e5e5e5",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e5e5e5",
  },
  photoIndicators: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 4,
  },
  photoIndicator: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  photoIndicatorActive: {
    backgroundColor: "#ffffff",
  },
  photoIndicatorInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  backButton: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  nameSection: {
    marginBottom: 32,
  },
  name: {
    fontFamily: "PlayfairDisplay_400Regular",
    fontSize: 32,
    color: "#171717",
    lineHeight: 38,
    marginBottom: 4,
  },
  meta: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#737373",
    lineHeight: 22,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#737373",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  sectionValue: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#171717",
    lineHeight: 23,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  tagText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#171717",
  },
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "#fafafa",
  },
  ctaButton: {
    backgroundColor: "#171717",
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#ffffff",
  },
  backButtonStatic: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  errorTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 24,
    color: "#171717",
    textAlign: "center",
    marginBottom: 12,
  },
  errorSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#737373",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
});
