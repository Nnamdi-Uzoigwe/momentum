import { AppText } from "@/components/AppText";
import { useCelebration } from "@/lib/celebrationHost";
import { previewStreakCelebration } from "@/lib/celebrations";
import { clearAllData, loadSampleData } from "@/lib/demoData";
import { useOnboarding } from "@/lib/onboarding";
import { syncReminders } from "@/lib/reminders";
import { useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

type IconName = keyof typeof Feather.glyphMap;

function ToolButton({
  label,
  icon,
  onPress,
  danger,
}: {
  label: string;
  icon: IconName;
  onPress: () => void;
  danger?: boolean;
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
      <Feather
        name={icon}
        size={18}
        color={danger ? colors.error : colors.textMuted}
      />
      <AppText variant="bodyStrong" color={danger ? colors.error : colors.text}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function DeveloperTools() {
  const { colors } = useTheme();
  const { showToast, showCelebration } = useCelebration();
  const { replay } = useOnboarding();
  const [open, setOpen] = useState(false);

  const confirmLoad = () => {
    Alert.alert(
      "Load sample data?",
      "This adds 5 sample habits with about 10 weeks of history, a goal and a few badges. Your own data stays.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Load",
          onPress: async () => {
            try {
              await loadSampleData();
              syncReminders();
              showToast({ message: "Sample data loaded", icon: "database" });
            } catch (e) {
              console.error("Failed to load sample data", e);
            }
          },
        },
      ],
    );
  };

  const confirmClear = () => {
    Alert.alert(
      "Clear all data?",
      "This permanently deletes every habit, check-in, goal and badge on this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear everything",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllData();
              syncReminders();
              showToast({ message: "All data cleared", icon: "trash-2" });
            } catch (e) {
              console.error("Failed to clear data", e);
            }
          },
        },
      ],
    );
  };

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
          Demo tools
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
            Handy for screenshots and demos. Celebration previews do not unlock
            anything.
          </AppText>
          <ToolButton
            label="Load sample data"
            icon="database"
            onPress={confirmLoad}
          />
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
          <ToolButton
            label="Clear all data"
            icon="trash-2"
            onPress={confirmClear}
            danger
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
