import { AppText } from "@/components/AppText";
import { CheckCircle } from "@/components/CheckCircle";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useTheme } from "@/theme";
import { resolveHabitColor, type HabitColorKey } from "@/theme/habitColors";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type IconName = keyof typeof Feather.glyphMap;

const DEMO: { name: string; icon: IconName; color: HabitColorKey }[] = [
  { name: "Read 10 pages", icon: "book-open", color: "teal" },
  { name: "Drink 2 litres of water", icon: "droplet", color: "green" },
  { name: "Walk 30 minutes", icon: "activity", color: "amber" },
];

export default function WelcomeScreen() {
  const { colors, isDark } = useTheme();
  const [checked, setChecked] = useState(0);

  // A looping demo: the habits tick off one by one
  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      setChecked(0);
      timers = [700, 1300, 1900].map((ms, i) =>
        setTimeout(() => setChecked(i + 1), ms),
      );
    };
    run();
    const interval = setInterval(run, 4400);
    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.hero}>
        <View
          style={[
            styles.demoCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={styles.demoHead}>
            <AppText variant="heading">Today</AppText>
            <AppText variant="caption" muted>
              {checked} of {DEMO.length} done
            </AppText>
          </View>
          {DEMO.map((item, i) => {
            const tone = resolveHabitColor(item.color, isDark, colors);
            return (
              <View
                key={item.name}
                style={[styles.demoRow, { backgroundColor: colors.surfaceAlt }]}
              >
                <View style={[styles.demoIcon, { backgroundColor: tone.soft }]}>
                  <Feather name={item.icon} size={20} color={tone.solid} />
                </View>
                <AppText variant="bodyStrong" style={styles.demoName}>
                  {item.name}
                </AppText>
                <CheckCircle done={checked > i} size={30} />
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.copy}>
        <AppText variant="display">Small daily wins add up</AppText>
        <AppText variant="body" muted>
          Turn big goals into one tap a day. No clutter, no pressure, just
          progress you can see.
        </AppText>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Get started"
          icon="arrow-right"
          onPress={() => router.push("/name")}
        />
        <AppText variant="caption" muted style={styles.hint}>
          Takes less than a minute
        </AppText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  hero: { flex: 1, justifyContent: "center" },
  demoCard: {
    padding: 16,
    gap: 10,
    borderRadius: 32,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  demoHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  demoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 20,
  },
  demoIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  demoName: { flex: 1 },
  copy: { gap: 10, paddingBottom: 24 },
  footer: { gap: 10, paddingBottom: 12 },
  hint: { textAlign: "center" },
});
