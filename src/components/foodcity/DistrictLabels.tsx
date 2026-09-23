import type { DistrictSummary } from '../../services/restaurantService';
import { brand } from '../../theme/brand';
import { BLOCK, districtPlots, iso } from './iso';

interface DistrictLabelsProps {
  summaries: DistrictSummary[];
  hoveredId: string | null;
  activeId: string | null;
}

/**
 * Name plates and hover cards for every district, drawn as one layer above the
 * whole city.
 *
 * They deliberately live outside the district groups: inside them, a label sat
 * in the depth order with its own block and could be painted over by a nearer
 * district's rooftops. Labels must always be legible, so they get their own
 * pass. Pointer events stay off so this layer never intercepts a hover.
 */
export function DistrictLabels({ summaries, hoveredId, activeId }: DistrictLabelsProps) {
  return (
    <g className="fc-labels" aria-hidden="true">
      {summaries.map(({ district, restaurantCount, topRating, cuisineNames }) => {
        const plot = districtPlots[district.id];
        const centre = iso(plot.gx + BLOCK / 2, plot.gy + BLOCK / 2);
        const hovered = hoveredId === district.id && activeId === null;
        const dimmed = activeId !== null && activeId !== district.id;

        return (
          <g
            key={district.id}
            className={[
              'fc-label',
              hovered ? 'is-hovered' : '',
              dimmed ? 'is-dimmed' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <g className="fc-signpost">
              <rect
                x={centre.x - 74}
                y={centre.y - 196}
                width={148}
                height={30}
                rx={9}
                fill={brand.teal900}
                opacity={0.3}
              />
              <rect
                x={centre.x - 76}
                y={centre.y - 199}
                width={148}
                height={30}
                rx={9}
                fill={brand.butter}
                stroke={brand.teal900}
                strokeWidth={2}
              />
              <text
                x={centre.x - 2}
                y={centre.y - 179}
                textAnchor="middle"
                className="fc-sign-text"
                fill={brand.teal900}
              >
                {district.emoji} {district.name}
              </text>
            </g>

            <g className="fc-card" transform={`translate(${centre.x} ${centre.y - 250})`}>
              <rect x={-138} y={-2} width={276} height={92} rx={16} fill={brand.teal900} opacity={0.34} />
              <rect x={-140} y={-6} width={276} height={92} rx={16} fill={brand.cream} />
              <rect
                x={-140}
                y={-6}
                width={276}
                height={92}
                rx={16}
                fill="none"
                stroke={brand.magenta}
                strokeWidth={2}
                opacity={0.9}
              />
              <text x={-120} y={24} className="fc-card-title" fill={brand.teal900}>
                {district.emoji} {district.name}
              </text>
              <text x={-120} y={48} className="fc-card-meta" fill={brand.magenta}>
                {restaurantCount} restaurants
                {topRating !== null ? `  ·  ★ ${topRating.toFixed(1)} top rated` : ''}
              </text>
              <text x={-120} y={69} className="fc-card-sub" fill={brand.slate}>
                {cuisineNames.slice(0, 3).join(' · ')}
              </text>
              <polygon points="-10,86 10,86 0,99" fill={brand.cream} />
            </g>
          </g>
        );
      })}
    </g>
  );
}
