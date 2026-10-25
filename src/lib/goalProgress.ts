import { addDays, diffDays, weekStart } from "@/lib/dates";
import { isScheduledOn, type FrequencyRule } from "@/lib/schedule";

export type GoalHabitInput = {
  rule: FrequencyRule;
  startDate: string;
  completedDates: string[];
};

export type GoalProgress = {
  done: number;
  total: number;
  ratio: number; // 0 to 1
  daysLeft: number | null; // negative once the deadline has passed
  hasTarget: boolean;
};

type Input = {
  startDate: string;
  targetDate: string | null;
  today: string;
  habits: GoalHabitInput[];
};

const maxKey = (a: string, b: string) => (a > b ? a : b);
const minKey = (a: string, b: string) => (a < b ? a : b);

function habitCounts(
  habit: GoalHabitInput,
  periodStart: string,
  periodEnd: string,
  today: string,
  hasTarget: boolean,
) {
  const from = maxKey(periodStart, habit.startDate);
  if (from > periodEnd) return { done: 0, total: 0 };

  const upTo = minKey(periodEnd, today);
  const rule = habit.rule;

  if (rule.type === "weekly") {
    const days = diffDays(from, periodEnd) + 1;
    const total = Math.max(1, Math.round((days / 7) * rule.count));
    const perWeek = new Map<string, number>();
    habit.completedDates.forEach((k) => {
      if (k < from || k > upTo) return;
      const ws = weekStart(k);
      perWeek.set(ws, (perWeek.get(ws) ?? 0) + 1);
    });
    let done = 0;
    perWeek.forEach((n) => {
      done += Math.min(n, rule.count); // extra check-ins in a week do not overcount
    });
    return { done: Math.min(done, total), total };
  }

  const completed = new Set(habit.completedDates);
  let total = 0;
  let done = 0;
  for (let k = from; k <= periodEnd; k = addDays(k, 1)) {
    if (!isScheduledOn(rule, k)) continue;
    const isDone = completed.has(k);
    // Without a deadline, today only counts once it is done
    if (!hasTarget && k === today && !isDone) continue;
    total++;
    if (isDone && k <= today) done++;
  }
  return { done, total };
}

export function computeGoalProgress({
  startDate,
  targetDate,
  today,
  habits,
}: Input): GoalProgress {
  const end = targetDate && targetDate >= startDate ? targetDate : null;
  const periodEnd = end ?? today;

  let done = 0;
  let total = 0;
  for (const habit of habits) {
    const counts = habitCounts(
      habit,
      startDate,
      periodEnd,
      today,
      end !== null,
    );
    done += counts.done;
    total += counts.total;
  }

  return {
    done,
    total,
    ratio: total === 0 ? 0 : Math.min(1, done / total),
    daysLeft: end ? diffDays(today, end) : null,
    hasTarget: end !== null,
  };
}
