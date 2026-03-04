# Cove

A mobile application built with Expo (React Native) and Express backend.

## Architecture

- **Frontend**: Expo SDK 54 with React Native, using expo-router for file-based routing
- **Backend**: Express server (TypeScript) on port 5000
- **Database**: PostgreSQL with Drizzle ORM
- **State**: React Query (@tanstack/react-query) for server state
- **Fonts**: Playfair Display (serif branding), Inter (sans-serif UI)

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
    _layout.tsx         # Tab navigation layout
    index.tsx           # Home tab
components/
  CoveSplash.tsx        # Animated splash screen
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

## Auth Flow

The app starts with a splash screen animation, then navigates to the login screen. Users can switch between login and register screens. The forms currently show alerts as the backend API will be provided separately.

## Workflows

- `Start Backend`: Runs `npm run server:dev` (Express on port 5000)
- `Start Frontend`: Runs `npm run expo:dev` (Expo on port 8081)
