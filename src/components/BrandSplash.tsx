import { AppText } from "@/components/AppText";
import { ProgressRing } from "@/components/ProgressRing";
import { useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";

const SHOW_MS = 1500;
const FADE_MS = 350;

export function BrandSplash({ onDone }: { onDone: () => void }) {
  const { colors } = useTheme();
  const [progress, setProgress] = useState(0);

  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.85);
  const content = useSharedValue(0);

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    scale.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.back(1.4)),
    });
    content.value = withTiming(1, { duration: 500 });
    opacity.value = withDelay(SHOW_MS, withTiming(0, { duration: FADE_MS }));

    const grow = setTimeout(() => setProgress(1), 200);
    const finish = setTimeout(() => onDoneRef.current(), SHOW_MS + FADE_MS);
    return () => {
      clearTimeout(grow);
      clearTimeout(finish);
    };
  }, [content, opacity, scale]);

  const rootStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: content.value,
    transform: [{ scale: scale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: content.value,
    transform: [{ translateY: (1 - content.value) * 12 }],
  }));

  return (
    <Animated.View style={[styles.root, rootStyle]}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fill}
      >
        <View style={styles.center}>
          <Animated.View style={logoStyle}>
            <ProgressRing
              progress={progress}
              size={104}
              stroke={9}
              color={colors.onAccent}
              trackColor={`${colors.onAccent}33`}
            >
              <Feather name="check" size={42} color={colors.onAccent} />
            </ProgressRing>
          </Animated.View>

          <Animated.View style={[styles.text, textStyle]}>
            <AppText variant="display" color={colors.onAccent}>
              Momentum
            </AppText>
            <AppText variant="bodyStrong" color={colors.onAccent}>
              Small daily wins
            </AppText>
          </Animated.View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill, zIndex: 100, elevation: 100 },
  fill: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  text: { alignItems: "center", gap: 4 },
});
