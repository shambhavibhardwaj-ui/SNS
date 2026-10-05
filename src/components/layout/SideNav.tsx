import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export interface SideNavProps {
  collapsed: boolean;
  onToggle: () => void;
}

/**
 * The city sidebar's one control: collapse.
 *
 * Home and Cart used to be here. They moved to the top bar, which is the right
 * place for them — they are true on every screen, while this panel is about
 * the map it sits beside. What is left is the toggle that gives the city its
 * width back, and the district rail underneath.
 *
 * The sliding pill went with them. It existed to move between two rows; one
 * button does not need a cursor to tell you which one you are on.
 */
export function SideNav({ collapsed, onToggle }: SideNavProps) {
  return (
    <nav className="fc-nav" aria-label="City panel">
      <button
        type="button"
        className="fc-nav-toggle"
        onClick={onToggle}
        aria-expanded={!collapsed}
        title={collapsed ? 'Expand the panel' : 'Collapse the panel'}
      >
        {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        <span className="fc-nav-label">Collapse</span>
      </button>
    </nav>
  );
}
