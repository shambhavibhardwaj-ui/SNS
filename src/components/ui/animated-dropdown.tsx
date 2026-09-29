import { useId, type ReactNode } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * A labelled section that opens and closes, for navigation.
 *
 * This is the sidebar form of a dropdown: the items open *in flow*, pushing
 * what follows down, rather than floating over the page. A popover is the
 * wrong shape inside a rail that already scrolls — it would be clipped by the
 * scroll container, and it hides the section you just opened behind the one
 * below it.
 *
 * Controlled on purpose. The sidebar needs to open whichever section holds the
 * current page, which it cannot do if each section owns its own state.
 *
 * The open/close is a CSS grid-row transition (`0fr` to `1fr`), which animates
 * to the content's real height without anyone measuring it, and needs no
 * animation library. `visibility` is delayed to the end of the close so the
 * links inside stop taking focus once they are actually hidden.
 */
export interface AnimatedDropdownProps {
  label: string;
  Icon?: LucideIcon;
  open: boolean;
  onToggle: () => void;
  /** True when the current page lives inside this section. */
  active?: boolean;
  children: ReactNode;
  className?: string;
}

export function AnimatedDropdown({
  label,
  Icon,
  open,
  onToggle,
  active,
  children,
  className,
}: AnimatedDropdownProps) {
  const panelId = useId();

  return (
    <div className={cn('nd', className)} data-open={open || undefined}>
      <button
        type="button"
        className="nd-trigger"
        data-active={active || undefined}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        {Icon ? <Icon size={16} strokeWidth={2} aria-hidden="true" /> : null}
        <span className="nd-label">{label}</span>
        <ChevronDown size={15} strokeWidth={2.2} className="nd-chevron" aria-hidden="true" />
      </button>

      <div className="nd-panel" id={panelId} role="group" aria-label={label}>
        <div className="nd-inner">{children}</div>
      </div>
    </div>
  );
}
