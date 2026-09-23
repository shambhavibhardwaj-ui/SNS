import { Bike, Clock, Star } from 'lucide-react';
import type { Restaurant } from '../../data/types';
import { getCuisinesForRestaurant } from '../../services/restaurantService';
import { FoodPlate } from '../ui/FoodPlate';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onOpen: (restaurantId: string) => void;
}

export function RestaurantCard({ restaurant, onOpen }: RestaurantCardProps) {
  const cuisines = getCuisinesForRestaurant(restaurant.id);
  /* The veg badge is rendered from isPureVeg, so drop any tag that repeats it. */
  const tags = restaurant.tags.filter((t) => t.toLowerCase() !== 'pure veg').slice(0, 2);

  return (
    <button
      type="button"
      className="rc-card"
      onClick={() => onOpen(restaurant.id)}
      aria-label={`${restaurant.name}, ${restaurant.rating} stars, ${cuisines
        .map((c) => c.name)
        .join(', ')}${restaurant.isOpen ? '' : ', currently closed'}`}
    >
      <div className="rc-media">
        <FoodPlate image={restaurant.image} className="rc-image" />
        {!restaurant.isOpen ? (
          <div className="rc-closed">
            <span>Closed right now</span>
          </div>
        ) : null}
        {restaurant.deliveryFee === 0 ? (
          <span className="rc-badge">Free delivery</span>
        ) : null}
      </div>

      <div className="rc-body">
        <div className="rc-head">
          <h3 className="rc-name">{restaurant.name}</h3>
          <span className={`rc-rating${restaurant.rating < 4 ? ' is-low' : ''}`}>
            <Star size={12} fill="currentColor" strokeWidth={0} />
            {restaurant.rating.toFixed(1)}
          </span>
        </div>

        <p className="rc-cuisines">
          {cuisines.map((c) => c.name).join(' • ')}
        </p>
        <p className="rc-desc">{restaurant.description}</p>

        <div className="rc-meta">
          <span>
            <Clock size={13} strokeWidth={2} />
            {restaurant.etaMinutes}–{restaurant.etaMaxMinutes} min
          </span>
          <span className="rc-dot" aria-hidden="true" />
          <span>{restaurant.priceRange} for two</span>
          <span className="rc-dot" aria-hidden="true" />
          <span>
            <Bike size={13} strokeWidth={2} />
            {restaurant.deliveryFee === 0 ? 'Free' : `₹${restaurant.deliveryFee}`}
          </span>
        </div>

        {tags.length || restaurant.isPureVeg ? (
          <ul className="rc-tags">
            {restaurant.isPureVeg ? <li className="is-veg">Pure veg</li> : null}
            {tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </button>
  );
}
