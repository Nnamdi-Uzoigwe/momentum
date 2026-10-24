import { getDb, uid } from "@/db/client";
import type { Habit, HabitRow, NewHabit } from "@/db/types";
import { toDateKey } from "@/lib/dates";
import { isScheduledOn, type FrequencyRule } from "@/lib/schedule";
import { computeStreak, type StreakResult } from "@/lib/streaks";

function toHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    rule: JSON.parse(row.frequency_rule) as FrequencyRule,
    targetCount: row.target_count,
    reminderTime: row.reminder_time,
    startDate: row.start_date,
    archived: row.archived === 1,
    createdAt: row.created_at,
  };
}

export async function createHabit(input: NewHabit): Promise<Habit> {
  const db = await getDb();
  const id = uid();
  const now = Date.now();
  const rule = input.rule ?? { type: "daily" };

  await db.runAsync(
    `INSERT INTO habits
      (id, name, icon, color, frequency_rule, target_count, reminder_time, start_date, archived, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    id,
    input.name.trim(),
    input.icon ?? "star",
    input.color ?? "orange",
    JSON.stringify(rule),
    input.targetCount ?? 1,
    input.reminderTime ?? null,
    input.startDate ?? toDateKey(),
    now,
  );

  const habit = await getHabit(id);
  if (!habit) throw new Error("Failed to create habit");
  return habit;
}

export async function getHabit(id: string): Promise<Habit | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<HabitRow>(
    "SELECT * FROM habits WHERE id = ?",
    id,
  );
  return row ? toHabit(row) : null;
}

export async function listHabits(
  options: { includeArchived?: boolean } = {},
): Promise<Habit[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<HabitRow>(
    options.includeArchived
      ? "SELECT * FROM habits ORDER BY created_at ASC"
      : "SELECT * FROM habits WHERE archived = 0 ORDER BY created_at ASC",
  );
  return rows.map(toHabit);
}

export async function countActiveHabits(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) AS n FROM habits WHERE archived = 0",
  );
  return row?.n ?? 0;
}

export async function updateHabit(
  id: string,
  patch: Partial<Omit<NewHabit, "startDate">>,
): Promise<void> {
  const habit = await getHabit(id);
  if (!habit) return;
  const db = await getDb();
  await db.runAsync(
    `UPDATE habits SET name = ?, icon = ?, color = ?, frequency_rule = ?,
       target_count = ?, reminder_time = ? WHERE id = ?`,
    (patch.name ?? habit.name).trim(),
    patch.icon ?? habit.icon,
    patch.color ?? habit.color,
    JSON.stringify(patch.rule ?? habit.rule),
    patch.targetCount ?? habit.targetCount,
    patch.reminderTime === undefined ? habit.reminderTime : patch.reminderTime,
    id,
  );
}

// Archive keeps all history; it only removes the habit from Today
export async function setArchived(id: string, archived: boolean) {
  const db = await getDb();
  await db.runAsync(
    "UPDATE habits SET archived = ? WHERE id = ?",
    archived ? 1 : 0,
    id,
  );
}

// Permanent. Completions are removed by ON DELETE CASCADE
export async function deleteHabit(id: string) {
  const db = await getDb();
  await db.runAsync("DELETE FROM habits WHERE id = ?", id);
}

// Returns true if the habit is now completed for that date
export async function toggleCompletion(
  habitId: string,
  dateKey: string = toDateKey(),
): Promise<boolean> {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ id: string }>(
    "SELECT id FROM completions WHERE habit_id = ? AND completed_on = ?",
    habitId,
    dateKey,
  );

  if (existing) {
    await db.runAsync("DELETE FROM completions WHERE id = ?", existing.id);
    return false;
  }

  await db.runAsync(
    "INSERT INTO completions (id, habit_id, completed_on, value, created_at) VALUES (?, ?, ?, 1, ?)",
    uid(),
    habitId,
    dateKey,
    Date.now(),
  );
  return true;
}

export async function getCompletionDates(habitId: string): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ completed_on: string }>(
    "SELECT completed_on FROM completions WHERE habit_id = ? ORDER BY completed_on ASC",
    habitId,
  );
  return rows.map((r) => r.completed_on);
}

export async function getStreak(
  habit: Habit,
  today: string = toDateKey(),
): Promise<StreakResult> {
  const completedDates = await getCompletionDates(habit.id);
  return computeStreak({
    rule: habit.rule,
    completedDates,
    startDate: habit.startDate,
    today,
  });
}

export type TodayItem = {
  habit: Habit;
  done: boolean;
  streak: StreakResult;
};

// Everything the Today screen needs in one call
export async function getTodayItems(
  today: string = toDateKey(),
): Promise<TodayItem[]> {
  const db = await getDb();
  const habits = (await listHabits()).filter((h) =>
    isScheduledOn(h.rule, today),
  );

  const doneRows = await db.getAllAsync<{ habit_id: string }>(
    "SELECT habit_id FROM completions WHERE completed_on = ?",
    today,
  );
  const doneIds = new Set(doneRows.map((r) => r.habit_id));

  return Promise.all(
    habits.map(async (habit) => ({
      habit,
      done: doneIds.has(habit.id),
      streak: await getStreak(habit, today),
    })),
  );
}
