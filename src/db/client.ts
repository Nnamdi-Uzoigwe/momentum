import * as SQLite from "expo-sqlite";

const SCHEMA_VERSION = 1;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb() {
  if (!dbPromise) dbPromise = open();
  return dbPromise;
}

async function open() {
  const db = await SQLite.openDatabaseAsync("momentum.db");
  await db.execAsync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  await migrate(db);
  return db;
}

async function migrate(db: SQLite.SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const current = row?.user_version ?? 0;

  if (current < 1) {
    await db.execAsync(`
      CREATE TABLE habits (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        icon TEXT NOT NULL DEFAULT 'star',
        color TEXT NOT NULL DEFAULT 'orange',
        frequency_rule TEXT NOT NULL,
        target_count INTEGER NOT NULL DEFAULT 1,
        reminder_time TEXT,
        start_date TEXT NOT NULL,
        archived INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE completions (
        id TEXT PRIMARY KEY NOT NULL,
        habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        completed_on TEXT NOT NULL,
        value INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        UNIQUE (habit_id, completed_on)
      );
      CREATE INDEX idx_completions_date ON completions(completed_on);

      CREATE TABLE goals (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        target_date TEXT,
        progress_type TEXT NOT NULL DEFAULT 'habits',
        status TEXT NOT NULL DEFAULT 'active',
        created_at INTEGER NOT NULL
      );

      CREATE TABLE goal_habits (
        goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
        habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        PRIMARY KEY (goal_id, habit_id)
      );

      CREATE TABLE badges (
        id TEXT PRIMARY KEY NOT NULL,
        badge_key TEXT NOT NULL UNIQUE,
        unlocked_at INTEGER NOT NULL
      );
    `);
  }

  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}

export function uid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}
