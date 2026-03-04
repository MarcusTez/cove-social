import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export interface ProfileCardProps {
  name: string;
  photoUrl: string;
  location: string;
  thisWeek: string;
  favoriteSong: string;
  interests: string[];
  regularRituals: string[];
  promptQuestion: string;
  promptAnswer: string;
  matchReasons?: string[];
  onMessage: () => void;
  onViewProfile: () => void;
}

export function ProfileCard({
  name,
  photoUrl,
  location,
  thisWeek,
  favoriteSong,
  interests,
  regularRituals,
  promptQuestion,
  promptAnswer,
  matchReasons,
  onMessage,
  onViewProfile,
}: ProfileCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: photoUrl }} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.location}>{location}</Text>
        </View>
      </View>

      {matchReasons && matchReasons.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Why we think you're a match</Text>
          <View style={styles.tagsContainer}>
            {matchReasons.map((reason, index) => (
              <View key={index} style={styles.matchTag}>
                <Text style={styles.matchTagText}>{reason}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>This week I'm probably…</Text>
        <Text style={styles.sectionValue}>"{thisWeek}"</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Favourite song right now</Text>
        <Text style={styles.sectionValue}>"{favoriteSong}"</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{promptQuestion}</Text>
        <Text style={styles.sectionValue}>"{promptAnswer}"</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Interests</Text>
        <View style={styles.tagsContainer}>
          {interests.map((interest, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Regular rituals</Text>
        <View style={styles.tagsContainer}>
          {regularRituals.map((ritual, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{ritual}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={onMessage}
          activeOpacity={0.8}
          testID={`message-${name}`}
        >
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.viewProfileButton}
          onPress={onViewProfile}
          activeOpacity={0.8}
          testID={`view-profile-${name}`}
        >
          <Text style={styles.viewProfileButtonText}>View profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e5e5e5",
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#171717",
  },
  location: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#737373",
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#737373",
    marginBottom: 6,
  },
  sectionValue: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#171717",
    lineHeight: 22,
    fontStyle: "italic",
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
  },
  tagText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#171717",
  },
  matchTag: {
    backgroundColor: "#171717",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  matchTagText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#ffffff",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  messageButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  messageButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#171717",
  },
  viewProfileButton: {
    flex: 1,
    backgroundColor: "#171717",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  viewProfileButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#fafafa",
  },
});
