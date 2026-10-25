import type { TodayItem } from "@/db/habits";
import type { Habit } from "@/db/types";
import { addDays, parseDateKey } from "@/lib/dates";
import { isScheduledOn } from "@/lib/schedule";

export type DotState = "done" | "missed" | "off" | "pending" | "frozen";

export type WeekDot = {
  key: string;
  label: string;
  state: DotState;
  isToday: boolean;
};

export type TodayRow = TodayItem & { week: WeekDot[] };

const LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

// The last seven days ending today, oldest first
export function lastSevenDays(
  habit: Habit,
  dates: string[],
  today: string,
  frozen: Set<string> = new Set(),
): WeekDot[] {
  const done = new Set(dates);
  const out: WeekDot[] = [];

  for (let i = 6; i >= 0; i--) {
    const key = addDays(today, -i);
    const isToday = key === today;

    let state: DotState;
    if (done.has(key)) state = "done";
    else if (frozen.has(key)) state = "frozen";
    else if (key < habit.startDate) state = "off";
    else if (isToday) state = "pending";
    else if (habit.rule.type === "weekly") state = "off";
    else if (isScheduledOn(habit.rule, key)) state = "missed";
    else state = "off";

    out.push({
      key,
      label: LETTERS[parseDateKey(key).getDay()],
      state,
      isToday,
    });
  }
  return out;
}
