import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchInsurers, fetchHospitals } from './api.js';
import { reverseGeocode, searchPlace } from './geocode.js';
import { withDemoMetadata } from './demoMetadata.js';
import { ALL_INSURERS_OPTION, BANGALORE_FALLBACK, BANGALORE_LABEL, ONBOARDING_STORAGE_KEY } from './constants.js';
import Header from './components/Header.jsx';
import SearchControls from './components/SearchControls.jsx';
import FilterBar from './components/FilterBar.jsx';
import HospitalMap from './components/HospitalMap.jsx';
import HospitalList from './components/HospitalList.jsx';
import Modal from './components/Modal.jsx';
import SpotlightTour from './components/SpotlightTour.jsx';

const INITIAL_FILTERS = {
  openNow: false,
  within2km: false,
  multispeciality: false,
  twentyFourSeven: false,
  emergency: false,
  cashlessConfirmed: false,
};

function describeGeolocationError(geoError) {
  switch (geoError.code) {
    case geoError.PERMISSION_DENIED:
      return 'Location permission was denied';
    case geoError.POSITION_UNAVAILABLE:
      return "Your browser couldn't determine your position";
    case geoError.TIMEOUT:
      return 'Location request timed out';
    default:
      return 'Location request failed';
  }
}

function getCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ ...BANGALORE_FALLBACK, isFallback: true, reason: 'Geolocation is not supported by this browser' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude, isFallback: false }),
      (geoError) => resolve({ ...BANGALORE_FALLBACK, isFallback: true, reason: describeGeolocationError(geoError) }),
      { timeout: 10000, maximumAge: 60000 }
    );
  });
}

function applyFilters(list, filters) {
  return list.filter((h) => {
    if (filters.openNow && !h.openNow) return false;
    if (filters.within2km && h.distance > 2) return false;
    if (filters.multispeciality && !h.tags.includes('Multispeciality')) return false;
    if (filters.twentyFourSeven && !h.tags.includes('24x7')) return false;
    if (filters.emergency && !h.tags.includes('Emergency')) return false;
    if (filters.cashlessConfirmed && !h.cashlessAvailable) return false;
    return true;
  });
}

function sortHospitals(list, sortBy) {
  const copy = [...list];
  if (sortBy === 'recentlyVerified') {
    copy.sort((a, b) => b.lastVerified - a.lastVerified);
  } else {
    copy.sort((a, b) => a.distance - b.distance);
  }
  return copy;
}

export default function App() {
  const [insurers, setInsurers] = useState([]);
  const [selectedInsurer, setSelectedInsurer] = useState(ALL_INSURERS_OPTION);
  const [userLocation, setUserLocation] = useState(BANGALORE_FALLBACK);
  const [locationLabel, setLocationLabel] = useState(BANGALORE_LABEL);
  const [locationQuery, setLocationQuery] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isMapFiltered, setIsMapFiltered] = useState(false);
  const [activeFilters, setActiveFilters] = useState(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState('nearest');
  const [searchAsIMoveMap, setSearchAsIMoveMap] = useState(true);
  const [recenterSignal, setRecenterSignal] = useState(0);
  const [detailsHospital, setDetailsHospital] = useState(null);
  const [locationNotice, setLocationNotice] = useState(null);
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [hoveredHospitalId, setHoveredHospitalId] = useState(null);
  const [resultsVersion, setResultsVersion] = useState(0);
  const highlightedHospitalId = hoveredHospitalId ?? selectedHospitalId;
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem(ONBOARDING_STORAGE_KEY)
  );
  const insurerFieldRef = useRef(null);
  const locationFieldRef = useRef(null);
  const searchButtonRef = useRef(null);
  const mapWrapperRef = useRef(null);
  const firstCardRef = useRef(null);

  function handleFinishOnboarding() {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setShowOnboarding(false);
  }

  const tourSteps = [
    {
      ref: insurerFieldRef,
      title: 'Pick your insurer',
      description: 'Select your insurance provider, or leave it as All Insurers.',
    },
    {
      ref: locationFieldRef,
      title: 'Confirm your location',
      description: "We've filled in a starting location — edit it, or use your current location instead.",
    },
    {
      ref: searchButtonRef,
      title: 'Search',
      description: "Tap Search to find cashless hospitals nearby — we'll do that for you now.",
      onAdvance: async () => {
        if (!hasSearched) await handleSearch();
      },
    },
    {
      ref: mapWrapperRef,
      title: 'Explore the map',
      description: 'Pan or zoom the map — the list updates to match what you see.',
    },
    {
      ref: firstCardRef,
      title: 'Get directions',
      description: 'Tap Directions on any hospital to navigate there in Google Maps.',
    },
  ];

  useEffect(() => {
    fetchInsurers()
      .then(setInsurers)
      .catch(() => setInsurers([]));
  }, []);

  const enrichedHospitals = useMemo(() => hospitals.map(withDemoMetadata), [hospitals]);
  const displayedHospitals = useMemo(() => {
    const filtered = applyFilters(enrichedHospitals, activeFilters);
    return sortHospitals(filtered, sortBy);
  }, [enrichedHospitals, activeFilters, sortBy]);

  function insurerParam() {
    return selectedInsurer === ALL_INSURERS_OPTION ? undefined : selectedInsurer;
  }

  async function handleSearch() {
    setLoading(true);
    setError(null);
    try {
      let location = userLocation;

      if (locationQuery.trim() === '') {
        const result = await getCurrentLocation();
        location = { lat: result.lat, lng: result.lng };
        setUserLocation(location);
        setLocationNotice(result.isFallback ? result.reason : null);
        const label = result.isFallback
          ? BANGALORE_LABEL
          : await reverseGeocode(location).catch(() => 'Current location');
        setLocationLabel(label);
        setLocationQuery(label);
      } else if (locationQuery !== locationLabel) {
        const place = await searchPlace(locationQuery);
        location = { lat: place.lat, lng: place.lng };
        setUserLocation(location);
        setLocationLabel(place.label);
        setLocationNotice(null);
      }

      const results = await fetchHospitals({ lat: location.lat, lng: location.lng, insurer: insurerParam() });
      setHospitals(results);
      setIsMapFiltered(false);
      setHasSearched(true);
      setSelectedHospitalId(null);
      setResultsVersion((v) => v + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUseMyLocation() {
    setError(null);
    try {
      const result = await getCurrentLocation();
      const location = { lat: result.lat, lng: result.lng };
      setUserLocation(location);
      setLocationNotice(result.isFallback ? result.reason : null);
      const label = result.isFallback
        ? BANGALORE_LABEL
        : await reverseGeocode(location).catch(() => 'Current location');
      setLocationLabel(label);
      setLocationQuery(label);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleMapViewportChange(bounds) {
    setMapLoading(true);
    try {
      const results = await fetchHospitals({ lat: userLocation.lat, lng: userLocation.lng, insurer: insurerParam(), bounds });
      setHospitals(results);
      setIsMapFiltered(true);
      setError(null);
      setSelectedHospitalId(null);
      setResultsVersion((v) => v + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setMapLoading(false);
    }
  }

  function handleToggleFilter(key) {
    setActiveFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="app">
      <Header onShowHowItWorks={() => setShowOnboarding(true)} />

      <SearchControls
        insurers={insurers}
        selectedInsurer={selectedInsurer}
        onInsurerChange={setSelectedInsurer}
        locationLabel={locationLabel}
        locationQuery={locationQuery}
        onLocationQueryChange={setLocationQuery}
        onUseMyLocation={handleUseMyLocation}
        onSearch={handleSearch}
        loading={loading}
        insurerFieldRef={insurerFieldRef}
        locationFieldRef={locationFieldRef}
        searchButtonRef={searchButtonRef}
      />

      {locationNotice && (
        <p className="notice-banner">
          &#9888; {locationNotice} — showing hospitals near {BANGALORE_LABEL} instead.{' '}
          <button className="link-button" onClick={handleUseMyLocation}>
            Retry
          </button>
        </p>
      )}

      {error && <p className="error-banner">{error}</p>}

      {hasSearched && (
        <>
          <FilterBar
            activeFilters={activeFilters}
            onToggleFilter={handleToggleFilter}
            onResetFilters={() => setActiveFilters(INITIAL_FILTERS)}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <div className="results">
            <div className="results__map-col">
              <HospitalMap
                userLocation={userLocation}
                hospitals={displayedHospitals}
                onViewportChange={handleMapViewportChange}
                searchAsIMoveMap={searchAsIMoveMap}
                onToggleSearchAsIMoveMap={setSearchAsIMoveMap}
                recenterSignal={recenterSignal}
                onRecenter={() => setRecenterSignal((s) => s + 1)}
                onSelectHospital={setSelectedHospitalId}
                wrapperRef={mapWrapperRef}
                highlightedHospitalId={highlightedHospitalId}
              />
              {mapLoading && <p className="map-status">Updating hospitals in view...</p>}
            </div>
            <div className="results__list-col">
              <div className="results__caption">
                <span>
                  {isMapFiltered
                    ? `Showing ${displayedHospitals.length} hospital${displayedHospitals.length === 1 ? '' : 's'} visible on the map`
                    : `Showing ${displayedHospitals.length} nearest hospital${displayedHospitals.length === 1 ? '' : 's'}`}
                </span>
              </div>
              <HospitalList
                key={resultsVersion}
                hospitals={displayedHospitals}
                userLocation={userLocation}
                onViewDetails={setDetailsHospital}
                selectedHospitalId={selectedHospitalId}
                firstCardRef={firstCardRef}
                onHoverHospital={setHoveredHospitalId}
              />
            </div>
          </div>

          <div className="important-note">
            <strong>&#128737; Important Note</strong>
            <p>
              Network status may change. Please confirm cashless availability with the hospital or insurer before
              admission. Hospital tags, verification dates, and cashless status shown here are illustrative demo
              data for this preview and have not been verified with real providers.
            </p>
          </div>
        </>
      )}

      {showOnboarding && <SpotlightTour steps={tourSteps} onFinish={handleFinishOnboarding} />}

      {detailsHospital && (
        <Modal title={detailsHospital.name} onClose={() => setDetailsHospital(null)}>
          <p>{detailsHospital.address}</p>
          <p>
            <strong>Insurer:</strong> {detailsHospital.insurer}
          </p>
          <p>
            <strong>Distance:</strong> {detailsHospital.distance} km
          </p>
          <p className="modal__note">Full hospital profiles (specialities, reviews, photos) are coming soon.</p>
        </Modal>
      )}
    </div>
  );
}
