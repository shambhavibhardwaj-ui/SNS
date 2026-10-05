import { Home, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AccountButton } from '../auth/AccountButton';
import { SearchBox } from './SearchBox';
import { useCart } from '../../cart/useCart';

/**
 * Landing-page chrome: brand, navigation, search, account.
 *
 * Home and Cart live here rather than in the city's sidebar. They are the two
 * things that are true everywhere — the cart follows you out of the city and
 * into the listing and the menu — while the sidebar is about *this* map, and
 * keeps the collapse toggle and the district rail.
 *
 * **Home here means the city, not the camera.** The map has its own reset
 * control sitting on it, which is where a camera reset belongs; from the top
 * bar the useful move is leaving a listing and getting the map back. It is
 * marked `aria-current` while the city is already what is on screen.
 *
 * Search is real — see `services/searchService`. It takes the two callbacks
 * rather than routing itself, because a district is local state in
 * `FoodCityExperience` and has to be entered the way the map enters it.
 */
export function TopBar({
  compact = false,
  onHome,
  onOpenRestaurant,
  onEnterDistrict,
}: {
  compact?: boolean;
  /** Back to the city. */
  onHome: () => void;
  onOpenRestaurant: (restaurantId: string) => void;
  onEnterDistrict: (districtId: string) => void;
}) {
  const navigate = useNavigate();
  const { totals } = useCart();
  const cartCount = totals.itemCount;

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

      <nav className="fc-topnav" aria-label="Main">
        <button
          type="button"
          className="fc-topnav-item"
          onClick={onHome}
          aria-current={compact ? undefined : 'page'}
        >
          <Home size={17} strokeWidth={2} aria-hidden="true" />
          <span>Home</span>
        </button>

        {/* Relative: works under "/" for a visitor and "/customer" signed in. */}
        <button type="button" className="fc-topnav-item" onClick={() => navigate('cart')}>
          <span className="fc-topnav-icon">
            <ShoppingBag size={17} strokeWidth={2} aria-hidden="true" />
            {cartCount ? <span className="fc-topnav-badge">{cartCount}</span> : null}
          </span>
          <span>Cart</span>
          {/* The count is in the badge for sighted users and in the label for
              everyone else — a bare number read aloud says nothing. */}
          {cartCount ? (
            <span className="fc-sr-only">{cartCount === 1 ? '1 item' : `${cartCount} items`}</span>
          ) : null}
        </button>
      </nav>

      <SearchBox onOpenRestaurant={onOpenRestaurant} onEnterDistrict={onEnterDistrict} />

      <AccountButton />
    </header>
  );
}
