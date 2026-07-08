import { getNearestHospitals, getInsurers } from './hospitals.service.js';

function toFiniteNumber(value) {
  if (value === undefined || value === null || value === '') return NaN;
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
}

function parseBounds(query) {
  const minLat = toFiniteNumber(query.minLat);
  const maxLat = toFiniteNumber(query.maxLat);
  const minLng = toFiniteNumber(query.minLng);
  const maxLng = toFiniteNumber(query.maxLng);

  const allProvided = [minLat, maxLat, minLng, maxLng].every(Number.isFinite);
  if (!allProvided) return null;
  return { minLat, maxLat, minLng, maxLng };
}

export function handleGetHospitals(req, res) {
  try {
    const lat = toFiniteNumber(req.query.lat);
    const lng = toFiniteNumber(req.query.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: 'lat and lng query parameters are required and must be valid numbers' });
    }

    const bounds = parseBounds(req.query);
    const insurer = typeof req.query.insurer === 'string' ? req.query.insurer : undefined;

    const hospitals = getNearestHospitals({ lat, lng, insurer, bounds });
    return res.status(200).json(hospitals);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch hospitals' });
  }
}

export function handleGetInsurers(req, res) {
  try {
    const insurers = getInsurers();
    return res.status(200).json(insurers);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch insurers' });
  }
}
