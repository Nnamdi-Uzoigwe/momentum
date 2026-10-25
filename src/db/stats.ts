import { getDb } from "@/db/client";

export type ProfileStats = {
  checkIns: number;
  activeDays: number;
  badges: number;
  habits: number;
};

export async function getProfileStats(): Promise<ProfileStats> {
  const db = await getDb();
  const [checkIns, days, badges, habits] = await Promise.all([
    db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM completions"),
    db.getFirstAsync<{ n: number }>(
      "SELECT COUNT(DISTINCT completed_on) AS n FROM completions",
    ),
    db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM badges"),
    db.getFirstAsync<{ n: number }>(
      "SELECT COUNT(*) AS n FROM habits WHERE archived = 0",
    ),
  ]);

  return {
    checkIns: checkIns?.n ?? 0,
    activeDays: days?.n ?? 0,
    badges: badges?.n ?? 0,
    habits: habits?.n ?? 0,
  };
}
