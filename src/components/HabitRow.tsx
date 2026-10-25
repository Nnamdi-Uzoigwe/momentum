import { AppText } from "@/components/AppText";
import { CheckCircle } from "@/components/CheckCircle";
import type { TodayItem } from "@/db/habits";
import { describeRule } from "@/lib/schedule";
import { useTheme } from "@/theme";
import { resolveHabitColor } from "@/theme/habitColors";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useRef, type ElementRef } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  Extrapolation,
  FadeOut,
  LinearTransition,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

type Props = {
  item: TodayItem;
  onToggle: (habitId: string) => void;
  onArchive: (habitId: string) => void;
  onDelete: (habitId: string) => void;
};

type ActionsProps = {
  progress: SharedValue<number>;
  onArchive: () => void;
  onDelete: () => void;
};

function RightActions({ progress, onArchive, onDelete }: ActionsProps) {
  const { colors } = useTheme();

  // Hidden until the row starts moving so nothing peeks out from behind it
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.2, 1],
      [0, 1, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 1],
          [24, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.actions, style]}>
      <Pressable
        onPress={onArchive}
        accessibilityRole="button"
        accessibilityLabel="Archive habit"
        style={[styles.action, { backgroundColor: colors.accentSoft }]}
      >
        <Feather name="archive" size={20} color={colors.accentDeep} />
        <AppText variant="label" color={colors.accentDeep}>
          Archive
        </AppText>
      </Pressable>
      <Pressable
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel="Delete habit"
        style={[styles.action, { backgroundColor: colors.error }]}
      >
        <Feather name="trash-2" size={20} color={colors.onAccent} />
        <AppText variant="label" color={colors.onAccent}>
          Delete
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

export function HabitRow({ item, onToggle, onArchive, onDelete }: Props) {
  const { colors, isDark } = useTheme();
  const { habit, done, streak } = item;
  const tone = resolveHabitColor(habit.color, isDark, colors);

  const swipeRef = useRef<ElementRef<typeof ReanimatedSwipeable>>(null);
  const closeSwipe = () => swipeRef.current?.close();

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (done) Haptics.selectionAsync();
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle(habit.id);
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/habit/[id]", params: { id: habit.id } });
  };

  const handleArchive = () => {
    closeSwipe();
    onArchive(habit.id);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete habit?",
      `"${habit.name}" and all of its history will be removed for good. Archive it instead if you want to keep your history.`,
      [
        { text: "Cancel", style: "cancel", onPress: closeSwipe },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(habit.id),
        },
      ],
      { cancelable: true, onDismiss: closeSwipe },
    );
  };

  const streakLabel = `${streak.current}${streak.unit === "week" ? "w" : ""}`;

  return (
    <Animated.View
      layout={LinearTransition.duration(220)}
      exiting={FadeOut.duration(180)}
    >
      <Animated.View style={animatedStyle}>
        <ReanimatedSwipeable
          ref={swipeRef}
          friction={2}
          rightThreshold={40}
          overshootRight={false}
          containerStyle={styles.swipe}
          onSwipeableOpen={() =>
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          }
          renderRightActions={(progress) => (
            <RightActions
              progress={progress}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          )}
        >
          <Pressable
            onPress={handlePress}
            onLongPress={handleLongPress}
            onPressIn={() => {
              scale.value = withTiming(0.97, { duration: 90 });
            }}
            onPressOut={() => {
              scale.value = withSpring(1, { damping: 14, stiffness: 260 });
            }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: done }}
            accessibilityLabel={habit.name}
            accessibilityHint="Long press for details. Swipe left to archive or delete."
            style={[
              styles.row,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: done ? colors.surfaceAlt : tone.soft },
              ]}
            >
              <Feather
                name={habit.icon as keyof typeof Feather.glyphMap}
                size={22}
                color={done ? colors.textMuted : tone.solid}
              />
            </View>

            <View style={styles.text}>
              <AppText variant="bodyStrong" muted={done} numberOfLines={1}>
                {habit.name}
              </AppText>
              <AppText variant="caption" muted numberOfLines={1}>
                {describeRule(habit.rule)}
              </AppText>
            </View>

            {streak.current > 0 ? (
              <View
                style={[styles.streak, { backgroundColor: colors.accentSoft }]}
              >
                <Ionicons name="flame" size={14} color={colors.warning} />
                <AppText variant="label" color={colors.accentDeep}>
                  {streakLabel}
                </AppText>
              </View>
            ) : null}

            <CheckCircle done={done} />
          </Pressable>
        </ReanimatedSwipeable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Let the row's soft shadow draw outside the swipe container
  swipe: { overflow: "visible" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, gap: 2 },
  streak: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
  },
  actions: { width: 172, flexDirection: "row", gap: 8, paddingLeft: 8 },
  action: {
    flex: 1,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
});
