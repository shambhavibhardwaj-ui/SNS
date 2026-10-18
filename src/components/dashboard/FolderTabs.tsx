import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import type { NavGroup, DashboardSection } from '../../pages/DashboardShell';

/**
 * Navigation as a stack of folder tabs.
 *
 * The admin rail was a column of fourteen links in collapsible sections. This
 * is the same information as a row of folders: one tab per section, the open
 * one brought to the front and joined to the panel below it, so the tab you
 * pressed and the content you get are visibly one object.
 *
 * **Tabs navigate, they do not just switch.** Each is a `NavLink` to its
 * section's first page, so the URL still says where you are, the back button
 * still works, and a link into `/admin/fees` still opens with Performance
 * already at the front. A tab strip backed by `useState` would have broken all
 * three.
 *
 * A section with more than one page shows those pages as a second row inside
 * the folder, because a folder tab is one level deep and this navigation is
 * two. Putting all fourteen across the top would be a row of tabs too narrow
 * to read, which is the problem the rail already had in a different direction.
 */
export function FolderTabs({
  groups,
  current,
}: {
  groups: NavGroup[];
  /** The longest-matching nav item, from the shell. */
  current: DashboardSection | undefined;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeIndex = groups.findIndex((g) => g.items.some((i) => i === current));
  const openIndex = activeIndex === -1 ? 0 : activeIndex;
  const openGroup = groups[openIndex];

  return (
    <div className="ft">
      {/*
        One row, scrollable rather than wrapping. Wrapped folder tabs lose the
        thing that makes them read as folders — a single row of spines with one
        pulled forward.
      */}
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
              /* Stacked left-to-right, so a tab further right sits above the
                 one before it — except the open one, which sits above all. */
              style={{ zIndex: open ? groups.length + 1 : i, ['--tone' as string]: `var(--ft-${i})` }}
            >
              <Icon size={15} strokeWidth={2.1} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="ft-folder" style={{ ['--tone' as string]: `var(--ft-${openIndex})` }}>
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
      </div>
    </div>
  );
}
