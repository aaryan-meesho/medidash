import { findHospitals, findDistinctInsurers } from './hospitals.repository.js';
import { UNBOUNDED_RESULT_LIMIT, BOUNDED_RESULT_LIMIT, ALL_INSURERS, EARTH_RADIUS_KM } from './hospitals.constants.js';

function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function normalizeInsurer(insurer) {
  if (!insurer || insurer.toLowerCase() === ALL_INSURERS) return null;
  return insurer;
}

export function getNearestHospitals({ lat, lng, insurer, bounds }) {
  const normalizedInsurer = normalizeInsurer(insurer);
  const rows = findHospitals({ insurer: normalizedInsurer, bounds });

  const withDistance = rows.map((hospital) => ({
    ...hospital,
    distance: Number(haversineDistanceKm(lat, lng, hospital.lat, hospital.lng).toFixed(2)),
  }));

  withDistance.sort((a, b) => a.distance - b.distance);

  const limit = bounds ? BOUNDED_RESULT_LIMIT : UNBOUNDED_RESULT_LIMIT;
  return withDistance.slice(0, limit);
}

export function getInsurers() {
  return findDistinctInsurers();
}
