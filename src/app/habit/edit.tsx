import { AppText } from "@/components/AppText";
import { PrimaryButton } from "@/components/PrimaryButton";
import {
    createHabit,
    deleteHabit,
    getHabit,
    setArchived,
    updateHabit,
} from "@/db/habits";
import { describeRule, type FrequencyRule } from "@/lib/schedule";
import { formatTime, shiftTime } from "@/lib/time";
import { useTheme } from "@/theme";
import { HABIT_COLOR_KEYS, resolveHabitColor } from "@/theme/habitColors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

type IconName = keyof typeof Feather.glyphMap;
type Mode = "daily" | "weekdays" | "weekly";

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

const MODES: { key: Mode; label: string }[] = [
  { key: "daily", label: "Every day" },
  { key: "weekdays", label: "Pick days" },
  { key: "weekly", label: "Per week" },
];

const PRESETS = ["07:00", "12:00", "18:00", "21:00"];

function StepButton({
  icon,
  onPress,
  disabled,
}: {
  icon: IconName;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="button"
      style={[
        styles.stepButton,
        {
          backgroundColor: colors.surfaceAlt,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      <Feather name={icon} size={20} color={colors.text} />
    </Pressable>
  );
}

export default function EditHabitScreen() {
  const { colors, isDark } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = Boolean(id);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState<IconName>("star");
  const [colorKey, setColorKey] = useState<string>("teal");
  const [mode, setMode] = useState<Mode>("daily");
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [count, setCount] = useState(3);
  const [reminderOn, setReminderOn] = useState(false);
  const [reminder, setReminder] = useState("08:00");
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(!id);

  // Load the habit when editing
  useEffect(() => {
    if (!id) return;
    getHabit(id)
      .then((habit) => {
        if (!habit) {
          router.back();
          return;
        }
        setName(habit.name);
        setIcon(habit.icon as IconName);
        setColorKey(habit.color);
        if (habit.rule.type === "weekdays") {
          setMode("weekdays");
          setDays(habit.rule.days);
        } else if (habit.rule.type === "weekly") {
          setMode("weekly");
          setCount(habit.rule.count);
        } else {
          setMode("daily");
        }
        if (habit.reminderTime) {
          setReminderOn(true);
          setReminder(habit.reminderTime);
        }
        setReady(true);
      })
      .catch((e) => console.error("Failed to load habit", e));
  }, [id]);

  const rule = useMemo<FrequencyRule>(() => {
    if (mode === "weekdays") {
      return { type: "weekdays", days: [...days].sort((a, b) => a - b) };
    }
    if (mode === "weekly") return { type: "weekly", count };
    return { type: "daily" };
  }, [mode, days, count]);

  const tone = resolveHabitColor(colorKey, isDark, colors);
  const valid =
    name.trim().length > 0 && (mode !== "weekdays" || days.length > 0);

  const previewSubtitle = [
    mode === "weekdays" && days.length === 0
      ? "Pick at least one day"
      : describeRule(rule),
    reminderOn ? formatTime(reminder) : null,
  ]
    .filter(Boolean)
    .join(", ");

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
      const payload = {
        name,
        icon,
        color: colorKey,
        rule,
        reminderTime: reminderOn ? reminder : null,
      };
      if (id) await updateHabit(id, payload);
      else await createHabit(payload);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      console.error("Failed to save habit", e);
      setSaving(false);
    }
  };

  const archive = async () => {
    if (!id) return;
    try {
      await setArchived(id, true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      console.error("Failed to archive habit", e);
    }
  };

  const confirmDelete = () => {
    if (!id) return;
    Alert.alert(
      "Delete habit?",
      "This removes the habit and all of its history. Archive it instead if you want to keep your history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHabit(id);
              router.back();
            } catch (e) {
              console.error("Failed to delete habit", e);
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
            {editing ? "Edit habit" : "New habit"}
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
            <View style={[styles.preview, { backgroundColor: tone.soft }]}>
              <View
                style={[
                  styles.previewIcon,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Feather name={icon} size={28} color={tone.solid} />
              </View>
              <View style={styles.previewText}>
                <AppText variant="heading" numberOfLines={1}>
                  {name.trim() || "Your habit"}
                </AppText>
                <AppText variant="caption" muted numberOfLines={1}>
                  {previewSubtitle}
                </AppText>
              </View>
            </View>

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
                {ICONS.map((iconName) => {
                  const selected = icon === iconName;
                  return (
                    <Pressable
                      key={iconName}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setIcon(iconName);
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      style={[
                        styles.iconCell,
                        {
                          backgroundColor: selected
                            ? tone.soft
                            : colors.surface,
                          borderColor: selected ? tone.solid : colors.border,
                        },
                      ]}
                    >
                      <Feather
                        name={iconName}
                        size={22}
                        color={selected ? tone.solid : colors.textMuted}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <AppText variant="label" muted>
                Color
              </AppText>
              <View style={styles.swatchRow}>
                {HABIT_COLOR_KEYS.map((key) => {
                  const swatch = resolveHabitColor(key, isDark, colors);
                  const selected = colorKey === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setColorKey(key);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={key}
                      accessibilityState={{ selected }}
                      style={[
                        styles.swatchRing,
                        {
                          borderColor: selected ? swatch.solid : "transparent",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.swatch,
                          { backgroundColor: swatch.solid },
                        ]}
                      >
                        {selected ? (
                          <Feather name="check" size={16} color="#FFFFFF" />
                        ) : null}
                      </View>
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
                {MODES.map((option) => {
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
                            borderColor: selected
                              ? colors.accent
                              : colors.border,
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

              {mode === "weekly" ? (
                <View style={styles.stepperRow}>
                  <StepButton
                    icon="minus"
                    disabled={count <= 1}
                    onPress={() => setCount((c) => Math.max(1, c - 1))}
                  />
                  <View style={styles.stepperValue}>
                    <AppText variant="title">{count}</AppText>
                    <AppText variant="caption" muted>
                      {count === 1 ? "time per week" : "times per week"}
                    </AppText>
                  </View>
                  <StepButton
                    icon="plus"
                    disabled={count >= 7}
                    onPress={() => setCount((c) => Math.min(7, c + 1))}
                  />
                </View>
              ) : null}
            </View>

            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.reminderHead}>
                <View style={styles.flex}>
                  <AppText variant="bodyStrong">Reminder</AppText>
                  <AppText variant="caption" muted>
                    A gentle nudge at a time you pick
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
                  <View style={styles.stepperRow}>
                    <StepButton
                      icon="minus"
                      onPress={() => setReminder((r) => shiftTime(r, -15))}
                    />
                    <AppText variant="title">{formatTime(reminder)}</AppText>
                    <StepButton
                      icon="plus"
                      onPress={() => setReminder((r) => shiftTime(r, 15))}
                    />
                  </View>
                  <View style={styles.presets}>
                    {PRESETS.map((preset) => {
                      const selected = reminder === preset;
                      return (
                        <Pressable
                          key={preset}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setReminder(preset);
                          }}
                          style={[
                            styles.preset,
                            {
                              backgroundColor: selected
                                ? colors.accentSoft
                                : colors.surfaceAlt,
                            },
                          ]}
                        >
                          <AppText
                            variant="label"
                            color={
                              selected ? colors.accentDeep : colors.textMuted
                            }
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

            {editing ? (
              <View style={styles.dangerRow}>
                <Pressable onPress={archive} style={styles.dangerButton}>
                  <Feather name="archive" size={18} color={colors.textMuted} />
                  <AppText variant="bodyStrong" muted>
                    Archive
                  </AppText>
                </Pressable>
                <Pressable onPress={confirmDelete} style={styles.dangerButton}>
                  <Feather name="trash-2" size={18} color={colors.error} />
                  <AppText variant="bodyStrong" color={colors.error}>
                    Delete
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
            label={editing ? "Save changes" : "Save habit"}
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
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 28,
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  previewText: { flex: 1, gap: 2 },
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
  swatchRow: { flexDirection: "row", justifyContent: "space-between" },
  swatchRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    padding: 3,
  },
  swatch: {
    flex: 1,
    borderRadius: 20,
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
  card: {
    padding: 16,
    gap: 12,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
  },
  reminderHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  presets: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  preset: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  dangerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 28,
    paddingTop: 4,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  footer: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
});
