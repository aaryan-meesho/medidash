export async function fetchInsurers() {
  const res = await fetch('/api/insurers');
  if (!res.ok) throw new Error('Failed to load insurers');
  return res.json();
}

export async function fetchHospitals({ lat, lng, insurer, bounds }) {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  if (insurer) params.set('insurer', insurer);
  if (bounds) {
    params.set('minLat', String(bounds.minLat));
    params.set('maxLat', String(bounds.maxLat));
    params.set('minLng', String(bounds.minLng));
    params.set('maxLng', String(bounds.maxLng));
  }

  const res = await fetch(`/api/hospitals?${params.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Failed to load hospitals' }));
    throw new Error(body.error || 'Failed to load hospitals');
  }
  return res.json();
}
