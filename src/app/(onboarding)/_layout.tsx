import { useOnboarding } from "@/lib/onboarding";
import { useTheme } from "@/theme";
import { Redirect, Stack } from "expo-router";

export default function OnboardingLayout() {
  const { done } = useOnboarding();
  const { colors } = useTheme();

  // Once onboarding finishes, drop the user on Today
  if (done) return <Redirect href="/" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
