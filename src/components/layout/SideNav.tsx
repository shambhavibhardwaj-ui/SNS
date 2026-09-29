import { Home, PanelLeftClose, PanelLeftOpen, ShoppingBag } from 'lucide-react';
import { SlideCursor } from '../ui/slide-tabs';
import { SLIDE_ITEM_ATTR, useSlideCursor } from '../ui/use-slide-cursor';

export interface SideNavProps {
  collapsed: boolean;
  onToggle: () => void;
  /** Home and Explore both return to the city; the rest are stubs for now. */
  onHome: () => void;
  cartCount?: number;
  /** Opens the cart. Null until there is a cart to open. */
  onCart?: (() => void) | null;
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
 * destination has not been built yet are left out rather than
 * wired to nothing, so the demo never implies a working feature.
 */
export function SideNav({ collapsed, onToggle, onHome, onCart = null, cartCount = 0 }: SideNavProps) {
  const items: NavItem[] = [
    /*
     * Only what works. Search, Favorites, Orders and Profile were disabled
     * placeholders, and Explore just repeated Home — six greyed-out rows that
     * filled the panel and led nowhere. Profile also duplicated the account
     * button in the top bar. They come back as they are built.
     */
    { key: 'home', label: 'Home', Icon: Home, onSelect: onHome },
    { key: 'cart', label: 'Cart', Icon: ShoppingBag, onSelect: onCart, badge: cartCount },
  ];

  /*
   * Same sliding pill as the staff rail. It rests on Home — the only item with
   * a current destination — and follows the pointer over the rest, including
   * the stubs: the movement is a hover affordance, not a claim that the item
   * goes anywhere.
   */
  const { setContainer, position, moveTo, rest } = useSlideCursor('home');

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

      <ul className="fc-nav-list" ref={setContainer} onMouseLeave={rest}>
        <SlideCursor position={position} className="fc-nav-cursor" />

        {items.map(({ key, label, Icon, onSelect, badge }) => (
          <li key={key}>
            <button
              type="button"
              className="fc-nav-item"
              onClick={onSelect ?? undefined}
              aria-disabled={onSelect ? undefined : true}
              aria-current={key === 'home' ? 'page' : undefined}
              title={onSelect ? label : `${label} — arrives in a later step`}
              onMouseEnter={(e) => moveTo(e.currentTarget)}
              {...{ [SLIDE_ITEM_ATTR]: key }}
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
