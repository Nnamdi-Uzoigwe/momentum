import { getCompletionDates, getHabit, toggleCompletion } from "@/db/habits";
import type { Habit } from "@/db/types";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useHabitDetail(id: string | undefined) {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    if (!id) return;
    const found = await getHabit(id);
    const completed = found ? await getCompletionDates(id) : [];
    setHabit(found);
    setDates(completed);
    setLoaded(true);
  }, [id]);

  // Reload whenever the screen regains focus (for example after editing)
  useFocusEffect(
    useCallback(() => {
      reload().catch((e) => console.error("Failed to load habit", e));
    }, [reload]),
  );

  const toggleDay = useCallback(
    async (dateKey: string) => {
      if (!id) return;
      // Optimistic flip so the cell responds instantly
      setDates((prev) =>
        prev.includes(dateKey)
          ? prev.filter((k) => k !== dateKey)
          : [...prev, dateKey].sort(),
      );
      try {
        await toggleCompletion(id, dateKey);
      } catch (e) {
        console.error("Failed to toggle day", e);
      }
      await reload().catch((e) => console.error(e));
    },
    [id, reload],
  );

  return { habit, dates, loaded, toggleDay };
}
