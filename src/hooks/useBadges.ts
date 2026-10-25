import { listUnlockedBadges } from "@/db/badges";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useBadges() {
  const [unlocked, setUnlocked] = useState<Record<string, number>>({});

  const reload = useCallback(async () => {
    setUnlocked(await listUnlockedBadges());
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload().catch((e) => console.error("Failed to load badges", e));
    }, [reload]),
  );

  return { unlocked, reload };
}
