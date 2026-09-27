import { Link } from 'react-router-dom';
import { formatCount } from './format';
import type { FlowEdgeSeed, FlowNodeSeed } from '../../data/admin/analytics';

/**
 * A process diagram: real nodes, real connectors.
 *
 * Built here rather than pulled in, because React Flow and its neighbours bring
 * a canvas, a pan/zoom surface and their own styling for a diagram that is
 * eight fixed boxes. This renders nodes as ordinary HTML — so a node can be a
 * router `Link`, take focus and wrap its own text — over an SVG layer that
 * draws only the edges.
 *
 * Positions come from the `col`/`row` on each node rather than from a layout
 * pass. The grid is uniform, so every coordinate is arithmetic and nothing has
 * to be measured; the container is sized in pixels and scrolls sideways on a
 * phone rather than crushing the boxes.
 */

const NODE_W = 152;
const NODE_H = 66;
const GAP_X = 62;
const GAP_Y = 30;

type Node = FlowNodeSeed & { count?: number };

const xOf = (col: number) => col * (NODE_W + GAP_X);
const yOf = (row: number) => row * (NODE_H + GAP_Y);

/** Centre-right of a node — where an outgoing edge starts. */
const exitPoint = (n: Node) => ({ x: xOf(n.col) + NODE_W, y: yOf(n.row) + NODE_H / 2 });
/** Centre-left — where an incoming edge lands. */
const entryPoint = (n: Node) => ({ x: xOf(n.col), y: yOf(n.row) + NODE_H / 2 });

/**
 * Two routes.
 *
 * Forward edges get a horizontal cubic: the control points sit on the same y as
 * their endpoints, so a straight run stays straight and a branch bends only in
 * the middle. An edge that goes backwards (a resubmission returning to review)
 * cannot do that without crossing the boxes, so it drops below the row and
 * travels back underneath.
 */
function edgePath(from: Node, to: Node): { d: string; mid: { x: number; y: number } } {
  const a = exitPoint(from);
  const b = entryPoint(to);

  if (to.col > from.col) {
    const dx = Math.max(24, (b.x - a.x) * 0.5);
    return {
      d: `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`,
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    };
  }

  const below = Math.max(yOf(from.row), yOf(to.row)) + NODE_H + GAP_Y * 0.55;
  const start = { x: xOf(from.col) + NODE_W / 2, y: yOf(from.row) + NODE_H };
  const end = { x: xOf(to.col) + NODE_W / 2, y: yOf(to.row) + NODE_H };
  return {
    d: `M ${start.x} ${start.y} C ${start.x} ${below}, ${end.x} ${below}, ${end.x} ${end.y}`,
    mid: { x: (start.x + end.x) / 2, y: below + 2 },
  };
}

export function FlowDiagram({
  nodes,
  edges,
  caption,
  countLabel,
}: {
  nodes: Node[];
  edges: FlowEdgeSeed[];
  caption: string;
  /** What a node's number counts — "12" alone tells an admin nothing. */
  countLabel?: string;
}) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const cols = Math.max(...nodes.map((n) => n.col)) + 1;
  const rows = Math.max(...nodes.map((n) => n.row)) + 1;

  /* Room under the last row for a backward edge to pass through. */
  const width = cols * (NODE_W + GAP_X) - GAP_X;
  const height = rows * (NODE_H + GAP_Y) - GAP_Y + GAP_Y;

  return (
    <div className="an-flow-scroll">
      <div className="an-flow" style={{ width, height }} role="group" aria-label={caption}>
        <svg className="an-flow-edges" width={width} height={height} aria-hidden="true">
          <defs>
            <marker
              id="an-arrow" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="7" markerHeight="7" orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="an-flow-arrowhead" />
            </marker>
          </defs>

          {edges.map((e) => {
            const from = byId.get(e.from);
            const to = byId.get(e.to);
            if (!from || !to) return null;
            const { d, mid } = edgePath(from, to);
            const back = to.col <= from.col;

            return (
              <g key={`${e.from}-${e.to}`}>
                <path d={d} className="an-flow-edge" data-back={back || undefined} markerEnd="url(#an-arrow)" />
                {e.label ? (
                  <text x={mid.x} y={mid.y - 6} className="an-flow-edge-label" textAnchor="middle">
                    {e.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>

        {nodes.map((n) => {
          const body = (
            <>
              <span className="an-node-label">{n.label}</span>
              {n.count === undefined ? null : (
                <span className="an-node-count">{formatCount(n.count)}</span>
              )}
            </>
          );

          const style = { left: xOf(n.col), top: yOf(n.row), width: NODE_W, height: NODE_H };
          const title = [n.hint, countLabel && n.count !== undefined ? `${formatCount(n.count)} ${countLabel}` : null]
            .filter(Boolean)
            .join(' — ');

          return n.href ? (
            <Link
              key={n.id}
              to={n.href}
              className="an-node"
              data-kind={n.kind}
              style={style}
              title={title || undefined}
            >
              {body}
            </Link>
          ) : (
            <div key={n.id} className="an-node" data-kind={n.kind} style={style} title={title || undefined}>
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
}
