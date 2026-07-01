import type { TableState } from '../../types';

const ROLE_COLORS: Record<string, string> = {
  active: 'var(--c-active)',
  compare: 'var(--c-compare)',
  found: 'var(--c-found)',
  done: 'var(--c-done)',
  discard: 'var(--c-discard)',
  pivot: 'var(--c-pivot)',
};

export default function TableViz({ state }: { state: TableState }) {
  return (
    <div className="table-viz">
      {state.note && <div className="viz-note">{state.note}</div>}
      <table className="dp-table">
        {state.colLabels && (
          <thead>
            <tr>
              {state.rowLabels && <th />}
              {state.colLabels.map((c, i) => (
                <th key={i}>{c}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {state.rows.map((row, r) => (
            <tr key={r}>
              {state.rowLabels && <th>{state.rowLabels[r]}</th>}
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={cell.value === null ? 'empty' : ''}
                  style={cell.role ? { background: ROLE_COLORS[cell.role], color: '#0b1120' } : undefined}
                >
                  {cell.value ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
