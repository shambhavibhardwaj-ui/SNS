import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Bell, LogOut, Menu, Search, X, type LucideIcon } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { AccountButton } from '../components/auth/AccountButton';
import { SlideCursor } from '../components/ui/slide-tabs';
import { SLIDE_ITEM_ATTR, useSlideCursor } from '../components/ui/use-slide-cursor';
import { AnimatedDropdown } from '../components/ui/animated-dropdown';

export interface DashboardSection {
  to: string;
  label: string;
  Icon: LucideIcon;
}

export interface NavGroup {
  /** Omitted for a single ungrouped list. */
  title?: string;
  /** Shown beside the title when the group collapses into a section. */
  Icon?: LucideIcon;
  items: DashboardSection[];
}

/**
 * Shared chrome for the staff dashboards.
 *
 * Admin and delivery differ in their navigation and accent, not their layout,
 * so they share this. Deliberately plainer than the city: these are work
 * tools, read at speed.
 *
 * Below 980px the sidebar becomes a drawer rather than shrinking, because a
 * squeezed rail of fourteen links is worse than a button that opens a proper
 * one.
 */
export function DashboardShell({
  title,
  lede,
  kicker,
  groups,
  accent,
  theme,
  showSearch = false,
  children,
}: {
  title: string;
  lede?: string;
  kicker: string;
  groups: NavGroup[];
  accent: string;
  /**
   * Names a palette for this dashboard. The whole recolour lives in one CSS
   * block keyed off it, so a section can have its own colours without a second
   * copy of the shell.
   */
  theme?: string;
  showSearch?: boolean;
  children?: ReactNode;
}) {
  const { profile, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();

  /*
   * The header names the section you are actually in.
   *
   * It used to be a fixed string, so every screen said "Overview" while the
   * page below it said something else — two headings disagreeing. Longest
   * matching nav path wins, so /admin/restaurants/applications picks
   * "Restaurant Applications" rather than the shorter /admin that also
   * prefixes it.
   */
  const items = groups.flatMap((g) => g.items);

  const current = items
    .filter((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0];

  const heading = current?.label ?? title;

  /*
   * The active pill slides between links instead of blinking from one to the
   * next, and follows the pointer on the way. It rests on whichever link the
   * route says is current, so it always ends up telling the truth about where
   * you are.
   */
  const { setContainer, position, moveTo, rest } = useSlideCursor(current?.to);

  /*
   * Which section is open.
   *
   * Twelve links in one column was the complaint, so a section with more than
   * one link collapses; a section with exactly one is its own link and needs
   * no header. The section holding the current page is open by default, and a
   * choice made by hand sticks — until the route moves to a different section,
   * at which point the overrides are dropped and the new section opens. That
   * is why the overrides carry the key they were made under rather than living
   * in an effect that fights the route.
   */
  const groupKey = (group: NavGroup, i: number) => group.title ?? `group-${i}`;

  /*
   * Which section holds the current page.
   *
   * Found from `current` — the longest-matching link — rather than by prefix
   * matching the groups again. `/admin` is a prefix of every admin route, so a
   * fresh scan handed the win to whichever group owned it, and the section you
   * were actually in stayed shut.
   */
  const activeKey = current
    ? (groups
        .map((group, i) => ({ group, key: groupKey(group, i) }))
        .find(({ group }) => group.items.includes(current))?.key ?? null)
    : null;

  const [openState, setOpenState] = useState<{
    key: string | null;
    map: Record<string, boolean>;
  }>({ key: activeKey, map: {} });

  const overrides = openState.key === activeKey ? openState.map : {};
  const isOpen = (key: string) => overrides[key] ?? key === activeKey;
  const toggleGroup = (key: string) =>
    setOpenState({ key: activeKey, map: { ...overrides, [key]: !isOpen(key) } });

  /* The shortest nav path is the section's own index — the one link whose
     description belongs in the header rather than on the page. */
  const homeTo = items.reduce((a, b) => (b.to.length < a.to.length ? b : a)).to;
  const isIndex = !current || current.to === homeTo;

  /* Escape closes the drawer, and it never stays open across a navigation. */
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <div
      className="db"
      data-theme={theme}
      style={{ '--db-accent': accent } as React.CSSProperties}
    >
      {drawerOpen ? (
        <div className="db-scrim" onClick={() => setDrawerOpen(false)} role="presentation" />
      ) : null}

      <aside className="db-rail" data-open={drawerOpen || undefined}>
        <div className="db-brand">
          <span className="db-dot" aria-hidden="true" />
          <span>
            <strong>SNS</strong>
            <em>{kicker}</em>
          </span>
          <button
            type="button"
            className="db-drawer-close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation"
          >
            <X size={17} strokeWidth={2.2} />
          </button>
        </div>

        <nav
          className="db-nav"
          aria-label={`${title} sections`}
          ref={setContainer}
          onMouseLeave={rest}
          /* A section opening moves every link below it, and the height is a
             CSS transition, so the pill re-measures when it finishes. */
          onTransitionEnd={rest}
        >
          <SlideCursor position={position} className="db-nav-cursor" />

          {groups.map((group, i) => {
            const key = groupKey(group, i);

            const link = ({ to, label, Icon }: DashboardSection) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) => `db-nav-item${isActive ? ' is-active' : ''}`}
                onClick={() => setDrawerOpen(false)}
                onMouseEnter={(e) => moveTo(e.currentTarget)}
                /* Names this link for the pill; the hook rests on whichever
                   one matches the current route. */
                {...{ [SLIDE_ITEM_ATTR]: to }}
              >
                <Icon size={16} strokeWidth={2} />
                <span>{label}</span>
              </NavLink>
            );

            /*
             * Flat when there is nothing to collapse *under*: a single link
             * needs no header, and an untitled group has no name to give one
             * (the delivery rail is one such list, and it is short enough to
             * read whole).
             */
            if (!group.title || group.items.length === 1) {
              return (
                <div key={key} className="db-nav-group">
                  {group.items.map(link)}
                </div>
              );
            }

            return (
              <AnimatedDropdown
                key={key}
                label={group.title}
                Icon={group.Icon}
                open={isOpen(key)}
                active={key === activeKey}
                onToggle={() => toggleGroup(key)}
              >
                {group.items.map(link)}
              </AnimatedDropdown>
            );
          })}
        </nav>

        {profile ? (
          <div className="db-rail-foot">
            <span className="db-rail-avatar" aria-hidden="true">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" referrerPolicy="no-referrer" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </span>
            <span className="db-rail-who">
              <strong>{profile.name}</strong>
              <em>{profile.email}</em>
            </span>
            <button
              type="button"
              className="db-rail-out"
              onClick={() => void signOut()}
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={15} strokeWidth={2} />
            </button>
          </div>
        ) : null}
      </aside>

      <div className="db-main">
        <header className="db-top">
          <button
            type="button"
            className="db-burger"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={19} strokeWidth={2} />
          </button>

          <div className="db-top-title">
            <h1 className="db-title">{heading}</h1>
            {/* Only on the index: every other page carries its own. */}
            {lede && isIndex ? <p className="db-lede">{lede}</p> : null}
          </div>

          <div className="db-top-tools">
            {showSearch ? (
              <label className="db-search">
                <Search size={16} strokeWidth={2} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search the platform"
                  aria-label="Search the platform — not wired up yet"
                  disabled
                />
              </label>
            ) : null}

            <button
              type="button"
              className="db-bell"
              aria-disabled="true"
              title="Notifications arrive with real orders"
              aria-label="Notifications"
            >
              <Bell size={17} strokeWidth={2} />
              <span className="db-bell-dot" aria-hidden="true" />
            </button>

            <AccountButton />
          </div>
        </header>

        <div className="db-body">{children ?? <Outlet />}</div>
      </div>
    </div>
  );
}
