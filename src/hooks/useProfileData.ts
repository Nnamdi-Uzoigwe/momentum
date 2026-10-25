import { listHabits } from "@/db/habits";
import { getProfileStats, type ProfileStats } from "@/db/stats";
import type { Habit } from "@/db/types";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useProfileData() {
  const [archived, setArchived] = useState<Habit[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);

  const reload = useCallback(async () => {
    const [all, nextStats] = await Promise.all([
      listHabits({ includeArchived: true }),
      getProfileStats(),
    ]);
    setArchived(all.filter((h) => h.archived));
    setStats(nextStats);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload().catch((e) => console.error("Failed to load profile", e));
    }, [reload]),
  );

  return { archived, stats, reload };
}
