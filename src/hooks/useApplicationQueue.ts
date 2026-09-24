import { useCallback, useMemo, useState } from 'react';
import { restaurantApplications } from '../data/admin/applications';
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type RestaurantApplication,
} from '../data/admin/types';

export type StatusFilter = ApplicationStatus | 'All';
export type SortKey = 'newest' | 'oldest' | 'restaurant' | 'status';

export interface Decision {
  status: ApplicationStatus;
  reason?: string;
  decidedAt: string;
}

/**
 * The application queue, with the decisions an admin has made in this session.
 *
 * Decisions are held here rather than mutating the mock array, so the seed data
 * stays a fixture and the table reflects what the admin just did. This hook is
 * the seam: `decide` becomes a Supabase update and `rows` becomes a query, and
 * nothing in the components changes.
 */
export function useApplicationQueue() {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [filter, setFilter] = useState<StatusFilter>('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');

  /** Seed rows with any decision made since the page loaded. */
  const applied: RestaurantApplication[] = useMemo(
    () =>
      restaurantApplications.map((a) => {
        const d = decisions[a.id];
        return d ? { ...a, status: d.status, reviewNote: d.reason ?? a.reviewNote } : a;
      }),
    [decisions],
  );

  const counts = useMemo(() => {
    const map = new Map<StatusFilter, number>([['All', applied.length]]);
    for (const s of APPLICATION_STATUSES) {
      map.set(s, applied.filter((a) => a.status === s).length);
    }
    return map;
  }, [applied]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matched = applied
      .filter((a) => filter === 'All' || a.status === filter)
      .filter((a) =>
        !q
          ? true
          : [a.restaurantName, a.ownerName, a.id, a.phone].join(' ').toLowerCase().includes(q),
      );

    const sorted = [...matched];
    switch (sort) {
      case 'oldest':
        sorted.sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
        break;
      case 'restaurant':
        sorted.sort((a, b) => a.restaurantName.localeCompare(b.restaurantName));
        break;
      case 'status':
        sorted.sort((a, b) => a.status.localeCompare(b.status));
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    }
    return sorted;
  }, [applied, filter, search, sort]);

  const decide = useCallback((id: string, status: ApplicationStatus, reason?: string) => {
    setDecisions((d) => ({
      ...d,
      [id]: { status, reason, decidedAt: new Date().toISOString() },
    }));
  }, []);

  /** Waiting on the admin: anything not yet finally decided. */
  const awaitingAction = useMemo(
    () => applied.filter((a) => a.status === 'Pending' || a.status === 'Under Review').length,
    [applied],
  );

  return {
    rows,
    counts,
    decisions,
    awaitingAction,
    filter,
    setFilter,
    search,
    setSearch,
    sort,
    setSort,
    decide,
  };
}
