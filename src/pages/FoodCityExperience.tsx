import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FoodCity } from '../components/foodcity/FoodCity';
import { TopBar } from '../components/layout/TopBar';
import { RestaurantListing } from './RestaurantListing';

/**
 * The customer discovery and ordering experience — unchanged by the auth work.
 *
 * City and district stay as local state: the district view is a zoom of the
 * same canvas, and giving it a URL would mean rebuilding the camera on every
 * navigation. From the restaurant onwards the journey does get real routes —
 * a menu, a cart and an order are all things a person expects to be able to
 * reload, link to, and reach with the back button.
 */
type View = { name: 'city' } | { name: 'listing'; districtId: string };

export function FoodCityExperience() {
  /*
   * `?district=` opens straight into a listing.
   *
   * The landing page's cuisine cards need to land on the district they name,
   * and the district view is local state rather than a route — so the query
   * string is read once, as the initial view, and not kept in sync. Treating
   * it as the source of truth would mean every click on the map rewrote the
   * URL, which is the arrangement this file deliberately avoided.
   */
  const [params] = useSearchParams();
  const [view, setView] = useState<View>(() => {
    const id = params.get('district');
    return id ? { name: 'listing', districtId: id } : { name: 'city' };
  });
  const navigate = useNavigate();

  const enterDistrict = useCallback((districtId: string) => {
    setView({ name: 'listing', districtId });
  }, []);

  const backToCity = useCallback(() => {
    setView({ name: 'city' });
  }, []);

  /*
   * Up one, then across.
   *
   * The city sits at "city" now rather than at the index, so a bare
   * `restaurant/:id` would resolve to `city/restaurant/:id`, which is not a
   * route — every kitchen clicked from the map would 404. `..` steps back to
   * whichever base this is mounted on, so one path works under "/" for a
   * visitor and under "/customer" for a signed-in one.
   */
  const openRestaurant = useCallback(
    (restaurantId: string) => navigate(`../restaurant/${restaurantId}`),
    [navigate],
  );

  return (
    <div className="fc-shell" id="top" data-view={view.name}>
      <TopBar
        compact={view.name !== 'city'}
        onHome={backToCity}
        onOpenRestaurant={openRestaurant}
        onEnterDistrict={enterDistrict}
      />

      {view.name === 'city' ? (
        <FoodCity key="city" onEnterDistrict={enterDistrict} onOpenRestaurant={openRestaurant} />
      ) : (
        <div className="rl-scroll" key={view.districtId}>
          <RestaurantListing
            districtId={view.districtId}
            onBackToCity={backToCity}
            onOpenRestaurant={openRestaurant}
          />
        </div>
      )}
    </div>
  );
}
