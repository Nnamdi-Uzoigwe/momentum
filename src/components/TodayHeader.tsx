import { AppText } from "@/components/AppText";
import { Avatar } from "@/components/Avatar";
import { PART_ICON, dayPart, greetingFor } from "@/lib/greeting";
import { useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

export function TodayHeader({ name }: { name: string | null }) {
  const { colors } = useTheme();
  const now = new Date();
  const part = dayPart(now);
  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <View style={styles.greetRow}>
          <View
            style={[styles.partIcon, { backgroundColor: colors.accentSoft }]}
          >
            <Feather name={PART_ICON[part]} size={14} color={colors.accent} />
          </View>
          <AppText variant="bodyStrong" muted>
            {greetingFor(part)}
          </AppText>
        </View>
        <AppText
          variant="display"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          {name ?? "Today"}
        </AppText>
        <AppText variant="caption" muted>
          {date}
        </AppText>
      </View>

      <Pressable
        onPress={() => router.navigate("/profile")}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
      >
        <Avatar name={name} size={56} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 16 },
  text: { flex: 1, gap: 2 },
  greetRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  partIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
});
