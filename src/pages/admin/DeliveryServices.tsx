import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bike, CalendarClock, CheckCircle2, ClipboardList, Clock, IndianRupee,
  RotateCcw, ShieldCheck, ShieldAlert, Star, UserCheck, UserMinus, Users,
} from 'lucide-react';
import { DataTable, RatingCell, StatusPill, type Column } from '../../components/dashboard/DataTable';
import { StatCards } from '../../components/dashboard/StatCard';
import { BarChart } from '../../components/analytics/BarChart';
import { DonutChart } from '../../components/analytics/DonutChart';
import { FlowDiagram } from '../../components/analytics/FlowDiagram';
import { LineChart } from '../../components/analytics/LineChart';
import { MetricToggle } from '../../components/analytics/MetricToggle';
import { formatCount, formatMoney, formatPercent } from '../../components/analytics/format';
import { DeliveryPartnerDetail } from '../../components/admin/DeliveryPartnerDetail';
import { INSURANCE_STATUSES, PARTNER_STATUSES } from '../../data/deliveryData';
import type { InsuranceStatus, PartnerStatus } from '../../data/deliveryData';
import {
  BASE_MONTHLY_SALARY, DEFAULT_PARTNER_FILTERS, filterPartners, getDeliveryModelComparison,
  getDeliveryOrders, getDeliveryOverview, getDeliveryPerformance, getDeliveryProviders,
  getDeliveryStatusFlow, getInsuranceAnalytics, getOrderTotals, getSalaryAnalytics,
  getWorkforceAvailability, PERFORMANCE_GRAINS,
  type DeliveryPartner, type PartnerFilters, type PerformanceGrain,
} from '../../services/deliveryService';

/**
 * Delivery Services — a tab inside the admin dashboard, not a dashboard.
 *
 * It renders inside `DashboardShell` like every other admin page, so the
 * sidebar, header, palette and spacing are not this file's business. What is
 * this file's business is choosing what to show; every figure on it arrives
 * finished from `deliveryService`, the same rule the analytics page follows.
 *
 * The salary bill is the one worth watching. ₹1,800 is a constant in the data
 * layer and the monthly cost is headcount × that constant, computed on read —
 * so the card, the analytics panel and the eight-month graph cannot disagree,
 * and adding a twenty-fifth partner moves all three.
 */
export function DeliveryServices() {
  const [filters, setFilters] = useState<PartnerFilters>(DEFAULT_PARTNER_FILTERS);
  const [grain, setGrain] = useState<PerformanceGrain>('daily');
  const [viewing, setViewing] = useState<DeliveryPartner | null>(null);

  const set = <K extends keyof PartnerFilters>(key: K, value: PartnerFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const overview = useMemo(() => getDeliveryOverview(), []);
  const salary = useMemo(() => getSalaryAnalytics(), []);
  const performance = useMemo(() => getDeliveryPerformance(grain), [grain]);
  const orders = useMemo(() => getDeliveryOrders(), []);
  const orderTotals = useMemo(() => getOrderTotals(), []);
  const insurance = useMemo(() => getInsuranceAnalytics(), []);
  const shifts = useMemo(() => getWorkforceAvailability(), []);
  const providers = useMemo(() => getDeliveryProviders(), []);
  const models = useMemo(() => getDeliveryModelComparison(), []);
  const flow = useMemo(() => getDeliveryStatusFlow(), []);

  const rows = useMemo(() => filterPartners(filters), [filters]);
  const filtered =
    filters.search !== '' || filters.status !== 'all' || filters.insurance !== 'all';

  const COLUMNS: Column<DeliveryPartner>[] = [
    { key: 'id', header: 'Partner ID', cell: (r) => <span className="dt-mono">{r.id}</span>, sortValue: (r) => r.id },
    {
      key: 'name',
      header: 'Name',
      cell: (r) => (
        <button type="button" className="dt-link" onClick={() => setViewing(r)}>
          {r.name}
        </button>
      ),
      sortValue: (r) => r.name,
    },
    { key: 'status', header: 'Status', cell: (r) => <StatusPill value={r.status} />, sortValue: (r) => r.status },
    { key: 'assigned', header: 'Assigned', align: 'end', cell: (r) => formatCount(r.ordersAssigned), sortValue: (r) => r.ordersAssigned },
    { key: 'completed', header: 'Completed', align: 'end', cell: (r) => formatCount(r.ordersCompleted), sortValue: (r) => r.ordersCompleted },
    { key: 'rating', header: 'Rating', cell: (r) => <RatingCell value={r.rating} />, sortValue: (r) => r.rating },
    {
      key: 'salary',
      header: 'Salary',
      align: 'end',
      /* The same for everyone by design, so the column states the rate rather
         than reading a per-row number that cannot differ. */
      cell: (r) => (
        <span className="dt-money" data-muted={r.status === 'Inactive' || undefined}>
          ₹{BASE_MONTHLY_SALARY.toLocaleString('en-IN')}/mo
        </span>
      ),
      sortValue: (r) => (r.status === 'Inactive' ? 0 : BASE_MONTHLY_SALARY),
    },
    { key: 'insurance', header: 'Insurance', cell: (r) => <StatusPill value={r.insurance.status} />, sortValue: (r) => r.insurance.status },
    { key: 'joined', header: 'Joining date', secondary: true, cell: (r) => r.joinedAt, sortValue: (r) => r.joinedAt },
    {
      key: 'action',
      header: 'Action',
      cell: (r) => (
        <button type="button" className="dt-action is-live" onClick={() => setViewing(r)}>
          View
        </button>
      ),
    },
  ];

  return (
    <div className="dh an">
      {/* 1 — OVERVIEW */}
      <header className="an-head">
        <div>
          <p>Manage delivery partners, workforce, salaries, insurance and delivery performance.</p>
        </div>
      </header>

      <StatCards
        stats={[
          { label: 'Total delivery partners', value: String(overview.totalPartners), hint: `${overview.activePartners} on the books`, Icon: Users },
          { label: 'Active partners', value: String(overview.activePartners), hint: 'available, riding or on leave', Icon: UserCheck },
          { label: 'On delivery', value: String(overview.onDelivery), hint: 'carrying an order now', Icon: Bike },
          { label: 'Available', value: String(overview.available), hint: 'on shift, unassigned', Icon: CheckCircle2 },
          { label: 'On leave', value: String(overview.onLeave), hint: 'still salaried', Icon: CalendarClock },
          { label: 'Inactive', value: String(overview.inactive), hint: 'not riding, not paid', Icon: UserMinus },
        ]}
      />

      <StatCards
        stats={[
          {
            label: 'Monthly salary cost',
            value: formatMoney(overview.monthlySalaryCost),
            hint: `${overview.salaryEligible} partners × ₹${BASE_MONTHLY_SALARY.toLocaleString('en-IN')}`,
            Icon: IndianRupee,
          },
          { label: 'Average salary', value: formatMoney(overview.averageSalary), hint: 'one flat rate for everyone', Icon: IndianRupee },
          { label: 'Insured partners', value: String(overview.insured), hint: `${formatPercent(insurance.coveragePercent, 0)} of the workforce`, Icon: ShieldCheck },
          { label: 'Insurance pending', value: String(overview.insurancePending), hint: `${overview.insuranceExpired} expired`, Icon: ShieldAlert },
        ]}
      />

      {/* 4 — WORKFORCE BREAKDOWN */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Delivery workforce</h3>
            <p className="dh-block-sub">
              Where the {overview.totalPartners} partners are right now. Counted from the partner
              rows, so the ring and the table always agree.
            </p>
          </div>
        </div>
        <div className="an-two">
          <div className="an-card">
            <h4 className="an-card-title">Partners by status</h4>
            <DonutChart
              slices={overview.byStatus.map((s) => ({
                id: s.status.toLowerCase().replace(/\s+/g, '-'),
                label: s.status,
                value: s.count,
                percent: s.percent,
              }))}
              total={overview.totalPartners}
              centreLabel="partners"
            />
          </div>
          <div className="an-card">
            <h4 className="an-card-title">Workforce availability</h4>
            <p className="an-card-sub">
              Rostered cover by shift. A roster is a plan, so these are separate from the live
              statuses above — a rider is "On Delivery" at one instant and still on three shifts.
            </p>
            <ul className="an-shifts">
              {shifts.map((s) => (
                <li key={s.id}>
                  <div className="an-shift-head">
                    <strong>{s.label}</strong>
                    <span className="dt-mono">{s.window}</span>
                  </div>
                  <div className="an-shift-bar" role="img" aria-label={`${s.label}: ${s.available} available, ${s.onDelivery} on delivery, ${s.onLeave} on leave`}>
                    <span data-tone="available" style={{ flexGrow: s.available }} />
                    <span data-tone="on-delivery" style={{ flexGrow: s.onDelivery }} />
                    <span data-tone="on-leave" style={{ flexGrow: s.onLeave }} />
                  </div>
                  <p className="an-shift-key">
                    <span>{s.available} available</span>
                    <span>{s.onDelivery} on delivery</span>
                    <span>{s.onLeave} on leave</span>
                    <strong>{s.onShift} covering</strong>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="an-note">Shift cover is mock data, as the brief allows; the status ring is not.</p>
      </section>

      {/* 5 — SALARY ANALYTICS */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Delivery workforce cost</h3>
            <p className="dh-block-sub">
              Headcount priced at the base salary. Nothing here is a stored total — add a partner
              and every figure in this section moves.
            </p>
          </div>
        </div>
        <div className="an-two-wide">
          <div className="an-card">
            <h4 className="an-card-title">Monthly salary cost</h4>
            <p className="an-card-sub">
              The last {salary.history.length} months, counting the salary-eligible partners who
              had joined by the end of each.
            </p>
            <LineChart
              series={[{ id: 'salary', label: 'Monthly salary cost', points: salary.history }]}
              unit="money"
              height={260}
              caption="Monthly delivery salary cost"
            />
          </div>
          <div className="an-card">
            <h4 className="an-card-title">How it is worked out</h4>
            <dl className="ac-facts">
              <div>
                <dt>Base salary per partner</dt>
                <dd>₹{BASE_MONTHLY_SALARY.toLocaleString('en-IN')}</dd>
              </div>
              <div>
                <dt>Salary-eligible partners</dt>
                <dd>{salary.salaryEligible}</dd>
              </div>
              <div>
                <dt>Monthly salary cost</dt>
                <dd>{formatMoney(salary.monthlySalaryCost)}</dd>
              </div>
              <div>
                <dt>Average base salary</dt>
                <dd>{formatMoney(salary.averageSalary)}</dd>
              </div>
            </dl>
            <p className="an-note">
              {salary.excluded} of {overview.totalPartners} partners are inactive and off the bill,
              which is why the eligible count is not the headcount.
            </p>
          </div>
        </div>
      </section>

      {/* 6 — DELIVERY PERFORMANCE */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Delivery performance</h3>
            <p className="dh-block-sub">
              Read from the platform's own order series — every order is a delivery, so these are
              the same events the analytics page counts, not a second set of numbers.
            </p>
          </div>
          <MetricToggle
            label="Trend grain"
            options={PERFORMANCE_GRAINS}
            value={grain}
            onChange={setGrain}
          />
        </div>
        <StatCards
          stats={[
            { label: 'Total deliveries', value: formatCount(performance.totalDeliveries), Icon: ClipboardList },
            { label: 'Completed', value: formatCount(performance.completed), hint: formatPercent(performance.completionRate), Icon: CheckCircle2 },
            { label: 'Active now', value: String(performance.active), hint: 'partners carrying an order', Icon: Bike },
            { label: 'Cancelled', value: formatCount(performance.cancelled), hint: formatPercent(performance.cancellationRate), Icon: RotateCcw },
            { label: 'Average delivery time', value: `${performance.averageMinutes.toFixed(1)} min`, hint: 'weighted by volume', Icon: Clock },
            { label: 'Average partner rating', value: `★ ${performance.averageRating.toFixed(2)}`, hint: 'weighted by volume', Icon: Star },
          ]}
        />
        <div className="an-card">
          <h4 className="an-card-title">{performance.trendLabel}</h4>
          <LineChart
            series={[{ id: 'deliveries', label: performance.trendLabel, points: performance.trend }]}
            unit="count"
            height={300}
            caption="Completed deliveries over time"
          />
        </div>
      </section>

      {/* 7 — ORDER DISTRIBUTION */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Orders by delivery partner</h3>
            <p className="dh-block-sub">
              {formatCount(orderTotals.assigned)} assigned · {formatCount(orderTotals.completed)} completed ·
              {' '}{formatCount(orderTotals.cancelled)} cancelled ·
              {' '}{formatPercent(orderTotals.completionRate)} completion rate
            </p>
          </div>
        </div>
        <div className="an-card">
          <BarChart
            data={orders.map((o) => ({
              id: o.id,
              label: o.name,
              value: o.completed,
              percent: o.completionRate,
              hint: `${formatCount(o.assigned)} assigned · ${formatCount(o.cancelled)} cancelled`,
            }))}
          />
          <p className="an-note">
            Bars are completed deliveries; the share beside each is that partner's completion rate,
            not their share of the platform.
          </p>
        </div>
      </section>

      {/* 2 — PARTNERS TABLE */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Delivery partners</h3>
            <p className="dh-block-sub">
              {rows.length} of {overview.totalPartners} shown. Contact details and policy numbers
              are in the detail view rather than the table.
            </p>
          </div>
        </div>

        <section className="an-filters" aria-label="Filter delivery partners">
          <input
            className="an-search"
            type="search"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Search name, ID, email or provider"
            aria-label="Search delivery partners"
          />
          <label>
            <span>Status</span>
            <select value={filters.status} onChange={(e) => set('status', e.target.value as PartnerStatus | 'all')}>
              <option value="all">All statuses</option>
              {PARTNER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>
            <span>Insurance</span>
            <select value={filters.insurance} onChange={(e) => set('insurance', e.target.value as InsuranceStatus | 'all')}>
              <option value="all">All cover</option>
              {INSURANCE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          {filtered ? (
            <button type="button" className="an-clear" onClick={() => setFilters(DEFAULT_PARTNER_FILTERS)}>
              <RotateCcw size={13} />
              Clear filters
            </button>
          ) : null}
        </section>

        <DataTable
          caption="Delivery partners"
          columns={COLUMNS}
          rows={rows}
          rowKey={(r) => r.id}
          defaultSort={{ key: 'completed' }}
          empty="No partner matches those filters."
        />
      </section>

      {/* 8 — STATUS FLOW */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Delivery status flow</h3>
            <p className="dh-block-sub">
              How one delivery moves, and how a rider comes back round to available. The numbers
              are partners sitting at each point now, so the two end states carry none — nobody
              waits at "delivered".
            </p>
          </div>
        </div>
        <div className="an-card an-card-flow">
          <FlowDiagram
            nodes={flow.nodes}
            edges={flow.edges}
            caption="Delivery status flow"
            countLabel="partners"
          />
        </div>
      </section>

      {/* 9 — INSURANCE */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Insurance coverage</h3>
            <p className="dh-block-sub">
              {insurance.covered} of {insurance.total} partners covered — {formatPercent(insurance.coveragePercent)}.
            </p>
          </div>
        </div>
        <div className="an-two">
          <div className="an-card">
            <h4 className="an-card-title">Cover across the workforce</h4>
            <DonutChart
              slices={insurance.breakdown.map((b) => ({
                id: b.status.toLowerCase(),
                label: b.status,
                value: b.count,
                percent: b.percent,
              }))}
              total={insurance.total}
              centreLabel="partners"
            />
          </div>
          <div className="an-card">
            <h4 className="an-card-title">Expiring soon</h4>
            <p className="an-card-sub">
              Live policies lapsing within 45 days. Already-expired ones sit under Expired — that is
              a different problem from one there is still time to fix.
            </p>
            <DataTable
              caption="Insurance expiring soon"
              columns={EXPIRY_COLUMNS}
              rows={insurance.expiringSoon}
              rowKey={(r) => r.id}
              empty="No policy lapses in the next 45 days."
            />
          </div>
        </div>
      </section>

      {/* 10 — DELIVERY MODEL */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Delivery model</h3>
            <p className="dh-block-sub">
              RULE-03 and RULE-04 turn on this choice. The fee each model attracts is not shown
              because the client has not given us those figures.
            </p>
          </div>
          <Link to="/admin/fees">Service fees</Link>
        </div>
        <div className="an-card">
          <DataTable
            caption="Delivery model comparison"
            columns={MODEL_COLUMNS}
            rows={models}
            rowKey={(r) => r.model}
          />
        </div>
        <div className="an-card">
          <h4 className="an-card-title">By provider</h4>
          <p className="an-card-sub">
            Grouped from the partner rows, so a provider cannot appear with nobody riding for it.
          </p>
          <DataTable
            caption="Delivery providers"
            columns={PROVIDER_COLUMNS}
            rows={providers}
            rowKey={(r) => r.provider}
            defaultSort={{ key: 'completed' }}
          />
        </div>
      </section>

      <p className="dh-mock-note">
        Mock data, shaped like the tables it becomes. Every total on this page — the salary bill,
        the coverage share, each completion rate — is computed from the partner rows on read, so
        none of them can drift from the table underneath.
      </p>

      {viewing ? (
        <DeliveryPartnerDetail partner={viewing} onClose={() => setViewing(null)} />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------- columns -- */

type ExpiryRow = ReturnType<typeof getInsuranceAnalytics>['expiringSoon'][number];

const EXPIRY_COLUMNS: Column<ExpiryRow>[] = [
  { key: 'name', header: 'Partner', cell: (r) => <strong>{r.name}</strong>, sortValue: (r) => r.name },
  { key: 'provider', header: 'Provider', cell: (r) => r.provider },
  { key: 'expires', header: 'Expiry date', cell: (r) => r.expiresOn, sortValue: (r) => r.expiresOn },
  {
    key: 'left',
    header: 'Status',
    cell: (r) => (
      <span className="dt-pill" data-tone={r.daysLeft <= 14 ? 'bad' : 'warn'}>
        {r.daysLeft} days left
      </span>
    ),
    sortValue: (r) => r.daysLeft,
  },
];

type ModelRow = ReturnType<typeof getDeliveryModelComparison>[number];

const MODEL_COLUMNS: Column<ModelRow>[] = [
  { key: 'model', header: 'Delivery model', cell: (r) => <strong>{r.label}</strong> },
  { key: 'riders', header: 'Partners', align: 'end', cell: (r) => r.riders },
  { key: 'assigned', header: 'Orders', align: 'end', cell: (r) => formatCount(r.assigned) },
  { key: 'completed', header: 'Completed', align: 'end', cell: (r) => formatCount(r.completed) },
  { key: 'minutes', header: 'Average time', align: 'end', cell: (r) => `${r.averageMinutes.toFixed(1)} min` },
  { key: 'cancel', header: 'Cancellation rate', align: 'end', cell: (r) => formatPercent(r.cancellationRate) },
];

type ProviderRowType = ReturnType<typeof getDeliveryProviders>[number];

const PROVIDER_COLUMNS: Column<ProviderRowType>[] = [
  { key: 'provider', header: 'Provider', cell: (r) => <strong>{r.provider}</strong>, sortValue: (r) => r.provider },
  { key: 'model', header: 'Model', secondary: true, cell: (r) => r.modelLabel },
  { key: 'riders', header: 'Partners', align: 'end', cell: (r) => r.riders, sortValue: (r) => r.riders },
  { key: 'completed', header: 'Completed', align: 'end', cell: (r) => formatCount(r.completed), sortValue: (r) => r.completed },
  { key: 'minutes', header: 'Average time', align: 'end', secondary: true, cell: (r) => `${r.averageMinutes.toFixed(1)} min`, sortValue: (r) => r.averageMinutes },
  { key: 'rate', header: 'Completion', align: 'end', cell: (r) => formatPercent(r.completionRate), sortValue: (r) => r.completionRate },
];
