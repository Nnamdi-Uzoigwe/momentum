import { getGoalSummaries, type GoalSummary } from "@/db/goals";
import { toDateKey } from "@/lib/dates";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useGoals() {
  const [summaries, setSummaries] = useState<GoalSummary[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Reload every time the screen gains focus so progress stays fresh
  useFocusEffect(
    useCallback(() => {
      getGoalSummaries(toDateKey())
        .then((next) => {
          setSummaries(next);
          setLoaded(true);
        })
        .catch((e) => console.error("Failed to load goals", e));
    }, []),
  );

  return { summaries, loaded };
}
