import { unlockBadge } from "@/db/badges";
import { getDb, uid } from "@/db/client";
import { createGoal } from "@/db/goals";
import { createHabit } from "@/db/habits";
import { addDays, diffDays, toDateKey } from "@/lib/dates";
import { isScheduledOn, type FrequencyRule } from "@/lib/schedule";

type Sample = {
  name: string;
  icon: string;
  color: string;
  rule: FrequencyRule;
  reminderTime: string | null;
  rate: number; // chance of completing a scheduled day outside the streak
  streakDays: number; // how many recent days are done in a row
};

const SAMPLES: Sample[] = [
  {
    name: "Read 10 pages",
    icon: "book-open",
    color: "teal",
    rule: { type: "daily" },
    reminderTime: "21:00",
    rate: 0.9,
    streakDays: 21,
  },
  {
    name: "Drink 2 litres of water",
    icon: "droplet",
    color: "green",
    rule: { type: "daily" },
    reminderTime: "09:00",
    rate: 0.8,
    streakDays: 9,
  },
  {
    name: "Morning prayer",
    icon: "sun",
    color: "amber",
    rule: { type: "daily" },
    reminderTime: "06:30",
    rate: 0.95,
    streakDays: 34,
  },
  {
    name: "Gym session",
    icon: "activity",
    color: "coral",
    rule: { type: "weekdays", days: [1, 3, 5] },
    reminderTime: "17:30",
    rate: 0.85,
    streakDays: 14,
  },
  {
    name: "Practice guitar",
    icon: "music",
    color: "rose",
    rule: { type: "weekly", count: 3 },
    reminderTime: null,
    rate: 0.6,
    streakDays: 0,
  },
];

// Small deterministic random generator so the sample data is always the same
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export async function loadSampleData(): Promise<void> {
  const db = await getDb();
  const today = toDateKey();
  const start = addDays(today, -75);

  const habitIds: string[] = [];
  const rows: { habitId: string; day: string }[] = [];

  for (let i = 0; i < SAMPLES.length; i++) {
    const sample = SAMPLES[i];
    const habit = await createHabit({
      name: sample.name,
      icon: sample.icon,
      color: sample.color,
      rule: sample.rule,
      reminderTime: sample.reminderTime,
      startDate: start,
    });
    habitIds.push(habit.id);

    const rand = seededRandom(i + 11);
    // Up to yesterday, so today is left open for you to check off
    for (let k = start; k < today; k = addDays(k, 1)) {
      const daysAgo = diffDays(k, today);
      let done: boolean;

      if (sample.rule.type === "weekly") {
        done = rand() < 0.5;
      } else if (!isScheduledOn(sample.rule, k)) {
        done = false;
      } else if (sample.streakDays > 0 && daysAgo <= sample.streakDays) {
        done = true;
      } else if (sample.streakDays > 0 && daysAgo === sample.streakDays + 1) {
        done = false; // a missed day just before the current streak
      } else {
        done = rand() < sample.rate;
      }

      if (done) rows.push({ habitId: habit.id, day: k });
    }
  }

  await db.withTransactionAsync(async () => {
    for (const row of rows) {
      await db.runAsync(
        `INSERT OR IGNORE INTO completions (id, habit_id, completed_on, value, created_at)
         VALUES (?, ?, ?, 1, ?)`,
        uid(),
        row.habitId,
        row.day,
        Date.now(),
      );
    }
  });

  const goalId = await createGoal({
    title: "Get healthier in 90 days",
    targetDate: addDays(today, 60),
    habitIds: [habitIds[0], habitIds[1], habitIds[3]],
  });
  // Backdate the goal so its progress reflects the sample history
  await db.runAsync(
    "UPDATE goals SET created_at = ? WHERE id = ?",
    Date.now() - 30 * 86400000,
    goalId,
  );

  await unlockBadge("first_habit");
  await unlockBadge("streak_7");
  await unlockBadge("streak_30");
}

export async function clearAllData(): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM completions");
    await db.runAsync("DELETE FROM streak_freezes");
    await db.runAsync("DELETE FROM goal_habits");
    await db.runAsync("DELETE FROM goals");
    await db.runAsync("DELETE FROM badges");
    await db.runAsync("DELETE FROM habits");
    await db.runAsync(
      "DELETE FROM settings WHERE key LIKE 'milestone:%' OR key = 'perfect_day'",
    );
  });
}
