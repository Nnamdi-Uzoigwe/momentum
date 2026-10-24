import { AppText } from "@/components/AppText";
import { PrimaryButton } from "@/components/PrimaryButton";
import { createHabit } from "@/db/habits";
import type { FrequencyRule } from "@/lib/schedule";
import { useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type IconName = keyof typeof Feather.glyphMap;

const ICONS: IconName[] = [
  "star",
  "book-open",
  "droplet",
  "activity",
  "moon",
  "sun",
  "coffee",
  "edit-3",
  "heart",
  "music",
  "dollar-sign",
  "target",
];

// Monday first; values match Date.getDay() (0 = Sunday)
const WEEK = [
  { day: 1, label: "M" },
  { day: 2, label: "T" },
  { day: 3, label: "W" },
  { day: 4, label: "T" },
  { day: 5, label: "F" },
  { day: 6, label: "S" },
  { day: 0, label: "S" },
];

export default function EditHabitScreen() {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<IconName>("star");
  const [mode, setMode] = useState<"daily" | "weekdays">("daily");
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [saving, setSaving] = useState(false);

  const valid = name.trim().length > 0 && (mode === "daily" || days.length > 0);

  const toggleDay = (day: number) => {
    Haptics.selectionAsync();
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const save = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      const rule: FrequencyRule =
        mode === "daily"
          ? { type: "daily" }
          : { type: "weekdays", days: [...days].sort((a, b) => a - b) };
      await createHabit({ name, icon, rule });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      console.error("Failed to save habit", e);
      setSaving(false);
    }
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
          <AppText variant="heading">New habit</AppText>
          <View style={styles.back} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <AppText variant="label" muted>
              Name
            </AppText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Read 10 pages"
              placeholderTextColor={colors.textMuted}
              maxLength={40}
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
              Icon
            </AppText>
            <View style={styles.iconGrid}>
              {ICONS.map((name) => {
                const selected = icon === name;
                return (
                  <Pressable
                    key={name}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setIcon(name);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={[
                      styles.iconCell,
                      {
                        backgroundColor: selected
                          ? colors.accentSoft
                          : colors.surface,
                        borderColor: selected ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Feather
                      name={name}
                      size={22}
                      color={selected ? colors.accent : colors.textMuted}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <AppText variant="label" muted>
              How often
            </AppText>
            <View
              style={[styles.segment, { backgroundColor: colors.surfaceAlt }]}
            >
              {(
                [
                  { key: "daily", label: "Every day" },
                  { key: "weekdays", label: "Pick days" },
                ] as const
              ).map((option) => {
                const selected = mode === option.key;
                return (
                  <Pressable
                    key={option.key}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setMode(option.key);
                    }}
                    style={[
                      styles.segmentItem,
                      selected && { backgroundColor: colors.surface },
                    ]}
                  >
                    <AppText
                      variant="bodyStrong"
                      color={selected ? colors.accentDeep : colors.textMuted}
                    >
                      {option.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            {mode === "weekdays" ? (
              <View style={styles.weekRow}>
                {WEEK.map(({ day, label }) => {
                  const selected = days.includes(day);
                  return (
                    <Pressable
                      key={day}
                      onPress={() => toggleDay(day)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      style={[
                        styles.dayChip,
                        {
                          backgroundColor: selected
                            ? colors.accent
                            : colors.surface,
                          borderColor: selected ? colors.accent : colors.border,
                        },
                      ]}
                    >
                      <AppText
                        variant="bodyStrong"
                        color={selected ? colors.onAccent : colors.textMuted}
                      >
                        {label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label="Save habit"
            icon="check"
            onPress={save}
            disabled={!valid || saving}
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
  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  iconCell: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  segment: { flexDirection: "row", padding: 4, borderRadius: 20 },
  segmentItem: {
    flex: 1,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  dayChip: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
});
