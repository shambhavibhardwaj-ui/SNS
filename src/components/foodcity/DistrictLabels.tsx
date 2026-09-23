import type { DistrictSummary } from '../../services/restaurantService';
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
                fill="#4A3B2E"
                opacity={0.16}
              />
              <rect
                x={centre.x - 76}
                y={centre.y - 199}
                width={148}
                height={30}
                rx={9}
                fill="#FFFBF2"
                stroke={district.theme.roof}
                strokeWidth={2.2}
              />
              <text
                x={centre.x - 2}
                y={centre.y - 179}
                textAnchor="middle"
                className="fc-sign-text"
                fill={district.theme.roof}
              >
                {district.emoji} {district.name}
              </text>
            </g>

            <g className="fc-card" transform={`translate(${centre.x} ${centre.y - 250})`}>
              <rect x={-138} y={-2} width={276} height={92} rx={16} fill="#4A3B2E" opacity={0.2} />
              <rect x={-140} y={-6} width={276} height={92} rx={16} fill="#FFFBF2" />
              <rect
                x={-140}
                y={-6}
                width={276}
                height={92}
                rx={16}
                fill="none"
                stroke={district.theme.roof}
                strokeWidth={2}
                opacity={0.45}
              />
              <text x={-120} y={24} className="fc-card-title" fill="#33261B">
                {district.emoji} {district.name}
              </text>
              <text x={-120} y={48} className="fc-card-meta" fill={district.theme.roof}>
                {restaurantCount} restaurants
                {topRating !== null ? `  ·  ★ ${topRating.toFixed(1)} top rated` : ''}
              </text>
              <text x={-120} y={69} className="fc-card-sub" fill="#7A6250">
                {cuisineNames.slice(0, 3).join(' · ')}
              </text>
              <polygon points="-10,86 10,86 0,99" fill="#FFFBF2" />
            </g>
          </g>
        );
      })}
    </g>
  );
}
