import type { Feather } from "@expo/vector-icons";

export type BadgeKey =
  | "first_habit"
  | "streak_7"
  | "streak_30"
  | "streak_100"
  | "streak_365"
  | "goal_complete";

export type BadgeDef = {
  key: BadgeKey;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
};

export const BADGES: Record<BadgeKey, BadgeDef> = {
  first_habit: {
    key: "first_habit",
    title: "First step",
    description: "Complete your first check-in",
    icon: "flag",
  },
  streak_7: {
    key: "streak_7",
    title: "Spark",
    description: "7 day streak",
    icon: "zap",
  },
  streak_30: {
    key: "streak_30",
    title: "Flame",
    description: "30 day streak",
    icon: "award",
  },
  streak_100: {
    key: "streak_100",
    title: "Blaze",
    description: "100 day streak",
    icon: "star",
  },
  streak_365: {
    key: "streak_365",
    title: "Legend",
    description: "365 day streak",
    icon: "sun",
  },
  goal_complete: {
    key: "goal_complete",
    title: "Goal getter",
    description: "Complete a goal",
    icon: "target",
  },
};

export const BADGE_ORDER: BadgeKey[] = [
  "first_habit",
  "streak_7",
  "streak_30",
  "streak_100",
  "streak_365",
  "goal_complete",
];

// Streak length to the badge it unlocks (day streaks only)
export const STREAK_BADGES: Record<number, BadgeKey> = {
  7: "streak_7",
  30: "streak_30",
  100: "streak_100",
  365: "streak_365",
};

export const DAY_MILESTONES = [3, 7, 14, 30, 100, 365];
export const WEEK_MILESTONES = [4, 12, 26, 52];
