import { AppText } from "@/components/AppText";
import { HabitRow } from "@/components/HabitRow";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProgressRing } from "@/components/ProgressRing";
import { Screen } from "@/components/Screen";
import { StreakSaver } from "@/components/StreakSaver";
import { TodayHeader } from "@/components/TodayHeader";
import { useTodayHabits } from "@/hooks/useTodayHabits";
import { useUserName } from "@/hooks/useUserName";
import { useTheme } from "@/theme";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

function heroMessage(done: number, total: number) {
  if (done === total) return "Perfect day. Everything is done.";
  if (done === 0) return "Small steps count. Start with one.";
  const left = total - done;
  return `${left} left. You are on your way.`;
}

export default function TodayScreen() {
  const { colors } = useTheme();
  const {
    items,
    loaded,
    toggle,
    archive,
    remove,
    atRisk,
    freezesLeft,
    freezeDay,
  } = useTodayHabits();
  const { name } = useUserName();

  const total = items.length;
  const doneCount = items.filter((i) => i.done).length;
  const ratio = total === 0 ? 0 : doneCount / total;

  const bestStreak = items.reduce(
    (max, i) =>
      i.streak.unit === "day" && i.streak.current > max
        ? i.streak.current
        : max,
    0,
  );

  const saver = freezesLeft > 0 ? atRisk[0] : undefined;

  return (
    <Screen>
      <TodayHeader name={name} />

      {saver ? (
        <StreakSaver
          habitName={saver.habit.name}
          saved={saver.saved}
          left={freezesLeft}
          onUse={() => freezeDay(saver.habit.id, saver.frozenOn)}
        />
      ) : null}

      {total > 0 ? (
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View
            style={[
              styles.blobBig,
              { backgroundColor: `${colors.onAccent}14` },
            ]}
          />
          <View
            style={[
              styles.blobSmall,
              { backgroundColor: `${colors.onAccent}10` },
            ]}
          />

          <ProgressRing
            progress={ratio}
            size={96}
            stroke={10}
            color={colors.onAccent}
            trackColor={`${colors.onAccent}33`}
          >
            <AppText variant="heading" color={colors.onAccent}>
              {Math.round(ratio * 100)}%
            </AppText>
          </ProgressRing>

          <View style={styles.heroText}>
            <AppText variant="title" color={colors.onAccent}>
              {doneCount} of {total} done
            </AppText>
            <AppText variant="bodyStrong" color={colors.onAccent}>
              {heroMessage(doneCount, total)}
            </AppText>
            {bestStreak >= 2 ? (
              <View
                style={[
                  styles.streakChip,
                  { backgroundColor: `${colors.onAccent}26` },
                ]}
              >
                <Ionicons name="flame" size={14} color={colors.onAccent} />
                <AppText variant="label" color={colors.onAccent}>
                  {bestStreak} day streak
                </AppText>
              </View>
            ) : null}
          </View>
        </LinearGradient>
      ) : null}

      {total > 0 ? (
        <View style={styles.list}>
          <View>
            <AppText variant="heading">Your habits</AppText>
            <AppText variant="caption" muted>
              Swipe left to archive or delete. Long press for details.
            </AppText>
          </View>
          {items.map((item) => (
            <HabitRow
              key={item.habit.id}
              item={item}
              onToggle={toggle}
              onArchive={archive}
              onDelete={remove}
            />
          ))}
        </View>
      ) : null}

      {loaded && total === 0 ? (
        <View
          style={[
            styles.empty,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View
            style={[styles.emptyIcon, { backgroundColor: colors.accentSoft }]}
          >
            <Feather name="sunrise" size={30} color={colors.accent} />
          </View>
          <AppText variant="heading">Nothing planned yet</AppText>
          <AppText variant="body" muted style={styles.emptyText}>
            Start with one small habit. Tap it once a day and watch it add up.
          </AppText>
          <View style={styles.emptyButton}>
            <PrimaryButton
              label="Add your first habit"
              icon="plus"
              onPress={() => router.push("/habit/edit")}
            />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    padding: 20,
    borderRadius: 32,
    overflow: "hidden",
  },
  blobBig: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -60,
    right: -40,
  },
  blobSmall: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    bottom: -30,
    left: 90,
  },
  heroText: { flex: 1, gap: 4 },
  streakChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 2,
  },
  list: { gap: 14 },
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
