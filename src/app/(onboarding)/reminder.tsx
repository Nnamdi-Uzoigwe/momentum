import { AppText } from "@/components/AppText";
import { OnboardingShell } from "@/components/OnboardingShell";
import { PrimaryButton } from "@/components/PrimaryButton";
import { createHabit } from "@/db/habits";
import { useOnboarding } from "@/lib/onboarding";
import { formatTime, shiftTime } from "@/lib/time";
import { useTheme } from "@/theme";
import { resolveHabitColor } from "@/theme/habitColors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";

const PRESETS = ["07:00", "12:00", "18:00", "21:00"];

type IconName = keyof typeof Feather.glyphMap;

export default function ReminderScreen() {
  const { colors, isDark } = useTheme();
  const { finish } = useOnboarding();
  const { areas, name, icon, color } = useLocalSearchParams<{
    areas?: string;
    name?: string;
    icon?: string;
    color?: string;
  }>();

  const habitName = name?.trim() ? name.trim() : "My first habit";
  const habitIcon = (icon ?? "star") as IconName;
  const tone = resolveHabitColor(color ?? "teal", isDark, colors);

  const [reminderOn, setReminderOn] = useState(true);
  const [time, setTime] = useState("08:00");
  const [saving, setSaving] = useState(false);

  const start = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await createHabit({
        name: habitName,
        icon: habitIcon,
        color: color ?? "teal",
        rule: { type: "daily" },
        reminderTime: reminderOn ? time : null,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error("Failed to create first habit", e);
    }
    await finish(areas ? areas.split(",").filter(Boolean) : []);
  };

  const step = (minutes: number) => {
    Haptics.selectionAsync();
    setTime((t) => shiftTime(t, minutes));
  };

  return (
    <OnboardingShell
      step={3}
      title="When should we nudge you?"
      subtitle="One gentle reminder a day. You can change it any time."
      onBack={() => router.back()}
      footer={
        <PrimaryButton
          label="Start my journey"
          icon="arrow-right"
          onPress={start}
          disabled={saving}
        />
      }
    >
      <View style={[styles.preview, { backgroundColor: tone.soft }]}>
        <View style={[styles.previewIcon, { backgroundColor: colors.surface }]}>
          <Feather name={habitIcon} size={26} color={tone.solid} />
        </View>
        <View style={styles.previewText}>
          <AppText variant="heading" numberOfLines={1}>
            {habitName}
          </AppText>
          <AppText variant="caption" muted>
            Every day{reminderOn ? `, ${formatTime(time)}` : ""}
          </AppText>
        </View>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.head}>
          <View style={styles.flex}>
            <AppText variant="bodyStrong">Remind me</AppText>
            <AppText variant="caption" muted>
              A single nudge at a time you pick
            </AppText>
          </View>
          <Switch
            value={reminderOn}
            onValueChange={(value) => {
              Haptics.selectionAsync();
              setReminderOn(value);
            }}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        {reminderOn ? (
          <>
            <View style={styles.stepper}>
              <Pressable
                onPress={() => step(-15)}
                accessibilityRole="button"
                accessibilityLabel="15 minutes earlier"
                style={[
                  styles.stepButton,
                  { backgroundColor: colors.surfaceAlt },
                ]}
              >
                <Feather name="minus" size={20} color={colors.text} />
              </Pressable>
              <AppText variant="title">{formatTime(time)}</AppText>
              <Pressable
                onPress={() => step(15)}
                accessibilityRole="button"
                accessibilityLabel="15 minutes later"
                style={[
                  styles.stepButton,
                  { backgroundColor: colors.surfaceAlt },
                ]}
              >
                <Feather name="plus" size={20} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.presets}>
              {PRESETS.map((preset) => {
                const on = time === preset;
                return (
                  <Pressable
                    key={preset}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setTime(preset);
                    }}
                    style={[
                      styles.preset,
                      {
                        backgroundColor: on
                          ? colors.accentSoft
                          : colors.surfaceAlt,
                      },
                    ]}
                  >
                    <AppText
                      variant="label"
                      color={on ? colors.accentDeep : colors.textMuted}
                    >
                      {formatTime(preset)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 28,
  },
  previewIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  previewText: { flex: 1, gap: 2 },
  card: {
    padding: 16,
    gap: 14,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
  },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  presets: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  preset: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
});
