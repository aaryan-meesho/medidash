import SelectDropdown from './SelectDropdown.jsx';

const CHIPS = [
  { key: 'multispeciality', label: 'Multispeciality', icon: '\u{1F3E5}' },
  { key: 'cashlessConfirmed', label: 'Cashless' },
];

const SORT_OPTIONS = [
  { value: 'nearest', label: 'Nearest first' },
  { value: 'recentlyVerified', label: 'Recently verified' },
];

export default function FilterBar({ activeFilters, onToggleFilter, onResetFilters, sortBy, onSortChange }) {
  const hasActiveFilters = Object.values(activeFilters).some(Boolean);

  return (
    <div className="filter-bar">
      <button
        className={`filter-chip filter-chip--all${hasActiveFilters ? '' : ' filter-chip--active'}`}
        onClick={onResetFilters}
      >
        <span aria-hidden="true">&#9776;</span> All Filters
      </button>
      {CHIPS.map((chip) => (
        <button
          key={chip.key}
          className={`filter-chip${activeFilters[chip.key] ? ' filter-chip--active' : ''}`}
          onClick={() => onToggleFilter(chip.key)}
        >
          {chip.icon && <span aria-hidden="true">{chip.icon}</span>} {chip.label}
        </button>
      ))}
      <div className="sort-control">
        Sort by:
        <SelectDropdown value={sortBy} onChange={onSortChange} options={SORT_OPTIONS} />
      </div>
    </div>
  );
}
