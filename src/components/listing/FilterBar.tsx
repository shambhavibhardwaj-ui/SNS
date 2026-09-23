import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { Cuisine } from '../../data/types';
import type { ListingFilters, SortKey } from '../../services/restaurantService';

interface FilterBarProps {
  cuisines: Cuisine[];
  filters: ListingFilters;
  sort: SortKey;
  resultCount: number;
  onFilters: (next: ListingFilters) => void;
  onSort: (next: SortKey) => void;
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'rating', label: 'Rating' },
  { key: 'delivery', label: 'Delivery time' },
  { key: 'price', label: 'Price' },
];

/** Search, filter chips and sort for a cuisine listing page. */
export function FilterBar({
  cuisines,
  filters,
  sort,
  resultCount,
  onFilters,
  onSort,
}: FilterBarProps) {
  const set = (patch: Partial<ListingFilters>) => onFilters({ ...filters, ...patch });
  const togglePrice = (band: string) => {
    const current = filters.priceRanges ?? [];
    set({
      priceRanges: current.includes(band)
        ? current.filter((b) => b !== band)
        : [...current, band],
    });
  };

  const active =
    Boolean(filters.minRating) ||
    Boolean(filters.maxEta) ||
    Boolean(filters.priceRanges?.length) ||
    Boolean(filters.cuisineId) ||
    Boolean(filters.vegOnly);

  return (
    <div className="fb">
      <div className="fb-search">
        <Search size={17} strokeWidth={2} aria-hidden="true" />
        <input
          type="search"
          value={filters.query ?? ''}
          placeholder="Search restaurants or dishes"
          aria-label="Search restaurants or dishes in this district"
          onChange={(e) => set({ query: e.target.value })}
        />
        {filters.query ? (
          <button type="button" className="fb-clear" onClick={() => set({ query: '' })} aria-label="Clear search">
            <X size={15} strokeWidth={2.2} />
          </button>
        ) : null}
      </div>

      <div className="fb-row">
        <span className="fb-icon" aria-hidden="true">
          <SlidersHorizontal size={15} strokeWidth={2} />
        </span>

        <button
          type="button"
          className="fb-chip"
          aria-pressed={filters.minRating === 4.5}
          onClick={() => set({ minRating: filters.minRating === 4.5 ? undefined : 4.5 })}
        >
          Rating 4.5+
        </button>

        <button
          type="button"
          className="fb-chip"
          aria-pressed={filters.maxEta === 30}
          onClick={() => set({ maxEta: filters.maxEta === 30 ? undefined : 30 })}
        >
          Under 30 min
        </button>

        {(['₹', '₹₹', '₹₹₹'] as const).map((band) => (
          <button
            key={band}
            type="button"
            className="fb-chip"
            aria-pressed={filters.priceRanges?.includes(band) ?? false}
            onClick={() => togglePrice(band)}
          >
            {band}
          </button>
        ))}

        <button
          type="button"
          className="fb-chip is-veg"
          aria-pressed={Boolean(filters.vegOnly)}
          onClick={() => set({ vegOnly: filters.vegOnly ? undefined : true })}
        >
          Pure veg
        </button>

        <label className="fb-select">
          <span className="fc-sr-only">Filter by cuisine</span>
          <select
            value={filters.cuisineId ?? ''}
            onChange={(e) => set({ cuisineId: e.target.value || undefined })}
          >
            <option value="">All cuisines</option>
            {cuisines.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="fb-select fb-sort">
          <span className="fc-sr-only">Sort restaurants</span>
          <select value={sort} onChange={(e) => onSort(e.target.value as SortKey)}>
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                Sort: {s.label}
              </option>
            ))}
          </select>
        </label>

        {active ? (
          <button
            type="button"
            className="fb-reset"
            onClick={() => onFilters({ query: filters.query })}
          >
            Clear filters
          </button>
        ) : null}
      </div>

      <p className="fb-count" role="status">
        {resultCount} {resultCount === 1 ? 'restaurant' : 'restaurants'}
      </p>
    </div>
  );
}
