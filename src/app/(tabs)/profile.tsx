import { AppText } from "@/components/AppText";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useOnboarding } from "@/lib/onboarding";
import { useTheme } from "@/theme";
import { StyleSheet, View } from "react-native";

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { replay } = useOnboarding();

  return (
    <Screen>
      <AppText variant="display">Profile</AppText>

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
});
