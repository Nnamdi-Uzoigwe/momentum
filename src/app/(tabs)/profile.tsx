import { AppText } from "@/components/AppText";
import { Screen } from "@/components/Screen";
import { AppearanceCard } from "@/components/profile/AppearanceCard";
import { ArchivedHabits } from "@/components/profile/ArchivedHabits";
import { DeveloperTools } from "@/components/profile/DeveloperTools";
import { RemindersCard } from "@/components/profile/RemindersCard";
import { Section } from "@/components/profile/Section";
import { useProfileData } from "@/hooks/useProfileData";
import { useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

function Stat({ value, label }: { value: number; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.stat}>
      <AppText variant="title" color={colors.onAccent}>
        {value}
      </AppText>
      <AppText variant="caption" color={colors.onAccent}>
        {label}
      </AppText>
    </View>
  );
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { archived, stats, reload } = useProfileData();
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <Screen>
      <View>
        <AppText variant="caption" muted>
          Your space
        </AppText>
        <AppText variant="display">Profile</AppText>
      </View>

      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroTop}>
          <View
            style={[styles.mark, { backgroundColor: `${colors.onAccent}26` }]}
          >
            <Feather name="check" size={24} color={colors.onAccent} />
          </View>
          <View>
            <AppText variant="title" color={colors.onAccent}>
              Momentum
            </AppText>
            <AppText variant="bodyStrong" color={colors.onAccent}>
              Small daily wins
            </AppText>
          </View>
        </View>

        <View
          style={[styles.stats, { backgroundColor: `${colors.onAccent}1F` }]}
        >
          <Stat value={stats?.checkIns ?? 0} label="Check-ins" />
          <Stat value={stats?.activeDays ?? 0} label="Active days" />
          <Stat value={stats?.badges ?? 0} label="Badges" />
        </View>
      </LinearGradient>

      <AppearanceCard />
      <RemindersCard />

      {archived.length > 0 ? (
        <ArchivedHabits habits={archived} onChanged={reload} />
      ) : null}

      <Section title="About">
        <View style={styles.aboutRow}>
          <AppText variant="body" muted>
            Version
          </AppText>
          <AppText variant="bodyStrong">{version}</AppText>
        </View>
        <AppText variant="caption" muted>
          Your habits and history are stored on this device. Nothing is
          uploaded.
        </AppText>
      </Section>

      <DeveloperTools />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 20, gap: 18, borderRadius: 32 },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  mark: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  stats: {
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 22,
  },
  stat: { flex: 1, alignItems: "center" },
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
