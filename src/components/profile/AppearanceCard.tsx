import { AppText } from "@/components/AppText";
import { Section } from "@/components/profile/Section";
import { useTheme, type ThemeMode } from "@/theme";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, View } from "react-native";

type IconName = keyof typeof Feather.glyphMap;

const OPTIONS: { mode: ThemeMode; label: string; icon: IconName }[] = [
  { mode: "light", label: "Light", icon: "sun" },
  { mode: "dark", label: "Dark", icon: "moon" },
  { mode: "system", label: "System", icon: "smartphone" },
];

export function AppearanceCard() {
  const { colors, mode, setMode } = useTheme();

  return (
    <Section title="Appearance" subtitle="Choose how Momentum looks">
      <View style={[styles.segment, { backgroundColor: colors.surfaceAlt }]}>
        {OPTIONS.map((option) => {
          const selected = mode === option.mode;
          return (
            <Pressable
              key={option.mode}
              onPress={() => {
                Haptics.selectionAsync();
                setMode(option.mode);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[
                styles.item,
                selected && { backgroundColor: colors.surface },
              ]}
            >
              <Feather
                name={option.icon}
                size={18}
                color={selected ? colors.accent : colors.textMuted}
              />
              <AppText
                variant="label"
                color={selected ? colors.accentDeep : colors.textMuted}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  segment: { flexDirection: "row", padding: 4, borderRadius: 20 },
  item: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});
