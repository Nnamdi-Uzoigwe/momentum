import { AppText } from "@/components/AppText";
import { Avatar } from "@/components/Avatar";
import { GRACE_HOURS, isInGrace, parseDateKey, toDateKey } from "@/lib/dates";
import { PART_ICON, dayPart, greetingFor } from "@/lib/greeting";
import { useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

export function TodayHeader({ name }: { name: string | null }) {
  const { colors } = useTheme();
  const now = new Date();
  const part = dayPart(now);
  const grace = isInGrace(now);

  // The date of the day check-ins currently count for
  const date = parseDateKey(toDateKey()).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <View style={styles.wrap}>
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

      {grace ? (
        <View style={[styles.grace, { backgroundColor: colors.accentSoft }]}>
          <Feather name="moon" size={14} color={colors.accentDeep} />
          <AppText
            variant="caption"
            color={colors.accentDeep}
            style={styles.graceText}
          >
            Late night grace: check-ins still count for this day until{" "}
            {GRACE_HOURS} AM.
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
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
  grace: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
  },
  graceText: { flex: 1 },
});
