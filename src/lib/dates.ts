// All day logic uses the user's LOCAL date as a 'YYYY-MM-DD' key

export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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
