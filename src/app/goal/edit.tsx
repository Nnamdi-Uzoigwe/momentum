import { AppText } from "@/components/AppText";
import { PrimaryButton } from "@/components/PrimaryButton";
import {
    createGoal,
    deleteGoal,
    getGoal,
    updateGoal,
    type GoalStatus,
} from "@/db/goals";
import { listHabits } from "@/db/habits";
import type { Habit } from "@/db/types";
import { addDays, diffDays, parseDateKey, toDateKey } from "@/lib/dates";
import { describeRule } from "@/lib/schedule";
import { useTheme } from "@/theme";
import { resolveHabitColor } from "@/theme/habitColors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRESETS: { label: string; days: number | null }[] = [
  { label: "No deadline", days: null },
  { label: "30 days", days: 30 },
  { label: "60 days", days: 60 },
  { label: "90 days", days: 90 },
  { label: "6 months", days: 182 },
  { label: "1 year", days: 365 },
];

function formatDate(key: string) {
  return parseDateKey(key).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function EditGoalScreen() {
  const { colors, isDark } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = Boolean(id);
  const today = toDateKey();

  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<GoalStatus>("active");
  const [habits, setHabits] = useState<Habit[]>([]);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(!id);

  // Habits can change while this screen is open (for example after creating one)
  useFocusEffect(
    useCallback(() => {
      listHabits()
        .then(setHabits)
        .catch((e) => console.error("Failed to load habits", e));
    }, []),
  );

  useEffect(() => {
    if (!id) return;
    getGoal(id)
      .then((goal) => {
        if (!goal) {
          router.back();
          return;
        }
        setTitle(goal.title);
        setTargetDate(goal.targetDate);
        setSelected(goal.habitIds);
        setStatus(goal.status);
        setReady(true);
      })
      .catch((e) => console.error("Failed to load goal", e));
  }, [id]);

  const valid = title.trim().length > 0;

  const toggleHabit = (habitId: string) => {
    Haptics.selectionAsync();
    setSelected((prev) =>
      prev.includes(habitId)
        ? prev.filter((h) => h !== habitId)
        : [...prev, habitId],
    );
  };

  const shiftTarget = (delta: number) => {
    Haptics.selectionAsync();
    setTargetDate((prev) => {
      if (!prev) return prev;
      const next = addDays(prev, delta);
      return next < today ? today : next;
    });
  };

  const save = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      if (id) {
        await updateGoal(id, { title, targetDate, habitIds: selected, status });
      } else {
        await createGoal({ title, targetDate, habitIds: selected });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      console.error("Failed to save goal", e);
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!id) return;
    Alert.alert(
      "Delete goal?",
      "Only the goal is removed. Your habits and their history stay.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGoal(id);
              router.back();
            } catch (e) {
              console.error("Failed to delete goal", e);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={[
              styles.back,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Feather name="chevron-left" size={22} color={colors.text} />
          </Pressable>
          <AppText variant="heading">
            {editing ? "Edit goal" : "New goal"}
          </AppText>
          <View style={styles.back} />
        </View>

        {ready ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <AppText variant="label" muted>
                Goal
              </AppText>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Get healthier in 90 days"
                placeholderTextColor={colors.textMuted}
                maxLength={60}
                returnKeyType="done"
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
              />
            </View>

            <View style={styles.section}>
              <AppText variant="label" muted>
                Deadline
              </AppText>
              <View style={styles.presets}>
                {PRESETS.map((preset) => {
                  const presetDate =
                    preset.days === null ? null : addDays(today, preset.days);
                  const isSelected = targetDate === presetDate;
                  return (
                    <Pressable
                      key={preset.label}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setTargetDate(presetDate);
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      style={[
                        styles.preset,
                        {
                          backgroundColor: isSelected
                            ? colors.accent
                            : colors.surface,
                          borderColor: isSelected
                            ? colors.accent
                            : colors.border,
                        },
                      ]}
                    >
                      <AppText
                        variant="label"
                        color={isSelected ? colors.onAccent : colors.textMuted}
                      >
                        {preset.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>

              {targetDate ? (
                <View style={styles.stepperRow}>
                  <Pressable
                    onPress={() => shiftTarget(-7)}
                    accessibilityRole="button"
                    accessibilityLabel="One week earlier"
                    style={[
                      styles.stepButton,
                      { backgroundColor: colors.surfaceAlt },
                    ]}
                  >
                    <Feather name="minus" size={20} color={colors.text} />
                  </Pressable>
                  <View style={styles.stepperValue}>
                    <AppText variant="heading">
                      {formatDate(targetDate)}
                    </AppText>
                    <AppText variant="caption" muted>
                      {diffDays(today, targetDate)} days from now
                    </AppText>
                  </View>
                  <Pressable
                    onPress={() => shiftTarget(7)}
                    accessibilityRole="button"
                    accessibilityLabel="One week later"
                    style={[
                      styles.stepButton,
                      { backgroundColor: colors.surfaceAlt },
                    ]}
                  >
                    <Feather name="plus" size={20} color={colors.text} />
                  </Pressable>
                </View>
              ) : null}
            </View>

            <View style={styles.section}>
              <AppText variant="label" muted>
                Linked habits
              </AppText>
              {habits.length === 0 ? (
                <View
                  style={[
                    styles.noHabits,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <AppText variant="body" muted>
                    You have no habits yet. Create one, then link it here to
                    track progress toward this goal.
                  </AppText>
                  <PrimaryButton
                    label="Create a habit"
                    icon="plus"
                    onPress={() => router.push("/habit/edit")}
                  />
                </View>
              ) : (
                habits.map((habit) => {
                  const tone = resolveHabitColor(habit.color, isDark, colors);
                  const isLinked = selected.includes(habit.id);
                  return (
                    <Pressable
                      key={habit.id}
                      onPress={() => toggleHabit(habit.id)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isLinked }}
                      style={[
                        styles.habitRow,
                        {
                          backgroundColor: colors.surface,
                          borderColor: isLinked ? colors.accent : colors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.habitIcon,
                          { backgroundColor: tone.soft },
                        ]}
                      >
                        <Feather
                          name={habit.icon as keyof typeof Feather.glyphMap}
                          size={20}
                          color={tone.solid}
                        />
                      </View>
                      <View style={styles.habitText}>
                        <AppText variant="bodyStrong" numberOfLines={1}>
                          {habit.name}
                        </AppText>
                        <AppText variant="caption" muted numberOfLines={1}>
                          {describeRule(habit.rule)}
                        </AppText>
                      </View>
                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: isLinked
                              ? colors.accent
                              : "transparent",
                            borderColor: isLinked
                              ? colors.accent
                              : `${colors.textMuted}66`,
                          },
                        ]}
                      >
                        {isLinked ? (
                          <Feather
                            name="check"
                            size={16}
                            color={colors.onAccent}
                          />
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>

            {editing ? (
              <View style={styles.section}>
                <View
                  style={[
                    styles.switchRow,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.flex}>
                    <AppText variant="bodyStrong">Mark as completed</AppText>
                    <AppText variant="caption" muted>
                      Moves this goal to your completed list
                    </AppText>
                  </View>
                  <Switch
                    value={status === "completed"}
                    onValueChange={(value) => {
                      Haptics.selectionAsync();
                      setStatus(value ? "completed" : "active");
                    }}
                    trackColor={{ false: colors.border, true: colors.accent }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <Pressable onPress={confirmDelete} style={styles.deleteButton}>
                  <Feather name="trash-2" size={18} color={colors.error} />
                  <AppText variant="bodyStrong" color={colors.error}>
                    Delete goal
                  </AppText>
                </Pressable>
              </View>
            ) : null}
          </ScrollView>
        ) : (
          <View style={styles.flex} />
        )}

        <View style={styles.footer}>
          <PrimaryButton
            label={editing ? "Save changes" : "Save goal"}
            icon="check"
            onPress={save}
            disabled={!valid || saving || !ready}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "transparent",
  },
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 24 },
  section: { gap: 10 },
  input: {
    height: 56,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    fontFamily: "Inter_500Medium",
    fontSize: 17,
  },
  presets: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  preset: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  stepperValue: { alignItems: "center" },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  noHabits: {
    gap: 14,
    padding: 16,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  habitIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  habitText: { flex: 1, gap: 2 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  footer: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
});
