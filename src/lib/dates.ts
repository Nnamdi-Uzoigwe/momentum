// All day logic uses the user's LOCAL date as a 'YYYY-MM-DD' key.
//
// Grace period: until GRACE_HOURS in the morning, "today" is still the previous
// day, so a late night check-in after midnight counts for the day it belongs to.
// toDateKey() with no argument gives that grace-aware "today". Passing a Date
// gives the exact calendar date of that moment.

export const GRACE_HOURS = 3;

export function isInGrace(now: Date = new Date()): boolean {
  return now.getHours() < GRACE_HOURS;
}

export function toDateKey(date?: Date): string {
  const d = date ?? new Date(Date.now() - GRACE_HOURS * 3600 * 1000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, amount: number): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

// 0 = Sunday ... 6 = Saturday
export function dayOfWeek(key: string): number {
  return parseDateKey(key).getDay();
}

// Monday of the week containing the key
export function weekStart(key: string): string {
  const offset = (dayOfWeek(key) + 6) % 7;
  return addDays(key, -offset);
}

export function diffDays(from: string, to: string): number {
  const ms = parseDateKey(to).getTime() - parseDateKey(from).getTime();
  return Math.round(ms / 86400000);
}
