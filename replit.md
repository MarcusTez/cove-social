# Cove

A mobile application built with Expo (React Native) and Express backend. A social introductions platform focused on deliberate, curated connections.

## Architecture

- **Frontend**: Expo SDK 54 with React Native, using expo-router for file-based routing
- **Backend**: Express server (TypeScript) on port 5000
- **External API**: Cove API at `EXPO_PUBLIC_COVE_API_URL` for auth, profiles, matches, etc.
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: Socket.IO for live messaging (attached to Express HTTP server)
- **State**: React Query (@tanstack/react-query) for server state
- **Auth**: JWT-based auth with access tokens (in-memory) and refresh tokens (expo-secure-store / AsyncStorage on web)
- **Fonts**: Playfair Display (serif branding/titles), Inter (sans-serif body/UI)
- **Icons**: Ionicons from @expo/vector-icons

## Project Structure

```
app/
  _layout.tsx           # Root layout (fonts, splash, providers, auth guard)
  (auth)/
    _layout.tsx         # Auth stack layout
    index.tsx           # Redirects to login
    login.tsx           # Login screen (email + password) — connected to Cove API
    register.tsx        # Waitlist screen (email, city dropdown, gender) — connected to Cove API
  (tabs)/
    _layout.tsx         # Tab navigation layout (Home, Chat, Events, My Profile)
    index.tsx           # Home tab - introductions screen
    chat.tsx            # Chat tab - conversation list (API-connected)
    events.tsx          # Events tab - placeholder
    profile.tsx         # My Profile tab - API-connected editable profile
  chat/
    [id].tsx            # Chat thread (full screen, real-time messaging via Socket.IO)
  profile/
    [matchId].tsx       # Public profile screen (match partner detail view, message CTA creates conversation)
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
  auth.tsx              # AuthContext provider, useAuth hook, token management, socket connect/disconnect
  query-client.ts       # React Query client config, apiRequest, auth header injection
  socket.ts             # Socket.IO client, useSocket hook, generateClientMessageId
server/
  index.ts              # Express server entry
  routes.ts             # API routes (Cove proxy + chat endpoints + Socket.IO setup)
  db.ts                 # Drizzle ORM database connection
  chat.ts               # Chat REST API handlers (conversations, messages, read receipts)
  socket.ts             # Socket.IO event handlers (real-time messaging, typing indicators)
shared/
  schema.ts             # Drizzle database schemas (users, conversations, conversation_participants, messages)
```

## Authentication Flow

1. On app launch, AuthProvider checks for a stored refresh token and attempts silent re-authentication via `POST /auth/refresh`
2. If no valid refresh token, user sees the login screen
3. Login calls `POST /auth/login` with email + password, receives access token (1hr) + refresh token (30 days) + user object
4. Access token stored in memory (`lib/query-client.ts` module variable), refresh token stored in expo-secure-store (native) or AsyncStorage (web)
5. All API requests automatically include `Authorization: Bearer <token>` header via `getAuthHeaders()` in query-client
6. Navigation guard in `_layout.tsx` redirects unauthenticated users to login and authenticated users to tabs
7. On login/refresh, Socket.IO client connects with the access token for real-time messaging
8. Logout calls `POST /auth/logout`, disconnects socket, clears all tokens, and resets user state

## Chat Feature (Real-time Messaging)

### Database Schema
- **conversations**: id, matchId, lastMessageAt, createdAt, updatedAt
- **conversation_participants** (join table): conversationId + userId (composite PK), displayName, photoUrl, lastReadAt
- **messages**: id, conversationId, senderId, clientMessageId (unique per conversation for idempotency), content, createdAt

### REST API Endpoints
- `GET /api/mobile/conversations` — list user's conversations with partner info, last message, unread count (sorted by lastMessageAt). Server enriches missing partner photoUrls by fetching from Cove matches API (with in-memory caching)
- `POST /api/mobile/conversations` — create or get existing conversation for a match
- `GET /api/mobile/conversations/:id/messages?cursor=<iso>&limit=30` — cursor-paginated message history
- `POST /api/mobile/conversations/:id/messages` — send message with clientMessageId idempotency
- `PATCH /api/mobile/conversations/:id/read` — update lastReadAt for the current user

### Socket.IO Events
- **Room strategy**: personal `user:{userId}` room on connect; `conversation:{id}` rooms joined/left on screen open/close
- **send_message**: client sends {conversationId, content, clientMessageId}, server persists + broadcasts
- **message:ack**: server confirms message saved with server-assigned id + timestamp
- **new_message**: broadcast to conversation room participants
- **conversation_updated**: sent to partner's user room for list refresh
- **typing / stop_typing**: broadcast to conversation room (no persistence)
- **mark_read**: updates lastReadAt on participant row

### Frontend Flow
- Chat list fetches via React Query, updates in real-time via `conversation_updated` socket event
- Chat thread uses infinite query with cursor pagination, optimistic message sending via socket
- Conversations created from match profile "Message" CTA via `POST /api/mobile/conversations`
- Unread count = messages where createdAt > participant.lastReadAt AND senderId != me

## Environment Variables

- `EXPO_PUBLIC_COVE_API_URL`: Base URL for the Cove API (environment-scoped: dev uses `https://e4af2c56-d31e-4016-b6f4-4605cbfaf1bf-00-9jq2nkbugewe.worf.replit.dev/api/mobile`, production uses `https://www.cove-social.com/api/mobile`)
- `EXPO_PUBLIC_DOMAIN`: Auto-set by Replit for the Express backend URL
- `DATABASE_URL`: PostgreSQL connection string (auto-set by Replit)

## App Flow

1. Splash screen with animated "Cove" branding
2. Auth guard checks authentication state
3. Login screen (connected to Cove API) or main app
4. Main app with 4-tab navigation:
   - **Home**: Weekly introductions fetched from `GET /api/mobile/matches` via React Query; displays profile cards with partner data (photos, overlap tags, activities, prompts, rituals) or empty "being prepared" state; pull-to-refresh supported; "View profile" navigates to public profile screen
   - **Chat**: Real-time conversation list with unread badges → chat thread with live messaging
   - **Events**: Events listing (placeholder, awaiting backend)
   - **My Profile**: API-connected profile with editable sections; fetches from `GET /profile`, saves via `PATCH /profile`, prompts via CRUD endpoints

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
