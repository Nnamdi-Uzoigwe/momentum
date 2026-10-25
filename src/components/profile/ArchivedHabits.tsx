import { AppText } from "@/components/AppText";
import { Section } from "@/components/profile/Section";
import { deleteHabit, setArchived } from "@/db/habits";
import type { Habit } from "@/db/types";
import { syncReminders } from "@/lib/reminders";
import { describeRule } from "@/lib/schedule";
import { useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Alert, Pressable, StyleSheet, View } from "react-native";

type Props = {
  habits: Habit[];
  onChanged: () => void;
};

export function ArchivedHabits({ habits, onChanged }: Props) {
  const { colors } = useTheme();

  const restore = async (id: string) => {
    try {
      await setArchived(id, false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      syncReminders();
      onChanged();
    } catch (e) {
      console.error("Failed to restore habit", e);
    }
  };

  const confirmDelete = (habit: Habit) => {
    Alert.alert(
      "Delete habit?",
      `"${habit.name}" and all of its history will be removed for good.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHabit(habit.id);
              syncReminders();
              onChanged();
            } catch (e) {
              console.error("Failed to delete habit", e);
            }
          },
        },
      ],
    );
  };

  return (
    <Section
      title="Archived habits"
      subtitle="Hidden from Today. Your history is kept."
    >
      {habits.map((habit) => (
        <View
          key={habit.id}
          style={[styles.row, { backgroundColor: colors.surfaceAlt }]}
        >
          <View style={[styles.icon, { backgroundColor: colors.surface }]}>
            <Feather
              name={habit.icon as keyof typeof Feather.glyphMap}
              size={20}
              color={colors.textMuted}
            />
          </View>
          <View style={styles.text}>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {habit.name}
            </AppText>
            <AppText variant="caption" muted numberOfLines={1}>
              {describeRule(habit.rule)}
            </AppText>
          </View>
          <Pressable
            onPress={() => restore(habit.id)}
            accessibilityRole="button"
            accessibilityLabel={`Restore ${habit.name}`}
            style={[styles.restore, { backgroundColor: colors.accentSoft }]}
          >
            <AppText variant="label" color={colors.accentDeep}>
              Restore
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => confirmDelete(habit)}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${habit.name}`}
            style={styles.trash}
          >
            <Feather name="trash-2" size={18} color={colors.error} />
          </Pressable>
        </View>
      ))}
    </Section>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 20,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, gap: 2 },
  restore: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 16 },
  trash: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
