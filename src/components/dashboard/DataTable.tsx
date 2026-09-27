import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

export interface Column<Row> {
  key: string;
  header: string;
  /** Cell contents. Return a string for plain text, or a node for pills etc. */
  cell: (row: Row) => ReactNode;
  /** Right-align numbers so columns of figures line up. */
  align?: 'start' | 'end';
  /** Hidden on narrow screens when the column is secondary. */
  secondary?: boolean;
  /**
   * Makes the column sortable. Returns what to order by — usually a raw number
   * rather than the formatted cell, so "₹1,20,000" sorts as 120000 and not as
   * the string it renders to.
   */
  sortValue?: (row: Row) => number | string;
}

export type SortDirection = 'asc' | 'desc';

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
  defaultSort,
}: {
  columns: Column<Row>[];
  rows: Row[];
  caption: string;
  empty?: string;
  rowKey: (row: Row, index: number) => string;
  /**
   * Column key to order by initially. Sorting is held here rather than by each
   * caller: every screen wants the same click-to-sort behaviour, and seven
   * copies of that state is seven chances to get it subtly different.
   */
  defaultSort?: { key: string; direction?: SortDirection };
}) {
  const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(
    defaultSort ? { key: defaultSort.key, direction: defaultSort.direction ?? 'desc' } : null,
  );

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) return rows;
    const factor = sort.direction === 'asc' ? 1 : -1;
    /* Copy first: sorting the caller's array in place would mutate the data. */
    return [...rows].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return String(av).localeCompare(String(bv)) * factor;
    });
  }, [rows, columns, sort]);

  const toggle = (key: string) =>
    setSort((s) =>
      s?.key === key
        ? { key, direction: s.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'desc' },
    );

  if (!rows.length) return <p className="dt-empty">{empty}</p>;

  return (
    <div className="dt-wrap">
      <table className="dt">
        <caption className="fc-sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => {
              const active = sort?.key === c.key;
              return (
                <th
                  key={c.key}
                  scope="col"
                  data-align={c.align}
                  data-secondary={c.secondary || undefined}
                  aria-sort={active ? (sort!.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {c.sortValue ? (
                    <button type="button" className="dt-sort" onClick={() => toggle(c.key)} data-on={active || undefined}>
                      {c.header}
                      {active ? (
                        sort!.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ChevronsUpDown size={12} className="dt-sort-idle" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
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
