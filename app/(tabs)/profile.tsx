import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MOCK_PROFILE = {
  photos: [
    "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsaW5nfGVufDF8fHx8MTc3MjQ1NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1763259405177-0121bf79da0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMGxpZmVzdHlsZSUyMG91dGRvb3IlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI0NTk5MTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
  ],
  name: "Lena",
  age: 28,
  location: "London",
  gender: "Woman",
  prompts: [
    {
      question: "This week I'm probably\u2026",
      answer:
        "Exploring new coffee shops in Shoreditch or planning my next weekend escape",
    },
    {
      question: "Favourite song right now",
      answer: "Anything by Phoebe Bridgers on repeat",
    },
    {
      question: "A small ritual I care about\u2026",
      answer:
        "Sunday morning yoga followed by a long walk through Victoria Park",
    },
  ],
  thisWeek: ["Dinner out", "Running", "Comedy nights", "Pilates/Yoga", "Park walks"],
  regularRituals: [
    "Yoga",
    "Running",
    "Cooking",
    "Networking",
    "Museums",
    "Coffee culture",
  ],
  whyHere: [
    "I want friends who share my interests and ambitions",
    "My social circle is great, but I want to expand it",
  ],
  londonAreas: ["Shoreditch", "Soho", "Clapham"],
  values: [
    "Personal growth is non-negotiable",
    "I need culture like I need air",
    "Quality time over large groups",
  ],
  lifestyle: [
    "I love discovering hidden gems in London",
    "Weekend getaways over staying home",
  ],
  upcomingPlans: ["Gigs/concerts", "UK weekend away", "Weekly dinner crew"],
  idealWeek: "2\u20133 solid plans, rest is chill time",
  describeWords: ["Ambitious", "Curious", "Warm", "Authentic", "Creative"],
  relationshipStatus: "Single and dating",
  whereAtInLife: [
    "Climbing the corporate ladder",
    "Building a social life",
    "Building healthier habits",
  ],
  friendshipMatters: [
    "Ambitious/driven energy",
    "Wellness-focused lifestyle",
    "Up for spontaneous plans",
  ],
  instagram: "@lena.creates",
  linkedin: "https://www.linkedin.com/in/lena-creates/",
};

function SectionHeader({
  title,
  visibility,
}: {
  title: string;
  visibility: "Visible" | "Hidden";
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text
        style={[
          styles.visibilityLabel,
          visibility === "Hidden" && styles.visibilityHidden,
        ]}
      >
        {visibility}
      </Text>
    </View>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <View style={styles.tagsContainer}>
      {items.map((item, index) => (
        <View key={index} style={styles.tag}>
          <Text style={styles.tagText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function TextItem({ text }: { text: string }) {
  return <Text style={styles.itemText}>{text}</Text>;
}

export default function MyProfileScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const p = MOCK_PROFILE;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + webTopInset,
        paddingBottom: 100,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>

      <View style={styles.body}>
        <SectionHeader title="Photos" visibility="Visible" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.photosScroll}
          contentContainerStyle={styles.photosContainer}
        >
          {p.photos.map((url, index) => (
            <Image key={index} source={{ uri: url }} style={styles.photo} />
          ))}
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>+</Text>
          </View>
        </ScrollView>

        <View style={styles.divider} />

        <SectionHeader title="Basic Information" visibility="Visible" />
        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{p.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Age:</Text>
            <Text style={styles.infoValue}>{p.age}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{p.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender:</Text>
            <Text style={styles.infoValue}>{p.gender}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <SectionHeader title="Prompts" visibility="Visible" />
        <View style={styles.promptsContainer}>
          {p.prompts.map((prompt, index) => (
            <View key={index} style={styles.promptItem}>
              <Text style={styles.promptQuestion}>{prompt.question}</Text>
              <Text style={styles.promptAnswer}>{prompt.answer}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <SectionHeader title="What you're doing this week" visibility="Visible" />
        <TagList items={p.thisWeek} />

        <View style={styles.divider} />

        <SectionHeader title="Your regular rituals" visibility="Visible" />
        <TagList items={p.regularRituals} />

        <View style={styles.divider} />

        <SectionHeader title="Why you're here" visibility="Visible" />
        {p.whyHere.map((item, index) => (
          <TextItem key={index} text={item} />
        ))}

        <View style={styles.divider} />

        <SectionHeader title="Where you spend time" visibility="Visible" />
        <TagList items={p.londonAreas} />

        <View style={styles.divider} />

        <SectionHeader title="Your values & lifestyle" visibility="Visible" />
        {p.values.map((item, index) => (
          <TextItem key={index} text={item} />
        ))}

        <View style={styles.divider} />

        <SectionHeader title="Lifestyle preferences" visibility="Visible" />
        {p.lifestyle.map((item, index) => (
          <TextItem key={index} text={item} />
        ))}

        <View style={styles.divider} />

        <SectionHeader title="Upcoming plans" visibility="Visible" />
        <TagList items={p.upcomingPlans} />

        <View style={styles.divider} />

        <SectionHeader title="Ideal week" visibility="Visible" />
        <TextItem text={p.idealWeek} />

        <View style={styles.divider} />

        <SectionHeader title="Words that describe you" visibility="Hidden" />
        <TagList items={p.describeWords} />

        <View style={styles.divider} />

        <SectionHeader title="Relationship status" visibility="Hidden" />
        <TextItem text={p.relationshipStatus} />

        <View style={styles.divider} />

        <SectionHeader title="Where you're at in life" visibility="Hidden" />
        {p.whereAtInLife.map((item, index) => (
          <TextItem key={index} text={item} />
        ))}

        <View style={styles.divider} />

        <SectionHeader title="What matters in friendships" visibility="Hidden" />
        {p.friendshipMatters.map((item, index) => (
          <TextItem key={index} text={item} />
        ))}

        <View style={styles.divider} />

        <SectionHeader title="Social verification" visibility="Visible" />
        <View style={styles.socialContainer}>
          <View style={styles.socialRow}>
            <Text style={styles.socialLabel}>Instagram</Text>
            <Text style={styles.socialValue}>{p.instagram}</Text>
          </View>
          <View style={styles.socialRow}>
            <Text style={styles.socialLabel}>LinkedIn</Text>
            <Text style={styles.socialValue}>{p.linkedin}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    color: "#171717",
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#171717",
  },
  visibilityLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#737373",
  },
  visibilityHidden: {
    color: "#a3a3a3",
  },
  photosScroll: {
    marginBottom: 4,
    marginHorizontal: -20,
  },
  photosContainer: {
    paddingHorizontal: 20,
    gap: 10,
    flexDirection: "row",
  },
  photo: {
    width: 100,
    height: 130,
    borderRadius: 12,
    backgroundColor: "#e5e5e5",
  },
  photoPlaceholder: {
    width: 100,
    height: 130,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  photoPlaceholderText: {
    fontFamily: "Inter_400Regular",
    fontSize: 24,
    color: "#a3a3a3",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e5e5e5",
    marginVertical: 20,
  },
  infoGrid: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
  },
  infoLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#737373",
  },
  infoValue: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#171717",
  },
  promptsContainer: {
    gap: 16,
  },
  promptItem: {
    gap: 4,
  },
  promptQuestion: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#737373",
  },
  promptAnswer: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#171717",
    fontStyle: "italic",
    lineHeight: 22,
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
  itemText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#171717",
    lineHeight: 22,
    marginBottom: 4,
  },
  socialContainer: {
    gap: 8,
  },
  socialRow: {
    gap: 2,
  },
  socialLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#737373",
  },
  socialValue: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#171717",
  },
});
