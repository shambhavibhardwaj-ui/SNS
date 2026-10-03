/**
 * The title above a step's cards.
 *
 * The layout has no header of its own — the rail names the step you are on,
 * but only in 13px beside four others. This is the page saying what it is,
 * once, at the size a page title should be.
 */
export function PageHead({ title, lede }: { title: string; lede?: string }) {
  return (
    <header className="ob-pagehead">
      <h1>{title}</h1>
      {lede ? <p>{lede}</p> : null}
    </header>
  );
}

/**
 * One titled card. Every step is a stack of these, so a long form reads as a
 * few named groups rather than forty fields.
 */
export function Panel({
  title,
  lede,
  aside,
  children,
}: {
  title?: string;
  lede?: string;
  /** Top-right of the card — a guidelines link, a count, a toggle. */
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="ob-panel">
      {title ? (
        <div className="ob-panel-head">
          <div>
            <h2>{title}</h2>
            {lede ? <p>{lede}</p> : null}
          </div>
          {aside}
        </div>
      ) : null}
      {children}
    </section>
  );
}
