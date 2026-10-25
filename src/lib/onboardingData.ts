import type { HabitColorKey } from "@/theme/habitColors";
import type { Feather } from "@expo/vector-icons";

type IconName = keyof typeof Feather.glyphMap;

export type FocusArea = {
  key: string;
  label: string;
  icon: IconName;
  color: HabitColorKey;
};

export type Suggestion = {
  name: string;
  icon: IconName;
  color: HabitColorKey;
};

export const FOCUS_AREAS: FocusArea[] = [
  { key: "health", label: "Health", icon: "activity", color: "green" },
  { key: "study", label: "Study", icon: "book-open", color: "teal" },
  { key: "faith", label: "Faith", icon: "sun", color: "amber" },
  { key: "money", label: "Money", icon: "dollar-sign", color: "slate" },
  { key: "work", label: "Work", icon: "briefcase", color: "coral" },
  { key: "personal", label: "Personal", icon: "heart", color: "rose" },
];

const SUGGESTIONS: Record<string, { name: string; icon: IconName }[]> = {
  health: [
    { name: "Walk 30 minutes", icon: "activity" },
    { name: "Drink 2 litres of water", icon: "droplet" },
    { name: "Sleep before 11pm", icon: "moon" },
  ],
  study: [
    { name: "Read 10 pages", icon: "book-open" },
    { name: "Study for 1 hour", icon: "edit-3" },
    { name: "Review my notes", icon: "target" },
  ],
  faith: [
    { name: "Morning prayer", icon: "sun" },
    { name: "Read scripture", icon: "book-open" },
    { name: "Write one thing I am grateful for", icon: "heart" },
  ],
  money: [
    { name: "Save a little today", icon: "dollar-sign" },
    { name: "Track my spending", icon: "edit-3" },
    { name: "No impulse buys", icon: "target" },
  ],
  work: [
    { name: "Plan tomorrow", icon: "target" },
    { name: "One hour of deep work", icon: "clock" },
    { name: "Learn one new thing", icon: "star" },
  ],
  personal: [
    { name: "Journal for 5 minutes", icon: "edit-3" },
    { name: "Stretch for 5 minutes", icon: "activity" },
    { name: "Call a friend or family", icon: "phone" },
  ],
};

// Up to six suggestions, taking one from each chosen area before taking seconds
export function suggestionsFor(areaKeys: string[]): Suggestion[] {
  const chosen = FOCUS_AREAS.filter((a) => areaKeys.includes(a.key));
  const areas = chosen.length > 0 ? chosen : FOCUS_AREAS;
  const out: Suggestion[] = [];

  for (let i = 0; i < 3 && out.length < 6; i++) {
    for (const area of areas) {
      const item = SUGGESTIONS[area.key]?.[i];
      if (item && out.length < 6) out.push({ ...item, color: area.color });
    }
  }
  return out;
}
