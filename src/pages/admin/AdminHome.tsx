import {
  Bike, ClipboardList, Clock, FileSearch,
  Store, TrendingUp, Users, UtensilsCrossed,
} from 'lucide-react';
import { ApplicationStatusBadge } from '../../components/admin/ApplicationStatusBadge';
import { StatCards } from '../../components/dashboard/StatCard';
import {
  getApplicationStatusCounts, getCustomerTotals, getPlatformOverview,
} from '../../services/adminService';
/* The workforce figures come from the delivery service, which owns them —
   adminService's own delivery summary counts courier *companies*, which is a
   different thing from the riders this card is about. */
import { getDeliveryOverview } from '../../services/deliveryService';

/**
 * The admin home: the figures, and the one chart.
 *
 * It used to carry nine blocks — the application queue, restaurant
 * performance, both rule panels, recent orders, recent customers, a delivery
 * summary and a row of quick actions. Every one of them had its own page in
 * the rail, so the home was a worse copy of the whole dashboard: shorter
 * tables, no filters, no sort, and a second place for the same number to be
 * wrong in.
 *
 * What is left is what a home is for. The eight figures say where the platform
 * is, and the chart says where the applications are — and that chart is the
 * one thing here with nowhere else to live, since the applications page lists
 * rows and does not sum them.
 *
 * Two blocks moved rather than died, because their pages did not already show
 * what they showed: restaurant performance is now on Active Restaurants, and
 * the RULE-02 qualifying counts are on Service Fees. The rest were duplicates
 * and were deleted — a link in the rail is not improved by a shorter copy of
 * its page on the screen before it.
 */
export function AdminHome() {
  const overview = getPlatformOverview();
  const delivery = getDeliveryOverview();
  const customers = getCustomerTotals();

  return (
    <div className="dh">
      {/*
        A bento: eight figures, three rows, 2+4+2.

        The wide cards are not decoration. Two wide, four narrow, two wide fills
        a four-column grid exactly at eight cards, which one wide card cannot —
        it would leave a hole and the row would stop looking deliberate. The
        pairing follows the reading: the two restaurant totals, then the four
        counts of people and queues, then the two order volumes.

        Eight, not nine: four across is the row a person reads at a glance.
        Offboarded moves into the total's supporting line rather than being
        dropped.
      */}
      <StatCards
        variant="bento"
        stats={[
          { label: 'Total restaurants', value: String(overview.totalRestaurants), hint: `all states · ${overview.offboarded} offboarded`, Icon: Store, wide: true },
          { label: 'Active restaurants', value: String(overview.activeRestaurants), hint: 'taking orders', Icon: UtensilsCrossed, wide: true },
          { label: 'Pending applications', value: String(overview.pendingApplications), hint: 'awaiting first look', Icon: FileSearch },
          { label: 'Under review', value: String(overview.underReview), hint: 'being assessed', Icon: Clock },
          { label: 'Total customers', value: overview.totalCustomers.toLocaleString('en-IN'), hint: `${customers.newThisWeek} new this week`, Icon: Users },
          { label: 'Delivery partners', value: String(delivery.totalPartners), hint: `${delivery.activePartners} active · ${delivery.onDelivery} on delivery`, Icon: Bike },
          { label: 'Orders today', value: overview.ordersToday.toLocaleString('en-IN'), Icon: ClipboardList, wide: true },
          { label: 'Orders this week', value: overview.ordersThisWeek.toLocaleString('en-IN'), Icon: TrendingUp, wide: true },
        ]}
      />

      <section className="dh-block">
        <div className="dh-block-head"><h3>Onboarding status</h3></div>
        <StatusDistribution />
      </section>

      <p className="dh-mock-note">
        Figures here are mock data, shaped like the tables they will read from. The two business
        rules are computed from the rating rows rather than stored as flags, so the thresholds
        are doing the work you can see — on Improvement Plans and Service Fees.
      </p>
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
