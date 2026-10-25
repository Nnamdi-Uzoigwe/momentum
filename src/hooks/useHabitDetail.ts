import { applyFreeze, getFreezesLeft, getHabitFrozen } from "@/db/freezes";
import { getCompletionDates, getHabit, toggleCompletion } from "@/db/habits";
import type { Habit } from "@/db/types";
import { toDateKey } from "@/lib/dates";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useHabitDetail(id: string | undefined) {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [frozen, setFrozen] = useState<string[]>([]);
  const [freezesLeft, setFreezesLeft] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    if (!id) return;
    const found = await getHabit(id);

    let completed: string[] = [];
    let frozenDates: string[] = [];
    let left = 0;
    if (found) {
      [completed, frozenDates, left] = await Promise.all([
        getCompletionDates(id),
        getHabitFrozen(id),
        getFreezesLeft(toDateKey()),
      ]);
    }

    setHabit(found);
    setDates(completed);
    setFrozen(frozenDates);
    setFreezesLeft(left);
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

  const freezeDay = useCallback(
    async (dateKey: string): Promise<boolean> => {
      if (!id) return false;
      try {
        const ok = await applyFreeze(id, dateKey, toDateKey());
        await reload();
        return ok;
      } catch (e) {
        console.error("Failed to freeze day", e);
        return false;
      }
    },
    [id, reload],
  );

  return { habit, dates, frozen, freezesLeft, loaded, toggleDay, freezeDay };
}
