import { AppText } from "@/components/AppText";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useOnboarding } from "@/lib/onboarding";
import {
  getReminderPermission,
  requestReminderPermission,
  scheduleTestReminder,
  syncReminders,
  type ReminderPermission,
} from "@/lib/reminders";
import { useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";

const COPY: Record<
  ReminderPermission,
  {
    icon: keyof typeof Feather.glyphMap;
    title: string;
    body: string;
    action: string;
  }
> = {
  granted: {
    icon: "bell",
    title: "Reminders are on",
    body: "Each habit with a reminder time nudges you once a day. Finishing a habit skips that day.",
    action: "Send a test reminder",
  },
  undetermined: {
    icon: "bell",
    title: "Turn on reminders",
    body: "Allow notifications so your habit reminders can reach you.",
    action: "Allow notifications",
  },
  denied: {
    icon: "bell-off",
    title: "Reminders are off",
    body: "Notifications are blocked for Momentum. You can turn them on in your phone settings.",
    action: "Open settings",
  },
};

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { replay } = useOnboarding();
  const [permission, setPermission] =
    useState<ReminderPermission>("undetermined");
  const [testSent, setTestSent] = useState(false);

  const refresh = useCallback(async () => {
    const { status } = await getReminderPermission();
    setPermission(status);
  }, []);

  // Refresh on focus, which also catches returning from phone settings
  useFocusEffect(
    useCallback(() => {
      refresh().catch((e) => console.error(e));
    }, [refresh]),
  );

  const copy = COPY[permission];

  const onPrimary = async () => {
    try {
      if (permission === "granted") {
        setTestSent(await scheduleTestReminder());
      } else if (permission === "undetermined") {
        await requestReminderPermission();
        await refresh();
        await syncReminders();
      } else {
        await Linking.openSettings();
      }
    } catch (e) {
      console.error("Reminder action failed", e);
    }
  };

  return (
    <Screen>
      <AppText variant="display">Profile</AppText>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.head}>
          <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
            <Feather name={copy.icon} size={22} color={colors.accent} />
          </View>
          <AppText variant="heading" style={styles.headText}>
            {copy.title}
          </AppText>
        </View>
        <AppText variant="body" muted>
          {copy.body}
        </AppText>
        <PrimaryButton label={copy.action} onPress={onPrimary} />
        {testSent && permission === "granted" ? (
          <AppText variant="caption" muted>
            Test reminder sent. It should arrive in about 5 seconds.
          </AppText>
        ) : null}
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <AppText variant="heading">Developer tools</AppText>
        <AppText variant="body" muted>
          Real settings arrive in step 11. For now you can replay the welcome
          flow to test it.
        </AppText>
        <PrimaryButton
          label="Replay onboarding"
          icon="refresh-cw"
          onPress={() => {
            replay();
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    gap: 12,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
  },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headText: { flex: 1 },
});
