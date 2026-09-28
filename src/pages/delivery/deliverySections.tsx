import { DataTable, Money, StatusPill, type Column } from '../../components/dashboard/DataTable';
import { StatCards } from '../../components/dashboard/StatCard';
import { CalendarDays, IndianRupee, TrendingUp } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import {
  completedDeliveries,
  deliveryJobs,
  earnings,
  type CompletedDelivery,
  type DeliveryJob,
  type EarningRow,
} from '../../data/staffMock';

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

/* ----------------------------------------------------- assigned orders -- */

const ASSIGNED_COLUMNS: Column<DeliveryJob>[] = [
  { key: 'id', header: 'Order', cell: (r) => <span className="dt-mono">{r.id}</span> },
  { key: 'restaurant', header: 'Restaurant', cell: (r) => r.restaurant },
  { key: 'customer', header: 'Customer', secondary: true, cell: (r) => r.customer },
  { key: 'distance', header: 'Distance', align: 'end', cell: (r) => `${r.distanceKm.toFixed(1)} km` },
  { key: 'status', header: 'Status', cell: (r) => <StatusPill value={r.stage} /> },
  {
    key: 'action',
    header: 'Action',
    cell: () => (
      <button type="button" className="dt-action is-primary" aria-disabled="true" title="Accepting is wired up on the Active Deliveries screen">
        Accept
      </button>
    ),
  },
];

export function AssignedOrders() {
  const assigned = deliveryJobs.filter((j) => j.stage === 'Assigned');
  return (
    <Page title="Assigned Orders" lede="Handed to you and not yet picked up.">
      <DataTable
        caption="Assigned orders"
        columns={ASSIGNED_COLUMNS}
        rows={assigned}
        rowKey={(r) => r.id}
        empty="Nothing assigned right now."
      />
    </Page>
  );
}

/* ------------------------------------------------ completed deliveries -- */

const COMPLETED_COLUMNS: Column<CompletedDelivery>[] = [
  { key: 'id', header: 'Order', cell: (r) => <span className="dt-mono">{r.id}</span> },
  { key: 'restaurant', header: 'Restaurant', cell: (r) => r.restaurant },
  { key: 'customer', header: 'Customer', secondary: true, cell: (r) => r.customer },
  { key: 'date', header: 'Date', cell: (r) => r.date },
  { key: 'completed', header: 'Completed', secondary: true, cell: (r) => r.completedAt },
  { key: 'amount', header: 'Amount', align: 'end', cell: (r) => <Money value={r.amount} /> },
];

export function CompletedDeliveries() {
  return (
    <Page title="Completed Deliveries" lede="Your finished runs.">
      <DataTable
        caption="Completed deliveries"
        columns={COMPLETED_COLUMNS}
        rows={completedDeliveries}
        rowKey={(r) => r.id}
      />
    </Page>
  );
}

/* ------------------------------------------------------------ earnings -- */

const LEDGER_COLUMNS: Column<EarningRow>[] = [
  { key: 'date', header: 'Date', cell: (r) => r.date },
  { key: 'deliveries', header: 'Deliveries', align: 'end', cell: (r) => r.deliveries },
  { key: 'amount', header: 'Amount', align: 'end', cell: (r) => <Money value={r.amount} /> },
  { key: 'note', header: 'Note', secondary: true, cell: (r) => r.note || '—' },
];

export function Earnings() {
  return (
    <Page
      title="Earnings"
      lede="What you have earned, and the runs behind it."
      note="Mock figures. Rates are not set — the client has not given us delivery payment terms."
    >
      <StatCards
        stats={[
          { label: "Today's earnings", value: `₹${earnings.today.toLocaleString('en-IN')}`, Icon: IndianRupee },
          { label: 'This week', value: `₹${earnings.week.toLocaleString('en-IN')}`, Icon: CalendarDays },
          { label: 'This month', value: `₹${earnings.month.toLocaleString('en-IN')}`, Icon: TrendingUp },
        ]}
      />
      <section className="dh-block">
        <div className="dh-block-head">
          <h3>Transactions</h3>
        </div>
        <DataTable
          caption="Earnings by day"
          columns={LEDGER_COLUMNS}
          rows={earnings.ledger}
          rowKey={(r) => r.date}
        />
      </section>
    </Page>
  );
}

/* ------------------------------------------------------------- profile -- */

export function DeliveryProfile() {
  const { profile } = useAuth();
  if (!profile) return null;

  return (
    <Page
      title="Profile"
      lede="Your details, taken from the Google account you signed in with."
      note="Availability is not wired up yet; it will move to the profile record when shifts are built."
    >
      <dl className="ac-facts">
        <div>
          <dt>Name</dt>
          <dd>{profile.name}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{profile.email}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd className="ac-role">{profile.role}</dd>
        </div>
        <div>
          <dt>Delivery service</dt>
          <dd>QuickDrop</dd>
        </div>
        <div>
          <dt>Availability</dt>
          <dd>
            <StatusPill value="Active" />
          </dd>
        </div>
      </dl>
    </Page>
  );
}
