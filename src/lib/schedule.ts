import { dayOfWeek } from "@/lib/dates";

export type FrequencyRule =
  | { type: "daily" }
  | { type: "weekdays"; days: number[] } // 0 = Sun ... 6 = Sat
  | { type: "weekly"; count: number }; // e.g. 3 times per week

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function isScheduledOn(rule: FrequencyRule, key: string): boolean {
  switch (rule.type) {
    case "daily":
      return true;
    case "weekdays":
      return rule.days.includes(dayOfWeek(key));
    case "weekly":
      return true; // any day can count toward the weekly target
  }
}

export function describeRule(rule: FrequencyRule): string {
  switch (rule.type) {
    case "daily":
      return "Every day";
    case "weekdays":
      return [...rule.days]
        .sort((a, b) => a - b)
        .map((d) => DAY_NAMES[d])
        .join(", ");
    case "weekly":
      return `${rule.count}x per week`;
  }
}
