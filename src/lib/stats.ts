import { addDays, weekStart } from "@/lib/dates";
import { isScheduledOn, type FrequencyRule } from "@/lib/schedule";

export type CellState =
  | "done"
  | "missed"
  | "off"
  | "today"
  | "before"
  | "future";

export type HeatmapCell = {
  key: string;
  state: CellState;
  isToday: boolean;
  canToggle: boolean;
};

type BaseInput = {
  rule: FrequencyRule;
  completedDates: string[];
  startDate: string;
  today: string;
};

// Columns are weeks (Monday first), each with 7 cells from Monday to Sunday
export function buildHeatmap({
  rule,
  completedDates,
  startDate,
  today,
  weeks = 13,
}: BaseInput & { weeks?: number }): HeatmapCell[][] {
  const done = new Set(completedDates);
  const first = addDays(weekStart(today), -(weeks - 1) * 7);
  const columns: HeatmapCell[][] = [];

  for (let w = 0; w < weeks; w++) {
    const monday = addDays(first, w * 7);
    const column: HeatmapCell[] = [];

    for (let i = 0; i < 7; i++) {
      const key = addDays(monday, i);
      const isToday = key === today;
      const scheduled = isScheduledOn(rule, key);
      const inRange = key >= startDate && key <= today;

      let state: CellState;
      if (key > today) state = "future";
      else if (done.has(key)) state = "done";
      else if (key < startDate) state = "before";
      else if (isToday && scheduled) state = "today";
      else if (rule.type === "weekly") state = "off";
      else if (scheduled) state = "missed";
      else state = "off";

      column.push({
        key,
        state,
        isToday,
        canToggle: inRange && (scheduled || done.has(key)),
      });
    }
    columns.push(column);
  }
  return columns;
}

export type Rate = { value: number | null; label: string };

export function completionRate({
  rule,
  completedDates,
  startDate,
  today,
}: BaseInput): Rate {
  const done = new Set(completedDates);

  if (rule.type === "weekly") {
    const thisWeek = weekStart(today);
    const windowStart = addDays(thisWeek, -7 * 7);
    const startWeek = weekStart(startDate);
    const firstWeek = startWeek > windowStart ? startWeek : windowStart;

    const perWeek = new Map<string, number>();
    done.forEach((k) => {
      const ws = weekStart(k);
      perWeek.set(ws, (perWeek.get(ws) ?? 0) + 1);
    });

    let met = 0;
    let total = 0;
    for (let w = firstWeek; w <= thisWeek; w = addDays(w, 7)) {
      const hit = (perWeek.get(w) ?? 0) >= rule.count;
      if (hit) {
        met++;
        total++;
      } else if (w !== thisWeek) {
        total++; // the current week is still in progress
      }
    }
    return { value: total === 0 ? null : met / total, label: "Last 8 weeks" };
  }

  let from = addDays(today, -29);
  if (from < startDate) from = startDate;

  let scheduled = 0;
  let hit = 0;
  for (let k = from; k <= today; k = addDays(k, 1)) {
    if (!isScheduledOn(rule, k)) continue;
    if (done.has(k)) {
      scheduled++;
      hit++;
    } else if (k !== today) {
      scheduled++; // today only counts once it is done
    }
  }
  return {
    value: scheduled === 0 ? null : hit / scheduled,
    label: "Last 30 days",
  };
}
