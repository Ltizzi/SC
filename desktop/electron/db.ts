import Database from "better-sqlite3";
import path from "path";
import { randomUUID } from "crypto";
import { HistoryItem } from "../types/types";

const dbPath = path.join(process.cwd(), "history.db");
const db = new Database(dbPath);

db.exec(`
    CREATE TABLE IF NOT EXISTS history (
     id TEXT PRIMARY KEY, 
     value TEXT NOT NULL,
     timestamp INTEGER NOT NULL)`);

export function addHistory(value: string): void {
  const stmt = db.prepare(
    "INSERT INTO history (id, value, timestamp) VALUES (?, ?, ?"
  );
  stmt.run(randomUUID(), value, Date.now());
}

export function getHistory(): HistoryItem[] {
  const stmt = db.prepare("SELECT * FROM history ORDER BY timestamp DESC");
  return stmt.all() as HistoryItem[];
}

export function deleteHistory(id?: string): void {
  const stmt = db.prepare("DELETE FROM history WHERE id = ?");
  stmt.run(id);
}

export function getHistoryById(id?: string): HistoryItem | null {
  const stmt = db.prepare("SELECT * FROM history WHERE id = ?");
  const result = stmt.get(id);
  return result ? (result as HistoryItem) : null;
}

export function updateHistory(id: string, value: string): void {
  const stmt = db.prepare(
    "UPDATE history SET value = ?, timestamp = ? WHERE id = ?"
  );
  stmt.run(value, Date.now(), id);
}
