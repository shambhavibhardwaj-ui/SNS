import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import {
  decideApplication, getDecidedIds, getDecisionLog, getQueueWithDecisions, getVersion, subscribe,
} from '../services/applicationQueue';
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
 * The application queue, filtered, sorted and searchable.
 *
 * The rows come from `services/applicationQueue`, which is shared with the
 * restaurant owner's dashboard — so an application the owner submits appears
 * here, and a decision made here is written back onto their record. Before
 * that, these were two unconnected arrays and neither side could ever hear the
 * other.
 *
 * Subscribed rather than copied into state: the two dashboards are on
 * different routes and must agree. `getVersion` is the snapshot because
 * `useSyncExternalStore` compares by identity, and the row array is rebuilt on
 * every read — returning it would look changed every time and never settle.
 *
 * This hook is still the seam. `decide` becomes a Supabase update and the
 * store's `subscribe` becomes a realtime channel; no component changes.
 */
export function useApplicationQueue() {
  const version = useSyncExternalStore(subscribe, getVersion, getVersion);
  const [filter, setFilter] = useState<StatusFilter>('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');

  /* `version` is the dependency: it changes on every write to the store. */
  const applied: RestaurantApplication[] = useMemo(
    () => getQueueWithDecisions(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );

  const decidedIds = useMemo(
    () => getDecidedIds(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );

  const decisionLog = useMemo(
    () => [...getDecisionLog()].reverse(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
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
    decideApplication(id, status, reason);
  }, []);

  /** Waiting on the admin: anything not yet finally decided. */
  const awaitingAction = useMemo(
    () => applied.filter((a) => a.status === 'Pending' || a.status === 'Under Review').length,
    [applied],
  );

  return {
    rows,
    counts,
    decidedIds,
    decisionLog,
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
