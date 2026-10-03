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

/**
 * The hand-off at the foot of every step.
 *
 * One button, in one place, doing one thing: save what is on this screen and
 * move to the next step. Before this each step ended differently — the details
 * form saved and stayed put, documents and delivery had no ending at all — so
 * finishing a step meant going back to the rail and working out which link was
 * next, which is exactly the job the rail is supposed to do *for* you.
 *
 * `disabled` is a courtesy, not a rule: every step's own guard still runs, and
 * the submit step re-checks readiness in the service. A button that cannot be
 * pressed should still say why, which is what `reason` is for.
 */
export function StepFooter({
  label = 'Save and continue',
  onContinue,
  disabled = false,
  reason,
  note,
}: {
  label?: string;
  onContinue: () => void;
  disabled?: boolean;
  /** Shown beside the button when it is disabled. */
  reason?: string;
  /** Shown either way — a standing caveat about this step. */
  note?: string;
}) {
  return (
    <div className="ob-footer">
      <button
        type="button"
        className="ob-save"
        onClick={onContinue}
        disabled={disabled}
        title={disabled ? reason : undefined}
      >
        {label}
      </button>
      {disabled && reason ? <p className="ob-footer-why">{reason}</p> : null}
      {note ? <p className="ob-note">{note}</p> : null}
    </div>
  );
}
