import type { GraphState, NodeStatus, EdgeStatus } from '../../types';

const NODE_COLORS: Record<NodeStatus, string> = {
  unvisited: 'var(--c-node)',
  frontier: 'var(--c-compare)',
  current: 'var(--c-active)',
  visited: 'var(--c-done)',
};

const EDGE_COLORS: Record<EdgeStatus, string> = {
  idle: 'var(--c-edge)',
  active: 'var(--c-active)',
  included: 'var(--c-found)',
  rejected: 'var(--c-discard)',
};

const W = 700;
const H = 420;
const R = 22;

export default function GraphViz({ state }: { state: GraphState }) {
  const pos = new Map(state.nodes.map((n) => [n.id, { x: (n.x / 100) * W, y: (n.y / 100) * H }]));

  return (
    <div className="graph-viz">
      {state.note && <div className="viz-note">{state.note}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} className="graph-svg">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--c-edge-strong)" />
          </marker>
        </defs>
        {state.edges.map((e, i) => {
          const a = pos.get(e.from)!;
          const b = pos.get(e.to)!;
          const status = e.status ?? 'idle';
          // shorten line so arrowheads don't overlap nodes
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const pad = e.directed ? R + 4 : R;
          const x1 = a.x + (dx / len) * R;
          const y1 = a.y + (dy / len) * R;
          const x2 = b.x - (dx / len) * pad;
          const y2 = b.y - (dy / len) * pad;
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          return (
            <g key={i}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={EDGE_COLORS[status]}
                strokeWidth={status === 'idle' ? 2 : 4}
                strokeDasharray={status === 'rejected' ? '6 6' : undefined}
                markerEnd={e.directed ? 'url(#arrow)' : undefined}
                className="graph-edge"
              />
              {e.weight != null && (
                <g>
                  <rect x={mx - 13} y={my - 11} width={26} height={20} rx={5} fill="var(--c-panel)" />
                  <text x={mx} y={my + 4} textAnchor="middle" className="edge-weight">
                    {e.weight}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        {state.nodes.map((n) => {
          const p = pos.get(n.id)!;
          const status = n.status ?? 'unvisited';
          return (
            <g key={n.id} className="graph-node" transform={`translate(${p.x},${p.y})`}>
              <circle
                r={R}
                fill={NODE_COLORS[status]}
                stroke={status === 'current' ? 'var(--c-text)' : 'transparent'}
                strokeWidth={3}
              />
              <text y={5} textAnchor="middle" className="node-label">
                {n.id}
              </text>
              {n.sub != null && (
                <text y={R + 16} textAnchor="middle" className="node-sub">
                  {n.sub}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
