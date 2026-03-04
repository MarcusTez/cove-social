import { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { EditProfileSection } from "@/components/EditProfileSection";
import { EditPrompts } from "@/components/EditPrompts";

interface Prompt {
  question: string;
  answer: string;
}

interface ProfileData {
  photos: (string | null)[];
  name: string;
  age: number;
  location: string;
  gender: string;
  prompts: Prompt[];
  thisWeek: string[];
  regularRituals: string[];
  whyHere: string[];
  londonAreas: string[];
  values: string[];
  lifestyle: string[];
  upcomingPlans: string[];
  idealWeek: string;
  describeWords: string[];
  relationshipStatus: string;
  whereAtInLife: string[];
  friendshipMatters: string[];
  instagram: string;
  linkedin: string;
}

const INITIAL_PROFILE: ProfileData = {
  photos: [
    "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsaW5nfGVufDF8fHx8MTc3MjQ1NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1763259405177-0121bf79da0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMGxpZmVzdHlsZSUyMG91dGRvb3IlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI0NTk5MTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    null,
  ],
  name: "Lena",
  age: 28,
  location: "London",
  gender: "Woman",
  prompts: [
    { question: "This week I'm probably\u2026", answer: "Exploring new coffee shops in Shoreditch or planning my next weekend escape" },
    { question: "Favourite song right now", answer: "Anything by Phoebe Bridgers on repeat" },
    { question: "A small ritual I care about\u2026", answer: "Sunday morning yoga followed by a long walk through Victoria Park" },
  ],
  thisWeek: ["Dinner out", "Running", "Comedy nights", "Pilates/Yoga", "Park walks"],
  regularRituals: ["Yoga", "Running", "Cooking", "Networking", "Museums", "Coffee culture"],
  whyHere: ["I want friends who share my interests and ambitions", "My social circle is great, but I want to expand it"],
  londonAreas: ["Shoreditch", "Soho", "Clapham"],
  values: ["Personal growth is non-negotiable", "I need culture like I need air", "Quality time over large groups"],
  lifestyle: ["I love discovering hidden gems in London", "Weekend getaways over staying home"],
  upcomingPlans: ["Gigs/concerts", "UK weekend away", "Weekly dinner crew"],
  idealWeek: "2\u20133 solid plans, rest is chill time",
  describeWords: ["Ambitious", "Curious", "Warm", "Authentic", "Creative"],
  relationshipStatus: "Single and dating",
  whereAtInLife: ["Climbing the corporate ladder", "Building a social life", "Building healthier habits"],
  friendshipMatters: ["Ambitious/driven energy", "Wellness-focused lifestyle", "Up for spontaneous plans"],
  instagram: "@lena.creates",
  linkedin: "https://www.linkedin.com/in/lena-creates/",
};

const THIS_WEEK_OPTIONS = [
  "Drinks", "Dinner out", "Coffee catchups", "Going out/dancing", "Hosting at home",
  "Running", "Pilates/Yoga", "Gym sessions", "Cycling", "Swimming", "Tennis/Padel",
  "Galleries", "Museums", "Theatre/Shows", "Cinema", "Book clubs/readings",
  "Gigs/concerts", "Shopping/markets", "Ballet", "Comedy nights",
  "Industry events/talks", "Workshops/classes", "Networking",
  "Park walks", "Dog walking", "Day trips", "Exploring new areas",
];

const REGULAR_RITUALS_OPTIONS = [
  "Pilates", "Running", "Yoga", "Gym", "Cycling", "Boxing", "Swimming", "Meditation",
  "Therapy", "Massage", "Ice baths", "Sauna",
  "Friday drinks", "Sunday roasts", "Dinner clubs", "Hosting", "Brunch gang",
  "Wine tasting", "Pub quiz", "Board games",
  "Writing", "Photography", "DJ'ing", "Fashion", "Design", "Painting", "Pottery",
  "Music", "Dance", "Cooking",
  "Founder life", "Networking", "Side hustles", "Investing", "Reading", "Podcasts",
  "Mentoring", "Learning",
  "Museums", "Theatre", "Art galleries", "Film", "Vintage markets", "Architecture",
  "Bookshops", "Poetry",
  "Fine dining", "Street food", "Wine bars", "Cocktail bars", "Coffee culture",
  "Vegan spots",
  "Hiking", "Wild swimming", "Camping", "Climbing", "Sailing", "Skiing", "Surfing",
  "Foraging",
];

const WHY_HERE_OPTIONS = [
  "I'm new to London and starting from scratch",
  "My friends are all coupled up or moved away",
  "I'm tired of surface-level small talk",
  "I want friends who actually follow through on plans",
  "I'm done with the \"we should hang out sometime\" cycle",
  "My social circle is great, but I want to expand it",
  "I've outgrown my current friend group",
  "I want friends who share my interests and ambitions",
  "I'm ready to prioritise my social life again",
];

const LONDON_AREAS_OPTIONS = [
  "Soho", "Covent Garden", "Fitzrovia", "King's Cross", "Marylebone",
  "Shoreditch", "Hackney", "Dalston", "Victoria Park", "Bethnal Green", "Stratford",
  "Canary Wharf",
  "Notting Hill", "Hammersmith", "Fulham", "Shepherd's Bush", "Kensington", "Chelsea",
  "Clapham", "Brixton", "Peckham", "Greenwich", "Battersea", "Wandsworth", "Dulwich",
  "Camden", "Islington", "Highbury", "Stoke Newington", "Hampstead", "Archway",
];

const VALUES_OPTIONS = [
  "I'm building something and want ambitious friends",
  "Personal growth is non-negotiable",
  "I'm obsessed with learning new things",
  "I want friends who challenge me",
  "Wellness is my religion",
  "I optimize everything (sleep, diet, routine)",
  "Movement is my meditation",
  "Self-care isn't selfish",
  "Fashion/art/music is my love language",
  "I collect experiences, not things",
  "I need culture like I need air",
  "Aesthetics matter to me",
  "Give me dinner parties over nightclubs",
  "I'm the person who organizes everything",
  "Quality time over large groups",
  "I love hosting and bringing people together",
  "Spontaneous plans are the best plans",
];

const LIFESTYLE_OPTIONS = [
  "I'm always planning the next trip",
  "Passport stamps are my love language",
  "I need regular escapes from the city",
  "Solo travel is my therapy",
  "Weekend getaways over staying home",
  "I love discovering hidden gems in London",
  "I know the best spots before they're cool",
  "East London is my spiritual home",
  "I live for rooftop bars and secret gardens",
];

const UPCOMING_PLANS_OPTIONS = [
  "International trip", "Beach/island getaway", "Ski trip", "Festival season",
  "UK weekend away", "Solo travel adventure",
  "Gigs/concerts", "Race/sporting event", "Theatre/show tickets",
  "Exhibition/gallery opening", "Wine tasting/food event", "Festival",
  "Weekly dinner crew", "Running club", "Workout buddy", "Sunday coffee walks",
  "Cinema/culture buddy",
];

const IDEAL_WEEK_OPTIONS = [
  "Packed calendar \u2014 something every night",
  "2-3 solid plans, rest is chill time",
  "1 big thing, mostly low-key",
  "Spontaneous \u2014 I don't plan ahead",
];

const DESCRIBE_WORDS_OPTIONS = [
  "Adventurous", "Ambitious", "Authentic", "Calm", "Caring", "Creative", "Curious",
  "Driven", "Easy-going", "Energetic", "Extroverted", "Funny", "Genuine", "Grounded",
  "Independent", "Introverted", "Kind", "Laid-back", "Loyal", "Optimistic",
  "Organized", "Outgoing", "Passionate", "Playful", "Reliable", "Sarcastic",
  "Spontaneous", "Thoughtful", "Warm", "Witty",
];

const RELATIONSHIP_OPTIONS = [
  "Single and dating",
  "Single and not dating",
  "In a relationship",
  "Married/partnered",
  "It's complicated",
];

const GENDER_OPTIONS = ["Woman", "Man", "Non-binary", "Prefer to self-describe"];

const WHERE_AT_OPTIONS = [
  "Climbing the corporate ladder",
  "Founder/building my own thing",
  "Freelance/portfolio life",
  "Career break/sabbatical",
  "Just started a new job/industry",
  "Prefer not to say",
  "New to London",
  "Moved neighborhoods recently",
  "Friend group shifted",
  "Coming out of a breakup",
  "Fresh out of a long relationship",
  "Just moved back to London",
  "Building a career",
  "Building a business",
  "Building a social life",
  "Building healthier habits",
  "Building creative projects",
  "Just want to have more fun",
];

const FRIENDSHIP_MATTERS_OPTIONS = [
  "Ambitious/driven energy",
  "Wellness-focused lifestyle",
  "Politically progressive",
  "Environmentally conscious",
  "Spiritual/open-minded",
  "LGBTQ+ friendly",
  "Up for spontaneous plans",
  "Prefers planned-ahead hangouts",
  "Doesn't smoke",
  "Drinks socially",
  "Doesn't drink",
];

const PROMPT_OPTIONS = [
  "This week I'm probably\u2026",
  "Favourite song right now",
  "A small ritual I care about\u2026",
  "Best meal I've had recently",
  "Last thing that made me laugh",
  "A place that feels like home",
  "Something I'm learning",
  "My ideal Sunday looks like\u2026",
  "A non-negotiable for me",
  "Something I'm looking forward to",
  "My go-to coffee order",
  "A hidden talent",
  "Something that surprised me lately",
  "My current obsession",
];

type EditingSection = {
  key: string;
  title: string;
  type: "multi-select" | "single-select" | "text";
  options: string[];
  field: keyof ProfileData;
  maxSelections?: number;
  note?: string;
} | null;

function SectionHeader({
  title,
  visibility,
  onEdit,
}: {
  title: string;
  visibility: "Visible" | "Hidden";
  onEdit?: () => void;
}) {
  const Wrapper = onEdit ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.sectionHeader} {...(onEdit ? { onPress: onEdit, activeOpacity: 0.6 } : {})}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRight}>
        <Text style={[styles.visibilityLabel, visibility === "Hidden" && styles.visibilityHidden]}>
          {visibility}
        </Text>
        {onEdit && <Ionicons name="chevron-forward" size={16} color="#a3a3a3" />}
      </View>
    </Wrapper>
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
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [editing, setEditing] = useState<EditingSection>(null);
  const [editingBasic, setEditingBasic] = useState(false);
  const [editingBasicField, setEditingBasicField] = useState<EditingSection>(null);
  const [editingPrompts, setEditingPrompts] = useState(false);

  const handleSave = (field: keyof ProfileData, value: string | string[]) => {
    setProfile({ ...profile, [field]: value });
  };

  const openEditor = (
    key: string,
    title: string,
    type: "multi-select" | "single-select" | "text",
    options: string[],
    field: keyof ProfileData,
    maxSelections?: number,
    note?: string,
  ) => {
    setEditing({ key, title, type, options, field, maxSelections, note });
  };

  if (editingBasic && !editingBasicField) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.basicHeader}>
          <TouchableOpacity onPress={() => setEditingBasic(false)} activeOpacity={0.7}>
            <Text style={styles.backText}>{"\u2190"} Back</Text>
          </TouchableOpacity>
          <Text style={styles.basicTitle}>Basic Information</Text>
        </View>
        <View style={styles.basicBody}>
          <TouchableOpacity
            style={styles.basicFieldCard}
            onPress={() =>
              setEditingBasicField({
                key: "name", title: "Name", type: "text", options: [], field: "name",
              })
            }
            activeOpacity={0.6}
          >
            <View>
              <Text style={styles.basicFieldLabel}>Name</Text>
              <Text style={styles.basicFieldValue}>{profile.name}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a3a3a3" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.basicFieldCard}
            onPress={() =>
              setEditingBasicField({
                key: "location", title: "Location", type: "text", options: [], field: "location",
              })
            }
            activeOpacity={0.6}
          >
            <View>
              <Text style={styles.basicFieldLabel}>Location</Text>
              <Text style={styles.basicFieldValue}>{profile.location}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a3a3a3" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.basicFieldCard}
            onPress={() =>
              setEditingBasicField({
                key: "gender", title: "Gender", type: "single-select", options: GENDER_OPTIONS, field: "gender",
              })
            }
            activeOpacity={0.6}
          >
            <View>
              <Text style={styles.basicFieldLabel}>Gender</Text>
              <Text style={styles.basicFieldValue}>{profile.gender}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a3a3a3" />
          </TouchableOpacity>
        </View>

        {editingBasicField && (
          <EditProfileSection
            key={editingBasicField.key}
            visible
            title={editingBasicField.title}
            type={editingBasicField.type}
            options={editingBasicField.options}
            currentValue={profile[editingBasicField.field] as string}
            onSave={(value) => handleSave(editingBasicField.field, value)}
            onClose={() => setEditingBasicField(null)}
          />
        )}
      </View>
    );
  }

  return (
    <>
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
            {profile.photos.map((url, index) =>
              url ? (
                <Image key={index} source={{ uri: url }} style={styles.photo} />
              ) : (
                <View key={index} style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderText}>+</Text>
                </View>
              )
            )}
          </ScrollView>

          <View style={styles.divider} />

          <SectionHeader title="Basic Information" visibility="Visible" onEdit={() => setEditingBasic(true)} />
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{profile.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age:</Text>
              <Text style={styles.infoValue}>{profile.age}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{profile.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender:</Text>
              <Text style={styles.infoValue}>{profile.gender}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <SectionHeader title="Prompts" visibility="Visible" onEdit={() => setEditingPrompts(true)} />
          <View style={styles.promptsContainer}>
            {profile.prompts.map((prompt, index) => (
              <View key={index} style={styles.promptItem}>
                <Text style={styles.promptQuestion}>{prompt.question}</Text>
                <Text style={styles.promptAnswer}>{prompt.answer}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <SectionHeader
            title="What you're doing this week"
            visibility="Visible"
            onEdit={() => openEditor("thisWeek", "What you're doing this week", "multi-select", THIS_WEEK_OPTIONS, "thisWeek")}
          />
          <TagList items={profile.thisWeek} />

          <View style={styles.divider} />

          <SectionHeader
            title="Your regular rituals"
            visibility="Visible"
            onEdit={() => openEditor("regularRituals", "Your regular rituals", "multi-select", REGULAR_RITUALS_OPTIONS, "regularRituals")}
          />
          <TagList items={profile.regularRituals} />

          <View style={styles.divider} />

          <SectionHeader
            title="Why you're here"
            visibility="Visible"
            onEdit={() => openEditor("whyHere", "Why you're here", "multi-select", WHY_HERE_OPTIONS, "whyHere")}
          />
          {profile.whyHere.map((item, index) => (
            <TextItem key={index} text={item} />
          ))}

          <View style={styles.divider} />

          <SectionHeader
            title="Where you spend time"
            visibility="Visible"
            onEdit={() => openEditor("londonAreas", "Where you spend time", "multi-select", LONDON_AREAS_OPTIONS, "londonAreas", undefined, "We'll prioritize matches near you - but you'll still see people across London.")}
          />
          <TagList items={profile.londonAreas} />

          <View style={styles.divider} />

          <SectionHeader
            title="Your values & lifestyle"
            visibility="Visible"
            onEdit={() => openEditor("values", "Your values & lifestyle", "multi-select", VALUES_OPTIONS, "values")}
          />
          {profile.values.map((item, index) => (
            <TextItem key={index} text={item} />
          ))}

          <View style={styles.divider} />

          <SectionHeader
            title="Lifestyle preferences"
            visibility="Visible"
            onEdit={() => openEditor("lifestyle", "Lifestyle preferences", "multi-select", LIFESTYLE_OPTIONS, "lifestyle")}
          />
          {profile.lifestyle.map((item, index) => (
            <TextItem key={index} text={item} />
          ))}

          <View style={styles.divider} />

          <SectionHeader
            title="Upcoming plans"
            visibility="Visible"
            onEdit={() => openEditor("upcomingPlans", "Upcoming plans", "multi-select", UPCOMING_PLANS_OPTIONS, "upcomingPlans")}
          />
          <TagList items={profile.upcomingPlans} />

          <View style={styles.divider} />

          <SectionHeader
            title="Ideal social week"
            visibility="Visible"
            onEdit={() => openEditor("idealWeek", "Ideal social week", "single-select", IDEAL_WEEK_OPTIONS, "idealWeek", undefined, "Helps us match you with similar energy")}
          />
          <TextItem text={profile.idealWeek} />

          <View style={styles.divider} />

          <SectionHeader
            title="Words that describe you"
            visibility="Hidden"
            onEdit={() => openEditor("describeWords", "Words that describe you", "multi-select", DESCRIBE_WORDS_OPTIONS, "describeWords", 5)}
          />
          <TagList items={profile.describeWords} />

          <View style={styles.divider} />

          <SectionHeader
            title="Relationship status"
            visibility="Hidden"
            onEdit={() => openEditor("relationshipStatus", "Relationship status", "single-select", RELATIONSHIP_OPTIONS, "relationshipStatus")}
          />
          <TextItem text={profile.relationshipStatus} />

          <View style={styles.divider} />

          <SectionHeader
            title="Where you're at in life"
            visibility="Hidden"
            onEdit={() => openEditor("whereAtInLife", "Where you're at in life", "multi-select", WHERE_AT_OPTIONS, "whereAtInLife")}
          />
          {profile.whereAtInLife.map((item, index) => (
            <TextItem key={index} text={item} />
          ))}

          <View style={styles.divider} />

          <SectionHeader
            title="What matters in friendships"
            visibility="Hidden"
            onEdit={() => openEditor("friendshipMatters", "What matters in friendships", "multi-select", FRIENDSHIP_MATTERS_OPTIONS, "friendshipMatters")}
          />
          {profile.friendshipMatters.map((item, index) => (
            <TextItem key={index} text={item} />
          ))}

          <View style={styles.divider} />

          <SectionHeader title="Social verification" visibility="Visible" />
          <View style={styles.socialContainer}>
            <View style={styles.socialRow}>
              <Text style={styles.socialLabel}>Instagram</Text>
              <Text style={styles.socialValue}>{profile.instagram}</Text>
            </View>
            <View style={styles.socialRow}>
              <Text style={styles.socialLabel}>LinkedIn</Text>
              <Text style={styles.socialValue}>{profile.linkedin}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {editing && (
        <EditProfileSection
          key={editing.key + JSON.stringify(profile[editing.field])}
          visible
          title={editing.title}
          type={editing.type}
          options={editing.options}
          currentValue={profile[editing.field] as string | string[]}
          onSave={(value) => handleSave(editing.field, value)}
          onClose={() => setEditing(null)}
          maxSelections={editing.maxSelections}
          note={editing.note}
        />
      )}

      {editingPrompts && (
        <EditPrompts
          key={"prompts-" + profile.prompts.length}
          visible
          availablePrompts={PROMPT_OPTIONS}
          currentPrompts={profile.prompts}
          onSave={(prompts) => setProfile({ ...profile, prompts })}
          onClose={() => setEditingPrompts(false)}
        />
      )}
    </>
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
    flex: 1,
  },
  sectionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  basicHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  backText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#171717",
    marginBottom: 16,
  },
  basicTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    color: "#171717",
  },
  basicBody: {
    padding: 20,
    gap: 12,
  },
  basicFieldCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
  },
  basicFieldLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#737373",
    marginBottom: 4,
  },
  basicFieldValue: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#171717",
  },
});
