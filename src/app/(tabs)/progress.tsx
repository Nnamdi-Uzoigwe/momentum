import { AppText } from "@/components/AppText";
import { GoalCard } from "@/components/GoalCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useGoals } from "@/hooks/useGoals";
import { useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

export default function ProgressScreen() {
  const { colors } = useTheme();
  const { summaries, loaded } = useGoals();

  const active = summaries.filter((s) => s.goal.status === "active");
  const completed = summaries.filter((s) => s.goal.status === "completed");

  const openGoal = (id: string) =>
    router.push({ pathname: "/goal/edit", params: { id } });

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View>
          <AppText variant="caption" muted>
            Your journey
          </AppText>
          <AppText variant="display">Progress</AppText>
        </View>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            router.push("/goal/edit");
          }}
          accessibilityRole="button"
          accessibilityLabel="New goal"
          style={[styles.addButton, { backgroundColor: colors.accentSoft }]}
        >
          <Feather name="plus" size={22} color={colors.accentDeep} />
        </Pressable>
      </View>

      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          router.push("/weekly-review");
        }}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.reviewCard,
          { backgroundColor: colors.accentSoft, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <View style={[styles.reviewIcon, { backgroundColor: colors.surface }]}>
          <Feather name="bar-chart-2" size={22} color={colors.accent} />
        </View>
        <View style={styles.reviewText}>
          <AppText variant="bodyStrong" color={colors.accentDeep}>
            Weekly review
          </AppText>
          <AppText variant="caption" color={colors.accentDeep}>
            See how your week went
          </AppText>
        </View>
        <Feather name="chevron-right" size={20} color={colors.accentDeep} />
      </Pressable>

      {active.length > 0 ? (
        <View style={styles.section}>
          <AppText variant="heading">Goals</AppText>
          {active.map((summary) => (
            <GoalCard
              key={summary.goal.id}
              summary={summary}
              onPress={() => openGoal(summary.goal.id)}
            />
          ))}
        </View>
      ) : null}

      {completed.length > 0 ? (
        <View style={styles.section}>
          <AppText variant="heading">Completed</AppText>
          {completed.map((summary) => (
            <GoalCard
              key={summary.goal.id}
              summary={summary}
              onPress={() => openGoal(summary.goal.id)}
            />
          ))}
        </View>
      ) : null}

      {loaded && summaries.length === 0 ? (
        <View
          style={[
            styles.empty,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View
            style={[styles.emptyIcon, { backgroundColor: colors.accentSoft }]}
          >
            <Feather name="flag" size={30} color={colors.accent} />
          </View>
          <AppText variant="heading">Aim for something bigger</AppText>
          <AppText variant="body" muted style={styles.emptyText}>
            A goal ties your daily habits to an outcome, like getting healthier
            in 90 days. Progress fills in as you check in.
          </AppText>
          <View style={styles.emptyButton}>
            <PrimaryButton
              label="Create a goal"
              icon="plus"
              onPress={() => router.push("/goal/edit")}
            />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  reviewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 24,
  },
  reviewIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewText: { flex: 1, gap: 2 },
  section: { gap: 12 },
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
