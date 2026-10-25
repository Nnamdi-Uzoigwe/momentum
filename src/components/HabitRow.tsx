import { AppText } from "@/components/AppText";
import { CheckCircle } from "@/components/CheckCircle";
import { describeRule } from "@/lib/schedule";
import { formatTime } from "@/lib/time";
import type { TodayRow, WeekDot } from "@/lib/weekDots";
import { useTheme } from "@/theme";
import { resolveHabitColor, type HabitTone } from "@/theme/habitColors";
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
  item: TodayRow;
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

  // Hidden until the card starts moving so nothing peeks out from behind it
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

function WeekDotView({ dot, tone }: { dot: WeekDot; tone: HabitTone }) {
  const { colors } = useTheme();

  let dotStyle;
  switch (dot.state) {
    case "done":
      dotStyle = { backgroundColor: tone.solid };
      break;
    case "missed":
      dotStyle = { backgroundColor: `${colors.error}26` };
      break;
    case "pending":
      dotStyle = { borderWidth: 2, borderColor: tone.solid };
      break;
    default:
      dotStyle = { backgroundColor: `${colors.textMuted}1F` };
  }

  return (
    <View style={styles.dotCol}>
      <View style={[styles.dot, dotStyle]}>
        {dot.state === "done" ? (
          <Feather name="check" size={11} color={colors.onAccent} />
        ) : null}
      </View>
      <AppText
        variant="label"
        color={dot.isToday ? colors.text : colors.textMuted}
        style={styles.dotLabel}
      >
        {dot.label}
      </AppText>
    </View>
  );
}

export function HabitRow({ item, onToggle, onArchive, onDelete }: Props) {
  const { colors, isDark } = useTheme();
  const { habit, done, streak, week } = item;
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
  const subtitle = [
    describeRule(habit.rule),
    habit.reminderTime ? formatTime(habit.reminderTime) : null,
  ]
    .filter(Boolean)
    .join(", ");

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
              scale.value = withTiming(0.98, { duration: 90 });
            }}
            onPressOut={() => {
              scale.value = withSpring(1, { damping: 14, stiffness: 260 });
            }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: done }}
            accessibilityLabel={habit.name}
            accessibilityHint="Long press for details. Swipe left to archive or delete."
            style={[
              styles.card,
              done
                ? {
                    backgroundColor: tone.soft,
                    borderColor: "transparent",
                    shadowOpacity: 0,
                    elevation: 0,
                  }
                : {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowColor: colors.shadow,
                    shadowOpacity: 0.08,
                    elevation: 2,
                  },
            ]}
          >
            <View style={styles.top}>
              <View
                style={[
                  styles.iconTile,
                  { backgroundColor: done ? tone.solid : tone.soft },
                ]}
              >
                <Feather
                  name={habit.icon as keyof typeof Feather.glyphMap}
                  size={24}
                  color={done ? colors.onAccent : tone.solid}
                />
              </View>

              <View style={styles.text}>
                <AppText variant="heading" numberOfLines={1}>
                  {habit.name}
                </AppText>
                <AppText variant="caption" muted numberOfLines={1}>
                  {subtitle}
                </AppText>
              </View>

              <CheckCircle done={done} size={38} />
            </View>

            <View style={styles.bottom}>
              <View style={styles.dots}>
                {week.map((dot) => (
                  <WeekDotView key={dot.key} dot={dot} tone={tone} />
                ))}
              </View>

              {streak.current > 0 ? (
                <View
                  style={[
                    styles.streak,
                    {
                      backgroundColor: done
                        ? colors.surface
                        : colors.accentSoft,
                    },
                  ]}
                >
                  <Ionicons name="flame" size={14} color={colors.warning} />
                  <AppText variant="label" color={colors.accentDeep}>
                    {streakLabel}
                  </AppText>
                </View>
              ) : null}
            </View>
          </Pressable>
        </ReanimatedSwipeable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Let the card's soft shadow draw outside the swipe container
  swipe: { overflow: "visible" },
  card: {
    padding: 14,
    gap: 14,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconTile: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, gap: 2 },
  bottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  dots: { flexDirection: "row", gap: 6 },
  dotCol: { alignItems: "center", gap: 3 },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dotLabel: { fontSize: 10, lineHeight: 12 },
  streak: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  actions: { width: 172, flexDirection: "row", gap: 8, paddingLeft: 8 },
  action: {
    flex: 1,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
});
