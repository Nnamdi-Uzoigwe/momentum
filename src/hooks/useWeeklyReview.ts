import { getHabitHistories } from "@/db/review";
import { addDays, toDateKey, weekStart } from "@/lib/dates";
import { reviewWeek, type HabitHistory } from "@/lib/weeklyReview";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

export function useWeeklyReview() {
  const [histories, setHistories] = useState<HabitHistory[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [offset, setOffset] = useState(0); // 0 = this week, -1 = last week

  useFocusEffect(
    useCallback(() => {
      getHabitHistories()
        .then((next) => {
          setHistories(next);
          setLoaded(true);
        })
        .catch((e) => console.error("Failed to load review", e));
    }, []),
  );

  const today = toDateKey();
  const ws = addDays(weekStart(today), offset * 7);

  const review = useMemo(
    () => reviewWeek(histories, ws, today),
    [histories, ws, today],
  );
  const previous = useMemo(
    () => reviewWeek(histories, addDays(ws, -7), today),
    [histories, ws, today],
  );

  const earliest = useMemo(() => {
    let min: string | null = null;
    for (const { habit } of histories) {
      const w = weekStart(habit.startDate);
      if (min === null || w < min) min = w;
    }
    return min;
  }, [histories]);

  return {
    loaded,
    hasHabits: histories.length > 0,
    offset,
    review,
    previous,
    canGoBack: earliest !== null && ws > earliest,
    canGoForward: offset < 0,
    goBack: () => setOffset((o) => o - 1),
    goForward: () => setOffset((o) => Math.min(0, o + 1)),
  };
}
