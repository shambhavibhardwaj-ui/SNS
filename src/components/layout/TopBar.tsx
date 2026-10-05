import { AccountButton } from '../auth/AccountButton';
import { SearchBox } from './SearchBox';

/**
 * Landing-page chrome.
 *
 * Search is real now. It takes the two callbacks rather than routing itself,
 * because a district is local state in `FoodCityExperience` — the search has to
 * enter one the same way the map does, or the camera would be rebuilt.
 */
export function TopBar({
  compact = false,
  onOpenRestaurant,
  onEnterDistrict,
}: {
  compact?: boolean;
  onOpenRestaurant: (restaurantId: string) => void;
  onEnterDistrict: (districtId: string) => void;
}) {
  return (
    <header className="fc-topbar" data-compact={compact || undefined}>
      <a className="fc-brand" href="#top">
        <svg className="fc-brand-mark" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="19" fill="#C4543F" />
          <path d="M8 26 L14 16 L20 23 L26 12 L32 26 Z" fill="#F6DCA9" />
          <rect x="8" y="26" width="24" height="4" rx="2" fill="#E8A33D" />
          <circle cx="26" cy="11" r="3" fill="#E8A33D" />
        </svg>
        <span className="fc-brand-text">
          <span className="fc-brand-name">SNS</span>
          <span className="fc-brand-sub">RestaurantOnboarding</span>
        </span>
      </a>

      <SearchBox onOpenRestaurant={onOpenRestaurant} onEnterDistrict={onEnterDistrict} />

      <AccountButton />
    </header>
  );
}
