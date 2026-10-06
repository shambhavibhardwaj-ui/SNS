import { IndianRupee } from 'lucide-react';
import {
  DataTable,
  Money,
  NotSet,
  RatingCell,
  StatusPill,
  type Column,
} from '../../components/dashboard/DataTable';
import {
  getConcessionCandidates, getRestaurantPerformance, HIGH_RATING_MIN_ORDERS,
} from '../../services/adminService';
import {
  adminCustomers,
  adminOrders,
  adminRestaurants,
  improvementPlans,
  ratings,
  serviceFees,
  type AdminCustomerRow,
  type AdminOrderRow,
  type AdminRestaurantRow,
  type ImprovementPlanRow,
  type RatingRow,
  type ServiceFeeRow,
} from '../../data/staffMock';

/**
 * The admin management screens.
 *
 * Each is a column definition plus a row source; the table itself is shared.
 * They live together because they are the same kind of thing — when one grows
 * real filters and mutations it earns its own file.
 */

function Page({
  lede,
  note,
  children,
}: {
  /** Named by the shell header now, so the page no longer prints it. */
  title?: string;
  lede: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="dh">
      <header className="dh-head">
        <p>{lede}</p>
      </header>
      {children}
      <p className="dh-mock-note">{note ?? 'Mock data — shaped like the table it will read from.'}</p>
    </section>
  );
}

/** Row controls exist so the layout is right; they are not wired up yet. */
function RowActions({ labels }: { labels: string[] }) {
  return (
    <span className="dt-actions">
      {labels.map((l) => (
        <button key={l} type="button" className="dt-action" aria-disabled="true" title="Not wired up yet">
          {l}
        </button>
      ))}
    </span>
  );
}

/* --------------------------------------------------------- restaurants -- */

const RESTAURANT_COLUMNS: Column<AdminRestaurantRow>[] = [
  { key: 'name', header: 'Restaurant', cell: (r) => <strong>{r.name}</strong> },
  { key: 'cuisine', header: 'Cuisine', secondary: true, cell: (r) => r.cuisine },
  { key: 'rating', header: 'Rating', cell: (r) => <RatingCell value={r.rating} /> },
  { key: 'delivery', header: 'Delivery option', cell: (r) => r.deliveryOption },
  { key: 'status', header: 'Status', cell: (r) => <StatusPill value={r.status} /> },
  { key: 'actions', header: 'Actions', cell: () => <RowActions labels={['View', 'Edit', 'Disable']} /> },
];

const PERFORMANCE_COLUMNS: Column<ReturnType<typeof getRestaurantPerformance>[number]>[] = [
  { key: 'r', header: 'Restaurant', cell: (r) => <strong>{r.restaurant}</strong> },
  { key: 'rating', header: 'Rating', cell: (r) => <RatingCell value={r.rating} /> },
  { key: 'orders', header: 'Total orders', align: 'end', cell: (r) => r.totalOrders.toLocaleString('en-IN') },
  { key: 'recent', header: 'Recent rating', align: 'end', secondary: true, cell: (r) => (r.recentRating === null ? '—' : <RatingCell value={r.recentRating} />) },
  { key: 'state', header: 'Status', cell: (r) => <StatusPill value={r.state} /> },
];

export function AdminRestaurants({ offboarded = false }: { offboarded?: boolean } = {}) {
  const rows = offboarded
    ? adminRestaurants.filter((r) => r.status === 'Paused')
    : adminRestaurants.filter((r) => r.status !== 'Paused');
  return (
    <Page
      title={offboarded ? 'Offboarded Restaurants' : 'Active Restaurants'}
      lede={
        offboarded
          ? 'Restaurants no longer trading on the platform.'
          : 'Every restaurant currently on the platform, its cuisines and how it delivers.'
      }
    >
      <DataTable
        caption={offboarded ? 'Offboarded restaurants' : 'Active restaurants'}
        columns={RESTAURANT_COLUMNS}
        rows={rows}
        rowKey={(r) => r.name}
        empty="None in this state."
      />

      {/*
        Moved here off the admin home, which was carrying a six-row copy of it.
        It belongs on this page and not on that one: it is the same restaurants
        read by how they are *doing* rather than by what they are, and the
        table above cannot answer that — it has no order count and no recent
        rating. Full list here, where there is room for it.

        Offboarded restaurants are left out: performance is a question about a
        kitchen still taking orders.
      */}
      {offboarded ? null : (
        <>
          <h3 className="dh-sub-head">Performance</h3>
          <p className="dh-block-sub">
            Rating against order volume, and the recent rating beside the stored one.
          </p>
          <DataTable
            caption="Restaurant performance"
            columns={PERFORMANCE_COLUMNS}
            rows={getRestaurantPerformance()}
            rowKey={(r) => r.restaurant}
          />
        </>
      )}
    </Page>
  );
}

/* ----------------------------------------------------------- customers -- */

const CUSTOMER_COLUMNS: Column<AdminCustomerRow>[] = [
  { key: 'name', header: 'Name', cell: (r) => <strong>{r.name}</strong> },
  { key: 'email', header: 'Email', cell: (r) => <span className="dt-mono">{r.email}</span> },
  { key: 'orders', header: 'Orders', align: 'end', cell: (r) => r.orders },
  { key: 'status', header: 'Status', cell: (r) => <StatusPill value={r.status} /> },
  { key: 'joined', header: 'Joined', secondary: true, cell: (r) => r.joined },
];

export function AdminCustomers() {
  return (
    <Page title="Customers" lede="Customer accounts and how much they order.">
      <DataTable
        caption="Customers"
        columns={CUSTOMER_COLUMNS}
        rows={adminCustomers}
        rowKey={(r) => r.email}
      />
    </Page>
  );
}

/* -------------------------------------------------------------- orders -- */

const ORDER_COLUMNS: Column<AdminOrderRow>[] = [
  { key: 'id', header: 'Order', cell: (r) => <span className="dt-mono">{r.id}</span> },
  { key: 'customer', header: 'Customer', cell: (r) => r.customer },
  { key: 'restaurant', header: 'Restaurant', cell: (r) => r.restaurant },
  { key: 'items', header: 'Items', align: 'end', secondary: true, cell: (r) => r.items },
  { key: 'amount', header: 'Amount', align: 'end', cell: (r) => <Money value={r.amount} /> },
  { key: 'delivery', header: 'Delivery service', secondary: true, cell: (r) => r.deliveryService },
  { key: 'status', header: 'Status', cell: (r) => <StatusPill value={r.status} /> },
];

export function AdminOrders() {
  return (
    <Page title="Orders" lede="Every order, with its status and who is delivering it.">
      <DataTable caption="Orders" columns={ORDER_COLUMNS} rows={adminOrders} rowKey={(r) => r.id} />
    </Page>
  );
}

/* ------------------------------------------------------------- ratings -- */

const RATING_COLUMNS: Column<RatingRow>[] = [
  { key: 'restaurant', header: 'Restaurant', cell: (r) => r.restaurant },
  { key: 'customer', header: 'Customer', secondary: true, cell: (r) => r.customer },
  { key: 'rating', header: 'Rating', cell: (r) => <RatingCell value={r.rating} /> },
  { key: 'review', header: 'Review', cell: (r) => <span className="dt-review">{r.review}</span> },
  { key: 'date', header: 'Date', secondary: true, cell: (r) => r.date },
];

export function AdminRatings() {
  return (
    <Page
      title="Ratings & Reviews"
      lede="What customers said. This is the input to RULE-01 and RULE-02."
    >
      <DataTable caption="Ratings and reviews" columns={RATING_COLUMNS} rows={ratings} rowKey={(r, i) => `${r.restaurant}-${i}`} />
    </Page>
  );
}

/* --------------------------------------------------- improvement plans -- */

const PLAN_COLUMNS: Column<ImprovementPlanRow>[] = [
  { key: 'restaurant', header: 'Restaurant', cell: (r) => <strong>{r.restaurant}</strong> },
  { key: 'low', header: 'Low-rated orders', align: 'end', cell: (r) => r.lowRatedOrders },
  { key: 'raised', header: 'Raised', secondary: true, cell: (r) => r.raisedOn },
  { key: 'status', header: 'Status', cell: (r) => <StatusPill value={r.status} /> },
  { key: 'actions', header: 'Plan', cell: () => <RowActions labels={['View plan']} /> },
];

export function AdminImprovementPlans() {
  return (
    <Page
      title="Improvement Plans"
      lede="RULE-01: a restaurant rated below 3★ on more than 5 orders must submit an improvement plan."
      note="Mock data. The plans themselves are not written here — a restaurant drafts one, with AI assistance, and a person reviews it before submission."
    >
      <DataTable
        caption="Improvement plans"
        columns={PLAN_COLUMNS}
        rows={improvementPlans}
        rowKey={(r) => r.restaurant}
      />
    </Page>
  );
}

/* -------------------------------------------------------- service fees -- */

const FEE_COLUMNS: Column<ServiceFeeRow>[] = [
  { key: 'restaurant', header: 'Restaurant', cell: (r) => <strong>{r.restaurant}</strong> },
  { key: 'delivery', header: 'Delivery option', cell: (r) => r.deliveryOption },
  { key: 'fee', header: 'Service fee', cell: (r) => (r.feePercent === null ? <NotSet /> : `${r.feePercent}%`) },
  { key: 'concession', header: 'Concession', cell: (r) => (r.concession === null ? <NotSet /> : r.concession) },
  {
    key: 'earned',
    header: 'RULE-02 met',
    cell: (r) => <StatusPill value={r.concessionEarned ? 'Active' : 'Pending'} />,
  },
  { key: 'from', header: 'Effective from', secondary: true, cell: (r) => r.effectiveFrom },
];

export function AdminServiceFees() {
  return (
    <Page
      title="Service Fees"
      lede="RULE-03/04 set the fee by delivery option. RULE-02 grants a concession for more than 4★ across 10 orders in a week."
      note="Fee percentages and the concession amount read “Not set” because the client has not given us those numbers. They are configurable fields, not invented defaults."
    >
      <DataTable
        caption="Service fees"
        columns={FEE_COLUMNS}
        rows={serviceFees}
        rowKey={(r) => r.restaurant}
      />

      {/*
        Moved here off the admin home. Not a duplicate of the table above: that
        column says whether RULE-02 was met, this says by how much — the
        qualifying orders and the average behind the verdict — which is the
        part an admin needs when someone asks why a restaurant did or did not
        earn it. Derived in adminService from the rating rows, so it cannot
        disagree with the rule.
      */}
      <h3 className="dh-sub-head">Who qualifies this week</h3>
      <ul className="at-list">
        {getConcessionCandidates().map((c) => (
          <li key={c.restaurantId} className="at-row" data-muted={!c.eligible || undefined}>
            <span className="at-icon is-good" aria-hidden="true"><IndianRupee size={17} strokeWidth={2} /></span>
            <span className="at-body">
              <strong>{c.restaurant}</strong>
              <span>
                {c.qualifyingOrders} qualifying {c.qualifyingOrders === 1 ? 'order' : 'orders'} this
                week · average rating {c.averageRating.toFixed(1)}
              </span>
            </span>
            <StatusPill value={c.eligible ? 'Eligible' : 'Not yet'} />
          </li>
        ))}
      </ul>
      <p className="dh-inline-note">
        Above 4★ across {HIGH_RATING_MIN_ORDERS} orders in one week earns the concession. The
        amount is not set — the client has not specified it, so it stays configurable.
      </p>
    </Page>
  );
}

/* ---------------------------------------------------------------- settings -- */
/* Analytics has its own file — it is a page, not a table with a header. */

export function AdminSettings() {
  return (
    <Page
      title="Settings"
      lede="Platform configuration: fee defaults, rule thresholds and role provisioning."
      note="Role changes go through set_user_role() in the database, which requires the caller to already be an admin. That screen is built here when the rest of provisioning is."
    >
      <dl className="ac-facts">
        <div>
          <dt>RULE-01 threshold</dt>
          <dd>Below 3★ on more than 5 orders</dd>
        </div>
        <div>
          <dt>RULE-02 threshold</dt>
          <dd>Above 4★ on 10 orders within a week</dd>
        </div>
        <div>
          <dt>Aggregator fee</dt>
          <dd><NotSet /></dd>
        </div>
        <div>
          <dt>Own-fleet fee</dt>
          <dd><NotSet /></dd>
        </div>
        <div>
          <dt>RULE-02 concession</dt>
          <dd><NotSet /></dd>
        </div>
      </dl>
    </Page>
  );
}
