import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { FilterBar } from '../components/listing/FilterBar';
import { RestaurantCard } from '../components/listing/RestaurantCard';
import {
  getCuisinesInDistrict,
  getDistrictById,
  listRestaurants,
  type ListingFilters,
  type SortKey,
} from '../services/restaurantService';

interface RestaurantListingProps {
  districtId: string;
  onBackToCity: () => void;
  onOpenRestaurant: (restaurantId: string) => void;
}

/**
 * Cuisine listing page.
 *
 * This is where the visual language changes: the city is gone, and from here on
 * the product behaves like a normal delivery app — search, filter, scan, pick.
 */
export function RestaurantListing({
  districtId,
  onBackToCity,
  onOpenRestaurant,
}: RestaurantListingProps) {
  const district = getDistrictById(districtId);
  const cuisines = useMemo(() => getCuisinesInDistrict(districtId), [districtId]);

  const [filters, setFilters] = useState<ListingFilters>({});
  const [sort, setSort] = useState<SortKey>('recommended');

  const results = useMemo(
    () => listRestaurants(districtId, filters, sort),
    [districtId, filters, sort],
  );

  if (!district) return null;

  return (
    <div className="rl" style={{ '--district-accent': district.theme.roof } as React.CSSProperties}>
      <header className="rl-hero">
        <button type="button" className="rl-back" onClick={onBackToCity}>
          <ArrowLeft size={16} strokeWidth={2.2} />
          Back to Food City
        </button>

        <div className="rl-hero-body">
          <p className="rl-eyebrow">
            <span aria-hidden="true">{district.emoji}</span> {district.name}
          </p>
          <h1 className="rl-title">{district.foodLabel}</h1>
          <p className="rl-sub">{district.description}</p>
        </div>
      </header>

      <div className="rl-body">
        <FilterBar
          cuisines={cuisines}
          filters={filters}
          sort={sort}
          resultCount={results.length}
          onFilters={setFilters}
          onSort={setSort}
        />

        {results.length ? (
          <>
            <h2 className="rl-section">
              {sort === 'recommended' ? 'Popular restaurants' : 'Restaurants'}
            </h2>
            <div className="rl-grid">
              {results.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onOpen={onOpenRestaurant}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="rl-empty">
            <p className="rl-empty-title">Nothing matches that yet</p>
            <p className="rl-empty-sub">
              Try clearing a filter, or search for a dish instead of a restaurant.
            </p>
            <button type="button" className="rl-empty-action" onClick={() => setFilters({})}>
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
