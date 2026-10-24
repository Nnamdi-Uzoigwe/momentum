import { addDays, weekStart } from "@/lib/dates";
import { isScheduledOn, type FrequencyRule } from "@/lib/schedule";

export type StreakResult = {
  current: number;
  best: number;
  unit: "day" | "week";
};

type Input = {
  rule: FrequencyRule;
  completedDates: string[];
  startDate: string;
  today: string;
};

export function computeStreak({
  rule,
  completedDates,
  startDate,
  today,
}: Input): StreakResult {
  const done = new Set(completedDates);
  return rule.type === "weekly"
    ? weeklyStreak(rule.count, done, startDate, today)
    : dailyStreak(rule, done, startDate, today);
}

function dailyStreak(
  rule: FrequencyRule,
  done: Set<string>,
  startDate: string,
  today: string,
): StreakResult {
  // Current: walk backwards from today
  let current = 0;
  for (let k = today; k >= startDate; k = addDays(k, -1)) {
    if (!isScheduledOn(rule, k)) continue; // non-scheduled days never break it
    if (done.has(k)) current++;
    else if (k === today)
      continue; // today is still in progress
    else break;
  }

  // Best: walk forwards from the start
  let run = 0;
  let best = 0;
  for (let k = startDate; k <= today; k = addDays(k, 1)) {
    if (!isScheduledOn(rule, k)) continue;
    if (done.has(k)) {
      run++;
      if (run > best) best = run;
    } else if (k !== today) {
      run = 0;
    }
  }

  return { current, best: Math.max(best, current), unit: "day" };
}

function weeklyStreak(
  count: number,
  done: Set<string>,
  startDate: string,
  today: string,
): StreakResult {
  const perWeek = new Map<string, number>();
  done.forEach((k) => {
    const ws = weekStart(k);
    perWeek.set(ws, (perWeek.get(ws) ?? 0) + 1);
  });
  const met = (ws: string) => (perWeek.get(ws) ?? 0) >= count;

  const thisWeek = weekStart(today);
  const firstWeek = weekStart(startDate);

  let current = 0;
  for (let w = thisWeek; w >= firstWeek; w = addDays(w, -7)) {
    if (met(w)) current++;
    else if (w === thisWeek)
      continue; // this week is still in progress
    else break;
  }

  let run = 0;
  let best = 0;
  for (let w = firstWeek; w <= thisWeek; w = addDays(w, 7)) {
    if (met(w)) {
      run++;
      if (run > best) best = run;
    } else if (w !== thisWeek) {
      run = 0;
    }
  }

  return { current, best: Math.max(best, current), unit: "week" };
}
