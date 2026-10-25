import { getDb, uid } from "@/db/client";
import { MONTHLY_FREEZES } from "@/lib/freezes";

export async function getFrozenByHabit(): Promise<Map<string, string[]>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ habit_id: string; frozen_on: string }>(
    "SELECT habit_id, frozen_on FROM streak_freezes",
  );
  const map = new Map<string, string[]>();
  rows.forEach((r) => {
    const list = map.get(r.habit_id);
    if (list) list.push(r.frozen_on);
    else map.set(r.habit_id, [r.frozen_on]);
  });
  return map;
}

export async function getHabitFrozen(habitId: string): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ frozen_on: string }>(
    "SELECT frozen_on FROM streak_freezes WHERE habit_id = ? ORDER BY frozen_on",
    habitId,
  );
  return rows.map((r) => r.frozen_on);
}

// Freezes reset each calendar month, counted by the month they were used in
export async function getFreezesLeft(today: string): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) AS n FROM streak_freezes WHERE substr(used_on, 1, 7) = ?",
    today.slice(0, 7),
  );
  return Math.max(0, MONTHLY_FREEZES - (row?.n ?? 0));
}

// Returns true when a freeze was recorded
export async function applyFreeze(
  habitId: string,
  frozenOn: string,
  today: string,
): Promise<boolean> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT OR IGNORE INTO streak_freezes (id, habit_id, frozen_on, used_on, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    uid(),
    habitId,
    frozenOn,
    today,
    Date.now(),
  );
  return result.changes > 0;
}
