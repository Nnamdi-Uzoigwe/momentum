import { AppText } from "@/components/AppText";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Section } from "@/components/profile/Section";
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

export function RemindersCard() {
  const { colors } = useTheme();
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
    <Section title="Reminders">
      <View style={styles.status}>
        <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
          <Feather name={copy.icon} size={22} color={colors.accent} />
        </View>
        <View style={styles.statusText}>
          <AppText variant="bodyStrong">{copy.title}</AppText>
          <AppText variant="caption" muted>
            {copy.body}
          </AppText>
        </View>
      </View>
      <PrimaryButton label={copy.action} onPress={onPrimary} />
      {testSent && permission === "granted" ? (
        <AppText variant="caption" muted>
          Test reminder sent. It should arrive in about 5 seconds.
        </AppText>
      ) : null}
    </Section>
  );
}

const styles = StyleSheet.create({
  status: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: { flex: 1, gap: 2 },
});
