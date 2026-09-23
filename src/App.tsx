import { useCallback, useState } from 'react';
import { FoodCity } from './components/foodcity/FoodCity';
import { TopBar } from './components/layout/TopBar';
import { RestaurantListing } from './pages/RestaurantListing';

/**
 * Customer journey state.
 *
 * Deliberately a plain union rather than a router: the journey is linear
 * (city -> district -> restaurant -> cart -> checkout) and each step needs the
 * previous step's id. A router goes in when URLs need to be shareable.
 */
type View = { name: 'city' } | { name: 'listing'; districtId: string };

export default function App() {
  const [view, setView] = useState<View>({ name: 'city' });
  const [notice, setNotice] = useState<string | null>(null);

  const enterDistrict = useCallback((districtId: string) => {
    setView({ name: 'listing', districtId });
  }, []);

  const backToCity = useCallback(() => {
    setNotice(null);
    setView({ name: 'city' });
  }, []);

  /* Phase 4 replaces this with the restaurant menu page. */
  const openRestaurant = useCallback((restaurantId: string) => {
    setNotice(restaurantId);
  }, []);

  return (
    <div className="fc-shell" id="top" data-view={view.name}>
      <TopBar compact={view.name !== 'city'} />

      {view.name === 'city' ? (
        <FoodCity key="city" onEnterDistrict={enterDistrict} />
      ) : (
        <div className="rl-scroll" key={view.districtId}>
          <RestaurantListing
            districtId={view.districtId}
            onBackToCity={backToCity}
            onOpenRestaurant={openRestaurant}
          />
        </div>
      )}

      {notice ? <NextStepNotice restaurantId={notice} onClose={() => setNotice(null)} /> : null}
    </div>
  );
}

/**
 * Stands in for the restaurant menu page until phase 4 lands, so a card click
 * says what will happen rather than doing nothing.
 */
function NextStepNotice({
  restaurantId,
  onClose,
}: {
  restaurantId: string;
  onClose: () => void;
}) {
  return (
    <div className="rl-notice" role="status">
      <span>
        <strong>{restaurantId.replace(/^res-/, '').replace(/-/g, ' ')}</strong> — the menu page with
        per-cuisine tabs is the next build step.
      </span>
      <button type="button" onClick={onClose} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
