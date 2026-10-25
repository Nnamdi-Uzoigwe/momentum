import { getHabitHistories } from "@/db/review";
import { addDays, parseDateKey, toDateKey, weekStart } from "@/lib/dates";
import { isScheduledOn } from "@/lib/schedule";
import { parseTime } from "@/lib/time";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const CHANNEL_ID = "reminders";
const PREFIX = "reminder:";
const WINDOW_DAYS = 7;
const MAX_SCHEDULED = 60;

const MESSAGES = [
  "A small step today keeps your momentum going.",
  "One tap and you are done.",
  "Ready when you are. Tiny wins add up.",
  "Your future self will thank you.",
];

export type ReminderPermission = "granted" | "denied" | "undetermined";

// Call once at startup. The Android channel must exist before the permission prompt.
export async function setupNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Habit reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function getReminderPermission(): Promise<{
  status: ReminderPermission;
}> {
  const p = await Notifications.getPermissionsAsync();
  const status: ReminderPermission = p.granted
    ? "granted"
    : p.canAskAgain
      ? "undetermined"
      : "denied";
  return { status };
}

export async function requestReminderPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

export async function scheduleTestReminder(): Promise<boolean> {
  const allowed = await requestReminderPermission();
  if (!allowed) return false;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Momentum",
      body: "This is how your habit reminders will look.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: CHANNEL_ID,
    },
  });
  return true;
}

type Desired = {
  id: string;
  title: string;
  body: string;
  date: Date;
  habitId: string;
  dateKey: string;
};

function messageFor(habitId: string, dateKey: string) {
  let sum = 0;
  for (const ch of habitId + dateKey) sum += ch.charCodeAt(0);
  return MESSAGES[sum % MESSAGES.length];
}

function fireDateFor(dateKey: string, time: string) {
  const { hour, minute } = parseTime(time);
  const date = parseDateKey(dateKey);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function buildDesired(): Promise<Desired[]> {
  const histories = await getHabitHistories(); // active habits only
  const now = new Date();
  const today = toDateKey(now);
  const out: Desired[] = [];

  for (const { habit, dates } of histories) {
    if (!habit.reminderTime) continue;

    const rule = habit.rule;
    const done = new Set(dates);

    const perWeek = new Map<string, number>();
    if (rule.type === "weekly") {
      dates.forEach((k) => {
        const ws = weekStart(k);
        perWeek.set(ws, (perWeek.get(ws) ?? 0) + 1);
      });
    }

    for (let i = 0; i < WINDOW_DAYS; i++) {
      const key = addDays(today, i);
      if (key < habit.startDate) continue;
      if (!isScheduledOn(rule, key)) continue;
      if (done.has(key)) continue; // already done, no nudge needed
      if (
        rule.type === "weekly" &&
        (perWeek.get(weekStart(key)) ?? 0) >= rule.count
      ) {
        continue; // this week's target is already met
      }

      const date = fireDateFor(key, habit.reminderTime);
      if (date.getTime() <= now.getTime() + 5000) continue; // already passed

      // The time and UTC offset are part of the id, so a changed reminder
      // time or a new timezone automatically produces a fresh notification
      const id = `${PREFIX}${habit.id}:${key}:${habit.reminderTime.replace(":", "")}:${date.getTimezoneOffset()}`;

      out.push({
        id,
        title: habit.name,
        body: messageFor(habit.id, key),
        date,
        habitId: habit.id,
        dateKey: key,
      });
    }
  }

  out.sort((a, b) => a.date.getTime() - b.date.getTime());
  return out.slice(0, MAX_SCHEDULED);
}

async function runSync(askPermission: boolean) {
  const desired = await buildDesired();

  let permission = await Notifications.getPermissionsAsync();
  if (
    !permission.granted &&
    askPermission &&
    permission.canAskAgain &&
    desired.length > 0
  ) {
    permission = await Notifications.requestPermissionsAsync();
  }
  if (!permission.granted) return;

  const desiredById = new Map(desired.map((d) => [d.id, d]));
  const pending = (
    await Notifications.getAllScheduledNotificationsAsync()
  ).filter((n) => n.identifier.startsWith(PREFIX));

  const keep = new Set<string>();
  for (const n of pending) {
    const want = desiredById.get(n.identifier);
    if (want && want.title === n.content.title) keep.add(n.identifier);
    else await Notifications.cancelScheduledNotificationAsync(n.identifier);
  }

  for (const d of desired) {
    if (keep.has(d.id)) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: d.id,
      content: {
        title: d.title,
        body: d.body,
        data: { habitId: d.habitId, dateKey: d.dateKey },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: d.date,
        channelId: CHANNEL_ID,
      },
    });
  }
}

let running = false;
let queued = false;

// Safe to call as often as you like: overlapping calls are merged into one rerun
export async function syncReminders(
  options: { askPermission?: boolean } = {},
): Promise<void> {
  if (running) {
    queued = true;
    return;
  }
  running = true;
  try {
    await runSync(Boolean(options.askPermission));
  } catch (e) {
    console.error("Reminder sync failed", e);
  } finally {
    running = false;
    if (queued) {
      queued = false;
      await syncReminders();
    }
  }
}
