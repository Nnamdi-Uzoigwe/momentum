import { AppText } from "@/components/AppText";
import { BADGES, BADGE_ORDER } from "@/lib/badges";
import { useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function BadgeShelf({ unlocked }: { unlocked: Record<string, number> }) {
  const { colors } = useTheme();

  return (
    <View style={styles.grid}>
      {BADGE_ORDER.map((key) => {
        const badge = BADGES[key];
        const at = unlocked[key];
        const earned = at !== undefined;

        return (
          <View
            key={key}
            style={[
              styles.tile,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.medal,
                { backgroundColor: earned ? colors.accent : colors.surfaceAlt },
              ]}
            >
              <Feather
                name={earned ? badge.icon : "lock"}
                size={22}
                color={earned ? colors.onAccent : colors.textMuted}
              />
            </View>
            <AppText
              variant="label"
              color={earned ? colors.text : colors.textMuted}
              numberOfLines={1}
            >
              {badge.title}
            </AppText>
            <AppText
              variant="caption"
              muted
              numberOfLines={2}
              style={styles.caption}
            >
              {earned ? formatDate(at) : badge.description}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: {
    flexGrow: 1,
    flexBasis: "30%",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
  },
  medal: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  caption: { textAlign: "center" },
});
