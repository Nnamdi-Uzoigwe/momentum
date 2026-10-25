import { AppText } from "@/components/AppText";
import { Avatar } from "@/components/Avatar";
import { OnboardingShell } from "@/components/OnboardingShell";
import { PrimaryButton } from "@/components/PrimaryButton";
import { getSetting, setSetting } from "@/db/settings";
import { dayPart, greetingFor } from "@/lib/greeting";
import { useTheme } from "@/theme";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

export default function NameScreen() {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const trimmed = name.trim();

  // Prefill when onboarding is replayed
  useEffect(() => {
    getSetting("user_name")
      .then((value) => {
        if (value) setName(value);
      })
      .catch((e) => console.error(e));
  }, []);

  const next = async () => {
    if (trimmed) {
      try {
        await setSetting("user_name", trimmed);
      } catch (e) {
        console.error("Failed to save name", e);
      }
    }
    router.push("/focus");
  };

  return (
    <OnboardingShell
      step={0}
      total={0}
      title="What should we call you?"
      subtitle="We will use it to greet you each day. You can change it later in Profile."
      onBack={() => router.back()}
      footer={
        <PrimaryButton
          label={trimmed ? "Continue" : "Skip for now"}
          onPress={next}
        />
      }
    >
      <View style={[styles.preview, { backgroundColor: colors.accentSoft }]}>
        <Avatar name={trimmed || null} size={56} />
        <View style={styles.previewText}>
          <AppText variant="caption" muted>
            {greetingFor(dayPart())}
          </AppText>
          <AppText variant="title" numberOfLines={1}>
            {trimmed || "Your name"}
          </AppText>
        </View>
      </View>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your first name"
        placeholderTextColor={colors.textMuted}
        maxLength={24}
        autoFocus
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={next}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
      />
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 28,
  },
  previewText: { flex: 1, gap: 2 },
  input: {
    height: 56,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    fontFamily: "Inter_500Medium",
    fontSize: 17,
  },
});
