import type { DistrictSummary } from '../../services/restaurantService';

interface DistrictPanelProps {
  summary: DistrictSummary;
  onBack: () => void;
}

/**
 * Shown once the camera has flown into a district.
 *
 * Phase scope: this identifies the district you have walked into. Choosing a
 * storefront is the next build step (restaurant discovery), so nothing here
 * pretends to open a restaurant yet.
 */
export function DistrictPanel({ summary, onBack }: DistrictPanelProps) {
  const { district, restaurantCount, topRating, cuisineNames } = summary;

  return (
    <div className="fc-panel" style={{ '--panel-accent': district.theme.roof } as React.CSSProperties}>
      <button type="button" className="fc-back" onClick={onBack}>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M10 3.5 L5.5 8 L10 12.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to the city
      </button>

      <div className="fc-panel-body">
        <p className="fc-panel-eyebrow">You&rsquo;re standing in</p>
        <h2 className="fc-panel-title">
          <span aria-hidden="true">{district.emoji}</span> {district.name}
        </h2>
        <p className="fc-panel-tagline">{district.tagline}</p>

        <dl className="fc-panel-stats">
          <div>
            <dt>Restaurants</dt>
            <dd>{restaurantCount}</dd>
          </div>
          <div>
            <dt>Top rated</dt>
            <dd>{topRating !== null ? `★ ${topRating.toFixed(1)}` : '—'}</dd>
          </div>
          <div>
            <dt>Cuisines</dt>
            <dd>{cuisineNames.length}</dd>
          </div>
        </dl>

        <ul className="fc-panel-cuisines">
          {cuisineNames.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>

        <p className="fc-panel-next">
          Each building on this street is one restaurant. Opening them comes next.
        </p>
      </div>
    </div>
  );
}
