import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Bell, Search, type LucideIcon } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { AccountButton } from '../components/auth/AccountButton';

export interface DashboardSection {
  to: string;
  label: string;
  Icon: LucideIcon;
}

/**
 * Shared chrome for the staff dashboards.
 *
 * Admin and delivery differ only in their sections and accent, so they share
 * one shell rather than two near-identical layouts. Deliberately plainer than
 * Food City: these are work tools, not the discovery experience.
 */
export function DashboardShell({
  title,
  kicker,
  sections,
  accent,
  showSearch = false,
  children,
}: {
  title: string;
  kicker: string;
  sections: DashboardSection[];
  accent: string;
  /** Admin gets a search field; delivery does not need one. */
  showSearch?: boolean;
  children?: ReactNode;
}) {
  const { profile } = useAuth();

  return (
    <div className="db" style={{ '--db-accent': accent } as React.CSSProperties}>
      <aside className="db-rail">
        <div className="db-brand">
          <span className="db-dot" aria-hidden="true" />
          <span>
            <strong>Food City</strong>
            <em>{kicker}</em>
          </span>
        </div>

        <nav className="db-nav" aria-label={`${title} sections`}>
          {sections.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) => `db-nav-item${isActive ? ' is-active' : ''}`}
            >
              <Icon size={17} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {profile ? (
          <p className="db-whoami">
            Signed in as <strong>{profile.email}</strong>
          </p>
        ) : null}
      </aside>

      <div className="db-main">
        <header className="db-top">
          <h1 className="db-title">{title}</h1>

          <div className="db-top-tools">
            {showSearch ? (
              <label className="db-search">
                <Search size={16} strokeWidth={2} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search restaurants, customers, orders"
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
