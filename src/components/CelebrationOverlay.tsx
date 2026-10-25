import { AppText } from "@/components/AppText";
import { Confetti } from "@/components/Confetti";
import type { CelebrationData } from "@/lib/celebrations";
import { useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CONFETTI = ["#FFFFFF", "#D4ECDD", "#FFC53D", "#FF7B6E", "#3DDC8A"];

function useCountUp(target: number, durationMs: number, startDelay: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const startAt = Date.now() + startDelay;
    const timer = setInterval(() => {
      const elapsed = Date.now() - startAt;
      if (elapsed < 0) return;
      const p = Math.min(1, elapsed / durationMs);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p >= 1) clearInterval(timer);
    }, 32);
    return () => clearInterval(timer);
  }, [target, durationMs, startDelay]);

  return value;
}

type Props = { data: CelebrationData; onClose: () => void };

export function CelebrationOverlay({ data, onClose }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const isStreak = data.kind === "streak";
  const count = useCountUp(data.streak, 900, 250);

  const numberIn = useSharedValue(0);
  const badgeIn = useSharedValue(0);
  const textIn = useSharedValue(0);
  const buttonIn = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const badgeDelay = isStreak ? 1000 : 300;
    numberIn.value = withDelay(
      150,
      withSpring(1, { damping: 12, stiffness: 140 }),
    );
    badgeIn.value = withDelay(
      badgeDelay,
      withSpring(1, { damping: 9, stiffness: 160 }),
    );
    textIn.value = withDelay(
      data.badge ? badgeDelay + 400 : 1200,
      withTiming(1, { duration: 400 }),
    );
    buttonIn.value = withDelay(1800, withTiming(1, { duration: 300 }));

    const heavy = data.badge
      ? setTimeout(
          () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
          badgeDelay + 60,
        )
      : undefined;
    return () => {
      if (heavy) clearTimeout(heavy);
    };
  }, [data, isStreak, numberIn, badgeIn, textIn, buttonIn]);

  const numberStyle = useAnimatedStyle(() => ({
    opacity: numberIn.value,
    transform: [{ scale: 0.6 + 0.4 * numberIn.value }],
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeIn.value,
    transform: [{ scale: 0.3 + 0.7 * badgeIn.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textIn.value,
    transform: [{ translateY: (1 - textIn.value) * 10 }],
  }));
  const buttonStyle = useAnimatedStyle(() => ({ opacity: buttonIn.value }));

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(220)}
      style={styles.root}
    >
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Confetti count={20 + data.intensity * 12} colors={CONFETTI} />

      {/* Tap anywhere to skip */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Dismiss celebration"
      />

      <View
        pointerEvents="none"
        style={[styles.content, { paddingTop: insets.top }]}
      >
        {isStreak ? (
          <Animated.View style={[styles.numberBlock, numberStyle]}>
            <AppText variant="bodyStrong" color={colors.onAccent}>
              Streak milestone
            </AppText>
            <AppText
              variant="display"
              color={colors.onAccent}
              style={styles.bigNumber}
            >
              {count}
            </AppText>
            <AppText variant="title" color={colors.onAccent}>
              {data.unit === "week" ? "week streak" : "day streak"}
            </AppText>
            <AppText variant="body" color={colors.onAccent}>
              {data.habitName}
            </AppText>
          </Animated.View>
        ) : null}

        {data.badge ? (
          <Animated.View style={[styles.badgeBlock, badgeStyle]}>
            <View style={[styles.medal, { backgroundColor: colors.onAccent }]}>
              <Feather name={data.badge.icon} size={44} color={colors.accent} />
            </View>
            <AppText variant="bodyStrong" color={colors.onAccent}>
              Badge unlocked
            </AppText>
            <AppText variant="title" color={colors.onAccent}>
              {data.badge.title}
            </AppText>
          </Animated.View>
        ) : null}

        <Animated.View style={textStyle}>
          <AppText
            variant="heading"
            color={colors.onAccent}
            style={styles.message}
          >
            {data.message}
          </AppText>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 24 },
          buttonStyle,
        ]}
      >
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: colors.onAccent }]}
        >
          <AppText variant="bodyStrong" color={colors.accent}>
            Continue
          </AppText>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill, zIndex: 50, elevation: 50 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
    paddingHorizontal: 32,
  },
  numberBlock: { alignItems: "center", gap: 2 },
  bigNumber: { fontSize: 112, lineHeight: 120 },
  badgeBlock: { alignItems: "center", gap: 6 },
  medal: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  message: { textAlign: "center" },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
  },
  button: {
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
