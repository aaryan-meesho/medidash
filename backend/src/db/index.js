import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_PATH = join(__dirname, 'seed-hospitals.json');

const DB_PATH = process.env.DB_PATH || '../db/medidash.db';

function ensureDir(path) {
  const dir = dirname(path);
  if (dir && dir !== '.' && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

ensureDir(DB_PATH);

export const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS hospitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    insurer TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const { count } = db.prepare('SELECT COUNT(*) AS count FROM hospitals').get();

if (count === 0 && existsSync(SEED_PATH)) {
  const seedHospitals = JSON.parse(readFileSync(SEED_PATH, 'utf-8'));

  const insert = db.prepare(
    'INSERT INTO hospitals (name, address, lat, lng, insurer) VALUES (?, ?, ?, ?, ?)'
  );
  for (const h of seedHospitals) {
    insert.run(h.name, h.address, h.lat, h.lng, h.insurer);
  }
}
