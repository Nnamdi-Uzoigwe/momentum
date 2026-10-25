import { deleteSetting, getSetting, setSetting } from "@/db/settings";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useUserName() {
  const [name, setName] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const value = await getSetting("user_name");
    setName(value && value.trim() ? value.trim() : null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload().catch((e) => console.error("Failed to load name", e));
    }, [reload]),
  );

  const save = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (trimmed) await setSetting("user_name", trimmed);
    else await deleteSetting("user_name");
    setName(trimmed || null);
  }, []);

  return { name, save };
}
