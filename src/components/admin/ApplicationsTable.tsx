import { ArrowDown } from 'lucide-react';
import { DELIVERY_MODEL_LABEL, type RestaurantApplication } from '../../data/admin/types';
import { formatDay } from './formatDay';
import type { SortKey } from '../../hooks/useApplicationQueue';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';

/**
 * The application table.
 *
 * Presentational: it renders whatever rows it is handed. Both the dashboard
 * panel and the full management page use it, so the queue looks the same
 * wherever it appears.
 */
export function ApplicationsTable({
  rows,
  onReview,
  sort,
  onSort,
  showDeliveryModel = false,
  decidedIds,
}: {
  rows: RestaurantApplication[];
  onReview: (application: RestaurantApplication) => void;
  /** Omit both to render without sortable headers. */
  sort?: SortKey;
  onSort?: (key: SortKey) => void;
  showDeliveryModel?: boolean;
  /** Marks rows decided in this session, so the admin can see their own work. */
  decidedIds?: Set<string>;
}) {
  if (!rows.length) {
    return (
      <p className="dt-empty">
        No applications match that. Try another status, or clear the search.
      </p>
    );
  }

  const sortable = (key: SortKey, label: string) =>
    onSort ? (
      <button type="button" className="ap-sort" onClick={() => onSort(key)} aria-pressed={sort === key}>
        {label}
        {sort === key ? <ArrowDown size={12} strokeWidth={2.6} /> : null}
      </button>
    ) : (
      label
    );

  return (
    <div className="dt-wrap">
      <table className="dt">
        <caption className="fc-sr-only">Restaurant applications</caption>
        <thead>
          <tr>
            <th scope="col">{sortable('restaurant', 'Restaurant')}</th>
            <th scope="col">Owner</th>
            <th scope="col" data-secondary>Cuisine</th>
            <th scope="col" data-secondary>Application ID</th>
            {showDeliveryModel ? <th scope="col" data-secondary>Delivery</th> : null}
            <th scope="col">{sortable('newest', 'Submitted')}</th>
            <th scope="col">{sortable('status', 'Status')}</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id} data-decided={decidedIds?.has(a.id) || undefined}>
              <td>
                <strong>{a.restaurantName}</strong>
                {decidedIds?.has(a.id) ? <span className="ap-justdone">updated</span> : null}
              </td>
              <td>{a.ownerName}</td>
              <td data-secondary>
                <span className="ap-cuisines">
                  {a.cuisines.map((c) => (
                    <span key={c} className="ap-cuisine">{c}</span>
                  ))}
                </span>
              </td>
              <td data-secondary><span className="dt-mono">{a.id}</span></td>
              {showDeliveryModel ? (
                <td data-secondary>{DELIVERY_MODEL_LABEL[a.deliveryModel]}</td>
              ) : null}
              <td>{formatDay(a.submittedAt)}</td>
              <td><ApplicationStatusBadge status={a.status} /></td>
              <td>
                <button type="button" className="dt-action is-live" onClick={() => onReview(a)}>
                  {a.status === 'Approved' || a.status === 'Rejected' ? 'View' : 'Review'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

