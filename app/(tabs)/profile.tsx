import { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LineLoader from "@/components/LineLoader";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/query-client";
import { useAuth } from "@/lib/auth";
import { EditProfileSection } from "@/components/EditProfileSection";
import { EditPrompts } from "@/components/EditPrompts";
import { SettingsScreen } from "@/components/SettingsScreen";
import * as ImagePicker from "expo-image-picker";

interface ApiPhoto {
  id: string;
  userId: string;
  photoData: string;
  displayOrder: number;
  createdAt: string;
}

interface ApiPrompt {
  id: string;
  userId: string;
  promptQuestion: string;
  promptAnswer: string;
  displayOrder: number;
  createdAt: string;
}

interface ApiProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  genderSelfDescribe: string | null;
  londonAreas: string[];
  personalityWords: string[];
  regularRituals: string[];
  thisWeekActivities: string[];
  valuesLifestyle: string[];
  lifestylePreferences: string[];
  upcomingPlans: string[];
  socialWeekStyle: string;
  relationshipStatus: string;
  lifeStageCareer: string[];
  lifeStageSituation: string[];
  lifeStageGoals: string[];
  friendshipValues: string[];
  friendshipPractical: string[];
  problemReasons: string[];
  city: string;
  instagramHandle: string;
  linkedinUrl: string;
  commitmentLevel: string;
  selectedPlan: string;
  subscriptionStatus: string;
  accountStatus: string;
  matchingOptIn: boolean;
  inviteCode: string;
  createdAt: string;
  photos: ApiPhoto[];
  prompts: ApiPrompt[];
}

interface DisplayProfile {
  photos: (string | null)[];
  photoIds: (string | null)[];
  name: string;
  firstName: string;
  gender: string;
  city: string;
  prompts: { id?: string; question: string; answer: string }[];
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

function mapApiToDisplay(api: ApiProfile): DisplayProfile {
  const photoSlots: (string | null)[] = [];
  const photoIdSlots: (string | null)[] = [];
  const sorted = [...(api.photos || [])].sort((a, b) => a.displayOrder - b.displayOrder);
  if (sorted[0]) {
    photoSlots.push(sorted[0].photoData);
    photoIdSlots.push(sorted[0].id);
  } else {
    photoSlots.push(null);
    photoIdSlots.push(null);
  }

  return {
    photos: photoSlots,
    photoIds: photoIdSlots,
    name: [api.firstName, api.lastName].filter(Boolean).join(" "),
    firstName: api.firstName || "",
    gender: api.gender || "",
    city: api.city || "",
    prompts: (api.prompts || [])
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((p) => ({ id: p.id, question: p.promptQuestion, answer: p.promptAnswer })),
    thisWeek: api.thisWeekActivities || [],
    regularRituals: api.regularRituals || [],
    whyHere: api.problemReasons || [],
    londonAreas: api.londonAreas || [],
    values: api.valuesLifestyle || [],
    lifestyle: api.lifestylePreferences || [],
    upcomingPlans: api.upcomingPlans || [],
    idealWeek: api.socialWeekStyle || "",
    describeWords: api.personalityWords || [],
    relationshipStatus: api.relationshipStatus || "",
    whereAtInLife: [
      ...(api.lifeStageCareer || []),
      ...(api.lifeStageSituation || []),
      ...(api.lifeStageGoals || []),
    ],
    friendshipMatters: [
      ...(api.friendshipValues || []),
      ...(api.friendshipPractical || []),
    ],
    instagram: api.instagramHandle || "",
    linkedin: api.linkedinUrl || "",
  };
}

const CAREER_OPTIONS_SET = new Set([
  "Climbing the corporate ladder", "Founder/building my own thing", "Freelance/portfolio life",
  "Career break/sabbatical", "Just started a new job/industry", "Prefer not to say",
]);
const SITUATION_OPTIONS_SET = new Set([
  "New to London", "Moved neighborhoods recently", "Friend group shifted",
  "Coming out of a breakup", "Fresh out of a long relationship", "Just moved back to London",
]);
const GOALS_OPTIONS_SET = new Set([
  "Building a career", "Building a business", "Building a social life",
  "Building healthier habits", "Building creative projects", "Just want to have more fun",
]);
const VALUES_FRIENDSHIP_SET = new Set([
  "Ambitious/driven energy", "Wellness-focused lifestyle", "Politically progressive",
  "Environmentally conscious", "Spiritual/open-minded", "LGBTQ+ friendly",
]);
const PRACTICAL_FRIENDSHIP_SET = new Set([
  "Up for spontaneous plans", "Prefers planned-ahead hangouts", "Doesn't smoke",
  "Drinks socially", "Doesn't drink",
]);

type DisplayField = keyof DisplayProfile;

const ALL_WHERE_AT_SET = new Set([...CAREER_OPTIONS_SET, ...SITUATION_OPTIONS_SET, ...GOALS_OPTIONS_SET]);
const ALL_FRIENDSHIP_SET = new Set([...VALUES_FRIENDSHIP_SET, ...PRACTICAL_FRIENDSHIP_SET]);

function mapFieldToApiBody(field: DisplayField, value: string | string[], apiProfile?: ApiProfile | null): Record<string, unknown> {
  switch (field) {
    case "name": {
      const parts = (value as string).trim().split(/\s+/);
      return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") || "" };
    }
    case "city":
      return { city: value };
    case "thisWeek":
      return { thisWeekActivities: value };
    case "whyHere":
      return { problemReasons: value };
    case "values":
      return { valuesLifestyle: value };
    case "lifestyle":
      return { lifestylePreferences: value };
    case "idealWeek":
      return { socialWeekStyle: value };
    case "describeWords":
      return { personalityWords: value };
    case "instagram":
      return { instagramHandle: value };
    case "linkedin":
      return { linkedinUrl: value };
    case "whereAtInLife": {
      const items = value as string[];
      const career = items.filter((s) => CAREER_OPTIONS_SET.has(s));
      const situation = items.filter((s) => SITUATION_OPTIONS_SET.has(s));
      const goals = items.filter((s) => GOALS_OPTIONS_SET.has(s));
      const unknownItems = items.filter((s) => !ALL_WHERE_AT_SET.has(s));
      if (apiProfile) {
        const origCareerUnknown = (apiProfile.lifeStageCareer || []).filter((s) => !CAREER_OPTIONS_SET.has(s));
        const origSitUnknown = (apiProfile.lifeStageSituation || []).filter((s) => !SITUATION_OPTIONS_SET.has(s));
        const origGoalsUnknown = (apiProfile.lifeStageGoals || []).filter((s) => !GOALS_OPTIONS_SET.has(s));
        career.push(...origCareerUnknown.filter((s) => !career.includes(s)));
        situation.push(...origSitUnknown.filter((s) => !situation.includes(s)));
        goals.push(...origGoalsUnknown.filter((s) => !goals.includes(s)));
      }
      if (unknownItems.length > 0) {
        goals.push(...unknownItems);
      }
      return { lifeStageCareer: career, lifeStageSituation: situation, lifeStageGoals: goals };
    }
    case "friendshipMatters": {
      const items = value as string[];
      const values = items.filter((s) => VALUES_FRIENDSHIP_SET.has(s));
      const practical = items.filter((s) => PRACTICAL_FRIENDSHIP_SET.has(s));
      const unknownItems = items.filter((s) => !ALL_FRIENDSHIP_SET.has(s));
      if (apiProfile) {
        const origValUnknown = (apiProfile.friendshipValues || []).filter((s) => !VALUES_FRIENDSHIP_SET.has(s));
        const origPracUnknown = (apiProfile.friendshipPractical || []).filter((s) => !PRACTICAL_FRIENDSHIP_SET.has(s));
        values.push(...origValUnknown.filter((s) => !values.includes(s)));
        practical.push(...origPracUnknown.filter((s) => !practical.includes(s)));
      }
      if (unknownItems.length > 0) {
        values.push(...unknownItems);
      }
      return { friendshipValues: values, friendshipPractical: practical };
    }
    case "regularRituals":
    case "londonAreas":
    case "upcomingPlans":
    case "relationshipStatus":
      return { [field]: value };
    default:
      return {};
  }
}

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
  "This week I'm probably",
  "A small ritual I care about",
  "A documentary / book / film / series I can't stop recommending",
  "A song I've played far too much recently",
  "The latest show I binged",
  "What I'm pondering at the moment",
  "A film or book I loved",
  "Favourite song or artist right now",
  "The last show that I went to",
  "The next trip I'm planning",
  "Best meal I've had recently",
];

type EditingSection = {
  key: string;
  title: string;
  type: "multi-select" | "single-select" | "text";
  options: string[];
  field: DisplayField;
  maxSelections?: number;
  note?: string;
  allowOther?: boolean;
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
  if (!items || items.length === 0) {
    return <Text style={styles.emptyText}>Not set</Text>;
  }
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
  if (!text) return <Text style={styles.emptyText}>Not set</Text>;
  return <Text style={styles.itemText}>{text}</Text>;
}

function useToggleAnim(value: boolean) {
  const ref = useRef<Animated.Value | null>(null);
  if (ref.current === null) {
    ref.current = new Animated.Value(value ? 1 : 0);
  }
  useEffect(() => {
    Animated.timing(ref.current!, { toValue: value ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [value]);
  return ref.current;
}

function CustomToggle({ value, onValueChange, disabled, testID }: { value: boolean; onValueChange: (v: boolean) => void; disabled?: boolean; testID?: string }) {
  const anim = useToggleAnim(value);
  const toggle = () => {
    if (disabled) return;
    onValueChange(!value);
  };
  const trackBg = anim.interpolate({ inputRange: [0, 1], outputRange: ["#d4d4d4", "#171717"] });
  const thumbLeft = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });
  return (
    <Pressable onPress={toggle} testID={testID} style={{ opacity: disabled ? 0.5 : 1 }}>
      <Animated.View style={{ width: 51, height: 31, borderRadius: 15.5, backgroundColor: trackBg, justifyContent: "center" }}>
        <Animated.View style={{ position: "absolute", left: thumbLeft, width: 27, height: 27, borderRadius: 13.5, backgroundColor: "#ffffff", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2 }} />
      </Animated.View>
    </Pressable>
  );
}

export default function MyProfileScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const { logout } = useAuth();
  const [editing, setEditing] = useState<EditingSection>(null);
  const [editingBasic, setEditingBasic] = useState(false);
  const [editingBasicField, setEditingBasicField] = useState<EditingSection>(null);
  const [editingPrompts, setEditingPrompts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [photoLoading, setPhotoLoading] = useState<number | null>(null);

  const { data: apiProfile, isLoading, error } = useQuery<ApiProfile>({
    queryKey: ["/api/mobile/profile"],
  });

  const profile: DisplayProfile | null = apiProfile ? mapApiToDisplay(apiProfile) : null;

  const handleDeletePhoto = useCallback(async (photoId: string, index: number) => {
    setPhotoLoading(index);
    try {
      await apiRequest("DELETE", `/api/mobile/profile/photos/${photoId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/mobile/profile"] });
    } catch {
      Alert.alert("Error", "Failed to delete photo. Please try again.");
    } finally {
      setPhotoLoading(null);
    }
  }, []);

  const handlePickPhoto = useCallback(async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photo library to upload photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]?.base64) return;

    setPhotoLoading(index);
    try {
      const asset = result.assets[0];
      const mimeType = asset.mimeType || "image/jpeg";
      const photoData = `data:${mimeType};base64,${asset.base64}`;
      await apiRequest("POST", "/api/mobile/profile/photos", {
        photoData,
        displayOrder: index,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/mobile/profile"] });
    } catch {
      Alert.alert("Error", "Failed to upload photo. Please try again.");
    } finally {
      setPhotoLoading(null);
    }
  }, []);

  const profileMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await apiRequest("PATCH", "/api/mobile/profile", body);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mobile/profile"] });
    },
  });

  const { data: introductionsData } = useQuery<{ active: boolean }>({
    queryKey: ["/api/mobile/introductions"],
  });

  const introductionsMutation = useMutation({
    mutationFn: async (active: boolean) => {
      const res = await apiRequest("PATCH", "/api/mobile/introductions", { active });
      return res.json();
    },
    onMutate: async (active: boolean) => {
      await queryClient.cancelQueries({ queryKey: ["/api/mobile/introductions"] });
      const previous = queryClient.getQueryData<{ active: boolean }>(["/api/mobile/introductions"]);
      queryClient.setQueryData(["/api/mobile/introductions"], { active });
      return { previous };
    },
    onError: (_err, _active, context: any) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["/api/mobile/introductions"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mobile/introductions"] });
    },
  });

  const introductionsActive = introductionsData?.active ?? false;

  const handleSave = useCallback(async (field: DisplayField, value: string | string[]) => {
    const body = mapFieldToApiBody(field, value, apiProfile);
    if (Object.keys(body).length === 0) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await profileMutation.mutateAsync(body);
    } catch (err: any) {
      console.error("Failed to save profile field:", err?.message || err);
      setSaveError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [profileMutation, apiProfile]);

  const handlePromptsSave = useCallback(async (
    newPrompts: { id?: string; question: string; answer: string }[]
  ) => {
    if (!apiProfile) return;
    setIsSaving(true);
    try {
      const oldPrompts = apiProfile.prompts || [];
      const oldIds = new Set(oldPrompts.map((p) => p.id));
      const newIds = new Set(newPrompts.filter((p) => p.id).map((p) => p.id));

      const toDelete = oldPrompts.filter((p) => !newIds.has(p.id));
      for (const p of toDelete) {
        await apiRequest("DELETE", `/api/mobile/profile/prompts/${p.id}`);
      }

      for (let i = 0; i < newPrompts.length; i++) {
        const np = newPrompts[i];
        if (np.id && oldIds.has(np.id)) {
          const old = oldPrompts.find((o) => o.id === np.id);
          if (old && (old.promptQuestion !== np.question || old.promptAnswer !== np.answer)) {
            await apiRequest("PUT", `/api/mobile/profile/prompts/${np.id}`, {
              promptQuestion: np.question,
              promptAnswer: np.answer,
            });
          }
        } else if (!np.id) {
          await apiRequest("POST", "/api/mobile/profile/prompts", {
            promptQuestion: np.question,
            promptAnswer: np.answer,
            displayOrder: i,
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["/api/mobile/profile"] });
    } catch (err) {
      console.error("Failed to save prompts:", err);
      setSaveError("Failed to save prompts. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [apiProfile]);

  const openEditor = (
    key: string,
    title: string,
    type: "multi-select" | "single-select" | "text",
    options: string[],
    field: DisplayField,
    maxSelections?: number,
    note?: string,
    allowOther?: boolean,
  ) => {
    setEditing({ key, title, type, options, field, maxSelections, note, allowOther });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top + webTopInset }]}>
        <LineLoader />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top + webTopInset }]}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => queryClient.invalidateQueries({ queryKey: ["/api/mobile/profile"] })}
          activeOpacity={0.7}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (editingBasic) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.basicHeader}>
          <TouchableOpacity
            onPress={() => {
              if (editingBasicField) {
                setEditingBasicField(null);
              } else {
                setEditingBasic(false);
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>{"\u2190"} Back</Text>
          </TouchableOpacity>
          <Text style={styles.basicTitle}>Basic Information</Text>
        </View>

        {!editingBasicField && (
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
                <Text style={styles.basicFieldValue}>{profile.firstName}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#a3a3a3" />
            </TouchableOpacity>

            <View style={styles.basicFieldCard}>
              <View>
                <Text style={styles.basicFieldLabel}>Gender</Text>
                <Text style={styles.basicFieldValue}>{profile.gender}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.basicFieldCard}
              onPress={() =>
                setEditingBasicField({
                  key: "city", title: "City", type: "text", options: [], field: "city",
                })
              }
              activeOpacity={0.6}
            >
              <View>
                <Text style={styles.basicFieldLabel}>City</Text>
                <Text style={styles.basicFieldValue}>{profile.city || "Not set"}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#a3a3a3" />
            </TouchableOpacity>
          </View>
        )}

        {editingBasicField && (
          <EditProfileSection
            key={editingBasicField.key}
            visible
            title={editingBasicField.title}
            type={editingBasicField.type}
            options={editingBasicField.options}
            currentValue={editingBasicField.field === "name" ? profile.firstName : (profile[editingBasicField.field] as string)}
            onSave={(value) => {
              if (editingBasicField.field === "name") {
                const existingLastName = apiProfile?.lastName || "";
                const fullName = existingLastName ? `${value} ${existingLastName}` : value;
                handleSave(editingBasicField.field, fullName);
              } else {
                handleSave(editingBasicField.field, value);
              }
              setEditingBasicField(null);
            }}
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
          <TouchableOpacity onPress={() => setShowSettings(true)} activeOpacity={0.6} style={styles.settingsCog}>
            <Ionicons name="settings-outline" size={22} color="#171717" />
          </TouchableOpacity>
        </View>

        {isSaving && (
          <View style={styles.savingBanner}>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text style={styles.savingText}>Saving...</Text>
          </View>
        )}

        {saveError && (
          <TouchableOpacity style={styles.errorBanner} onPress={() => setSaveError(null)} activeOpacity={0.8}>
            <Text style={styles.errorBannerText}>{saveError}</Text>
            <Text style={styles.errorDismiss}>Dismiss</Text>
          </TouchableOpacity>
        )}

        <View style={styles.body}>
          <SectionHeader title="Photos" visibility="Visible" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photosScroll}
            contentContainerStyle={styles.photosContainer}
          >
            {profile.photos.map((data, index) =>
              data ? (
                <View key={index} style={styles.photoWrapper}>
                  <Image source={{ uri: data }} style={styles.photo} />
                  {photoLoading === index ? (
                    <View style={styles.photoRemoveButton}>
                      <ActivityIndicator size="small" color="#fff" />
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.photoRemoveButton}
                      onPress={() => {
                        const photoId = profile.photoIds[index];
                        if (photoId) handleDeletePhoto(photoId, index);
                      }}
                      activeOpacity={0.7}
                      testID={`remove-photo-${index}`}
                    >
                      <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  key={index}
                  style={styles.photoPlaceholder}
                  onPress={() => handlePickPhoto(index)}
                  activeOpacity={0.6}
                  disabled={photoLoading === index}
                  testID={`add-photo-${index}`}
                >
                  {photoLoading === index ? (
                    <ActivityIndicator size="small" color="#a3a3a3" />
                  ) : (
                    <Text style={styles.photoPlaceholderText}>+</Text>
                  )}
                </TouchableOpacity>
              )
            )}
          </ScrollView>

          <View style={styles.divider} />

          <View style={styles.introductionsRow}>
            <View style={styles.introductionsLeft}>
              <Text style={styles.introductionsLabel}>Introductions</Text>
              <Text style={styles.introductionsSubtitle}>Receive a new introductions each week</Text>
            </View>
            <View style={styles.introductionsRight}>
              <Text style={styles.introductionsActive}>{introductionsActive ? "Active" : "Paused"}</Text>
              <CustomToggle
                value={introductionsActive}
                onValueChange={(value) => introductionsMutation.mutate(value)}
                disabled={introductionsMutation.isPending}
                testID="introductions-toggle"
              />
            </View>
          </View>

          <View style={styles.divider} />

          <SectionHeader title="Basic Information" visibility="Visible" onEdit={() => { setEditingBasicField(null); setEditingBasic(true); }} />
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{profile.firstName || "Not set"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender:</Text>
              <Text style={styles.infoValue}>{profile.gender || "Not set"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>City:</Text>
              <Text style={styles.infoValue}>{profile.city || "Not set"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <SectionHeader title="Prompts" visibility="Visible" onEdit={() => setEditingPrompts(true)} />
          <View style={styles.promptsContainer}>
            {profile.prompts.length === 0 ? (
              <Text style={styles.emptyText}>No prompts yet</Text>
            ) : (
              profile.prompts.map((prompt, index) => (
                <View key={prompt.id || index} style={styles.promptItem}>
                  <Text style={styles.promptQuestion}>{prompt.question}</Text>
                  <Text style={styles.promptAnswer}>{prompt.answer}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.divider} />

          <SectionHeader
            title="What you're doing this week"
            visibility="Visible"
            onEdit={() => openEditor("thisWeek", "What you're doing this week", "multi-select", THIS_WEEK_OPTIONS, "thisWeek", undefined, undefined, true)}
          />
          <TagList items={profile.thisWeek} />

          <View style={styles.divider} />

          <SectionHeader
            title="Your regular rituals"
            visibility="Visible"
            onEdit={() => openEditor("regularRituals", "Your regular rituals", "multi-select", REGULAR_RITUALS_OPTIONS, "regularRituals", undefined, undefined, true)}
          />
          <TagList items={profile.regularRituals} />

          <View style={styles.divider} />

          <SectionHeader
            title="Upcoming plans"
            visibility="Visible"
            onEdit={() => openEditor("upcomingPlans", "Upcoming plans", "multi-select", UPCOMING_PLANS_OPTIONS, "upcomingPlans", undefined, undefined, true)}
          />
          <TagList items={profile.upcomingPlans} />

          <View style={styles.divider} />

          <SectionHeader
            title="Why you're here"
            visibility="Hidden"
            onEdit={() => openEditor("whyHere", "Why you're here", "multi-select", WHY_HERE_OPTIONS, "whyHere")}
          />
          <TagList items={profile.whyHere} />

          <View style={styles.divider} />

          <SectionHeader
            title="Where you spend time"
            visibility="Hidden"
            onEdit={() => openEditor("londonAreas", "Where you spend time", "multi-select", LONDON_AREAS_OPTIONS, "londonAreas", undefined, "We'll prioritize matches near you - but you'll still see people across London.")}
          />
          <TagList items={profile.londonAreas} />

          <View style={styles.divider} />

          <SectionHeader
            title="Your values & lifestyle"
            visibility="Hidden"
            onEdit={() => openEditor("values", "Your values & lifestyle", "multi-select", VALUES_OPTIONS, "values")}
          />
          <TagList items={profile.values} />

          <View style={styles.divider} />

          <SectionHeader
            title="Lifestyle preferences"
            visibility="Hidden"
            onEdit={() => openEditor("lifestyle", "Lifestyle preferences", "multi-select", LIFESTYLE_OPTIONS, "lifestyle")}
          />
          <TagList items={profile.lifestyle} />

          <View style={styles.divider} />

          <SectionHeader
            title="Ideal social week"
            visibility="Hidden"
            onEdit={() => openEditor("idealWeek", "Ideal social week", "single-select", IDEAL_WEEK_OPTIONS, "idealWeek", undefined, "Helps us match you with similar energy")}
          />
          <TagList items={profile.idealWeek ? [profile.idealWeek] : []} />

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
          <TagList items={profile.relationshipStatus ? [profile.relationshipStatus] : []} />

          <View style={styles.divider} />

          <SectionHeader
            title="Where you're at in life"
            visibility="Hidden"
            onEdit={() => openEditor("whereAtInLife", "Where you're at in life", "multi-select", WHERE_AT_OPTIONS, "whereAtInLife")}
          />
          <TagList items={profile.whereAtInLife} />

          <View style={styles.divider} />

          <SectionHeader
            title="What matters in friendships"
            visibility="Hidden"
            onEdit={() => openEditor("friendshipMatters", "What matters in friendships", "multi-select", FRIENDSHIP_MATTERS_OPTIONS, "friendshipMatters")}
          />
          <TagList items={profile.friendshipMatters} />

          <View style={styles.divider} />

          <SectionHeader title="Social verification" visibility="Hidden" />
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={styles.socialCard}
              onPress={() => openEditor("instagram", "Instagram handle", "text", [], "instagram")}
              activeOpacity={0.6}
            >
              <View style={styles.socialCardContent}>
                <Text style={styles.socialCardLabel}>Instagram</Text>
                <Text style={styles.socialCardValue} numberOfLines={1}>{profile.instagram || "Not set"}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#a3a3a3" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialCard}
              onPress={() => openEditor("linkedin", "LinkedIn URL", "text", [], "linkedin")}
              activeOpacity={0.6}
            >
              <View style={styles.socialCardContent}>
                <Text style={styles.socialCardLabel}>LinkedIn</Text>
                <Text style={styles.socialCardValue} numberOfLines={1}>{profile.linkedin || "Not set"}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#a3a3a3" />
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {editing && profile && (
        <EditProfileSection
          key={editing.key + JSON.stringify(profile[editing.field])}
          visible
          title={editing.title}
          type={editing.type}
          options={editing.options}
          currentValue={profile[editing.field] as string | string[]}
          onSave={(value) => {
            handleSave(editing.field, value);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
          maxSelections={editing.maxSelections}
          note={editing.note}
          allowOther={editing.allowOther}
        />
      )}

      {editingPrompts && profile && (
        <EditPrompts
          key={"prompts-" + profile.prompts.length}
          visible
          availablePrompts={PROMPT_OPTIONS}
          currentPrompts={profile.prompts}
          onSave={(prompts) => {
            handlePromptsSave(prompts);
            setEditingPrompts(false);
          }}
          onClose={() => setEditingPrompts(false)}
        />
      )}

      <SettingsScreen
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        subscriptionStatus={apiProfile?.subscriptionStatus}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F7",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#171717",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#171717",
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  retryButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#fafafa",
  },
  savingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#171717",
    paddingVertical: 8,
    gap: 8,
  },
  savingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#ffffff",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  errorBannerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#ffffff",
    flex: 1,
  },
  errorDismiss: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#ffffff",
    marginLeft: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  settingsCog: {
    padding: 4,
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
    paddingTop: 8,
    gap: 10,
    flexDirection: "row",
  },
  photoWrapper: {
    position: "relative" as const,
  },
  photo: {
    width: 100,
    height: 130,
    borderRadius: 12,
    backgroundColor: "#e5e5e5",
  },
  photoRemoveButton: {
    position: "absolute" as const,
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    zIndex: 1,
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
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#a3a3a3",
    fontStyle: "italic",
  },
  socialContainer: {
    gap: 12,
  },
  socialCard: {
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
  socialCardContent: {
    flex: 1,
    marginRight: 8,
  },
  socialCardLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#737373",
    marginBottom: 4,
  },
  socialCardValue: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
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
  introductionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  introductionsLeft: {
    flex: 1,
    marginRight: 12,
  },
  introductionsLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#171717",
    marginBottom: 2,
  },
  introductionsSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#737373",
  },
  introductionsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  introductionsActive: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#737373",
  },
});
