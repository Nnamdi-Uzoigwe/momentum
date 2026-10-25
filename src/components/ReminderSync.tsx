import { syncReminders } from "@/lib/reminders";
import { usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

// Renders nothing. Keeps scheduled reminders in step with your habits.
export function ReminderSync() {
  const pathname = usePathname();
  const first = useRef(true);

  // Launch and coming back to the app: top up the window, never prompt
  useEffect(() => {
    syncReminders();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") syncReminders();
    });
    return () => sub.remove();
  }, []);

  // Any navigation: a habit may have just changed. This is also the moment
  // the one-time permission prompt is allowed to appear.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = setTimeout(() => syncReminders({ askPermission: true }), 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
