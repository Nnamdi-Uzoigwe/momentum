import {
  deleteHabit,
  getTodayItems,
  setArchived,
  toggleCompletion,
  type TodayItem,
} from "@/db/habits";
import { useCelebration } from "@/lib/celebrationHost";
import { evaluateCheckIn } from "@/lib/celebrations";
import { toDateKey } from "@/lib/dates";
import { syncReminders } from "@/lib/reminders";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useTodayHabits() {
  const [items, setItems] = useState<TodayItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { showToast, showCelebration } = useCelebration();

  const reload = useCallback(async (): Promise<TodayItem[]> => {
    const next = await getTodayItems(toDateKey());
    setItems(next);
    setLoaded(true);
    return next;
  }, []);

  // Reload every time the Today tab (or screen on top of it) gains focus
  useFocusEffect(
    useCallback(() => {
      reload().catch((e) => console.error("Failed to load habits", e));
    }, [reload]),
  );

  const toggle = useCallback(
    async (habitId: string) => {
      const today = toDateKey();

      // Optimistic flip so the check animation starts instantly
      setItems((prev) =>
        prev.map((i) => (i.habit.id === habitId ? { ...i, done: !i.done } : i)),
      );

      let nowDone = false;
      try {
        nowDone = await toggleCompletion(habitId, today);
        syncReminders(); // done today cancels today's nudge; undoing restores it
      } catch (e) {
        console.error("Failed to toggle habit", e);
      }

      // Reload to refresh streak numbers (and roll back on failure)
      let next: TodayItem[] | null = null;
      try {
        next = await reload();
      } catch (e) {
        console.error(e);
      }
      if (!nowDone || !next) return;

      try {
        const outcome = await evaluateCheckIn(next, habitId, today);
        if (!outcome) return;
        // Wait a beat so the check animation and burst can play first
        if (outcome.type === "celebration") {
          setTimeout(() => showCelebration(outcome.data), 550);
        } else {
          setTimeout(() => showToast(outcome.toast), 350);
        }
      } catch (e) {
        console.error("Celebration check failed", e);
      }
    },
    [reload, showCelebration, showToast],
  );

  // Hides the habit from Today but keeps all of its history
  const archive = useCallback(
    async (habitId: string) => {
      try {
        await setArchived(habitId, true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        syncReminders();
        await reload();
        showToast({
          message: "Habit archived. Restore it from Profile.",
          icon: "archive",
        });
      } catch (e) {
        console.error("Failed to archive habit", e);
      }
    },
    [reload, showToast],
  );

  // Permanent: removes the habit and its history
  const remove = useCallback(
    async (habitId: string) => {
      try {
        await deleteHabit(habitId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        syncReminders();
        await reload();
      } catch (e) {
        console.error("Failed to delete habit", e);
      }
    },
    [reload],
  );

  return { items, loaded, toggle, archive, remove };
}
