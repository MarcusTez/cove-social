import { useState } from "react";
import { BottomNav } from "./components/BottomNav";
import { ProfileCard } from "./components/ProfileCard";
import { ChatList } from "./components/ChatList";
import { ChatThread } from "./components/ChatThread";
import { FullProfile } from "./components/FullProfile";
import { MyProfile } from "./components/MyProfile";
import { Events } from "./components/Events";
import { Splash } from "./components/Splash";
import { LoginRegister } from "./components/LoginRegister";

interface Profile {
  id: number;
  name: string;
  photoUrl: string;
  photos: string[];
  location: string;
  thisWeek: string;
  favoriteSong: string;
  interests: string[];
  regularRituals: string[];
  promptQuestion: string;
  promptAnswer: string;
  matchReasons?: string[];
}

interface Chat {
  id: number;
  name: string;
  photoUrl: string;
  lastMessage: string;
  timestamp: string;
  unread?: boolean;
}

interface Message {
  id: number;
  text: string;
  sender: "me" | "them";
  timestamp: string;
}

const profiles: Profile[] = [
  {
    id: 1,
    name: "Lena",
    photoUrl:
      "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsaW5nfGVufDF8fHx8MTc3MjQ1NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    photos: [
      "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsaW5nfGVufDF8fHx8MTc3MjQ1NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1763259405177-0121bf79da0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMGxpZmVzdHlsZSUyMG91dGRvb3IlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI0NTk5MTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1631214570417-f7f0b73134b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGNyZWF0aXZlJTIwcHJvZmVzc2lvbmFsJTIwY2FuZGlkJTIwcGhvdG98ZW58MXx8fHwxNzcyNDU5OTEyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    location: "London",
    thisWeek:
      "A couple of runs + a comedy night, and one good dinner.",
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
    photos: [
      "https://images.unsplash.com/photo-1764084051711-45a3b7c84c06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBjYXN1YWwlMjBwb3J0cmFpdCUyMGhhcHB5fGVufDF8fHx8MTc3MjQ1NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1603110505034-7e7dd9458f27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBjYXN1YWwlMjBwb3J0cmFpdCUyMGhhcHB5JTIwbGlmZXN0eWxlfGVufDF8fHx8MTc3MjQ1OTkxMnww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1764451850143-428a7f9e931d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMGNyZWF0aXZlJTIwb3V0ZG9vciUyMGNhbmRpZCUyMHBob3RvfGVufDF8fHx8MTc3MjQ1OTkxMnww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
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
  {
    id: 3,
    name: "Sofia",
    photoUrl:
      "https://images.unsplash.com/photo-1758599543120-4e462429a4d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0JTIwb3V0ZG9vcnxlbnwxfHx8fDE3NzI0NTc0Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    photos: [
      "https://images.unsplash.com/photo-1758599543120-4e462429a4d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0JTIwb3V0ZG9vcnxlbnwxfHx8fDE3NzI0NTc0Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1769865562984-3be33b64632c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGxpZmVzdHlsZSUyMGNhbmRpZCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjQ1OTkxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    location: "Brighton",
    thisWeek:
      "Building my side project, Saturday farmers market, maybe a pottery class.",
    favoriteSong: "Bon Iver – Holocene",
    interests: [
      "Tech startups",
      "Pottery",
      "Farmers markets",
      "Hiking",
      "Sustainable living",
      "Cooking",
    ],
    regularRituals: [
      "Morning meditation",
      "Hiking",
      "Pottery",
      "Farmers market",
      "Cooking",
      "Reading",
      "Side projects",
      "Yoga",
    ],
    promptQuestion: "A small ritual I care about…",
    promptAnswer:
      "Saturday morning farmers market, then cooking something new for friends.",
  },
  {
    id: 4,
    name: "James",
    photoUrl:
      "https://images.unsplash.com/photo-1762708550141-2688121b9ebd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMGNyZWF0aXZlJTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyNDU3NDc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    photos: [
      "https://images.unsplash.com/photo-1762708550141-2688121b9ebd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMGNyZWF0aXZlJTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyNDU3NDc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1603110505034-7e7dd9458f27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBjYXN1YWwlMjBwb3J0cmFpdCUyMGhhcHB5JTIwbGlmZXN0eWxlfGVufDF8fHx8MTc3MjQ1OTkxMnww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1764451850143-428a7f9e931d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMGNyZWF0aXZlJTIwb3V0ZG9vciUyMGNhbmRpZCUyMHBob3RvfGVufDF8fHx8MTc3MjQ1OTkxMnww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    location: "London",
    thisWeek:
      "Cycling along the river, brunch with the crew, and a film at the Picturehouse.",
    favoriteSong: "LCD Soundsystem – All My Friends",
    interests: [
      "Cycling",
      "Independent film",
      "Brunch",
      "Architecture",
      "Photography",
      "Craft beer",
    ],
    regularRituals: [
      "Cycling",
      "Film nights",
      "Brunch",
      "Photography walks",
      "Architecture tours",
      "Pub nights",
      "Cooking",
      "Running",
    ],
    promptQuestion: "A small ritual I care about…",
    promptAnswer:
      "Sunday cycle along the Thames, stopping for coffee at a different spot each time.",
  },
  {
    id: 5,
    name: "Aisha",
    photoUrl:
      "https://images.unsplash.com/photo-1771430905474-11adef6fe314?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0JTIwbGlmZXN0eWxlfGVufDF8fHx8MTc3MjQ1NzQ3OHww&ixlib=rb-4.1.0&q=80&w=1080",
    photos: [
      "https://images.unsplash.com/photo-1771430905474-11adef6fe314?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0JTIwbGlmZXN0eWxlfGVufDF8fHx8MTc3MjQ1NzQ3OHww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1763259405177-0121bf79da0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMGxpZmVzdHlsZSUyMG91dGRvb3IlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI0NTk5MTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1769865562984-3be33b64632c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGxpZmVzdHlsZSUyMGNhbmRpZCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjQ1OTkxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    location: "Manchester",
    thisWeek:
      "Tennis lesson, dinner party at mine, and catching up on a podcast backlog.",
    favoriteSong: "SZA – Open Arms",
    interests: [
      "Tennis",
      "Hosting dinners",
      "Podcasts",
      "Interior design",
      "Wine tasting",
      "Travel",
    ],
    regularRituals: [
      "Tennis",
      "Hosting",
      "Podcasts",
      "Yoga",
      "Wine club",
      "Book club",
      "Cooking",
      "Travel planning",
    ],
    promptQuestion: "A small ritual I care about…",
    promptAnswer:
      "Friday evening wind-down: good wine, a podcast, and planning the weekend.",
  },
];

const chats: Chat[] = [
  {
    id: 1,
    name: "Lena",
    photoUrl:
      "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsaW5nfGVufDF8fHx8MTc3MjQ1NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    lastMessage:
      "Perfect timing actually – I'm free this Thursday",
    timestamp: "10:30 AM",
    unread: true,
  },
  {
    id: 2,
    name: "Marcus",
    photoUrl:
      "https://images.unsplash.com/photo-1764084051711-45a3b7c84c06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBjYXN1YWwlMjBwb3J0cmFpdCUyMGhhcHB5fGVufDF8fHx8MTc3MjQ1NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    lastMessage: "That coffee ritual sounds amazing",
    timestamp: "Yesterday",
    unread: false,
  },
  {
    id: 3,
    name: "Sofia",
    photoUrl:
      "https://images.unsplash.com/photo-1758599543120-4e462429a4d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0JTIwb3V0ZG9vcnxlbnwxfHx8fDE3NzI0NTc0Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    lastMessage:
      "Would love to hear more about your side project!",
    timestamp: "Yesterday",
    unread: false,
  },
  {
    id: 4,
    name: "James",
    photoUrl:
      "https://images.unsplash.com/photo-1762708550141-2688121b9ebd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMGNyZWF0aXZlJTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyNDU3NDc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    lastMessage: "The Picturehouse always has great picks",
    timestamp: "1 Mar",
    unread: false,
  },
  {
    id: 5,
    name: "Aisha",
    photoUrl:
      "https://images.unsplash.com/photo-1771430905474-11adef6fe314?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0JTIwbGlmZXN0eWxlfGVufDF8fHx8MTc3MjQ1NzQ3OHww&ixlib=rb-4.1.0&q=80&w=1080",
    lastMessage: "Your dinner party sounds lovely",
    timestamp: "28 Feb",
    unread: false,
  },
];

const messages: Message[] = [
  {
    id: 1,
    text: "Hey! Love your intro profile – that Sunday ritual sounds perfect 🌤️",
    sender: "them",
    timestamp: "9:15 AM",
  },
  {
    id: 2,
    text: "Thanks! Yeah it's my favourite part of the week honestly",
    sender: "me",
    timestamp: "9:18 AM",
  },
  {
    id: 3,
    text: "I saw you mentioned the comedy night – any recommendations?",
    sender: "them",
    timestamp: "9:20 AM",
  },
  {
    id: 4,
    text: "Oh definitely! There's this new place in Shoreditch that does open mic nights. Really intimate vibe",
    sender: "me",
    timestamp: "9:22 AM",
  },
  {
    id: 5,
    text: "That sounds great. Would love to check it out sometime",
    sender: "them",
    timestamp: "9:25 AM",
  },
  {
    id: 6,
    text: "For sure! They do it every Thursday. Let me know if you fancy going",
    sender: "me",
    timestamp: "9:28 AM",
  },
  {
    id: 7,
    text: "Perfect timing actually – I'm free this Thursday",
    sender: "them",
    timestamp: "10:30 AM",
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "home" | "chat" | "events" | "profile"
  >("home");
  const [activeChatId, setActiveChatId] = useState<
    number | null
  >(null);
  const [viewingProfileId, setViewingProfileId] = useState<
    number | null
  >(null);
  const [viewingFullProfileId, setViewingFullProfileId] =
    useState<number | null>(null);
  const [appState, setAppState] = useState<
    "splash" | "auth" | "app"
  >("splash");
  const [hasIntroductions, setHasIntroductions] =
    useState(true); // Toggle this to show/hide introductions

  const handleMessage = (profileId: number) => {
    console.log(`Message profile ${profileId}`);
    // Could navigate to chat here
  };

  const handleViewProfile = (profileId: number) => {
    setViewingFullProfileId(profileId);
  };

  const handleChatSelect = (chatId: number) => {
    setActiveChatId(chatId);
  };

  const handleBackToChats = () => {
    setActiveChatId(null);
  };

  const handleViewChatProfile = () => {
    if (activeChatId) {
      setViewingProfileId(activeChatId);
    }
  };

  const activeChat = activeChatId
    ? chats.find((c) => c.id === activeChatId)
    : null;
  const viewingProfile = viewingProfileId
    ? profiles.find((p) => p.id === viewingProfileId)
    : null;
  const viewingFullProfile = viewingFullProfileId
    ? profiles.find((p) => p.id === viewingFullProfileId)
    : null;
  const unreadCount = chats.filter((c) => c.unread).length;

  // Show splash screen
  if (appState === "splash") {
    return <Splash onComplete={() => setAppState("auth")} />;
  }

  // Show auth screen
  if (appState === "auth") {
    return (
      <LoginRegister onComplete={() => setAppState("app")} />
    );
  }

  // If viewing full profile from home
  if (viewingFullProfile) {
    return (
      <FullProfile
        name={viewingFullProfile.name}
        photos={viewingFullProfile.photos}
        location={viewingFullProfile.location}
        thisWeek={viewingFullProfile.thisWeek}
        favoriteSong={viewingFullProfile.favoriteSong}
        interests={viewingFullProfile.interests}
        regularRituals={viewingFullProfile.regularRituals}
        promptQuestion={viewingFullProfile.promptQuestion}
        promptAnswer={viewingFullProfile.promptAnswer}
        onBack={() => setViewingFullProfileId(null)}
        onMessage={() => handleMessage(viewingFullProfile.id)}
      />
    );
  }

  // If viewing a profile from chat
  if (viewingProfile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto">
          {/* Header with back button */}
          <div className="px-5 py-6 border-b border-border">
            <button
              onClick={() => setViewingProfileId(null)}
              className="flex items-center gap-2 text-foreground hover:opacity-70 transition-opacity"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <span>←</span>
              <span>Back to chat</span>
            </button>
          </div>

          <div className="px-5 py-6">
            <ProfileCard
              name={viewingProfile.name}
              photoUrl={viewingProfile.photoUrl}
              location={viewingProfile.location}
              thisWeek={viewingProfile.thisWeek}
              favoriteSong={viewingProfile.favoriteSong}
              interests={viewingProfile.interests}
              regularRituals={viewingProfile.regularRituals}
              promptQuestion={viewingProfile.promptQuestion}
              promptAnswer={viewingProfile.promptAnswer}
              onMessage={() => {
                setViewingProfileId(null);
              }}
              onViewProfile={() => {}}
            />
          </div>
        </div>
      </div>
    );
  }

  // If in a chat thread
  if (activeChat && activeChatId) {
    return (
      <ChatThread
        name={activeChat.name}
        photoUrl={activeChat.photoUrl}
        messages={messages}
        onBack={handleBackToChats}
        onViewProfile={handleViewChatProfile}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Home Tab */}
      {activeTab === "home" && (
        <div className="max-w-md mx-auto px-5 py-8">
          {!hasIntroductions ? (
            // Empty state - no introductions available
            <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-180px)]">
              <h1
                className="mb-4"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.75rem",
                  fontWeight: 500,
                  lineHeight: "1.2",
                }}
              >
                Your introductions are being prepared
              </h1>

              <p
                className="max-w-sm"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1rem",
                  color: "var(--color-muted-foreground)",
                  lineHeight: "1.5",
                }}
              >
                We introduce members thoughtfully, not
                endlessly.
                <br />
                Your next curated introductions will arrive
                soon.
              </p>
            </div>
          ) : (
            // Has introductions
            <>
              <h1
                className="mb-4"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.75rem",
                  fontWeight: 500,
                  lineHeight: "1.2",
                }}
              >
                This week's introductions
              </h1>

              <p
                className="mb-8"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1rem",
                  color: "var(--color-muted-foreground)",
                  lineHeight: "1.5",
                }}
              >
                We introduce slowly and with care.
                <br />
                What unfolds is up to you.
              </p>

              <div className="space-y-6 mb-12">
                {profiles.slice(0, 2).map((profile) => (
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
                    onViewProfile={() =>
                      handleViewProfile(profile.id)
                    }
                  />
                ))}
              </div>

              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.5rem",
                  fontWeight: 500,
                  lineHeight: "1.3",
                  marginBottom: "1rem",
                }}
              >
                Deliberate connections are rare. We treat them
                that way.
              </h2>

              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1rem",
                  color: "var(--color-muted-foreground)",
                  lineHeight: "1.5",
                }}
              >
                No algorithms pushing volume. No endless feeds.
                Just considered introductions and the space to
                begin.
              </p>
            </>
          )}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div className="max-w-md mx-auto">
          <div className="px-5 py-6 border-b border-border">
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.75rem",
                fontWeight: 500,
                lineHeight: "1.2",
              }}
            >
              Chat
            </h1>
          </div>
          <ChatList
            chats={chats}
            onChatSelect={handleChatSelect}
          />
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && <Events />}

      {/* Profile Tab */}
      {activeTab === "profile" && <MyProfile />}

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadCount={unreadCount}
      />
    </div>
  );
}