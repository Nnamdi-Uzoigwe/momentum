import { setSetting } from "@/db/settings";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors, type ThemeColors } from "./colors";

export type ThemeMode = "light" | "dark" | "system";

type ThemeValue = {
  colors: ThemeColors;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

// Space reserved at the bottom of scroll content so the floating bar never covers it
export const TAB_BAR_CLEARANCE = 128;

// Anything unknown falls back to light
export function parseThemeMode(value: string | null): ThemeMode {
  return value === "dark" || value === "system" ? value : "light";
}

export function ThemeProvider({
  children,
  initialMode = "light",
}: {
  children: ReactNode;
  initialMode?: ThemeMode;
}) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(initialMode);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    setSetting("theme_mode", next).catch((e) =>
      console.error("Failed to save theme", e),
    );
  }, []);

  const value = useMemo<ThemeValue>(() => {
    const isDark = mode === "system" ? system === "dark" : mode === "dark";
    return {
      colors: isDark ? darkColors : lightColors,
      isDark,
      mode,
      setMode,
    };
  }, [mode, system, setMode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
