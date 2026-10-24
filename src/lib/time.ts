// Times are stored as 'HH:mm' (24 hour)

export function parseTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return { hour, minute };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function shiftTime(value: string, minutes: number): string {
  const { hour, minute } = parseTime(value);
  const total = (((hour * 60 + minute + minutes) % 1440) + 1440) % 1440;
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export function formatTime(value: string): string {
  const { hour, minute } = parseTime(value);
  const suffix = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${pad(minute)} ${suffix}`;
}
