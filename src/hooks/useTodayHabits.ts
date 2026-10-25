import { getTodayItems, toggleCompletion, type TodayItem } from "@/db/habits";
import { toDateKey } from "@/lib/dates";
import { syncReminders } from "@/lib/reminders";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useTodayHabits() {
  const [items, setItems] = useState<TodayItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    const next = await getTodayItems(toDateKey());
    setItems(next);
    setLoaded(true);
  }, []);

  // Reload every time the Today tab (or screen on top of it) gains focus
  useFocusEffect(
    useCallback(() => {
      reload().catch((e) => console.error("Failed to load habits", e));
    }, [reload]),
  );

  const toggle = useCallback(
    async (habitId: string) => {
      // Optimistic flip so the check animation starts instantly
      setItems((prev) =>
        prev.map((i) => (i.habit.id === habitId ? { ...i, done: !i.done } : i)),
      );
      try {
        await toggleCompletion(habitId, toDateKey());
        // Done today cancels today's nudge; undoing brings it back
        syncReminders();
      } catch (e) {
        console.error("Failed to toggle habit", e);
      }
      // Reload to refresh streak numbers (and roll back on failure)
      await reload().catch((e) => console.error(e));
    },
    [reload],
  );

  return { items, loaded, toggle };
}
