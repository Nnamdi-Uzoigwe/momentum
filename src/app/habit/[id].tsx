import { AppText } from "@/components/AppText";
import { Heatmap } from "@/components/HeatMap";
import { useHabitDetail } from "@/hooks/useHabitDetail";
import { parseDateKey, toDateKey } from "@/lib/dates";
import { MONTHLY_FREEZES, freezeBlockReason } from "@/lib/freezes";
import { describeRule } from "@/lib/schedule";
import { buildHeatmap, completionRate, type HeatmapCell } from "@/lib/stats";
import { computeStreak } from "@/lib/streaks";
import { formatTime } from "@/lib/time";
import { useTheme } from "@/theme";
import { resolveHabitColor } from "@/theme/habitColors";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, type ReactNode } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type AlertButton,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function plural(n: number, singular: string) {
  return n === 1 ? singular : `${singular}s`;
}

function formatDay(key: string) {
  return parseDateKey(key).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

type TileProps = {
  label: string;
  value: string;
  unit?: string;
  caption?: string;
  icon: ReactNode;
};

function StatTile({ label, value, unit, caption, icon }: TileProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.tile,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.tileHead}>
        {icon}
        <AppText variant="label" muted>
          {label}
        </AppText>
      </View>
      <View style={styles.tileValue}>
        <AppText variant="title">{value}</AppText>
        {unit ? (
          <AppText variant="caption" muted>
            {unit}
          </AppText>
        ) : null}
      </View>
      {caption ? (
        <AppText variant="caption" muted>
          {caption}
        </AppText>
      ) : null}
    </View>
  );
}

export default function HabitDetailScreen() {
  const { colors, isDark } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habit, dates, frozen, freezesLeft, loaded, toggleDay, freezeDay } =
    useHabitDetail(id);
  const today = toDateKey();

  // Leave if the habit was deleted or archived (for example from the edit screen)
  useEffect(() => {
    if (loaded && (!habit || habit.archived)) router.back();
  }, [loaded, habit]);

  const frozenSet = useMemo(() => new Set(frozen), [frozen]);

  const streak = useMemo(
    () =>
      habit
        ? computeStreak({
            rule: habit.rule,
            completedDates: dates,
            startDate: habit.startDate,
            today,
            frozenDates: frozen,
          })
        : null,
    [habit, dates, frozen, today],
  );

  const columns = useMemo(
    () =>
      habit
        ? buildHeatmap({
            rule: habit.rule,
            completedDates: dates,
            startDate: habit.startDate,
            today,
          })
        : [],
    [habit, dates, today],
  );

  const cellMap = useMemo(() => {
    const map = new Map<string, HeatmapCell>();
    columns.forEach((col) => col.forEach((c) => map.set(c.key, c)));
    return map;
  }, [columns]);

  const rate = useMemo(
    () =>
      habit
        ? completionRate({
            rule: habit.rule,
            completedDates: dates,
            startDate: habit.startDate,
            today,
          })
        : null,
    [habit, dates, today],
  );

  const header = (
    <View style={styles.header}>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={[
          styles.circle,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Feather name="chevron-left" size={22} color={colors.text} />
      </Pressable>
      <AppText variant="heading">Habit</AppText>
      {habit ? (
        <Pressable
          onPress={() =>
            router.push({ pathname: "/habit/edit", params: { id: habit.id } })
          }
          accessibilityRole="button"
          accessibilityLabel="Edit habit"
          style={[
            styles.circle,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Feather name="edit-2" size={18} color={colors.text} />
        </Pressable>
      ) : (
        <View style={styles.circle} />
      )}
    </View>
  );

  if (!habit || !streak || !rate) {
    return (
      <SafeAreaView
        style={[styles.root, { backgroundColor: colors.background }]}
      >
        {header}
      </SafeAreaView>
    );
  }

  const tone = resolveHabitColor(habit.color, isDark, colors);
  const unitWord = streak.unit === "week" ? "week" : "day";
  const startLabel = parseDateKey(habit.startDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const summary = [
    describeRule(habit.rule),
    habit.reminderTime ? formatTime(habit.reminderTime) : null,
  ]
    .filter(Boolean)
    .join(", ");

  const onPressDay = (key: string) => {
    Haptics.selectionAsync();
    const cell = cellMap.get(key);
    if (!cell) return;

    if (frozenSet.has(key) && cell.state === "missed") {
      Alert.alert(
        "Frozen day",
        "A streak freeze protects this day, so your streak stays alive.",
      );
      return;
    }

    if (cell.state === "missed") {
      const reason = freezeBlockReason({
        rule: habit.rule,
        frozenOn: key,
        today,
        startDate: habit.startDate,
        frozen,
        left: freezesLeft,
      });

      const buttons: AlertButton[] = [
        { text: "Cancel", style: "cancel" },
        { text: "Mark as done", onPress: () => toggleDay(key) },
      ];
      if (!reason) {
        buttons.splice(1, 0, {
          text: `Use a freeze (${freezesLeft} left)`,
          onPress: () => {
            freezeDay(key).then((ok) => {
              if (ok) {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );
              }
            });
          },
        });
      }

      Alert.alert(
        formatDay(key),
        reason
          ? `You missed this day. ${reason}`
          : "You missed this day. Mark it as done, or use a streak freeze to protect your streak.",
        buttons,
      );
      return;
    }

    toggleDay(key);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      {header}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.summary, { backgroundColor: tone.soft }]}>
          <View
            style={[styles.summaryIcon, { backgroundColor: colors.surface }]}
          >
            <Feather
              name={habit.icon as keyof typeof Feather.glyphMap}
              size={28}
              color={tone.solid}
            />
          </View>
          <View style={styles.summaryText}>
            <AppText variant="title" numberOfLines={2}>
              {habit.name}
            </AppText>
            <AppText variant="caption" muted>
              {summary}
            </AppText>
            <AppText variant="caption" muted>
              Started {startLabel}
            </AppText>
          </View>
        </View>

        <View style={styles.tiles}>
          <StatTile
            label="Current streak"
            value={String(streak.current)}
            unit={plural(streak.current, unitWord)}
            caption={streak.current === 0 ? "Start again today" : undefined}
            icon={<Ionicons name="flame" size={16} color={colors.warning} />}
          />
          <StatTile
            label="Best streak"
            value={String(streak.best)}
            unit={plural(streak.best, unitWord)}
            icon={<Feather name="award" size={16} color={tone.solid} />}
          />
          <StatTile
            label="Total check-ins"
            value={String(dates.length)}
            icon={
              <Feather name="check-circle" size={16} color={colors.success} />
            }
          />
          <StatTile
            label="Completion"
            value={
              rate.value === null ? "-" : `${Math.round(rate.value * 100)}%`
            }
            caption={rate.label}
            icon={<Feather name="trending-up" size={16} color={tone.solid} />}
          />
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardHead}>
            <AppText variant="heading">Last 13 weeks</AppText>
            <AppText variant="caption" muted>
              Tap a day to mark or unmark it
            </AppText>
          </View>
          <Heatmap
            columns={columns}
            tone={tone}
            frozen={frozenSet}
            onPressDay={onPressDay}
          />
          {habit.rule.type !== "weekly" ? (
            <View style={styles.freezeRow}>
              <Ionicons name="snow" size={16} color={tone.solid} />
              <AppText variant="caption" muted>
                {freezesLeft} of {MONTHLY_FREEZES} streak freezes left this
                month
              </AppText>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "transparent",
  },
  content: { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 28,
  },
  summaryIcon: {
    width: 60,
    height: 60,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryText: { flex: 1, gap: 2 },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    flexGrow: 1,
    flexBasis: "45%",
    padding: 16,
    gap: 6,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tileHead: { flexDirection: "row", alignItems: "center", gap: 6 },
  tileValue: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  card: {
    padding: 16,
    gap: 14,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardHead: { gap: 2 },
  freezeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
});
