import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { AccountButton } from '../components/auth/AccountButton';

export interface DashboardSection {
  to: string;
  label: string;
  Icon: LucideIcon;
  /** Shown on the placeholder page until the section is built. */
  blurb: string;
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
  children,
}: {
  title: string;
  kicker: string;
  sections: DashboardSection[];
  accent: string;
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
          <AccountButton />
        </header>
        <div className="db-body">{children ?? <Outlet />}</div>
      </div>
    </div>
  );
}

/** Stands in for a section that has not been built yet. */
export function SectionPlaceholder({
  title,
  blurb,
  Icon,
}: {
  title: string;
  blurb: string;
  Icon: LucideIcon;
}) {
  return (
    <section className="db-placeholder">
      <span className="db-placeholder-icon" aria-hidden="true">
        <Icon size={22} strokeWidth={1.8} />
      </span>
      <h2>{title}</h2>
      <p>{blurb}</p>
      <p className="db-placeholder-note">
        The route, the guard and the navigation are in place. This screen is next.
      </p>
    </section>
  );
}
