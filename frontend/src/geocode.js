const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

export async function reverseGeocode({ lat, lng }) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(lat),
    lon: String(lng),
    zoom: '14',
  });
  const res = await fetch(`${NOMINATIM_BASE}/reverse?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to resolve location name');
  const data = await res.json();
  const address = data.address || {};
  const area = address.suburb || address.neighbourhood || address.city_district || address.town || address.village;
  const city = address.city || address.county || address.state_district;
  return [area, city].filter(Boolean).join(', ') || data.display_name || 'Current location';
}

export async function searchPlace(query) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    q: query,
    limit: '1',
  });
  const res = await fetch(`${NOMINATIM_BASE}/search?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to search location');
  const results = await res.json();
  if (results.length === 0) throw new Error(`No location found for "${query}"`);
  const [result] = results;
  return { lat: Number(result.lat), lng: Number(result.lon), label: query };
}
