import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

export default function LineLoader() {
  const lineTranslateX = useSharedValue(-1);

  useEffect(() => {
    lineTranslateX.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.cubic) }),
        withTiming(-1, { duration: 1200, easing: Easing.inOut(Easing.cubic) })
      ),
      -1,
      false
    );
  }, []);

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: lineTranslateX.value * 60 }],
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.indicator, lineStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 120,
    height: 1.5,
    backgroundColor: "#e5e5e5",
    borderRadius: 1,
    overflow: "hidden",
  },
  indicator: {
    width: 40,
    height: 1.5,
    backgroundColor: "#1a1a1a",
    borderRadius: 1,
    alignSelf: "center",
  },
});
