import {
  Heart,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShoppingBag,
  User,
} from 'lucide-react';

export interface SideNavProps {
  collapsed: boolean;
  onToggle: () => void;
  /** Items beyond Home are stubs until their phases land. */
  onHome: () => void;
  cartCount?: number;
}

interface NavItem {
  key: string;
  label: string;
  Icon: typeof Home;
  /** Null while the destination does not exist yet. */
  onSelect: (() => void) | null;
  badge?: number;
}

/**
 * Primary navigation for the city.
 *
 * Collapses to an icon rail so the city gets the width back. Items whose
 * destination has not been built yet are marked `aria-disabled` rather than
 * wired to nothing, so the demo never implies a working feature.
 */
export function SideNav({ collapsed, onToggle, onHome, cartCount = 0 }: SideNavProps) {
  const items: NavItem[] = [
    { key: 'home', label: 'Home', Icon: Home, onSelect: onHome },
    { key: 'search', label: 'Search', Icon: Search, onSelect: null },
    { key: 'favorites', label: 'Favorites', Icon: Heart, onSelect: null },
    { key: 'cart', label: 'Cart', Icon: ShoppingBag, onSelect: null, badge: cartCount },
    { key: 'profile', label: 'Profile', Icon: User, onSelect: null },
  ];

  return (
    <nav className="fc-nav" aria-label="Main">
      <button
        type="button"
        className="fc-nav-toggle"
        onClick={onToggle}
        aria-expanded={!collapsed}
        title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
      >
        {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        <span className="fc-nav-label">Collapse</span>
      </button>

      <ul className="fc-nav-list">
        {items.map(({ key, label, Icon, onSelect, badge }) => (
          <li key={key}>
            <button
              type="button"
              className="fc-nav-item"
              onClick={onSelect ?? undefined}
              aria-disabled={onSelect ? undefined : true}
              aria-current={key === 'home' ? 'page' : undefined}
              title={onSelect ? label : `${label} — arrives in a later step`}
            >
              <span className="fc-nav-icon">
                <Icon size={18} strokeWidth={2} />
                {badge ? <span className="fc-nav-badge">{badge}</span> : null}
              </span>
              <span className="fc-nav-label">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
