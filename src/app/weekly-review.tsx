import { AppText } from "@/components/AppText";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProgressRing } from "@/components/ProgressRing";
import { useWeeklyReview } from "@/hooks/useWeeklyReview";
import { parseDateKey } from "@/lib/dates";
import {
    buildSuggestion,
    headline,
    weekdayName,
    weekDelta,
    type HabitWeek,
} from "@/lib/weeklyReview";
import { useTheme } from "@/theme";
import { resolveHabitColor } from "@/theme/habitColors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const BAR_MAX = 96;

function shortDate(key: string) {
  return parseDateKey(key).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function HabitWeekRow({
  item,
  eyebrow,
}: {
  item: HabitWeek;
  eyebrow?: string;
}) {
  const { colors, isDark } = useTheme();
  const tone = resolveHabitColor(item.habit.color, isDark, colors);
  const percent = Math.round(item.rate * 100);

  return (
    <View
      style={[
        styles.habitCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {eyebrow ? (
        <AppText variant="label" muted>
          {eyebrow}
        </AppText>
      ) : null}
      <View style={styles.habitTop}>
        <View style={[styles.habitIcon, { backgroundColor: tone.soft }]}>
          <Feather
            name={item.habit.icon as keyof typeof Feather.glyphMap}
            size={20}
            color={tone.solid}
          />
        </View>
        <View style={styles.habitText}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {item.habit.name}
          </AppText>
          <AppText variant="caption" muted>
            {item.done} of {item.total} this week
          </AppText>
        </View>
        <AppText variant="heading">{percent}%</AppText>
      </View>
      <View style={[styles.miniTrack, { backgroundColor: colors.surfaceAlt }]}>
        <View
          style={[
            styles.miniFill,
            { backgroundColor: tone.solid, width: `${percent}%` },
          ]}
        />
      </View>
    </View>
  );
}

export default function WeeklyReviewScreen() {
  const { colors } = useTheme();
  const {
    loaded,
    hasHabits,
    offset,
    review,
    previous,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
  } = useWeeklyReview();

  const delta = weekDelta(review, previous);
  const percent = Math.round(review.ratio * 100);
  const weekLabel =
    offset === 0
      ? "This week"
      : offset === -1
        ? "Last week"
        : `${shortDate(review.weekStart)} to ${shortDate(review.weekEnd)}`;
  const weekRange = `${shortDate(review.weekStart)} to ${shortDate(review.weekEnd)}`;

  const step = (direction: "back" | "forward") => {
    Haptics.selectionAsync();
    if (direction === "back") goBack();
    else goForward();
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
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
        <AppText variant="heading">Weekly review</AppText>
        <View style={styles.circle} />
      </View>

      {loaded && !hasHabits ? (
        <View style={styles.emptyWrap}>
          <View
            style={[
              styles.empty,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[styles.emptyIcon, { backgroundColor: colors.accentSoft }]}
            >
              <Feather name="bar-chart-2" size={30} color={colors.accent} />
            </View>
            <AppText variant="heading">Your review starts with a habit</AppText>
            <AppText variant="body" muted style={styles.emptyText}>
              Add a habit and check in for a few days. Your first weekly review
              will show up here.
            </AppText>
            <View style={styles.emptyButton}>
              <PrimaryButton
                label="Add a habit"
                icon="plus"
                onPress={() => router.push("/habit/edit")}
              />
            </View>
          </View>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.switcher}>
            <Pressable
              onPress={() => step("back")}
              disabled={!canGoBack}
              accessibilityRole="button"
              accessibilityLabel="Previous week"
              style={[
                styles.circle,
                {
                  backgroundColor: colors.surfaceAlt,
                  opacity: canGoBack ? 1 : 0.35,
                },
              ]}
            >
              <Feather name="chevron-left" size={20} color={colors.text} />
            </Pressable>
            <View style={styles.switcherText}>
              <AppText variant="heading">{weekLabel}</AppText>
              <AppText variant="caption" muted>
                {weekRange}
              </AppText>
            </View>
            <Pressable
              onPress={() => step("forward")}
              disabled={!canGoForward}
              accessibilityRole="button"
              accessibilityLabel="Next week"
              style={[
                styles.circle,
                {
                  backgroundColor: colors.surfaceAlt,
                  opacity: canGoForward ? 1 : 0.35,
                },
              ]}
            >
              <Feather name="chevron-right" size={20} color={colors.text} />
            </Pressable>
          </View>

          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <ProgressRing
              progress={review.ratio}
              size={96}
              stroke={10}
              color={colors.onAccent}
              trackColor={`${colors.onAccent}33`}
            >
              <AppText variant="heading" color={colors.onAccent}>
                {percent}%
              </AppText>
            </ProgressRing>
            <View style={styles.heroText}>
              <AppText variant="title" color={colors.onAccent}>
                {headline(review)}
              </AppText>
              <AppText variant="bodyStrong" color={colors.onAccent}>
                {review.done} of {review.total} check-ins
              </AppText>
              {delta !== null ? (
                <View
                  style={[
                    styles.deltaChip,
                    { backgroundColor: `${colors.onAccent}26` },
                  ]}
                >
                  <Feather
                    name={
                      delta > 0
                        ? "trending-up"
                        : delta < 0
                          ? "trending-down"
                          : "minus"
                    }
                    size={14}
                    color={colors.onAccent}
                  />
                  <AppText variant="label" color={colors.onAccent}>
                    {delta === 0
                      ? "Same as the week before"
                      : `${delta > 0 ? "+" : ""}${delta} points vs the week before`}
                  </AppText>
                </View>
              ) : null}
            </View>
          </LinearGradient>

          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View>
              <AppText variant="heading">Your week</AppText>
              <AppText variant="caption" muted>
                {review.bestDay
                  ? `Best day: ${weekdayName(review.bestDay.key)}`
                  : "Check in to fill your bars"}
              </AppText>
            </View>
            <View style={styles.bars}>
              {review.days.map((day, i) => {
                const height =
                  day.ratio === null
                    ? 6
                    : Math.max(8, Math.round(day.ratio * BAR_MAX));
                const fill = day.isFuture
                  ? colors.surfaceAlt
                  : day.ratio === null
                    ? colors.surfaceAlt
                    : day.ratio >= 1
                      ? colors.success
                      : day.ratio === 0
                        ? `${colors.error}33`
                        : colors.accent;
                return (
                  <View key={day.key} style={styles.barCol}>
                    <View style={styles.barTrack}>
                      <View
                        style={{
                          height,
                          borderRadius: 8,
                          backgroundColor: fill,
                        }}
                      />
                    </View>
                    <AppText
                      variant="label"
                      color={day.isToday ? colors.text : colors.textMuted}
                    >
                      {DAY_LABELS[i]}
                    </AppText>
                  </View>
                );
              })}
            </View>
          </View>

          {review.strongest || review.needsCare ? (
            <View style={styles.section}>
              <AppText variant="heading">Highlights</AppText>
              {review.strongest ? (
                <HabitWeekRow
                  item={review.strongest}
                  eyebrow="Strongest habit"
                />
              ) : null}
              {review.needsCare ? (
                <HabitWeekRow
                  item={review.needsCare}
                  eyebrow="Needs a little care"
                />
              ) : null}
            </View>
          ) : null}

          <View style={[styles.nudge, { backgroundColor: colors.accentSoft }]}>
            <View
              style={[styles.nudgeIcon, { backgroundColor: colors.surface }]}
            >
              <Feather name="sun" size={20} color={colors.accent} />
            </View>
            <View style={styles.nudgeText}>
              <AppText variant="bodyStrong" color={colors.accentDeep}>
                Gentle nudge
              </AppText>
              <AppText variant="body" color={colors.accentDeep}>
                {buildSuggestion(review, previous)}
              </AppText>
            </View>
          </View>

          {review.habits.length > 1 ? (
            <View style={styles.section}>
              <AppText variant="heading">All habits</AppText>
              {review.habits.map((item) => (
                <HabitWeekRow key={item.habit.id} item={item} />
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}
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
  switcher: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switcherText: { alignItems: "center" },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    padding: 20,
    borderRadius: 32,
  },
  heroText: { flex: 1, gap: 6 },
  deltaChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  card: {
    padding: 18,
    gap: 16,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bars: { flexDirection: "row", justifyContent: "space-between" },
  barCol: { flex: 1, alignItems: "center", gap: 8 },
  barTrack: {
    height: BAR_MAX,
    width: 26,
    justifyContent: "flex-end",
  },
  section: { gap: 12 },
  habitCard: {
    padding: 14,
    gap: 10,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
  },
  habitTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  habitIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  habitText: { flex: 1, gap: 2 },
  miniTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  miniFill: { height: "100%", borderRadius: 3 },
  nudge: {
    flexDirection: "row",
    gap: 14,
    padding: 18,
    borderRadius: 28,
  },
  nudgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  nudgeText: { flex: 1, gap: 4 },
  emptyWrap: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },
  empty: {
    alignItems: "center",
    gap: 8,
    padding: 24,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyText: { textAlign: "center" },
  emptyButton: { alignSelf: "stretch", marginTop: 12 },
});
