import type { ReactNode } from 'react';

export interface Column<Row> {
  key: string;
  header: string;
  /** Cell contents. Return a string for plain text, or a node for pills etc. */
  cell: (row: Row) => ReactNode;
  /** Right-align numbers so columns of figures line up. */
  align?: 'start' | 'end';
  /** Hidden on narrow screens when the column is secondary. */
  secondary?: boolean;
}

/**
 * One table for every management screen.
 *
 * The admin sections differ only in their columns and rows, so they share this
 * rather than repeating a table seven times. Real `<table>` markup, so the
 * header/cell relationships survive for screen readers.
 */
export function DataTable<Row>({
  columns,
  rows,
  caption,
  empty = 'Nothing here yet.',
  rowKey,
}: {
  columns: Column<Row>[];
  rows: Row[];
  caption: string;
  empty?: string;
  rowKey: (row: Row, index: number) => string;
}) {
  if (!rows.length) return <p className="dt-empty">{empty}</p>;

  return (
    <div className="dt-wrap">
      <table className="dt">
        <caption className="fc-sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                data-align={c.align}
                data-secondary={c.secondary || undefined}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey(row, i)}>
              {columns.map((c) => (
                <td key={c.key} data-align={c.align} data-secondary={c.secondary || undefined}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Status text with a colour that carries meaning consistently across screens. */
export function StatusPill({ value }: { value: string }) {
  return (
    <span className="dt-pill" data-tone={toneFor(value)}>
      {value}
    </span>
  );
}

function toneFor(value: string): 'good' | 'warn' | 'bad' | 'busy' | 'idle' {
  const v = value.toLowerCase();
  if (['active', 'delivered', 'accepted', 'completed'].includes(v)) return 'good';
  if (['cancelled', 'suspended', 'required'].includes(v)) return 'bad';
  if (['paused', 'pending', 'dormant', 'onboarding'].includes(v)) return 'warn';
  if (['out for delivery', 'preparing', 'picked up', 'confirmed', 'submitted', 'assigned'].includes(v)) {
    return 'busy';
  }
  return 'idle';
}

/** Star rating with the value beside it, so it is readable without colour. */
export function RatingCell({ value }: { value: number }) {
  return (
    <span className="dt-rating" data-low={value < 3 || undefined}>
      ★ {value.toFixed(1)}
    </span>
  );
}

export function Money({ value }: { value: number }) {
  return <span className="dt-money">₹{value.toLocaleString('en-IN')}</span>;
}

/** Placeholder for a figure the client has not supplied. */
export function NotSet() {
  return <span className="dt-notset">Not set</span>;
}
