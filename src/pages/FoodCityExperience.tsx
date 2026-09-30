import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GridPulse } from '@/components/ui/grid-pulse';
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
  const [view, setView] = useState<View>({ name: 'city' });
  const navigate = useNavigate();

  const enterDistrict = useCallback((districtId: string) => {
    setView({ name: 'listing', districtId });
  }, []);

  const backToCity = useCallback(() => {
    setView({ name: 'city' });
  }, []);

  /* Relative, so this works under both "/" for a visitor and "/customer" for a
     signed-in customer without knowing which base it is mounted on. */
  const openRestaurant = useCallback(
    (restaurantId: string) => navigate(`restaurant/${restaurantId}`),
    [navigate],
  );

  return (
    <div className="fc-shell" id="top" data-view={view.name}>
      {/*
        Behind everything: a grid that takes colour where the pointer passes.
        It replaced a photographic landscape — which had to be tinted hard to
        stop it fighting the palette, and cost two megabytes to move. This is
        drawn, so it is the house colours by construction and weighs nothing.

        The band runs butter 52° down to soft pink 330°, through salmon — the
        component subtracts the span, so a positive number turns that way.
        Going the other way would travel through green and blue, which are not
        ours to spend, and a first attempt that did came out lime.
      */}
      <GridPulse className="fc-grid" hueTop={52} hueSpan={82} cell={30} />

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
    </div>
  );
}
