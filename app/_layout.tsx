import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_900Black,
  useFonts as usePlayfairFonts,
} from "@expo-google-fonts/playfair-display";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts as useInterFonts,
} from "@expo-google-fonts/inter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AuthProvider, useAuth } from "@/lib/auth";
import { CoveSplash } from "@/components/CoveSplash";
import LineLoader from "@/components/LineLoader";
import { registerForPushNotifications } from "@/lib/notifications";

SplashScreen.preventAutoHideAsync();

function AuthLoadingScreen() {
  return (
    <View style={loadingStyles.container}>
      <LineLoader />
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf9f7",
    justifyContent: "center",
    alignItems: "center",
  },
});

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const pushRegisteredRef = useRef(false);
  const notificationListenerRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
      pushRegisteredRef.current = false;
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (pushRegisteredRef.current) return;
    pushRegisteredRef.current = true;
    registerForPushNotifications();
  }, [isAuthenticated]);

  useEffect(() => {
    notificationListenerRef.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const conversationId = response.notification.request.content.data?.conversationId as string | undefined;
      if (conversationId) {
        router.push(`/chat/${conversationId}`);
      }
    });

    return () => {
      notificationListenerRef.current?.remove();
    };
  }, [router]);

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="profile/[matchId]" options={{ headerShown: false }} />
      <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [playfairLoaded, playfairError] = usePlayfairFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_900Black,
  });

  const [interLoaded, interError] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const fontsLoaded = playfairLoaded && interLoaded;
  const fontError = playfairError || interError;

  const [splashComplete, setSplashComplete] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const handleSplashComplete = useCallback(() => {
    setSplashComplete(true);
  }, []);

  if (!fontsLoaded && !fontError) return null;

  if (!splashComplete) {
    return <CoveSplash onComplete={handleSplashComplete} />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
