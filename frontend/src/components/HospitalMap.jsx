import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { HOSPITAL_BUILDING_SVG } from '../hospitalMarkerIcon.js';

const INITIAL_ZOOM = 13;
const DETAILED_ICON_ZOOM_THRESHOLD = 16;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const userIcon = new L.DivIcon({
  className: 'user-marker',
  html: '<div class="user-marker__dot"></div>',
  iconSize: [16, 16],
});

// Plain numbered circle - the default. Clear at a glance, doesn't clutter the
// map when many hospitals are visible at once.
function circleIcon(rank, isHighlighted) {
  return new L.DivIcon({
    className: `hospital-marker hospital-marker--circle${isHighlighted ? ' hospital-marker--highlighted' : ''}`,
    html: `<div class="hospital-marker__circle">${rank}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

// Illustrated building icon - only shown once zoomed in close enough that a
// handful of pins are on screen and the extra detail reads as useful rather
// than as clutter.
function buildingIcon(rank, isHighlighted) {
  return new L.DivIcon({
    className: `hospital-marker${isHighlighted ? ' hospital-marker--highlighted' : ''}`,
    html: `
      <div class="hospital-marker__wrap">
        ${HOSPITAL_BUILDING_SVG}
        <span class="hospital-marker__badge">${rank}</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

function numberedIcon(rank, isHighlighted, zoom) {
  return zoom >= DETAILED_ICON_ZOOM_THRESHOLD
    ? buildingIcon(rank, isHighlighted)
    : circleIcon(rank, isHighlighted);
}

const VIEWPORT_DEBOUNCE_MS = 400;

// RecenterOnChange re-centers the map when the search location changes (new
// search / geolocation result / Re-center button), without fighting the
// user's own pan/zoom. It sets `suppressRef` before calling setView so the
// resulting `moveend` isn't mistaken for a user-driven map interaction.
function RecenterOnChange({ lat, lng, recenterSignal, suppressRef }) {
  const map = useMap();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    suppressRef.current = true;
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, recenterSignal, map, suppressRef]);

  return null;
}

// Reports the map's visible bounds whenever the user pans or zooms, so the
// hospital list can be filtered down to only what's currently on screen.
function MapViewportWatcher({ enabled, onViewportChange, suppressRef }) {
  const debounceRef = useRef(null);

  useMapEvents({
    moveend(event) {
      if (suppressRef.current) {
        suppressRef.current = false;
        return;
      }
      if (!enabled) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const bounds = event.target.getBounds();
        onViewportChange({
          minLat: bounds.getSouth(),
          maxLat: bounds.getNorth(),
          minLng: bounds.getWest(),
          maxLng: bounds.getEast(),
        });
      }, VIEWPORT_DEBOUNCE_MS);
    },
  });

  return null;
}

// Tracks zoom level so markers can switch between the plain numbered circle
// and the more detailed building illustration.
function ZoomWatcher({ onZoomChange }) {
  useMapEvents({
    zoomend(event) {
      onZoomChange(event.target.getZoom());
    },
  });

  return null;
}

export default function HospitalMap({
  userLocation,
  hospitals,
  onViewportChange,
  searchAsIMoveMap,
  onToggleSearchAsIMoveMap,
  recenterSignal,
  onRecenter,
  onSelectHospital,
  wrapperRef,
  highlightedHospitalId,
}) {
  const suppressNextViewportEvent = useRef(false);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const center = useMemo(
    () => [userLocation.lat, userLocation.lng],
    [userLocation.lat, userLocation.lng]
  );

  return (
    <div ref={wrapperRef} className="hospital-map-wrapper">
      <MapContainer center={center} zoom={INITIAL_ZOOM} className="hospital-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterOnChange
          lat={userLocation.lat}
          lng={userLocation.lng}
          recenterSignal={recenterSignal}
          suppressRef={suppressNextViewportEvent}
        />
        <MapViewportWatcher
          enabled={searchAsIMoveMap}
          onViewportChange={onViewportChange}
          suppressRef={suppressNextViewportEvent}
        />
        <ZoomWatcher onZoomChange={setZoom} />
        <Marker position={center} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
        {hospitals.map((hospital, index) => (
          <Marker
            key={hospital.id}
            position={[hospital.lat, hospital.lng]}
            icon={numberedIcon(index + 1, hospital.id === highlightedHospitalId, zoom)}
            eventHandlers={{ click: () => onSelectHospital?.(hospital.id) }}
          />
        ))}
      </MapContainer>

      <label className="map-overlay map-overlay--top-left map-toggle">
        <input
          type="checkbox"
          checked={searchAsIMoveMap}
          onChange={(e) => onToggleSearchAsIMoveMap(e.target.checked)}
        />
        Search as I move the map
      </label>

      <button className="map-overlay map-overlay--bottom-left map-recenter" onClick={onRecenter}>
        <span aria-hidden="true">&#8859;</span> Re-center
      </button>

      <div className="map-overlay map-overlay--bottom-right map-legend">
        <span className="map-legend__dot" /> Hospitals
      </div>
    </div>
  );
}
