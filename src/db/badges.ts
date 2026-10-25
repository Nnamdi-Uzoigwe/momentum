import { getDb, uid } from "@/db/client";
import type { BadgeKey } from "@/lib/badges";

// badge_key to unlock timestamp
export async function listUnlockedBadges(): Promise<Record<string, number>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ badge_key: string; unlocked_at: number }>(
    "SELECT badge_key, unlocked_at FROM badges",
  );
  const out: Record<string, number> = {};
  rows.forEach((r) => {
    out[r.badge_key] = r.unlocked_at;
  });
  return out;
}

// Returns true only the first time the badge is unlocked
export async function unlockBadge(key: BadgeKey): Promise<boolean> {
  const db = await getDb();
  const result = await db.runAsync(
    "INSERT OR IGNORE INTO badges (id, badge_key, unlocked_at) VALUES (?, ?, ?)",
    uid(),
    key,
    Date.now(),
  );
  return result.changes > 0;
}
