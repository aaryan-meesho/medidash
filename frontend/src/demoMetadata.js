// Our real data (from the insurer's hospital sheet) only has name/address/lat/lng/insurer.
// The fields below (tags, verification date, open-now, cashless badge) are NOT sourced
// from any real provider feed - they're deterministic placeholders so the UI can be
// previewed end-to-end. They must stay visibly labeled as demo data (see the
// "Important Note" banner in App.jsx) until a real data source replaces them.

export const TAG_POOL = ['Multispeciality', '24x7', 'Pharmacy', 'Lab', 'Emergency', 'ICU', 'Women & Child', 'NICU'];

export const INSURER_HELPLINE = { label: '1800 2666', tel: '18002666' };

const AVERAGE_URBAN_SPEED_KMH = 25;

function seededRandom(seed) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}

export function withDemoMetadata(hospital) {
  const seed = hashString(String(hospital.id));
  const random = seededRandom(seed);

  const tagCount = 2 + Math.floor(random() * 3);
  const shuffledTags = [...TAG_POOL].sort(() => random() - 0.5);
  const tags = shuffledTags.slice(0, tagCount);

  const daysAgo = Math.floor(random() * 60);
  const lastVerified = new Date();
  lastVerified.setDate(lastVerified.getDate() - daysAgo);

  const driveMinutes = Math.max(1, Math.round((hospital.distance / AVERAGE_URBAN_SPEED_KMH) * 60));

  return {
    ...hospital,
    tags,
    cashlessAvailable: true,
    openNow: random() > 0.3,
    lastVerified,
    driveMinutes,
  };
}

export function formatVerifiedDate(date) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
