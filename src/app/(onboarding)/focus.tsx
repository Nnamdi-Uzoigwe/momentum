import { AppText } from "@/components/AppText";
import { OnboardingShell } from "@/components/OnboardingShell";
import { PrimaryButton } from "@/components/PrimaryButton";
import { FOCUS_AREAS } from "@/lib/onboardingData";
import { useTheme } from "@/theme";
import { resolveHabitColor } from "@/theme/habitColors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function FocusScreen() {
  const { colors, isDark } = useTheme();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (key: string) => {
    Haptics.selectionAsync();
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  return (
    <OnboardingShell
      step={1}
      title="What do you want to focus on?"
      subtitle="Pick one or more. We will suggest small habits to start with."
      onBack={() => router.back()}
      footer={
        <PrimaryButton
          label="Continue"
          disabled={selected.length === 0}
          onPress={() =>
            router.push({
              pathname: "/first-habit",
              params: { areas: selected.join(",") },
            })
          }
        />
      }
    >
      <View style={styles.grid}>
        {FOCUS_AREAS.map((area) => {
          const tone = resolveHabitColor(area.color, isDark, colors);
          const on = selected.includes(area.key);
          return (
            <Pressable
              key={area.key}
              onPress={() => toggle(area.key)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              style={[
                styles.card,
                {
                  backgroundColor: on ? colors.accentSoft : colors.surface,
                  borderColor: on ? colors.accent : colors.border,
                },
              ]}
            >
              <View style={[styles.icon, { backgroundColor: tone.soft }]}>
                <Feather name={area.icon} size={24} color={tone.solid} />
              </View>
              <AppText variant="bodyStrong">{area.label}</AppText>
              {on ? (
                <View
                  style={[styles.badge, { backgroundColor: colors.accent }]}
                >
                  <Feather name="check" size={14} color={colors.onAccent} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    flexGrow: 1,
    flexBasis: "45%",
    gap: 12,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
