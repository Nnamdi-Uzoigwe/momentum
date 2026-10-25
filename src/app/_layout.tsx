import { BrandSplash } from "@/components/BrandSplash";
import { getDb } from "@/db/client";
import { getSetting } from "@/db/settings";
import { OnboardingProvider } from "@/lib/onboarding";
import { ThemeProvider, useTheme } from "@/theme";
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
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    getDb()
      .then(() => getSetting("onboarding_done"))
      .then((value) => setOnboarded(value === "1"))
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
      <ThemeProvider>
        <OnboardingProvider initialDone={onboarded}>
          <BottomSheetModalProvider>
            <RootStack />
          </BottomSheetModalProvider>
        </OnboardingProvider>
        {showSplash ? <BrandSplash onDone={hideBrandSplash} /> : null}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
