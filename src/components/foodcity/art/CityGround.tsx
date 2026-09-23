import {
  BOULEVARD_Y,
  MAP_HEIGHT,
  MAP_WIDTH,
  PLAZA,
  ROAD_WIDTH,
  STREET_X,
} from '../mapLayout';
import { Shrub, Tree } from './Scenery';

const ROAD = '#E3D2B6';
const ROAD_EDGE = '#D2BD9C';
const MARKING = '#FBF3E3';

/** Terrain, roads and the central plaza. Everything a district stands on. */
export function CityGround() {
  const half = ROAD_WIDTH / 2;

  return (
    <g aria-hidden="true">
      {/* ground */}
      {/* Oversized so it still fills the frame when the map is letterboxed. */}
      <rect x={-900} y={-900} width={MAP_WIDTH + 1800} height={MAP_HEIGHT + 1800} fill="url(#fc-ground)" />

      {/* soft green blocks behind the neighbourhoods */}
      {[
        { x: 70, y: 150, w: 520, h: 300 },
        { x: 600, y: 120, w: 400, h: 330 },
        { x: 1020, y: 150, w: 370, h: 300 },
        { x: 70, y: 490, w: 520, h: 320 },
        { x: 600, y: 490, w: 400, h: 320 },
        { x: 1020, y: 490, w: 370, h: 320 },
      ].map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={34} fill="#EFE1C8" opacity={0.75} />
      ))}

      {/* north–south streets */}
      {STREET_X.map((x) => (
        <g key={x}>
          <rect x={x - half - 4} y={90} width={ROAD_WIDTH + 8} height={MAP_HEIGHT - 150} rx={20} fill={ROAD_EDGE} />
          <rect x={x - half} y={94} width={ROAD_WIDTH} height={MAP_HEIGHT - 158} rx={18} fill={ROAD} />
          <line
            x1={x}
            y1={110}
            x2={x}
            y2={MAP_HEIGHT - 76}
            stroke={MARKING}
            strokeWidth={3}
            strokeDasharray="16 20"
            opacity={0.8}
          />
        </g>
      ))}

      {/* east–west boulevard */}
      <rect x={40} y={BOULEVARD_Y - half - 4} width={MAP_WIDTH - 80} height={ROAD_WIDTH + 8} rx={20} fill={ROAD_EDGE} />
      <rect x={44} y={BOULEVARD_Y - half} width={MAP_WIDTH - 88} height={ROAD_WIDTH} rx={18} fill={ROAD} />
      <line
        x1={64}
        y1={BOULEVARD_Y}
        x2={MAP_WIDTH - 64}
        y2={BOULEVARD_Y}
        stroke={MARKING}
        strokeWidth={3}
        strokeDasharray="18 22"
        opacity={0.8}
      />

      {/* central plaza */}
      <circle cx={PLAZA.x} cy={PLAZA.y} r={PLAZA.r + 5} fill={ROAD_EDGE} />
      <circle cx={PLAZA.x} cy={PLAZA.y} r={PLAZA.r} fill="#EADCC0" />
      <circle cx={PLAZA.x} cy={PLAZA.y} r={PLAZA.r - 14} fill="none" stroke="#D8C4A2" strokeWidth={3} />
      {/* fountain */}
      <ellipse cx={PLAZA.x} cy={PLAZA.y + 6} rx={26} ry={13} fill="#C7D8DA" />
      <ellipse cx={PLAZA.x} cy={PLAZA.y + 4} rx={20} ry={9} fill="#9FC2C6" />
      <rect x={PLAZA.x - 3.5} y={PLAZA.y - 20} width={7} height={26} rx={3.5} fill="#CBB795" />
      <ellipse cx={PLAZA.x} cy={PLAZA.y - 21} rx={13} ry={5} fill="#CBB795" />
      <circle cx={PLAZA.x} cy={PLAZA.y - 30} r={4} fill="#9FC2C6" className="fc-lamp-glow" />

      {/* crossings where each block meets the boulevard */}
      {[300, 785, 1215].map((cx) =>
        [0, 1].map((side) => (
          <g key={`${cx}-${side}`}>
            {[0, 1, 2, 3].map((i) => (
              <rect
                key={i}
                x={cx - 21 + i * 12}
                y={side === 0 ? BOULEVARD_Y - half - 2 : BOULEVARD_Y + 6}
                width={7}
                height={16}
                rx={2}
                fill={MARKING}
                opacity={0.7}
              />
            ))}
          </g>
        )),
      )}

      {/* boulevard planting */}
      {[210, 430, 900, 1130, 1330].map((x) => (
        <Tree key={x} x={x} y={BOULEVARD_Y - 34} scale={0.6} />
      ))}
      {[150, 690, 1290].map((x) => (
        <Shrub key={x} x={x} y={BOULEVARD_Y + 44} scale={0.72} />
      ))}

      {/* corner parkland */}
      <Tree x={70} y={130} scale={0.72} />
      <Tree x={1380} y={132} scale={0.68} />
      <Tree x={64} y={846} scale={0.7} />
      <Tree x={1384} y={850} scale={0.74} />
    </g>
  );
}
