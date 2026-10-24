import { AppText } from "@/components/AppText";
import { HabitRow } from "@/components/HabitRow";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProgressRing } from "@/components/ProgressRing";
import { Screen } from "@/components/Screen";
import { useTodayHabits } from "@/hooks/useTodayHabits";
import { useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function heroMessage(done: number, total: number) {
  if (done === total) return "Perfect day. Everything is done.";
  if (done === 0) return "Small steps count. Start with one.";
  const left = total - done;
  return `${left} left. You are on your way.`;
}

export default function TodayScreen() {
  const { colors } = useTheme();
  const { items, loaded, toggle } = useTodayHabits();

  const total = items.length;
  const doneCount = items.filter((i) => i.done).length;
  const ratio = total === 0 ? 0 : doneCount / total;

  return (
    <Screen>
      <View>
        <AppText variant="caption" muted>
          {formatToday()}
        </AppText>
        <AppText variant="display">Today</AppText>
      </View>

      {total > 0 ? (
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <ProgressRing
            progress={ratio}
            size={96}
            stroke={10}
            color={colors.onAccent}
            trackColor="rgba(27, 26, 23, 0.18)"
          >
            <AppText variant="heading" color={colors.onAccent}>
              {Math.round(ratio * 100)}%
            </AppText>
          </ProgressRing>

          <View style={styles.heroText}>
            <AppText variant="title" color={colors.onAccent}>
              {doneCount} of {total} done
            </AppText>
            <AppText variant="body" color={colors.onAccent}>
              {heroMessage(doneCount, total)}
            </AppText>
          </View>
        </LinearGradient>
      ) : null}

      {total > 0 ? (
        <View style={styles.list}>
          <AppText variant="heading">Your habits</AppText>
          {items.map((item) => (
            <HabitRow key={item.habit.id} item={item} onToggle={toggle} />
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
  },
  heroText: { flex: 1, gap: 4 },
  list: { gap: 12 },
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
