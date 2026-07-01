import type { ArrayState } from '../../types';

const ROLE_COLORS: Record<string, string> = {
  active: 'var(--c-active)',
  compare: 'var(--c-compare)',
  found: 'var(--c-found)',
  done: 'var(--c-done)',
  discard: 'var(--c-discard)',
  pivot: 'var(--c-pivot)',
};

export default function ArrayViz({ state }: { state: ArrayState }) {
  const n = state.values.length;
  const max = Math.max(...state.values.map(Math.abs), 1);
  const pointersAt = (i: number) => (state.pointers ?? []).filter((p) => p.index === i);
  const inWindow = (i: number) =>
    state.window != null && i >= state.window[0] && i <= state.window[1];

  return (
    <div className="array-viz">
      {state.note && <div className="viz-note">{state.note}</div>}
      <div className="array-row" style={{ ['--n' as string]: n }}>
        {state.values.map((v, i) => {
          const role = state.highlights?.[i];
          const h = 30 + (Math.abs(v) / max) * 70;
          return (
            <div key={i} className={`cell-col ${inWindow(i) ? 'in-window' : ''}`}>
              <div
                className="cell-bar"
                style={{
                  height: `${h}%`,
                  background: role ? ROLE_COLORS[role] : 'var(--c-bar)',
                  opacity: role === 'discard' ? 0.25 : 1,
                }}
              >
                <span className="cell-value">{v}</span>
              </div>
              <div className="cell-index">{i}</div>
              <div className="cell-pointers">
                {pointersAt(i).map((p) => (
                  <span key={p.label} className="pointer-chip" style={{ background: p.color ?? 'var(--c-pointer)' }}>
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {state.aux && (
        <div className="aux-row">
          <span className="aux-label">{state.aux.label}</span>
          {state.aux.values.map((v, i) => (
            <div key={i} className={`aux-cell ${v === null ? 'empty' : ''}`}>
              {v ?? ''}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
