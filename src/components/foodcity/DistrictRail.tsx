import type { DistrictSummary } from '../../services/restaurantService';

interface DistrictRailProps {
  summaries: DistrictSummary[];
  hoveredId: string | null;
  activeId: string | null;
  onHover: (districtId: string | null) => void;
  onSelect: (districtId: string) => void;
}

/**
 * Text list of the districts, shown beside the map.
 *
 * This is not decoration: it is the accessible and small-screen route into the
 * same districts, and it drives the same hover highlight as the artwork.
 */
export function DistrictRail({ summaries, hoveredId, activeId, onHover, onSelect }: DistrictRailProps) {
  return (
    <nav className="fc-rail" aria-label="Cuisine districts">
      {summaries.map(({ district, restaurantCount, topRating }) => {
        const isHot = hoveredId === district.id || activeId === district.id;
        return (
          <button
            key={district.id}
            type="button"
            className="fc-rail-item"
            data-hot={isHot || undefined}
            aria-current={activeId === district.id || undefined}
            style={{ '--chip': district.theme.roof } as React.CSSProperties}
            onMouseEnter={() => onHover(district.id)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(district.id)}
            onBlur={() => onHover(null)}
            onClick={() => onSelect(district.id)}
          >
            <span className="fc-rail-emoji" aria-hidden="true">
              {district.emoji}
            </span>
            <span className="fc-rail-body">
              <span className="fc-rail-name">{district.name}</span>
              <span className="fc-rail-meta">
                {restaurantCount} places
                {topRating !== null ? ` · ★ ${topRating.toFixed(1)}` : ''}
              </span>
            </span>
            <svg className="fc-rail-chevron" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M6 3.5 L10.5 8 L6 12.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        );
      })}
    </nav>
  );
}
