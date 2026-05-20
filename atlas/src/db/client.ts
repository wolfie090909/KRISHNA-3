import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from "node:fs";
import path from "node:path";

import * as schema from "./schema";

declare global {
  var __atlasSqliteDb: Database.Database | undefined;
}

function getSqlitePath(): string {
  return process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "ledger.sqlite");
}

function openSqlite(): Database.Database {
  const sqlitePath = getSqlitePath();
  if (sqlitePath !== ":memory:") {
    fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
  }
  const sqlite = new Database(sqlitePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return sqlite;
}

export function resetDbSingletonForTests(): void {
  if (globalThis.__atlasSqliteDb) {
    globalThis.__atlasSqliteDb.close();
    globalThis.__atlasSqliteDb = undefined;
  }
}

export function getDb() {
  if (!globalThis.__atlasSqliteDb) {
    globalThis.__atlasSqliteDb = openSqlite();
    const db = drizzle(globalThis.__atlasSqliteDb, { schema });
    migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
    return db;
  }
  return drizzle(globalThis.__atlasSqliteDb, { schema });
}
