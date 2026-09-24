import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { listApplications } from '../../services/adminService';
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type RestaurantApplication,
} from '../../data/admin/types';
import { ApplicationsTable } from './ApplicationsTable';

type Filter = ApplicationStatus | 'All';
const FILTERS: Filter[] = ['All', ...APPLICATION_STATUSES];

/**
 * The restaurant onboarding queue.
 *
 * The primary business problem of the platform, so it gets the most room on
 * the dashboard. Filtering and searching go through adminService rather than
 * happening here, so the same query becomes SQL later.
 */
export function ApplicationsPanel({
  onReview,
  limit,
}: {
  onReview: (application: RestaurantApplication) => void;
  /** Omit to show the whole queue. */
  limit?: number;
}) {
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');

  const rows = useMemo(
    () => listApplications({ status: filter, search }),
    [filter, search],
  );
  const shown = limit ? rows.slice(0, limit) : rows;

  return (
    <div className="ap">
      <div className="ap-controls">
        <div className="ap-search">
          <Search size={16} strokeWidth={2} aria-hidden="true" />
          <input
            type="search"
            value={search}
            placeholder="Search restaurant, owner, application ID…"
            aria-label="Search applications by restaurant, owner, application ID or phone"
            onChange={(e) => setSearch(e.target.value)}
          />
          {search ? (
            <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
              <X size={14} strokeWidth={2.4} />
            </button>
          ) : null}
        </div>

        <div className="ap-filters" role="tablist" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              className="ap-filter"
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <p className="ap-count" role="status">
        {rows.length} {rows.length === 1 ? 'application' : 'applications'}
        {filter !== 'All' ? ` · ${filter}` : ''}
      </p>

      <ApplicationsTable rows={shown} onReview={onReview} />
    </div>
  );
}
