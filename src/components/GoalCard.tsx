import { AppText } from "@/components/AppText";
import type { GoalSummary } from "@/db/goals";
import { useTheme } from "@/theme";
import { resolveHabitColor } from "@/theme/habitColors";
import { Feather } from "@expo/vector-icons";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

const MAX_CHIPS = 4;

type Props = {
  summary: GoalSummary;
  onPress: () => void;
};

function deadlineLabel(daysLeft: number | null) {
  if (daysLeft === null) return "No deadline";
  if (daysLeft < 0) return "Deadline passed";
  if (daysLeft === 0) return "Due today";
  return `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`;
}

export function GoalCard({ summary, onPress }: Props) {
  const { colors, isDark } = useTheme();
  const { goal, habits, progress } = summary;
  const completed = goal.status === "completed";

  const ratio = useSharedValue(0);
  useEffect(() => {
    ratio.value = withTiming(progress.ratio, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress.ratio, ratio]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${ratio.value * 100}%`,
  }));

  const percent = Math.round(progress.ratio * 100);
  const shown = habits.slice(0, MAX_CHIPS);
  const extra = habits.length - shown.length;
  const habitText =
    habits.length === 0
      ? "No habits linked yet"
      : `${habits.length} ${habits.length === 1 ? "habit" : "habits"}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${goal.title}, ${percent} percent`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={styles.top}>
        <AppText variant="heading" numberOfLines={2} style={styles.title}>
          {goal.title}
        </AppText>
        {completed ? (
          <Feather name="check-circle" size={22} color={colors.success} />
        ) : (
          <Feather name="chevron-right" size={20} color={colors.textMuted} />
        )}
      </View>

      <View style={styles.chipsRow}>
        <View style={styles.chips}>
          {shown.map((habit, index) => {
            const tone = resolveHabitColor(habit.color, isDark, colors);
            return (
              <View
                key={habit.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: tone.soft,
                    borderColor: colors.surface,
                    marginLeft: index === 0 ? 0 : -8,
                  },
                ]}
              >
                <Feather
                  name={habit.icon as keyof typeof Feather.glyphMap}
                  size={14}
                  color={tone.solid}
                />
              </View>
            );
          })}
          {extra > 0 ? (
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.surface,
                  marginLeft: -8,
                },
              ]}
            >
              <AppText variant="label" muted>
                +{extra}
              </AppText>
            </View>
          ) : null}
        </View>
        <AppText variant="caption" muted>
          {habitText}
        </AppText>
      </View>

      <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: completed ? colors.success : colors.accent },
            fillStyle,
          ]}
        />
      </View>

      <View style={styles.bottom}>
        <View style={styles.percentRow}>
          <AppText variant="title">{percent}%</AppText>
          <AppText variant="caption" muted>
            {progress.hasTarget ? "of the plan" : "consistency"}
          </AppText>
        </View>
        <AppText variant="caption" muted>
          {completed ? "Completed" : deadlineLabel(progress.daysLeft)}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    gap: 14,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { flex: 1 },
  chipsRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  chips: { flexDirection: "row", alignItems: "center" },
  chip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  track: { height: 10, borderRadius: 5, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 5 },
  bottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  percentRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
});
