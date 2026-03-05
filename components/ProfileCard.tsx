import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PromptItem {
  promptQuestion: string;
  promptAnswer: string;
}

export interface ProfileCardProps {
  name: string;
  photoUrl?: string;
  location: string;
  thisWeekActivities?: string[];
  interests?: string[];
  regularRituals?: string[];
  prompts?: PromptItem[];
  overlapTags?: string[];
  onMessage: () => void;
  onViewProfile: () => void;
}

export function ProfileCard({
  name,
  photoUrl,
  location,
  thisWeekActivities,
  interests,
  regularRituals,
  prompts,
  overlapTags,
  onMessage,
  onViewProfile,
}: ProfileCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={24} color="#a3a3a3" />
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.location}>{location}</Text>
        </View>
      </View>

      {overlapTags && overlapTags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Why we think you're a match</Text>
          <View style={styles.tagsContainer}>
            {overlapTags.map((tag, index) => (
              <View key={index} style={styles.matchTag}>
                <Text style={styles.matchTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {prompts && prompts.length > 0 && prompts.map((prompt, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionLabel}>{prompt.promptQuestion}</Text>
          <Text style={styles.sectionValue}>"{prompt.promptAnswer}"</Text>
        </View>
      ))}

      {thisWeekActivities && thisWeekActivities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>This week I'm probably…</Text>
          <View style={styles.tagsContainer}>
            {thisWeekActivities.map((activity, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{activity}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {interests && interests.length > 0 && (
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
      )}

      {regularRituals && regularRituals.length > 0 && (
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
      )}

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
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "#171717",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  messageButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#ffffff",
  },
  viewProfileButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  viewProfileButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#171717",
  },
});
