import { getDb } from "@/db/client";
import { listHabits } from "@/db/habits";
import type { HabitHistory } from "@/lib/weeklyReview";

// Every active habit with all of its completion dates, in two queries
export async function getHabitHistories(): Promise<HabitHistory[]> {
  const db = await getDb();
  const [habits, rows] = await Promise.all([
    listHabits(),
    db.getAllAsync<{ habit_id: string; completed_on: string }>(
      "SELECT habit_id, completed_on FROM completions",
    ),
  ]);

  const byHabit = new Map<string, string[]>();
  rows.forEach((r) => {
    const list = byHabit.get(r.habit_id);
    if (list) list.push(r.completed_on);
    else byHabit.set(r.habit_id, [r.completed_on]);
  });

  return habits.map((habit) => ({ habit, dates: byHabit.get(habit.id) ?? [] }));
}
