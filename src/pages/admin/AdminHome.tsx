import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Archive, Bike, ClipboardList, Clock, FileSearch,
  IndianRupee, Store, TrendingUp, Users, UtensilsCrossed,
} from 'lucide-react';
import { ApplicationsPanel } from '../../components/admin/ApplicationsPanel';
import { ApplicationReview } from '../../components/admin/ApplicationReview';
import { ApplicationStatusBadge } from '../../components/admin/ApplicationStatusBadge';
import { DataTable, Money, RatingCell, StatusPill, type Column } from '../../components/dashboard/DataTable';
import { StatCards } from '../../components/dashboard/StatCard';
import {
  DELIVERY_MODEL_LABEL, type ApplicationStatus, type PlatformCustomer,
  type PlatformOrder, type RestaurantApplication,
} from '../../data/admin/types';
import {
  getApplicationStatusCounts, getConcessionCandidates, getCustomerTotals,
  getDeliveryModelSplit, getDeliveryOverview, getImprovementPlans, getPlatformOverview,
  getRecentCustomers, getRecentOrders, getRestaurantPerformance,
  getRestaurantsRequiringAttention, HIGH_RATING_MIN_ORDERS, LOW_RATING_MIN_ORDERS,
} from '../../services/adminService';

export function AdminHome() {
  const [reviewing, setReviewing] = useState<RestaurantApplication | null>(null);
  const [decisions, setDecisions] = useState<Record<string, ApplicationStatus>>({});

  const overview = getPlatformOverview();
  const attention = getRestaurantsRequiringAttention();
  const concessions = getConcessionCandidates();
  const eligible = concessions.filter((c) => c.eligible);
  const plans = getImprovementPlans();
  const delivery = getDeliveryOverview();
  const split = getDeliveryModelSplit();
  const customers = getCustomerTotals();

  const decide = (id: string, status: ApplicationStatus) => {
    setDecisions((d) => ({ ...d, [id]: status }));
    setReviewing(null);
  };

  return (
    <div className="dh">
      {/* 1 — PLATFORM OVERVIEW */}
      <StatCards
        stats={[
          { label: 'Total restaurants', value: String(overview.totalRestaurants), hint: 'all states', Icon: Store },
          { label: 'Active restaurants', value: String(overview.activeRestaurants), hint: 'taking orders', Icon: UtensilsCrossed },
          { label: 'Pending applications', value: String(overview.pendingApplications), hint: 'awaiting first look', Icon: FileSearch },
          { label: 'Under review', value: String(overview.underReview), hint: 'being assessed', Icon: Clock },
          { label: 'Offboarded', value: String(overview.offboarded), hint: 'no longer trading', Icon: Archive },
          { label: 'Total customers', value: overview.totalCustomers.toLocaleString('en-IN'), hint: `${customers.newThisWeek} new this week`, Icon: Users },
          { label: 'Delivery partners', value: String(overview.totalDeliveryPartners), hint: `${delivery.active} active`, Icon: Bike },
          { label: 'Orders today', value: overview.ordersToday.toLocaleString('en-IN'), Icon: ClipboardList },
          { label: 'Orders this week', value: overview.ordersThisWeek.toLocaleString('en-IN'), Icon: TrendingUp },
        ]}
      />

      {/* 2 — RESTAURANT ONBOARDING (the primary business problem) */}
      <section className="dh-block is-primary">
        <div className="dh-block-head">
          <div>
            <h3>Restaurant Onboarding</h3>
            <p className="dh-block-sub">Review and manage restaurant applications.</p>
          </div>
          <Link to="/admin/restaurants/applications">View all applications</Link>
        </div>
        <ApplicationsPanel onReview={setReviewing} />
      </section>

      {/* 3 — STATUS DISTRIBUTION */}
      <section className="dh-block">
        <div className="dh-block-head"><h3>Onboarding status</h3></div>
        <StatusDistribution />
      </section>

      {/* 4 — RESTAURANT PERFORMANCE */}
      <section className="dh-block">
        <div className="dh-block-head">
          <h3>Restaurant performance</h3>
          <Link to="/admin/restaurants/active">View all</Link>
        </div>
        <DataTable
          caption="Restaurant performance"
          columns={PERFORMANCE_COLUMNS}
          rows={getRestaurantPerformance().slice(0, 6)}
          rowKey={(r) => r.restaurant}
        />
      </section>

      {/* 5 — LOW RATING ALERTS (RULE-01) */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Restaurants requiring attention</h3>
            <p className="dh-block-sub">
              Below 3★ on more than {LOW_RATING_MIN_ORDERS} orders — an improvement plan is required.
            </p>
          </div>
          <Link to="/admin/improvement-plans">View improvement plans</Link>
        </div>

        {attention.length ? (
          <ul className="at-list">
            {attention.map((a) => (
              <li key={a.restaurantId} className="at-row">
                <span className="at-icon" aria-hidden="true"><AlertTriangle size={17} strokeWidth={2} /></span>
                <span className="at-body">
                  <strong>{a.restaurant}</strong>
                  <span>{a.lowRatedOrders} orders below 3 stars</span>
                </span>
                <StatusPill value={a.plan?.status ?? 'Plan Required'} />
                <Link to="/admin/improvement-plans" className="dt-action is-live">
                  {a.plan && a.plan.status !== 'Plan Required' ? 'View plan' : 'View restaurant'}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="dt-empty">No restaurant is over the threshold.</p>
        )}

        <div className="at-plans">
          {plans.map((p) => (
            <span key={p.restaurantId} className="at-plan">
              <strong>{p.restaurant}</strong>
              <StatusPill value={p.status} />
            </span>
          ))}
        </div>
      </section>

      {/* 6 — SERVICE FEE CONCESSION (RULE-02) */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Service fee opportunities</h3>
            <p className="dh-block-sub">
              Above 4★ across {HIGH_RATING_MIN_ORDERS} orders in one week earns a concession.
            </p>
          </div>
          <Link to="/admin/fees">Service fees</Link>
        </div>

        <ul className="at-list">
          {concessions.slice(0, 4).map((c) => (
            <li key={c.restaurantId} className="at-row" data-muted={!c.eligible || undefined}>
              <span className="at-icon is-good" aria-hidden="true"><IndianRupee size={17} strokeWidth={2} /></span>
              <span className="at-body">
                <strong>{c.restaurant}</strong>
                <span>
                  {c.qualifyingOrders} qualifying {c.qualifyingOrders === 1 ? 'order' : 'orders'} this week ·
                  average rating {c.averageRating.toFixed(1)}
                </span>
              </span>
              <StatusPill value={c.eligible ? 'Eligible' : 'Not yet'} />
              <button type="button" className="dt-action" aria-disabled="true" title="Fee review is built with Service Fees">
                Review
              </button>
            </li>
          ))}
        </ul>
        <p className="dh-inline-note">
          {eligible.length} of {concessions.length} restaurants meet the condition. The concession
          amount is not set — the client has not specified it, so it stays configurable.
        </p>
      </section>

      {/* 7 — ORDER ACTIVITY */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Order activity</h3>
            <p className="dh-block-sub">
              {overview.ordersToday.toLocaleString('en-IN')} today ·
              {' '}{overview.ordersThisWeek.toLocaleString('en-IN')} this week
            </p>
          </div>
          <Link to="/admin/orders">View orders</Link>
        </div>
        <DataTable caption="Recent orders" columns={ORDER_COLUMNS} rows={getRecentOrders()} rowKey={(r) => r.id} />
      </section>

      {/* 8 — DELIVERY OVERVIEW */}
      <section className="dh-block">
        <div className="dh-block-head">
          <h3>Delivery overview</h3>
          <Link to="/admin/delivery-partners">Delivery partners</Link>
        </div>
        <div className="dh-split">
          <StatCards
            stats={[
              { label: 'Delivery partners', value: String(delivery.total), Icon: Bike },
              { label: 'Active partners', value: String(delivery.active), Icon: Bike },
              { label: 'Out for delivery', value: String(delivery.outForDelivery), Icon: ClipboardList },
            ]}
          />
          <div className="dm-split">
            <p className="dm-title">Delivery model</p>
            {split.map(({ model, count }) => {
              const total = split.reduce((s, x) => s + x.count, 0);
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={model} className="dm-row">
                  <span className="dm-label">{DELIVERY_MODEL_LABEL[model]}</span>
                  <span className="dm-bar"><span style={{ width: `${pct}%` }} data-model={model} /></span>
                  <span className="dm-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9 — CUSTOMERS */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Customers</h3>
            <p className="dh-block-sub">
              {customers.total.toLocaleString('en-IN')} total · {customers.newThisWeek} new ·
              {' '}{customers.active.toLocaleString('en-IN')} active
            </p>
          </div>
          <Link to="/admin/customers">View all customers</Link>
        </div>
        <DataTable caption="Recent customers" columns={CUSTOMER_COLUMNS} rows={getRecentCustomers()} rowKey={(r) => r.id} />
      </section>

      {/* QUICK ACTIONS */}
      <section className="dh-block">
        <div className="dh-block-head"><h3>Quick actions</h3></div>
        <div className="dh-actions">
          <Link to="/admin/restaurants/applications" className="dh-action is-primary">Review applications</Link>
          <Link to="/admin/restaurants/active" className="dh-action">View restaurants</Link>
          <Link to="/admin/orders" className="dh-action">View orders</Link>
          <Link to="/admin/customers" className="dh-action">View customers</Link>
          <Link to="/admin/delivery-partners" className="dh-action">View delivery partners</Link>
          <Link to="/admin/improvement-plans" className="dh-action">View improvement plans</Link>
        </div>
      </section>

      <p className="dh-mock-note">
        Rows and figures here are mock data, shaped like the tables they will read from. The two
        business rules are computed from the rating rows rather than stored as flags, so the
        thresholds are doing the work you can see.
      </p>

      {reviewing ? (
        <ApplicationReview
          application={{ ...reviewing, status: decisions[reviewing.id] ?? reviewing.status }}
          onClose={() => setReviewing(null)}
          onDecide={decide}
        />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------ pieces -- */

function StatusDistribution() {
  const counts = getApplicationStatusCounts();
  const total = counts.reduce((s, c) => s + c.count, 0);
  return (
    <div className="sd">
      <div className="sd-bar" role="img" aria-label="Applications by status">
        {counts.map(({ status, count }) => (
          <span key={status} data-status={status} style={{ flexGrow: count }} title={`${status}: ${count}`} />
        ))}
      </div>
      <ul className="sd-key">
        {counts.map(({ status, count }) => (
          <li key={status}>
            <span className="sd-dot" data-status={status} aria-hidden="true" />
            <ApplicationStatusBadge status={status} />
            <strong>{count}</strong>
            <em>{Math.round((count / total) * 100)}%</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

const PERFORMANCE_COLUMNS: Column<ReturnType<typeof getRestaurantPerformance>[number]>[] = [
  { key: 'r', header: 'Restaurant', cell: (r) => <strong>{r.restaurant}</strong> },
  { key: 'rating', header: 'Rating', cell: (r) => <RatingCell value={r.rating} /> },
  { key: 'orders', header: 'Total orders', align: 'end', cell: (r) => r.totalOrders.toLocaleString('en-IN') },
  { key: 'recent', header: 'Recent rating', align: 'end', secondary: true, cell: (r) => (r.recentRating === null ? '—' : <RatingCell value={r.recentRating} />) },
  { key: 'state', header: 'Status', cell: (r) => <StatusPill value={r.state} /> },
];

const ORDER_COLUMNS: Column<PlatformOrder>[] = [
  { key: 'id', header: 'Order ID', cell: (r) => <span className="dt-mono">{r.id}</span> },
  { key: 'restaurant', header: 'Restaurant', cell: (r) => r.restaurant },
  { key: 'customer', header: 'Customer', secondary: true, cell: (r) => r.customer },
  { key: 'amount', header: 'Amount', align: 'end', cell: (r) => <Money value={r.amount} /> },
  { key: 'delivery', header: 'Delivery option', secondary: true, cell: (r) => DELIVERY_MODEL_LABEL[r.deliveryModel] },
  { key: 'status', header: 'Status', cell: (r) => <StatusPill value={r.status} /> },
];

const CUSTOMER_COLUMNS: Column<PlatformCustomer>[] = [
  { key: 'name', header: 'Customer', cell: (r) => <strong>{r.name}</strong> },
  { key: 'email', header: 'Email', cell: (r) => <span className="dt-mono">{r.email}</span> },
  { key: 'orders', header: 'Orders', align: 'end', cell: (r) => r.orders },
  { key: 'joined', header: 'Joined', secondary: true, cell: (r) => r.joinedAt },
  { key: 'status', header: 'Status', cell: (r) => <StatusPill value={r.status} /> },
];
