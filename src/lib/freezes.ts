import { addDays, diffDays } from "@/lib/dates";
import { isScheduledOn, type FrequencyRule } from "@/lib/schedule";
import { computeStreak } from "@/lib/streaks";

export const MONTHLY_FREEZES = 2;
export const FREEZE_WINDOW_DAYS = 7;

type BlockInput = {
  rule: FrequencyRule;
  frozenOn: string;
  today: string;
  startDate: string;
  frozen: string[];
  left: number;
};

// Returns why a day cannot be frozen, or null when it can
export function freezeBlockReason({
  rule,
  frozenOn,
  today,
  startDate,
  frozen,
  left,
}: BlockInput): string | null {
  if (rule.type === "weekly") {
    return "Streak freezes work for daily and weekday habits.";
  }
  if (frozenOn >= today) return "Only days that have passed can be frozen.";
  if (frozenOn < startDate) return "That day is before this habit started.";
  if (diffDays(frozenOn, today) > FREEZE_WINDOW_DAYS) {
    return `Freezes cover the last ${FREEZE_WINDOW_DAYS} days.`;
  }
  if (!isScheduledOn(rule, frozenOn)) return "That day was not scheduled.";
  if (frozen.includes(frozenOn)) return "That day is already frozen.";
  if (left <= 0) return "You have no freezes left this month.";
  return null;
}

type SaverInput = {
  rule: FrequencyRule;
  startDate: string;
  dates: string[];
  frozen: string[];
  today: string;
};

// If yesterday was missed and a freeze would restore a streak worth keeping,
// returns the streak length that would be saved. Otherwise null.
export function streakSaverFor({
  rule,
  startDate,
  dates,
  frozen,
  today,
}: SaverInput): number | null {
  if (rule.type === "weekly") return null;

  const yesterday = addDays(today, -1);
  if (yesterday < startDate || !isScheduledOn(rule, yesterday)) return null;
  if (dates.includes(yesterday) || frozen.includes(yesterday)) return null;

  const saved = computeStreak({
    rule,
    completedDates: dates,
    startDate,
    today,
    frozenDates: [...frozen, yesterday],
  }).current;

  return saved >= 3 ? saved : null;
}
