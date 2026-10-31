import * as SQLite from 'expo-sqlite';
import { Session } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('blindspot.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL,
        user_lat REAL, user_lng REAL,
        radius_m REAL,
        location_name TEXT,
        attractor_lat REAL, attractor_lng REAL,
        attractor_distance_m REAL, attractor_bearing REAL,
        void_lat REAL, void_lng REAL,
        void_distance_m REAL, void_bearing REAL
      );
      CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT);
    `);
  }
  return db;
}

export async function getDeviceId(): Promise<string> {
  const database = await getDb();
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM kv WHERE key = ?', 'deviceId'
  );
  if (row) return row.value;
  const id = uuid();
  await database.runAsync('INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)', 'deviceId', id);
  return id;
}

export async function saveSession(session: Omit<Session, 'id'>): Promise<number> {
  const database = await getDb();
  const result = await database.runAsync(
    `INSERT INTO sessions (
      created_at, user_lat, user_lng, radius_m, location_name,
      attractor_lat, attractor_lng, attractor_distance_m, attractor_bearing,
      void_lat, void_lng, void_distance_m, void_bearing
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    session.createdAt,
    session.userLat, session.userLng,
    session.radiusM,
    session.locationName,
    session.attractorLat, session.attractorLng,
    session.attractorDistanceM, session.attractorBearing,
    session.voidLat, session.voidLng,
    session.voidDistanceM, session.voidBearing,
  );
  return result.lastInsertRowId;
}

export async function getAllSessions(): Promise<Session[]> {
  const database = await getDb();
  return database.getAllAsync<Session>('SELECT * FROM sessions ORDER BY id DESC');
}

export async function deleteSession(id: number): Promise<void> {
  const database = await getDb();
  await database.runAsync('DELETE FROM sessions WHERE id = ?', id);
}
