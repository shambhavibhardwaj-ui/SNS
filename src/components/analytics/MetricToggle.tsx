/**
 * The segmented control every chart uses to switch metric.
 *
 * Radio semantics rather than buttons: the options are mutually exclusive and
 * arrow keys should move between them, which `role="radiogroup"` gives free.
 */
export interface ToggleOption<T extends string> {
  id: T;
  label: string;
}

export function MetricToggle<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
}: {
  options: ToggleOption<T>[];
  value: T;
  onChange: (next: T) => void;
  label: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="an-toggle" role="radiogroup" aria-label={label} data-size={size}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          className="an-toggle-btn"
          data-on={value === o.id || undefined}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
