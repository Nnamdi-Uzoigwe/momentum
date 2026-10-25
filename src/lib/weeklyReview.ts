import type { Habit } from "@/db/types";
import { addDays, diffDays, parseDateKey } from "@/lib/dates";
import { isScheduledOn } from "@/lib/schedule";

export type HabitHistory = { habit: Habit; dates: string[] };

export type HabitWeek = {
  habit: Habit;
  done: number;
  total: number;
  rate: number; // 0 to 1
};

export type DayStat = {
  key: string;
  done: number;
  scheduled: number;
  ratio: number | null; // null when nothing was scheduled
  isFuture: boolean;
  isToday: boolean;
};

export type WeekReview = {
  weekStart: string;
  weekEnd: string;
  done: number;
  total: number;
  ratio: number;
  habits: HabitWeek[]; // best rate first
  days: DayStat[]; // Monday to Sunday
  strongest: HabitWeek | null;
  needsCare: HabitWeek | null;
  bestDay: DayStat | null;
};

const minKey = (a: string, b: string) => (a < b ? a : b);
const maxKey = (a: string, b: string) => (a > b ? a : b);

export function reviewWeek(
  histories: HabitHistory[],
  ws: string,
  today: string,
): WeekReview {
  const we = addDays(ws, 6);
  const upTo = minKey(we, today);

  const days: DayStat[] = Array.from({ length: 7 }, (_, i) => {
    const key = addDays(ws, i);
    return {
      key,
      done: 0,
      scheduled: 0,
      ratio: null,
      isFuture: key > today,
      isToday: key === today,
    };
  });

  const habits: HabitWeek[] = [];

  for (const { habit, dates } of histories) {
    const from = maxKey(ws, habit.startDate);
    if (from > upTo) continue; // habit did not exist yet this week

    const doneSet = new Set(dates);
    const rule = habit.rule;
    let done = 0;
    let total = 0;

    if (rule.type === "weekly") {
      const activeDays = diffDays(from, we) + 1;
      total = Math.max(
        1,
        Math.min(rule.count, Math.round((rule.count * activeDays) / 7)),
      );
      let hits = 0;
      for (let k = from; k <= upTo; k = addDays(k, 1)) {
        if (!doneSet.has(k)) continue;
        hits++;
        const day = days[diffDays(ws, k)];
        day.done++;
        day.scheduled++;
      }
      done = Math.min(hits, total); // extra check-ins do not overcount
    } else {
      for (let k = from; k <= upTo; k = addDays(k, 1)) {
        if (!isScheduledOn(rule, k)) continue;
        const isDone = doneSet.has(k);
        const day = days[diffDays(ws, k)];
        day.scheduled++;
        if (isDone) day.done++;
        // Today only counts toward the week once it is done
        if (k === today && !isDone) continue;
        total++;
        if (isDone) done++;
      }
    }

    habits.push({ habit, done, total, rate: total === 0 ? 0 : done / total });
  }

  days.forEach((day) => {
    day.ratio =
      day.scheduled === 0 ? null : Math.min(1, day.done / day.scheduled);
  });

  const ranked = habits
    .filter((h) => h.total > 0)
    .sort((a, b) => b.rate - a.rate || b.done - a.done);

  const strongest = ranked.find((h) => h.done > 0) ?? null;
  const needsCare =
    ranked
      .filter((h) => h.rate < 1 && h.habit.id !== strongest?.habit.id)
      .sort((a, b) => a.rate - b.rate || b.total - a.total)[0] ?? null;

  const bestDay =
    days
      .filter((d) => !d.isFuture && d.scheduled > 0 && (d.ratio ?? 0) > 0)
      .sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0) || b.done - a.done)[0] ??
    null;

  const done = ranked.reduce((sum, h) => sum + h.done, 0);
  const total = ranked.reduce((sum, h) => sum + h.total, 0);

  return {
    weekStart: ws,
    weekEnd: we,
    done,
    total,
    ratio: total === 0 ? 0 : Math.min(1, done / total),
    habits: ranked,
    days,
    strongest,
    needsCare,
    bestDay,
  };
}

// Change versus the previous week, in percentage points
export function weekDelta(
  review: WeekReview,
  previous: WeekReview,
): number | null {
  if (review.total === 0 || previous.total === 0) return null;
  return Math.round((review.ratio - previous.ratio) * 100);
}

export function headline(review: WeekReview): string {
  if (review.total === 0) return "Nothing to review yet";
  if (review.ratio >= 1) return "Perfect week";
  if (review.ratio >= 0.8) return "Strong week";
  if (review.ratio >= 0.5) return "Solid progress";
  if (review.ratio > 0) return "A gentle start";
  return "Fresh start";
}

export function weekdayName(key: string): string {
  return parseDateKey(key).toLocaleDateString("en-US", { weekday: "long" });
}

export function buildSuggestion(
  review: WeekReview,
  previous: WeekReview,
): string {
  if (review.total === 0) {
    return "Add a habit and check in a few times. Your first review will be waiting.";
  }
  if (review.ratio >= 0.9) {
    return "A near perfect week. Keep the same rhythm and protect it.";
  }
  const care = review.needsCare;
  if (care && care.rate < 0.5) {
    return `${care.habit.name} had the toughest week. Try pairing it with something you already do every day, or shrink it to a two minute version.`;
  }
  const delta = weekDelta(review, previous);
  if (delta !== null && delta > 0) {
    return `You are up ${delta} points on last week. Keep that momentum going.`;
  }
  if (review.bestDay) {
    return `${weekdayName(review.bestDay.key)} was your strongest day. Try bringing that same energy to the rest of the week.`;
  }
  return "Small steps count. Pick one habit to protect next week.";
}
