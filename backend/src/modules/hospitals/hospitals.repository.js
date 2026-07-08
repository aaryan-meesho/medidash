import { db } from '../../db/index.js';

export function findHospitals({ insurer, bounds }) {
  const clauses = [];
  const params = [];

  if (insurer) {
    clauses.push('insurer = ?');
    params.push(insurer);
  }

  if (bounds) {
    clauses.push('lat BETWEEN ? AND ?', 'lng BETWEEN ? AND ?');
    params.push(bounds.minLat, bounds.maxLat, bounds.minLng, bounds.maxLng);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db.prepare(`SELECT * FROM hospitals ${where}`).all(...params);
  return rows;
}

export function findDistinctInsurers() {
  const rows = db
    .prepare('SELECT DISTINCT insurer FROM hospitals ORDER BY insurer ASC')
    .all();
  return rows.map((row) => row.insurer);
}
