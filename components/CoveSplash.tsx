import React, { useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from "react-native-reanimated";

interface CoveSplashProps {
  onComplete: () => void;
}

export function CoveSplash({ onComplete }: CoveSplashProps) {
  const textOpacity = useSharedValue(0);
  const textScale = useSharedValue(0.92);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    textOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });

    textScale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });

    containerOpacity.value = withDelay(
      2200,
      withTiming(0, {
        duration: 600,
        easing: Easing.in(Easing.cubic),
      })
    );

    const timeout = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => clearTimeout(timeout);
  }, []);

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text style={styles.logoText}>Cove</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf9f7",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 48,
    color: "#1a1a1a",
    letterSpacing: 1,
  },
});
