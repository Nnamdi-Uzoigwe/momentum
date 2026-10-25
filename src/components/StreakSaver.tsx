import { AppText } from "@/components/AppText";
import { useTheme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  habitName: string;
  saved: number;
  left: number;
  onUse: () => void;
};

export function StreakSaver({ habitName, saved, left, onUse }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.accentSoft }]}>
      <View style={[styles.icon, { backgroundColor: colors.surface }]}>
        <Ionicons name="snow" size={22} color={colors.accent} />
      </View>
      <View style={styles.text}>
        <AppText variant="bodyStrong" color={colors.accentDeep}>
          Save your {saved} day streak
        </AppText>
        <AppText variant="caption" color={colors.accentDeep}>
          You missed {habitName} yesterday. A freeze keeps the streak alive.{" "}
          {left} left this month.
        </AppText>
      </View>
      <Pressable
        onPress={onUse}
        accessibilityRole="button"
        accessibilityLabel={`Use a streak freeze on ${habitName}`}
        style={[styles.button, { backgroundColor: colors.accent }]}
      >
        <AppText variant="label" color={colors.onAccent}>
          Use freeze
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 24,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, gap: 2 },
  button: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
});
