# Cove

A mobile application built with Expo (React Native) and Express backend. A social introductions platform focused on deliberate, curated connections.

## Architecture

- **Frontend**: Expo SDK 54 with React Native, using expo-router for file-based routing
- **Backend**: Express server (TypeScript) on port 5000
- **Database**: PostgreSQL with Drizzle ORM
- **State**: React Query (@tanstack/react-query) for server state
- **Fonts**: Playfair Display (serif branding/titles), Inter (sans-serif body/UI)
- **Icons**: Ionicons from @expo/vector-icons

## Project Structure

```
app/
  _layout.tsx           # Root layout (fonts, splash, providers)
  (auth)/
    _layout.tsx         # Auth stack layout
    index.tsx           # Redirects to login
    login.tsx           # Login screen (email + password)
    register.tsx        # Register screen (first name, last name, email, confirm email)
  (tabs)/
    _layout.tsx         # Tab navigation layout (Home, Chat, Events, My Profile)
    index.tsx           # Home tab - introductions screen
    chat.tsx            # Chat tab - conversation list
    events.tsx          # Events tab - placeholder
    profile.tsx         # My Profile tab - editable profile with section editors
  chat/
    [id].tsx            # Chat thread (full screen, no tab bar)
components/
  CoveSplash.tsx        # Animated splash screen
  ProfileCard.tsx       # Profile introduction card component
  BlockModal.tsx        # Block user confirmation modal
  EditProfileSection.tsx # Reusable editor modal (multi-select, single-select, text)
  EditPrompts.tsx       # Prompts editor modal (pick 1-3 prompts with answers)
  ErrorBoundary.tsx     # Error boundary wrapper
  ErrorFallback.tsx     # Error fallback UI
  KeyboardAwareScrollViewCompat.tsx
constants/
  colors.ts             # Color definitions
lib/
  query-client.ts       # React Query client config
server/
  index.ts              # Express server entry
  routes.ts             # API routes
shared/
  schema.ts             # Drizzle database schemas
```

## App Flow

1. Splash screen with animated "Cove" branding
2. Auth screens (login/register) - forms ready for backend API connection
3. Main app with 4-tab navigation:
   - **Home**: Weekly introductions with profile cards (or empty "being prepared" state)
   - **Chat**: Conversation list with unread badges → chat thread with message bubbles
   - **Events**: Events listing (placeholder, awaiting backend)
   - **My Profile**: Scrollable profile with editable sections (photos, basic info, prompts, activities, rituals, values, lifestyle, areas, plans, ideal week, describe words, relationship status, life stage, friendship priorities, social links)

## Chat Feature

- Chat list shows conversations with avatars, last message, timestamps, unread badges
- Chat thread displays messages as bubbles (dark = sent, light = received) with inverted FlatList
- 3-dot menu in thread header provides: View intro profile, Block user, Report user
- Block modal with cancel/confirm actions
- Message composer with text input and send button
- Currently uses mock data; messaging mechanism to be built later

## Design System

- Background: #fafafa
- Foreground/text: #171717
- Muted text: #737373
- Borders: #e5e5e5
- Cards: #ffffff with 1px border
- Tags (interests): #f5f5f5 background
- Match reason tags: #171717 background, white text
- Buttons: #171717 background, #fafafa text
- Destructive: #dc2626 (block/report actions)
- Chat bubbles: #171717 (sent), #f5f5f5 (received)
- Border radius: 12px (buttons/inputs), 16px (cards), 18px (chat bubbles), 20px (tags), 24px (pill buttons)

## Workflows

- `Start Backend`: Runs `npm run server:dev` (Express on port 5000)
- `Start Frontend`: Runs `npm run expo:dev` (Expo on port 8081)
