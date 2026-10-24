import type { ThemeColors } from "@/theme/colors";

export const HABIT_COLOR_KEYS = [
  "coral",
  "amber",
  "green",
  "teal",
  "rose",
  "slate",
] as const;

export type HabitColorKey = (typeof HABIT_COLOR_KEYS)[number];

export type HabitTone = { solid: string; soft: string };

const light: Record<HabitColorKey, HabitTone> = {
  coral: { solid: "#FF6B5E", soft: "#FFE9E5" },
  amber: { solid: "#E09B00", soft: "#FFF3D6" },
  green: { solid: "#22A861", soft: "#DDF5E8" },
  teal: { solid: "#14A3A0", soft: "#D9F3F2" },
  rose: { solid: "#E8478F", soft: "#FDE3EF" },
  slate: { solid: "#5B6675", soft: "#E9ECF0" },
};

const dark: Record<HabitColorKey, HabitTone> = {
  coral: { solid: "#FF7B6E", soft: "#3A1E1B" },
  amber: { solid: "#FFC53D", soft: "#3A2E10" },
  green: { solid: "#3DDC8A", soft: "#143525" },
  teal: { solid: "#35D0CB", soft: "#10332F" },
  rose: { solid: "#FF6FAD", soft: "#3A1829" },
  slate: { solid: "#9AA6B6", soft: "#232A33" },
};

// Unknown keys (like the old 'orange' default) fall back to the app accent
export function resolveHabitColor(
  key: string,
  isDark: boolean,
  fallback: ThemeColors,
): HabitTone {
  const table = isDark ? dark : light;
  return (
    table[key as HabitColorKey] ?? {
      solid: fallback.accent,
      soft: fallback.accentSoft,
    }
  );
}
