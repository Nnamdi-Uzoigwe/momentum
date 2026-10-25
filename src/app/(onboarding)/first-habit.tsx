import { AppText } from "@/components/AppText";
import { OnboardingShell } from "@/components/OnboardingShell";
import { PrimaryButton } from "@/components/PrimaryButton";
import { suggestionsFor, type Suggestion } from "@/lib/onboardingData";
import { useTheme } from "@/theme";
import { resolveHabitColor } from "@/theme/habitColors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

export default function FirstHabitScreen() {
  const { colors, isDark } = useTheme();
  const { areas } = useLocalSearchParams<{ areas?: string }>();

  const areaKeys = useMemo(() => (areas ? areas.split(",") : []), [areas]);
  const suggestions = useMemo(() => suggestionsFor(areaKeys), [areaKeys]);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string>("star");
  const [color, setColor] = useState<string>(suggestions[0]?.color ?? "teal");
  const [picked, setPicked] = useState<string | null>(null);

  const pick = (item: Suggestion) => {
    Haptics.selectionAsync();
    setName(item.name);
    setIcon(item.icon);
    setColor(item.color);
    setPicked(item.name);
  };

  const onType = (text: string) => {
    setName(text);
    setPicked(null);
    setIcon("star");
  };

  const valid = name.trim().length > 0;

  return (
    <OnboardingShell
      step={2}
      title="Pick your first habit"
      subtitle="Start with just one. Small and easy wins beat big and ambitious."
      onBack={() => router.back()}
      footer={
        <PrimaryButton
          label="Continue"
          disabled={!valid}
          onPress={() =>
            router.push({
              pathname: "/reminder",
              params: { areas: areas ?? "", name: name.trim(), icon, color },
            })
          }
        />
      }
    >
      <View style={styles.list}>
        {suggestions.map((item) => {
          const tone = resolveHabitColor(item.color, isDark, colors);
          const on = picked === item.name;
          return (
            <Pressable
              key={item.name}
              onPress={() => pick(item)}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              style={[
                styles.row,
                {
                  backgroundColor: on ? colors.accentSoft : colors.surface,
                  borderColor: on ? colors.accent : colors.border,
                },
              ]}
            >
              <View style={[styles.icon, { backgroundColor: tone.soft }]}>
                <Feather name={item.icon} size={20} color={tone.solid} />
              </View>
              <AppText variant="bodyStrong" style={styles.rowText}>
                {item.name}
              </AppText>
              <View
                style={[
                  styles.radio,
                  {
                    backgroundColor: on ? colors.accent : "transparent",
                    borderColor: on ? colors.accent : `${colors.textMuted}66`,
                  },
                ]}
              >
                {on ? (
                  <Feather name="check" size={14} color={colors.onAccent} />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.custom}>
        <AppText variant="label" muted>
          Or write your own
        </AppText>
        <TextInput
          value={picked ? "" : name}
          onChangeText={onType}
          placeholder="e.g. Practice guitar"
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
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  custom: { gap: 10 },
  input: {
    height: 56,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    fontFamily: "Inter_500Medium",
    fontSize: 17,
  },
});
