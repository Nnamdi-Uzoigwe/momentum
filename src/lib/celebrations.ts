import { unlockBadge } from "@/db/badges";
import type { TodayItem } from "@/db/habits";
import { getSetting, setSetting } from "@/db/settings";
import {
    BADGES,
    DAY_MILESTONES,
    STREAK_BADGES,
    WEEK_MILESTONES,
    type BadgeDef,
} from "@/lib/badges";
import type { Feather } from "@expo/vector-icons";

export type CelebrationData = {
  kind: "streak" | "badge";
  streak: number;
  unit: "day" | "week";
  habitName: string;
  badge: BadgeDef | null;
  intensity: number; // 1 to 5, drives the amount of confetti
  message: string;
};

export type ToastInput = {
  message: string;
  icon: keyof typeof Feather.glyphMap;
  big?: boolean;
};

export type CheckInOutcome =
  | { type: "celebration"; data: CelebrationData }
  | { type: "toast"; toast: ToastInput }
  | null;

const DAY_INTENSITY: Record<number, number> = {
  7: 1,
  14: 2,
  30: 3,
  100: 4,
  365: 5,
};
const WEEK_INTENSITY: Record<number, number> = { 4: 1, 12: 2, 26: 3, 52: 4 };

const DAY_MESSAGES: Record<number, string> = {
  7: "A full week. Your habit is taking root.",
  14: "Two weeks strong. This is becoming part of you.",
  30: "Thirty days. You have built something real.",
  100: "One hundred days. Very few people get here.",
  365: "A whole year. This is legendary.",
};

function streakMessage(unit: "day" | "week", n: number) {
  if (unit === "day") return DAY_MESSAGES[n] ?? `${n} days in a row.`;
  return `${n} weeks in a row. Steady wins the race.`;
}

export function badgeCelebration(
  badge: BadgeDef,
  message: string,
): CelebrationData {
  return {
    kind: "badge",
    streak: 0,
    unit: "day",
    habitName: "",
    badge,
    intensity: 2,
    message,
  };
}

// Used by the preview buttons on the Profile tab
export function previewStreakCelebration(n: number): CelebrationData {
  const key = STREAK_BADGES[n];
  return {
    kind: "streak",
    streak: n,
    unit: "day",
    habitName: "Read 10 pages",
    badge: key ? BADGES[key] : null,
    intensity: DAY_INTENSITY[n] ?? 1,
    message: streakMessage("day", n),
  };
}

// Call after a habit was just checked off, with the freshly reloaded Today items
export async function evaluateCheckIn(
  items: TodayItem[],
  habitId: string,
  today: string,
): Promise<CheckInOutcome> {
  const item = items.find((i) => i.habit.id === habitId);
  if (!item || !item.done) return null;

  const { habit, streak } = item;
  const n = streak.current;
  const unit = streak.unit;

  // Badges are always awarded, whichever UI ends up being shown
  const firstStep = await unlockBadge("first_habit");
  const streakKey = unit === "day" ? STREAK_BADGES[n] : undefined;
  const streakBadgeIsNew = streakKey ? await unlockBadge(streakKey) : false;

  const milestones = unit === "day" ? DAY_MILESTONES : WEEK_MILESTONES;
  const milestoneKey = `milestone:${habit.id}:${unit}:${n}`;
  const milestoneFresh =
    milestones.includes(n) && !(await getSetting(milestoneKey));
  const fullScreen = milestoneFresh && (unit === "week" || n >= 7);

  if (fullScreen) {
    await setSetting(milestoneKey, "1");
    return {
      type: "celebration",
      data: {
        kind: "streak",
        streak: n,
        unit,
        habitName: habit.name,
        badge: streakBadgeIsNew && streakKey ? BADGES[streakKey] : null,
        intensity: (unit === "day" ? DAY_INTENSITY[n] : WEEK_INTENSITY[n]) ?? 1,
        message: streakMessage(unit, n),
      },
    };
  }

  const total = items.length;
  const doneCount = items.filter((i) => i.done).length;
  if (
    total >= 2 &&
    doneCount === total &&
    (await getSetting("perfect_day")) !== today
  ) {
    await setSetting("perfect_day", today);
    return {
      type: "toast",
      toast: {
        message: "Perfect day. Everything is done.",
        icon: "star",
        big: true,
      },
    };
  }

  if (milestoneFresh) {
    await setSetting(milestoneKey, "1");
    return {
      type: "toast",
      toast: { message: "Three days in a row. Nice start.", icon: "zap" },
    };
  }

  if (firstStep) {
    return {
      type: "toast",
      toast: { message: "Badge unlocked: First step", icon: "award" },
    };
  }

  return null;
}
