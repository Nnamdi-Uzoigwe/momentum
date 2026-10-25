import type { Feather } from "@expo/vector-icons";

export type DayPart = "morning" | "afternoon" | "evening" | "night";

export function dayPart(date: Date = new Date()): DayPart {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export function greetingFor(part: DayPart): string {
  switch (part) {
    case "morning":
      return "Good morning";
    case "afternoon":
      return "Good afternoon";
    case "evening":
      return "Good evening";
    default:
      return "Good night";
  }
}

export const PART_ICON: Record<DayPart, keyof typeof Feather.glyphMap> = {
  morning: "sunrise",
  afternoon: "sun",
  evening: "sunset",
  night: "moon",
};
