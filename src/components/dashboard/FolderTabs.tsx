import type { ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import type { NavGroup, DashboardSection } from '../../pages/DashboardShell';

/**
 * Navigation as a drawer of folders.
 *
 * The admin rail was a column of fourteen links. This is the same information
 * as a stack of folders: a tab per section along the top, the pressed one
 * pulled to the front, **and the page itself sitting inside that folder** —
 * which is the part that makes it a folder rather than a tab bar. The closed
 * ones stay visible as coloured edges behind the open card, the way files look
 * in a drawer when one is lifted.
 *
 * **Tabs navigate, they do not just switch.** Each is a `NavLink` to its
 * section's first page, so the URL still says where you are, the back button
 * still works, and a link into `/admin/fees` opens with Performance already
 * forward. A tab strip backed by `useState` would have broken all three.
 *
 * A section with more than one page lists those pages inside the folder,
 * because a folder tab is one level deep and this navigation is two. Fourteen
 * tabs across the top would be a row too narrow to read, which is the rail's
 * old complaint rotated ninety degrees.
 */
export function FolderTabs({
  groups,
  current,
  children,
}: {
  groups: NavGroup[];
  /** The longest-matching nav item, from the shell. */
  current: DashboardSection | undefined;
  /** The page. It renders inside the open folder. */
  children: ReactNode;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeIndex = groups.findIndex((g) => g.items.some((i) => i === current));
  const openIndex = activeIndex === -1 ? 0 : activeIndex;
  const openGroup = groups[openIndex];

  return (
    <div className="ft" style={{ ['--tone' as string]: `var(--ft-${openIndex})` }}>
      {/* One row, scrollable rather than wrapping: wrapped folder tabs lose the
          thing that makes them read as folders — a single row of spines with
          one pulled forward. */}
      <div className="ft-tabs" role="tablist" aria-label="Dashboard sections">
        {groups.map((group, i) => {
          const label = group.title ?? group.items[0].label;
          const Icon = group.Icon ?? group.items[0].Icon;
          const open = i === openIndex;
          return (
            <NavLink
              key={label}
              to={group.items[0].to}
              role="tab"
              aria-selected={open}
              className={`ft-tab${open ? ' is-open' : ''}`}
              /* Left to right, each above the one before it — except the open
                 one, which sits above all of them. */
              style={{ zIndex: open ? groups.length + 1 : i, ['--tone' as string]: `var(--ft-${i})` }}
            >
              <Icon size={15} strokeWidth={2.1} aria-hidden="true" />
              <span>{label}</span>
              <em>{String(group.items.length).padStart(2, '0')}</em>
            </NavLink>
          );
        })}
      </div>

      {/* The folders still in the drawer, as edges behind the open one. Purely
          decorative — every one of them is reachable by its tab above. */}
      <div className="ft-behind" aria-hidden="true">
        {groups.map((group, i) =>
          i === openIndex ? null : (
            <span key={group.title ?? i} style={{ ['--tone' as string]: `var(--ft-${i})` }} />
          ),
        )}
      </div>

      <div className="ft-folder">
        {openGroup.items.length > 1 ? (
          <div className="ft-pages">
            {openGroup.items.map((item) => {
              const on = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <button
                  key={item.to}
                  type="button"
                  className={`ft-page${on ? ' is-on' : ''}`}
                  aria-current={on ? 'page' : undefined}
                  onClick={() => navigate(item.to)}
                >
                  <item.Icon size={14} strokeWidth={2.1} aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </div>
        ) : null}

        {/* The sheet inside the folder. */}
        <div className="ft-sheet">{children}</div>
      </div>
    </div>
  );
}
