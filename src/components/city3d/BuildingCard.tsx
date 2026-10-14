import { ArrowRight, Star, X } from 'lucide-react';
import type { Restaurant } from '../../data/types';
import type { DistrictSummary } from '../../services/restaurantService';

/**
 * What a picked building says about itself.
 *
 * Shown beside the city rather than over its middle, so the thing you just
 * clicked is not hidden by the panel describing it. Both ways on are offered —
 * the kitchen itself, and the street it stands in — because a building in this
 * city has always been both a restaurant and a way into its district.
 */
export function BuildingCard({
  restaurant, summary, onClose, onEnterDistrict, onOpen,
}: {
  restaurant: Restaurant;
  summary: DistrictSummary;
  onClose: () => void;
  onEnterDistrict: () => void;
  onOpen: () => void;
}) {
  const { district } = summary;
  return (
    <aside className="c3-card" aria-label={`${restaurant.name}, selected`}>
      <button type="button" className="c3-card-close" onClick={onClose} aria-label="Close">
        <X size={15} strokeWidth={2.2} />
      </button>

      <p className="c3-card-eyebrow">
        <span aria-hidden="true">{district.emoji}</span> {district.name}
      </p>
      <h2 className="c3-card-title">{restaurant.name}</h2>
      <p className="c3-card-desc">{restaurant.description}</p>

      <dl className="c3-card-facts">
        <div>
          <dt>Rating</dt>
          <dd>
            <Star size={12} fill="currentColor" strokeWidth={0} aria-hidden="true" />
            {restaurant.rating.toFixed(1)}
          </dd>
        </div>
        <div>
          <dt>For two</dt>
          <dd>₹{restaurant.priceForTwo}</dd>
        </div>
        <div>
          <dt>Delivery</dt>
          <dd>{restaurant.etaMinutes}–{restaurant.etaMaxMinutes} min</dd>
        </div>
        <div>
          <dt>In this district</dt>
          <dd>{summary.restaurantCount} kitchens</dd>
        </div>
      </dl>

      <div className="c3-card-actions">
        <button type="button" className="c3-card-primary" onClick={onOpen}>
          See the menu
          <ArrowRight size={14} strokeWidth={2.2} />
        </button>
        <button type="button" className="c3-card-secondary" onClick={onEnterDistrict}>
          Enter {district.name}
        </button>
      </div>
    </aside>
  );
}
