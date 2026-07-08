import { useRef } from 'react';
import { ALL_INSURERS_OPTION } from '../constants.js';
import SelectDropdown from './SelectDropdown.jsx';

export default function SearchControls({
  insurers,
  selectedInsurer,
  onInsurerChange,
  locationLabel,
  locationQuery,
  onLocationQueryChange,
  onUseMyLocation,
  onSearch,
  loading,
  insurerFieldRef,
  locationFieldRef,
  searchButtonRef,
}) {
  const locationInputRef = useRef(null);

  return (
    <div className="search-controls">
      <div className="location-status">
        <span aria-hidden="true">&#128205;</span> Showing hospitals near{' '}
        <strong>{locationLabel}</strong>
        <button
          className="link-button location-status__change"
          onClick={() => locationInputRef.current?.focus()}
        >
          Change
        </button>
      </div>

      <div className="search-controls__row">
        <div ref={insurerFieldRef} className="search-field">
          <span className="search-field__icon" aria-hidden="true">
            &#128737;
          </span>
          <span className="search-field__text">
            <span className="search-field__label">Insurer</span>
            <SelectDropdown
              value={selectedInsurer}
              onChange={onInsurerChange}
              options={[
                { value: ALL_INSURERS_OPTION, label: 'All Insurers' },
                ...insurers.map((insurer) => ({ value: insurer, label: insurer })),
              ]}
            />
          </span>
        </div>

        <label ref={locationFieldRef} className="search-field search-field--location">
          <span className="search-field__icon" aria-hidden="true">
            &#128205;
          </span>
          <span className="search-field__text">
            <span className="search-field__label">Location</span>
            <input
              ref={locationInputRef}
              type="text"
              value={locationQuery}
              placeholder="Enter an area or landmark"
              onChange={(e) => onLocationQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSearch();
              }}
            />
          </span>
          <button type="button" className="use-location-pill" onClick={onUseMyLocation}>
            <span aria-hidden="true">&#8853;</span> Use my current location
          </button>
        </label>

        <button ref={searchButtonRef} className="search-button" onClick={onSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </div>
  );
}
