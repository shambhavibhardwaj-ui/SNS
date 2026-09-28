import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { ApplicationReview } from '../../components/admin/ApplicationReview';
import { ApplicationsTable } from '../../components/admin/ApplicationsTable';
import {
  APPLICATION_STATUSES,
  DELIVERY_MODEL_LABEL,
  type RestaurantApplication,
} from '../../data/admin/types';
import {
  useApplicationQueue,
  type SortKey,
  type StatusFilter,
} from '../../hooks/useApplicationQueue';

const TABS: StatusFilter[] = ['All', ...APPLICATION_STATUSES];

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'restaurant', label: 'Restaurant A–Z' },
  { key: 'status', label: 'Status' },
];

/**
 * Restaurant Application Management.
 *
 * The dashboard shows the queue; this is where it is worked through. Decisions
 * made here update the table and the tab counts immediately, so an admin can
 * see the queue shrink rather than wondering whether the click registered.
 */
export function RestaurantApplications() {
  const {
    rows, counts, decisions, awaitingAction,
    filter, setFilter, search, setSearch, sort, setSort, decide,
  } = useApplicationQueue();

  const [reviewing, setReviewing] = useState<RestaurantApplication | null>(null);
  const decidedIds = new Set(Object.keys(decisions));

  return (
    <section className="dh">
      <header className="dh-head">
        <p>
          Review and manage restaurant applications.
          {awaitingAction > 0 ? (
            <>
              {' '}<strong>{awaitingAction}</strong>{' '}
              {awaitingAction === 1 ? 'is' : 'are'} waiting on you.
            </>
          ) : (
            ' Nothing is waiting on you.'
          )}
        </p>
      </header>

      {/* Status tabs carry their counts, so the shape of the queue is visible
          without opening each filter. */}
      <div className="aq-tabs" role="tablist" aria-label="Filter applications by status">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={filter === t}
            className="aq-tab"
            onClick={() => setFilter(t)}
          >
            {t}
            <span className="aq-tab-count">{counts.get(t) ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="aq-controls">
        <div className="ap-search">
          <Search size={16} strokeWidth={2} aria-hidden="true" />
          <input
            type="search"
            value={search}
            placeholder="Search restaurant, owner, application ID…"
            aria-label="Search by restaurant, owner, application ID or phone"
            onChange={(e) => setSearch(e.target.value)}
          />
          {search ? (
            <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
              <X size={14} strokeWidth={2.4} />
            </button>
          ) : null}
        </div>

        <label className="aq-sort">
          <span className="fc-sr-only">Sort applications</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </label>
      </div>

      <p className="ap-count" role="status">
        Showing {rows.length} of {counts.get('All')} {counts.get('All') === 1 ? 'application' : 'applications'}
        {filter !== 'All' ? ` · ${filter}` : ''}
        {search ? ` · matching “${search}”` : ''}
      </p>

      <ApplicationsTable
        rows={rows}
        onReview={setReviewing}
        sort={sort}
        onSort={setSort}
        showDeliveryModel
        decidedIds={decidedIds}
      />

      {decidedIds.size ? (
        <div className="aq-log">
          <h3>Decisions this session</h3>
          <ul>
            {Object.entries(decisions).map(([id, d]) => (
              <li key={id}>
                <span className="dt-mono">{id}</span>
                <strong>{d.status}</strong>
                {d.reason ? <em>“{d.reason}”</em> : null}
              </li>
            ))}
          </ul>
          <p>
            Held in this page only — decisions are not written back yet. This is where the
            Supabase update goes.
          </p>
        </div>
      ) : null}

      <p className="dh-mock-note">
        Applications are mock rows shaped like the <code>restaurant_applications</code> table.
        A restaurant may register several cuisines — each gets its own menu — and its delivery
        model ({DELIVERY_MODEL_LABEL.aggregator} or {DELIVERY_MODEL_LABEL.own_staff}) determines
        which service fee structure applies. The rates themselves are not set; the client has not
        provided them.
      </p>

      {reviewing ? (
        <ApplicationReview
          application={rows.find((r) => r.id === reviewing.id) ?? reviewing}
          onClose={() => setReviewing(null)}
          onDecide={(id, status, reason) => {
            decide(id, status, reason);
            setReviewing(null);
          }}
        />
      ) : null}
    </section>
  );
}
