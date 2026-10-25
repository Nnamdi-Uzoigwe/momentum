import { BrandSplash } from "@/components/BrandSplash";
import { ReminderSync } from "@/components/ReminderSync";
import { getDb } from "@/db/client";
import { getSetting } from "@/db/settings";
import { CelebrationProvider } from "@/lib/celebrationHost";
import { OnboardingProvider } from "@/lib/onboarding";
import { setupNotifications } from "@/lib/reminders";
import {
  ThemeProvider,
  parseThemeMode,
  useTheme,
  type ThemeMode,
} from "@/theme";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  Urbanist_700Bold,
  Urbanist_800ExtraBold,
} from "@expo-google-fonts/urbanist";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { colors, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const [dbReady, setDbReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setupNotifications().catch((e) =>
      console.error("Notification setup failed", e),
    );
  }, []);

  useEffect(() => {
    getDb()
      .then(() =>
        Promise.all([getSetting("onboarding_done"), getSetting("theme_mode")]),
      )
      .then(([done, theme]) => {
        setOnboarded(done === "1");
        setThemeMode(parseThemeMode(theme));
      })
      .catch((error) => {
        console.error("Database failed to open", error);
        setOnboarded(true); // do not trap the user in onboarding
      })
      .finally(() => setDbReady(true));
  }, []);

  const ready = fontsLoaded && dbReady;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  const hideBrandSplash = useCallback(() => setShowSplash(false), []);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider initialMode={themeMode}>
        <OnboardingProvider initialDone={onboarded}>
          <CelebrationProvider>
            <BottomSheetModalProvider>
              <RootStack />
            </BottomSheetModalProvider>
            <ReminderSync />
          </CelebrationProvider>
        </OnboardingProvider>
        {showSplash ? <BrandSplash onDone={hideBrandSplash} /> : null}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
