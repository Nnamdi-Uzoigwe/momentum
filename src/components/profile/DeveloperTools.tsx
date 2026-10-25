import { AppText } from "@/components/AppText";
import { useCelebration } from "@/lib/celebrationHost";
import { previewStreakCelebration } from "@/lib/celebrations";
import { useOnboarding } from "@/lib/onboarding";
import { useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

type IconName = keyof typeof Feather.glyphMap;

function ToolButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: IconName;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.tool,
        { backgroundColor: colors.surfaceAlt, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Feather name={icon} size={18} color={colors.textMuted} />
      <AppText variant="bodyStrong">{label}</AppText>
    </Pressable>
  );
}

export function DeveloperTools() {
  const { colors } = useTheme();
  const { showToast, showCelebration } = useCelebration();
  const { replay } = useOnboarding();
  const [open, setOpen] = useState(false);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.head}
      >
        <Feather name="tool" size={18} color={colors.textMuted} />
        <AppText variant="bodyStrong" muted style={styles.title}>
          Developer tools
        </AppText>
        <Feather
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.textMuted}
        />
      </Pressable>

      {open ? (
        <View style={styles.body}>
          <AppText variant="caption" muted>
            Previews do not unlock anything.
          </AppText>
          <ToolButton
            label="Preview 7 day streak"
            icon="zap"
            onPress={() => showCelebration(previewStreakCelebration(7))}
          />
          <ToolButton
            label="Preview 30 day streak"
            icon="award"
            onPress={() => showCelebration(previewStreakCelebration(30))}
          />
          <ToolButton
            label="Preview 365 day streak"
            icon="sun"
            onPress={() => showCelebration(previewStreakCelebration(365))}
          />
          <ToolButton
            label="Preview perfect day"
            icon="star"
            onPress={() =>
              showToast({
                message: "Perfect day. Everything is done.",
                icon: "star",
                big: true,
              })
            }
          />
          <ToolButton
            label="Replay onboarding"
            icon="refresh-cw"
            onPress={() => {
              replay();
            }}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    gap: 12,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
  },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { flex: 1 },
  body: { gap: 10 },
  tool: {
    height: 48,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
  },
});
