import type { FrequencyRule } from "@/lib/schedule";

export type Habit = {
  id: string;
  name: string;
  icon: string; // Feather icon name
  color: string; // color key, resolved by the theme later
  rule: FrequencyRule;
  targetCount: number;
  reminderTime: string | null; // 'HH:mm'
  startDate: string; // 'YYYY-MM-DD'
  archived: boolean;
  createdAt: number;
};

export type NewHabit = {
  name: string;
  icon?: string;
  color?: string;
  rule?: FrequencyRule;
  targetCount?: number;
  reminderTime?: string | null;
  startDate?: string;
};

export type HabitRow = {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency_rule: string;
  target_count: number;
  reminder_time: string | null;
  start_date: string;
  archived: number;
  created_at: number;
};
