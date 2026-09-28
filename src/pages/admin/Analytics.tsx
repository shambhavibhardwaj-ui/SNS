import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowUpRight, BadgePercent, Bike, ClipboardList, Clock,
  Download, FileSearch, RotateCcw, Star, Store, TrendingUp, Users, UtensilsCrossed,
} from 'lucide-react';
import { DataTable, StatusPill, type Column } from '../../components/dashboard/DataTable';
import { BarChart } from '../../components/analytics/BarChart';
import { FlowDiagram } from '../../components/analytics/FlowDiagram';
import { Funnel } from '../../components/analytics/Funnel';
import { HealthMeter } from '../../components/analytics/HealthMeter';
import { LineChart } from '../../components/analytics/LineChart';
import { MetricToggle } from '../../components/analytics/MetricToggle';
import {
  formatChange, formatCount, formatMoney, formatPercent, formatValue,
} from '../../components/analytics/format';
import type { DeliveryModel } from '../../data/admin/types';
import {
  buildAnalyticsExport, CUSTOMER_METRICS, DATE_RANGES, DEFAULT_FILTERS, DELIVERY_METRICS,
  getBusinessRuleAlerts, getBusinessRuleMonitor, getCuisinePerformance, getCustomerFunnel,
  getFilterOptions,
  getCustomerGrowth, getDeliveryAnalytics, getDeliveryTrend, getLastUpdated, getOrderFlow,
  getOrderTrend, getOverviewMetrics, getPlatformHealth, getRatingAnalytics, getRecentActivity,
  getRestaurantOnboardingFlow, getRestaurantOnboardingFunnel, getRestaurantPerformance,
  getRevenueAnalytics, REVENUE_VIEWS, toCsv, TREND_METRICS,
  type AnalyticsFilters, type CustomerMetric, type DateRange, type DeliveryMetric,
  type OrderStatusFilter, type RestaurantAnalyticsRow, type RevenueView, type TrendMetric,
} from '../../services/analyticsService';

const ICONS = [Store, UtensilsCrossed, FileSearch, ClipboardList, TrendingUp, Users, Bike, Star];

/**
 * Admin analytics.
 *
 * One rule runs through this page: nothing here computes anything. Every
 * number, share, percentage change and rule verdict arrives finished from
 * `analyticsService`. The page chooses what to show and how it looks, which is
 * why swapping the mock source for Supabase will not touch this file.
 *
 * Filters live in one state object passed to every service call, so a cuisine
 * chosen in the bar chart moves the KPIs, the trend line, both tables and the
 * health ratios at once — a filter that only changes the chart you clicked is
 * worse than no filter.
 */
export function AdminAnalytics() {
  const [filters, setFilters] = useState<AnalyticsFilters>(DEFAULT_FILTERS);
  const [trendMetric, setTrendMetric] = useState<TrendMetric>('orders');
  const [deliveryMetric, setDeliveryMetric] = useState<DeliveryMetric>('minutes');
  const [customerMetric, setCustomerMetric] = useState<CustomerMetric>('new');
  const [revenueView, setRevenueView] = useState<RevenueView>('daily');

  const set = <K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  /* Recomputed only when the filters move — these walk a 92-day series and
     ~2,000 rating rows, which is cheap but not free on every keystroke. */
  const metrics = useMemo(() => getOverviewMetrics(filters), [filters]);
  const trend = useMemo(() => getOrderTrend(filters, trendMetric), [filters, trendMetric]);
  const funnel = useMemo(() => getRestaurantOnboardingFunnel(), []);
  const onboardingFlow = useMemo(() => getRestaurantOnboardingFlow(), []);
  const orderFlow = useMemo(() => getOrderFlow(), []);
  const cuisines = useMemo(() => getCuisinePerformance(filters), [filters]);
  const restaurants = useMemo(() => getRestaurantPerformance(filters), [filters]);
  const delivery = useMemo(() => getDeliveryAnalytics(filters), [filters]);
  const deliveryTrend = useMemo(() => getDeliveryTrend(filters, deliveryMetric), [filters, deliveryMetric]);
  const customers = useMemo(() => getCustomerGrowth(filters, customerMetric), [filters, customerMetric]);
  const customerFunnel = useMemo(() => getCustomerFunnel(), []);
  const ratings = useMemo(() => getRatingAnalytics(filters), [filters]);
  const revenue = useMemo(() => getRevenueAnalytics(filters, revenueView), [filters, revenueView]);
  const rules = useMemo(() => getBusinessRuleMonitor(), []);
  const alerts = useMemo(() => getBusinessRuleAlerts(), []);
  const health = useMemo(() => getPlatformHealth(filters), [filters]);
  const activity = useMemo(() => getRecentActivity(), []);

  const options = useMemo(() => getFilterOptions(), []);

  const [restaurantSearch, setRestaurantSearch] = useState('');
  const restaurantRows = useMemo(() => {
    const q = restaurantSearch.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter((r) => `${r.name} ${r.cuisine} ${r.state}`.toLowerCase().includes(q));
  }, [restaurants, restaurantSearch]);

  const filtered =
    filters.cuisineId !== 'all' ||
    filters.restaurantId !== 'all' ||
    filters.deliveryModel !== 'all' ||
    filters.orderStatus !== 'all';

  const exportCsv = () => {
    const { filename, rows } = buildAnalyticsExport(filters);
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dh an">
      {/* 1 — HEADER */}
      <header className="an-head">
        <div>
          <h2>Analytics</h2>
          <p>Understand how restaurants, customers, orders and delivery operations are performing.</p>
        </div>
        <div className="an-head-tools">
          <div className="an-range" role="radiogroup" aria-label="Date range">
            {DATE_RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                role="radio"
                aria-checked={filters.range === r.id}
                className="an-range-btn"
                data-on={filters.range === r.id || undefined}
                onClick={() => set('range', r.id as DateRange)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button type="button" className="an-export" onClick={exportCsv}>
            <Download size={14} />
            Export CSV
          </button>
          <p className="an-updated">
            <Clock size={12} aria-hidden="true" />
            Last updated just now
            <time dateTime={getLastUpdated().toISOString()} className="an-updated-time">
              {getLastUpdated().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </time>
          </p>
        </div>
      </header>

      {/* 20 — FILTERS */}
      <section className="an-filters" aria-label="Analytics filters">
        <label>
          <span>Cuisine</span>
          <select value={filters.cuisineId} onChange={(e) => set('cuisineId', e.target.value)}>
            <option value="all">All cuisines</option>
            {options.cuisines.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Restaurant</span>
          <select value={filters.restaurantId} onChange={(e) => set('restaurantId', e.target.value)}>
            <option value="all">All restaurants</option>
            {options.restaurants.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Delivery model</span>
          <select
            value={filters.deliveryModel}
            onChange={(e) => set('deliveryModel', e.target.value as DeliveryModel | 'all')}
          >
            <option value="all">Both models</option>
            {options.deliveryModels.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Order status</span>
          <select
            value={filters.orderStatus}
            onChange={(e) => set('orderStatus', e.target.value as OrderStatusFilter)}
          >
            <option value="all">All orders</option>
            <option value="completed">Completed only</option>
            <option value="cancelled">Cancelled only</option>
          </select>
        </label>
        {filtered ? (
          <button type="button" className="an-clear" onClick={() => setFilters({ ...DEFAULT_FILTERS, range: filters.range })}>
            <RotateCcw size={13} />
            Clear filters
          </button>
        ) : null}
      </section>

      {/* 2 — KPI CARDS */}
      <ul className="an-kpis">
        {metrics.map((m, i) => {
          const Icon = ICONS[i % ICONS.length];
          const good =
            m.changePercent === null || m.polarity === 'neutral'
              ? null
              : m.polarity === 'up-good'
                ? m.changePercent >= 0
                : m.changePercent <= 0;

          return (
            <li key={m.id} className="an-kpi">
              <Link to={m.href ?? '#'} className="an-kpi-link">
                <span className="an-kpi-icon" aria-hidden="true"><Icon size={16} /></span>
                <p className="an-kpi-label">{m.label}</p>
                <p className="an-kpi-value">{m.display}</p>
                <p className="an-kpi-foot">
                  {m.changePercent === null ? null : (
                    <span className="an-kpi-change" data-good={good === null ? undefined : good}>
                      {formatChange(m.changePercent)}
                    </span>
                  )}
                  <span className="an-kpi-hint">{m.hint}</span>
                </p>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* 15 — BUSINESS RULE ALERTS */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Action required</h3>
            <p className="dh-block-sub">Queues and rule outcomes that need a person.</p>
          </div>
        </div>
        <ul className="an-alerts">
          {alerts.map((a) => (
            <li key={a.id}>
              <Link to={a.href} className="an-alert" data-tone={a.tone}>
                <span className="an-alert-count">{a.count}</span>
                <span className="an-alert-body">
                  <strong>{a.label}</strong>
                  <span>{a.hint}</span>
                </span>
                <ArrowUpRight size={15} className="an-alert-go" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 3 — ORDER TREND */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Order activity</h3>
            <p className="dh-block-sub">
              {trend.label} across the {DATE_RANGES.find((r) => r.id === filters.range)?.label.toLowerCase()}
              {' — '}
              <strong>{formatValue(trend.total, trend.unit)}</strong> total
              {trend.changePercent === null ? null : (
                <>
                  {', '}
                  <span className="an-inline-change" data-good={trend.changePercent >= 0}>
                    {formatChange(trend.changePercent)}
                  </span>
                  {' vs previous period'}
                </>
              )}
            </p>
          </div>
          <MetricToggle
            label="Order metric"
            options={TREND_METRICS.map((m) => ({ id: m.id, label: m.label }))}
            value={trendMetric}
            onChange={(m) => setTrendMetric(m)}
          />
        </div>
        <div className="an-card">
          <LineChart
            series={[{ id: trend.id, label: trend.label, points: trend.points }]}
            unit={trend.unit}
            height={320}
            caption={`${trend.label} over time`}
          />
        </div>
      </section>

      {/* 4 + 5 — ONBOARDING FUNNEL AND FLOW */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Restaurant onboarding</h3>
            <p className="dh-block-sub">
              The platform's primary business process, counted from the applications table.
            </p>
          </div>
          <Link to="/admin/restaurants/applications">Open the queue</Link>
        </div>
        <div className="an-card">
          <h4 className="an-card-title">Onboarding funnel</h4>
          <Funnel stages={funnel.stages} exits={funnel.exits} />
        </div>
        <div className="an-card an-card-flow">
          <h4 className="an-card-title">Onboarding process</h4>
          <p className="an-card-sub">How an application moves. Numbers are applications sitting at each point now; the first is total intake.</p>
          <FlowDiagram
            nodes={onboardingFlow.nodes}
            edges={onboardingFlow.edges}
            caption="Restaurant onboarding process"
            countLabel="applications"
          />
        </div>
      </section>

      {/* 6 — ORDER LIFECYCLE */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Order lifecycle</h3>
            <p className="dh-block-sub">Orders currently at each stage. Cancellation can happen before pickup.</p>
          </div>
          <Link to="/admin/orders">View orders</Link>
        </div>
        <div className="an-card">
          <FlowDiagram
            nodes={orderFlow.nodes}
            edges={orderFlow.edges}
            caption="Order lifecycle"
            countLabel="orders"
          />
        </div>
      </section>

      {/* 7 + 8 — CUISINE */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Orders by cuisine</h3>
            <p className="dh-block-sub">
              The ten SNS cuisine categories. Select one to filter the whole page.
            </p>
          </div>
        </div>
        <div className="an-two">
          <div className="an-card">
            <BarChart
              data={cuisines.map((c) => ({
                id: c.id,
                label: c.name,
                value: c.orders,
                percent: c.percentOfOrders,
                hint: `${formatCount(c.orders)} orders — ${c.restaurants} restaurants`,
              }))}
              selectedId={filters.cuisineId === 'all' ? null : filters.cuisineId}
              onSelect={(id) => set('cuisineId', filters.cuisineId === id ? 'all' : id)}
            />
          </div>
          <div className="an-card">
            <h4 className="an-card-title">Cuisine performance</h4>
            <DataTable
              caption="Cuisine performance"
              columns={CUISINE_COLUMNS}
              rows={cuisines}
              rowKey={(c) => c.id}
              defaultSort={{ key: 'orders' }}
            />
          </div>
        </div>
      </section>

      {/* 9 — RESTAURANT PERFORMANCE */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Restaurant performance</h3>
            <p className="dh-block-sub">Sort any column. Search narrows the table without changing the filters.</p>
          </div>
          <input
            type="search"
            className="an-search"
            placeholder="Search restaurants"
            aria-label="Search restaurants"
            value={restaurantSearch}
            onChange={(e) => setRestaurantSearch(e.target.value)}
          />
        </div>
        <div className="an-card">
          <DataTable
            caption="Restaurant performance"
            columns={RESTAURANT_COLUMNS}
            rows={restaurantRows}
            rowKey={(r) => r.id}
            defaultSort={{ key: 'orders' }}
            empty="No restaurant matches that search."
          />
        </div>
      </section>

      {/* 10 + 11 — DELIVERY */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Delivery models</h3>
            <p className="dh-block-sub">
              RULE-03 and RULE-04 hang off this choice, so the two are always compared side by side.
            </p>
          </div>
          <Link to="/admin/delivery-partners">Delivery partners</Link>
        </div>

        <div className="an-models">
          {delivery.models.map((m) => (
            <div key={m.model} className="an-card an-model">
              <h4 className="an-card-title">{m.label}</h4>
              <dl className="an-model-facts">
                <div><dt>Orders handled</dt><dd>{formatCount(m.ordersHandled)}</dd></div>
                <div><dt>Completed</dt><dd>{formatCount(m.completed)}</dd></div>
                <div><dt>Active now</dt><dd>{formatCount(m.active)}</dd></div>
                <div><dt>Average time</dt><dd>{m.averageMinutes} min</dd></div>
              </dl>
              <div className="an-model-rate">
                <div className="an-model-track">
                  <span style={{ width: `${m.completionRate}%` }} />
                </div>
                <p>{formatPercent(m.completionRate)} completion rate</p>
              </div>
            </div>
          ))}
        </div>

        <div className="an-card an-card-flow">
          <h4 className="an-card-title">Where an order goes</h4>
          <p className="an-card-sub">The branch is set at onboarding and does not change per order.</p>
          <FlowDiagram
            nodes={delivery.flow.nodes}
            edges={delivery.flow.edges}
            caption="Delivery routing"
            countLabel="deliveries"
          />
        </div>

        <div className="an-card">
          <div className="an-card-head">
            <h4 className="an-card-title">Delivery performance over time</h4>
            <MetricToggle
              label="Delivery metric"
              size="sm"
              options={DELIVERY_METRICS.map((m) => ({ id: m.id, label: m.label }))}
              value={deliveryMetric}
              onChange={(m) => setDeliveryMetric(m)}
            />
          </div>
          <LineChart
            series={deliveryTrend.map((s) => ({ id: s.id, label: s.label, points: s.points }))}
            unit="count"
            height={260}
            area={false}
            caption="Delivery performance by model"
          />
          {deliveryMetric === 'minutes' ? (
            <p className="an-note">Minutes are an average per delivery, so they are not scaled by the filters.</p>
          ) : null}
        </div>
      </section>

      {/* 12 — CUSTOMERS */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Customers</h3>
            <p className="dh-block-sub">Growth, and how many of the people who arrive go on to order.</p>
          </div>
          <Link to="/admin/customers">View customers</Link>
        </div>
        <div className="an-two">
          <div className="an-card">
            <div className="an-card-head">
              <h4 className="an-card-title">Customer growth</h4>
              <MetricToggle
                label="Customer metric"
                size="sm"
                options={CUSTOMER_METRICS}
                value={customerMetric}
                onChange={(m) => setCustomerMetric(m)}
              />
            </div>
            <LineChart
              series={[{ id: customers.id, label: customers.label, points: customers.points }]}
              height={250}
              caption="Customer growth"
            />
          </div>
          <div className="an-card">
            <h4 className="an-card-title">Customer conversion</h4>
            <Funnel stages={customerFunnel} countLabel="people" />
          </div>
        </div>
      </section>

      {/* 13 — RATINGS */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Ratings</h3>
            <p className="dh-block-sub">The input to both business rules.</p>
          </div>
          <Link to="/admin/ratings">Ratings &amp; reviews</Link>
        </div>
        <div className="an-two">
          <div className="an-card">
            <div className="an-rating-summary">
              <div>
                <p className="an-rating-big">{ratings.averageRating.toFixed(2)}</p>
                <p className="an-rating-cap">average rating</p>
              </div>
              <dl className="an-rating-facts">
                <div><dt>Total reviews</dt><dd>{formatCount(ratings.totalReviews)}</dd></div>
                <div><dt>Five star</dt><dd>{formatPercent(ratings.fiveStarPercent)}</dd></div>
                <div><dt>Below 3★</dt><dd>{formatPercent(ratings.lowRatingPercent)}</dd></div>
              </dl>
            </div>
            <ul className="an-stars">
              {ratings.distribution.map((d) => (
                <li key={d.stars}>
                  <span className="an-stars-key">{'★'.repeat(d.stars)}</span>
                  <span className="an-stars-track">
                    <span className="an-stars-fill" data-low={d.stars <= 2 || undefined} style={{ width: `${d.percent}%` }} />
                  </span>
                  <span className="an-stars-value">{formatCount(d.count)}</span>
                  <span className="an-stars-pct">{formatPercent(d.percent)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="an-card">
            <h4 className="an-card-title">Rating by restaurant</h4>
            <BarChart
              data={ratings.byRestaurant.slice(0, 10).map((r) => ({
                id: r.id,
                label: r.name,
                value: Number(r.rating.toFixed(2)),
                valueLabel: `${r.rating.toFixed(2)}★`,
                hint: `${formatCount(r.reviews)} rated orders`,
              }))}
              max={5}
              onSelect={(id) => set('restaurantId', filters.restaurantId === id ? 'all' : id)}
              selectedId={filters.restaurantId === 'all' ? null : filters.restaurantId}
              emptyLabel="No rated restaurants in this selection."
            />
          </div>
        </div>
      </section>

      {/* 14 — BUSINESS RULE MONITORING */}
      <section className="dh-block is-primary">
        <div className="dh-block-head">
          <div>
            <h3>Business rule monitoring</h3>
            <p className="dh-block-sub">
              Both rules are evaluated by counting qualifying orders, not read from a stored flag.
            </p>
          </div>
        </div>

        <div className="an-rule">
          <div className="an-rule-head">
            <AlertTriangle size={16} aria-hidden="true" />
            <h4>
              RULE-01 — below {rules.improvement.threshold.below}★ on more than{' '}
              {rules.improvement.threshold.minOrders} orders requires an improvement plan
            </h4>
          </div>
          <FlowDiagram
            caption="Improvement plan rule"
            nodes={[
              { id: 'restaurant', label: 'Restaurant', col: 0, row: 0, kind: 'start' },
              { id: 'low', label: `Rating < ${rules.improvement.threshold.below}★`, col: 1, row: 0, kind: 'decision' },
              { id: 'count', label: `More than ${rules.improvement.threshold.minOrders} such orders`, col: 2, row: 0, kind: 'decision' },
              { id: 'plan', label: 'Improvement plan required', col: 3, row: 0, kind: 'warn', href: '/admin/improvement-plans', count: rules.improvement.rows.length },
            ]}
            edges={[
              { from: 'restaurant', to: 'low' },
              { from: 'low', to: 'count', label: 'yes' },
              { from: 'count', to: 'plan', label: 'yes' },
            ]}
            countLabel="restaurants"
          />
          {rules.improvement.rows.length ? (
            <ul className="an-rule-rows">
              {rules.improvement.rows.map((r) => (
                <li key={r.restaurantId}>
                  <div>
                    <strong>{r.restaurant}</strong>
                    <span>
                      {r.lowRatedOrders} qualifying orders · average rating {r.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <StatusPill value={r.planStatus} />
                  <Link to="/admin/improvement-plans" className="an-rule-cta">View improvement plan</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="an-empty">No restaurant currently meets this condition.</p>
          )}
        </div>

        <div className="an-rule">
          <div className="an-rule-head">
            <BadgePercent size={16} aria-hidden="true" />
            <h4>
              RULE-02 — above {rules.concession.threshold.above}★ on{' '}
              {rules.concession.threshold.minOrders} orders within{' '}
              {rules.concession.threshold.windowDays} days earns a service-fee concession
            </h4>
          </div>
          <FlowDiagram
            caption="Service fee concession rule"
            nodes={[
              { id: 'restaurant', label: 'Restaurant', col: 0, row: 0, kind: 'start' },
              { id: 'high', label: `Rating > ${rules.concession.threshold.above}★`, col: 1, row: 0, kind: 'decision' },
              { id: 'count', label: `${rules.concession.threshold.minOrders} such orders in a week`, col: 2, row: 0, kind: 'decision' },
              { id: 'fee', label: 'Concession eligible', col: 3, row: 0, kind: 'terminal', href: '/admin/fees', count: rules.concession.eligible.length },
            ]}
            edges={[
              { from: 'restaurant', to: 'high' },
              { from: 'high', to: 'count', label: 'yes' },
              { from: 'count', to: 'fee', label: 'yes' },
            ]}
            countLabel="restaurants"
          />
          <ul className="an-rule-rows">
            {rules.concession.rows.slice(0, 6).map((c) => (
              <li key={c.restaurantId} data-muted={!c.eligible || undefined}>
                <div>
                  <strong>{c.restaurant}</strong>
                  <span>
                    {c.qualifyingOrders} of {rules.concession.threshold.minOrders} qualifying orders ·
                    average {c.averageRating.toFixed(1)}★
                  </span>
                </div>
                <StatusPill value={c.eligible ? 'Eligible' : 'Not yet'} />
                <Link to="/admin/fees" className="an-rule-cta">Service fees</Link>
              </li>
            ))}
          </ul>
          <p className="dh-inline-note">
            {rules.concession.eligible.length} of {rules.concession.rows.length} restaurants meet the
            condition. The concession amount itself is not shown because the client has not specified
            it — inventing a percentage here would put a number in front of an admin that nobody agreed.
          </p>
        </div>
      </section>

      {/* 16 — REVENUE */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Revenue</h3>
            <p className="dh-block-sub">
              Order value, not platform fee income — the fee rates are still unset.
            </p>
          </div>
          <MetricToggle
            label="Revenue view"
            options={REVENUE_VIEWS}
            value={revenueView}
            onChange={(v) => setRevenueView(v)}
          />
        </div>
        <div className="an-card">
          <ul className="an-revenue-facts">
            <li><span>Total revenue</span><strong>{formatMoney(revenue.totalRevenue)}</strong></li>
            <li><span>Average order value</span><strong>{formatMoney(revenue.averageOrderValue)}</strong></li>
            <li><span>Revenue per active restaurant</span><strong>{formatMoney(revenue.revenuePerRestaurant)}</strong></li>
          </ul>
          <LineChart
            series={[{ id: revenue.series.id, label: revenue.series.label, points: revenue.series.points }]}
            unit="money"
            height={270}
            caption="Revenue over time"
          />
        </div>
      </section>

      {/* 17 + 18 — HEALTH AND ACTIVITY */}
      <section className="dh-block">
        <div className="an-two">
          <div className="an-card">
            <h4 className="an-card-title">Platform health</h4>
            <p className="an-card-sub">Each figure is a stated ratio of two counts, not a composite score.</p>
            <HealthMeter indicators={health} />
          </div>
          <div className="an-card">
            <h4 className="an-card-title">Recent platform activity</h4>
            <ol className="an-timeline">
              {activity.map((a) => (
                <li key={`${a.time}-${a.text}`} data-kind={a.kind}>
                  <span className="an-timeline-time">{a.time}</span>
                  <span className="an-timeline-dot" aria-hidden="true" />
                  {a.href ? (
                    <Link to={a.href} className="an-timeline-text">{a.text}</Link>
                  ) : (
                    <span className="an-timeline-text">{a.text}</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 19 — TOP PERFORMERS */}
      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Top performers</h3>
            <p className="dh-block-sub">
              A sortable view of the current selection, not a standing ranking.
            </p>
          </div>
        </div>
        <div className="an-two">
          <div className="an-card">
            <h4 className="an-card-title">Top restaurants</h4>
            <ol className="an-top">
              {restaurants.slice(0, 5).map((r, i) => (
                <li key={r.id}>
                  <span className="an-top-rank">{i + 1}</span>
                  <span className="an-top-name">{r.name}</span>
                  <span className="an-top-figs">
                    <span>{formatCount(r.orders)} orders</span>
                    <span>{r.averageRating === null ? '—' : `${r.averageRating.toFixed(1)}★`}</span>
                    <strong>{formatMoney(r.revenue, true)}</strong>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="an-card">
            <h4 className="an-card-title">Top cuisines</h4>
            <ol className="an-top">
              {cuisines.slice(0, 5).map((c, i) => (
                <li key={c.id}>
                  <span className="an-top-rank">{i + 1}</span>
                  <span className="an-top-name">{c.name}</span>
                  <span className="an-top-figs">
                    <span>{formatCount(c.orders)} orders</span>
                    <span>{c.averageRating === null ? '—' : `${c.averageRating.toFixed(1)}★`}</span>
                    <strong>{formatMoney(c.revenue, true)}</strong>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <p className="dh-mock-note">
        Mock data, shaped like the tables it will read from. Every percentage, share and rule verdict
        on this page is computed from the underlying counts in <code>analyticsService</code> — nothing
        is stored as a conclusion, so replacing the mock source with Supabase queries changes those
        function bodies and no component.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------- columns -- */

const CUISINE_COLUMNS: Column<ReturnType<typeof getCuisinePerformance>[number]>[] = [
  { key: 'name', header: 'Cuisine', cell: (c) => <strong>{c.name}</strong>, sortValue: (c) => c.name },
  { key: 'orders', header: 'Orders', align: 'end', cell: (c) => formatCount(c.orders), sortValue: (c) => c.orders },
  { key: 'revenue', header: 'Revenue', align: 'end', cell: (c) => formatMoney(c.revenue, true), sortValue: (c) => c.revenue },
  {
    key: 'rating',
    header: 'Rating',
    align: 'end',
    cell: (c) => (c.averageRating === null ? <span className="dt-notset">n/a</span> : `${c.averageRating.toFixed(2)}★`),
    sortValue: (c) => c.averageRating ?? 0,
  },
  { key: 'restaurants', header: 'Restaurants', align: 'end', secondary: true, cell: (c) => c.restaurants, sortValue: (c) => c.restaurants },
];

const RESTAURANT_COLUMNS: Column<RestaurantAnalyticsRow>[] = [
  {
    key: 'name',
    header: 'Restaurant',
    cell: (r) => <Link to={r.href} className="an-link">{r.name}</Link>,
    sortValue: (r) => r.name,
  },
  { key: 'cuisine', header: 'Cuisine', secondary: true, cell: (r) => r.cuisine, sortValue: (r) => r.cuisine },
  { key: 'orders', header: 'Orders', align: 'end', cell: (r) => formatCount(r.orders), sortValue: (r) => r.orders },
  { key: 'revenue', header: 'Revenue', align: 'end', cell: (r) => formatMoney(r.revenue, true), sortValue: (r) => r.revenue },
  {
    key: 'rating',
    header: 'Rating',
    align: 'end',
    cell: (r) => (r.averageRating === null ? <span className="dt-notset">n/a</span> : `${r.averageRating.toFixed(2)}★`),
    sortValue: (r) => r.averageRating ?? 0,
  },
  { key: 'time', header: 'Delivery', align: 'end', secondary: true, cell: (r) => `${r.deliveryMinutes} min`, sortValue: (r) => r.deliveryMinutes },
  { key: 'state', header: 'Status', cell: (r) => <StatusPill value={r.state} />, sortValue: (r) => r.state },
];
