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
    chat.tsx            # Chat tab - placeholder
    events.tsx          # Events tab - placeholder
    profile.tsx         # My Profile tab - placeholder
components/
  CoveSplash.tsx        # Animated splash screen
  ProfileCard.tsx       # Profile introduction card component
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
   - **Chat**: Conversations (placeholder, awaiting backend)
   - **Events**: Events listing (placeholder, awaiting backend)
   - **My Profile**: User profile (placeholder, awaiting backend)

## Design System

- Background: #fafafa
- Foreground/text: #171717
- Muted text: #737373
- Borders: #e5e5e5
- Cards: #ffffff with 1px border
- Tags (interests): #f5f5f5 background
- Match reason tags: #171717 background, white text
- Buttons: #171717 background, #fafafa text
- Border radius: 12px (buttons/inputs), 16px (cards), 20px (tags)

## Workflows

- `Start Backend`: Runs `npm run server:dev` (Express on port 5000)
- `Start Frontend`: Runs `npm run expo:dev` (Expo on port 8081)
