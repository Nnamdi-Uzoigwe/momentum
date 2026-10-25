import { getDb, uid } from "@/db/client";
import { listHabits } from "@/db/habits";
import type { Habit } from "@/db/types";
import { toDateKey } from "@/lib/dates";
import { computeGoalProgress, type GoalProgress } from "@/lib/goalProgress";

export type GoalStatus = "active" | "completed";

export type Goal = {
  id: string;
  title: string;
  targetDate: string | null;
  status: GoalStatus;
  createdAt: number;
  startDate: string; // the day the goal was created
  habitIds: string[];
};

type GoalRow = {
  id: string;
  title: string;
  target_date: string | null;
  progress_type: string;
  status: string;
  created_at: number;
};

export type NewGoal = {
  title: string;
  targetDate?: string | null;
  habitIds?: string[];
};

function toGoal(row: GoalRow, habitIds: string[]): Goal {
  return {
    id: row.id,
    title: row.title,
    targetDate: row.target_date,
    status: row.status === "completed" ? "completed" : "active",
    createdAt: row.created_at,
    startDate: toDateKey(new Date(row.created_at)),
    habitIds,
  };
}

export async function listGoals(): Promise<Goal[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<GoalRow>(
    `SELECT * FROM goals
     ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, created_at DESC`,
  );
  const links = await db.getAllAsync<{ goal_id: string; habit_id: string }>(
    "SELECT goal_id, habit_id FROM goal_habits",
  );

  const byGoal = new Map<string, string[]>();
  links.forEach((link) => {
    const list = byGoal.get(link.goal_id);
    if (list) list.push(link.habit_id);
    else byGoal.set(link.goal_id, [link.habit_id]);
  });

  return rows.map((row) => toGoal(row, byGoal.get(row.id) ?? []));
}

export async function getGoal(id: string): Promise<Goal | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<GoalRow>(
    "SELECT * FROM goals WHERE id = ?",
    id,
  );
  if (!row) return null;
  const links = await db.getAllAsync<{ habit_id: string }>(
    "SELECT habit_id FROM goal_habits WHERE goal_id = ?",
    id,
  );
  return toGoal(
    row,
    links.map((l) => l.habit_id),
  );
}

export async function createGoal(input: NewGoal): Promise<string> {
  const db = await getDb();
  const id = uid();
  const habitIds = Array.from(new Set(input.habitIds ?? []));

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO goals (id, title, target_date, progress_type, status, created_at)
       VALUES (?, ?, ?, 'habits', 'active', ?)`,
      id,
      input.title.trim(),
      input.targetDate ?? null,
      Date.now(),
    );
    for (const habitId of habitIds) {
      await db.runAsync(
        "INSERT INTO goal_habits (goal_id, habit_id) VALUES (?, ?)",
        id,
        habitId,
      );
    }
  });
  return id;
}

export async function updateGoal(
  id: string,
  patch: {
    title: string;
    targetDate: string | null;
    habitIds: string[];
    status: GoalStatus;
  },
): Promise<void> {
  const db = await getDb();
  const habitIds = Array.from(new Set(patch.habitIds));

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      "UPDATE goals SET title = ?, target_date = ?, status = ? WHERE id = ?",
      patch.title.trim(),
      patch.targetDate,
      patch.status,
      id,
    );
    await db.runAsync("DELETE FROM goal_habits WHERE goal_id = ?", id);
    for (const habitId of habitIds) {
      await db.runAsync(
        "INSERT INTO goal_habits (goal_id, habit_id) VALUES (?, ?)",
        id,
        habitId,
      );
    }
  });
}

// Removes the goal and its links only. Habits and their history stay.
export async function deleteGoal(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM goals WHERE id = ?", id);
}

export type GoalSummary = {
  goal: Goal;
  habits: Habit[]; // linked, non-archived habits
  progress: GoalProgress;
};

export async function getGoalSummaries(
  today: string = toDateKey(),
): Promise<GoalSummary[]> {
  const db = await getDb();
  const [goals, habits, rows] = await Promise.all([
    listGoals(),
    listHabits({ includeArchived: true }),
    db.getAllAsync<{ habit_id: string; completed_on: string }>(
      "SELECT habit_id, completed_on FROM completions",
    ),
  ]);

  const habitById = new Map(habits.map((h) => [h.id, h]));
  const datesByHabit = new Map<string, string[]>();
  rows.forEach((r) => {
    const list = datesByHabit.get(r.habit_id);
    if (list) list.push(r.completed_on);
    else datesByHabit.set(r.habit_id, [r.completed_on]);
  });

  return goals.map((goal) => {
    const linked = goal.habitIds
      .map((id) => habitById.get(id))
      .filter((h): h is Habit => Boolean(h) && !h!.archived);

    const progress = computeGoalProgress({
      startDate: goal.startDate,
      targetDate: goal.targetDate,
      today,
      habits: linked.map((h) => ({
        rule: h.rule,
        startDate: h.startDate,
        completedDates: datesByHabit.get(h.id) ?? [],
      })),
    });

    return { goal, habits: linked, progress };
  });
}
