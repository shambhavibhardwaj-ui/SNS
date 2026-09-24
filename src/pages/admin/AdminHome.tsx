import { Link } from 'react-router-dom';
import { Bike, ClipboardList, Plus, Store, Users } from 'lucide-react';
import { DataTable, Money, RatingCell, StatusPill, type Column } from '../../components/dashboard/DataTable';
import { StatCards } from '../../components/dashboard/StatCard';
import { useAuth } from '../../auth/useAuth';
import {
  adminOrders,
  adminRestaurants,
  type AdminOrderRow,
  type AdminRestaurantRow,
} from '../../data/staffMock';

const ORDER_COLUMNS: Column<AdminOrderRow>[] = [
  { key: 'id', header: 'Order', cell: (r) => <span className="dt-mono">{r.id}</span> },
  { key: 'customer', header: 'Customer', cell: (r) => r.customer },
  { key: 'restaurant', header: 'Restaurant', cell: (r) => r.restaurant },
  { key: 'amount', header: 'Amount', align: 'end', cell: (r) => <Money value={r.amount} /> },
  { key: 'delivery', header: 'Delivery', secondary: true, cell: (r) => r.deliveryService },
  { key: 'status', header: 'Status', cell: (r) => <StatusPill value={r.status} /> },
];

const PERFORMANCE_COLUMNS: Column<AdminRestaurantRow>[] = [
  { key: 'name', header: 'Restaurant', cell: (r) => r.name },
  { key: 'rating', header: 'Rating', cell: (r) => <RatingCell value={r.rating} /> },
  { key: 'orders', header: 'Orders', align: 'end', cell: (r) => r.orders.toLocaleString('en-IN') },
  { key: 'status', header: 'Status', cell: (r) => <StatusPill value={r.status} /> },
];

const QUICK_ACTIONS = [
  { to: '/admin/restaurants', label: 'Add restaurant', Icon: Plus, primary: true },
  { to: '/admin/restaurants', label: 'Manage restaurants', Icon: Store },
  { to: '/admin/orders', label: 'View orders', Icon: ClipboardList },
  { to: '/admin/delivery', label: 'Manage delivery', Icon: Bike },
];

export function AdminHome() {
  const { profile } = useAuth();
  const firstName = profile?.name.split(' ')[0] ?? 'Admin';

  return (
    <div className="dh">
      <header className="dh-head">
        <h2>Welcome back, {firstName}</h2>
        <p>Everything across the platform at a glance.</p>
      </header>

      <StatCards
        stats={[
          { label: 'Total restaurants', value: '30', hint: 'across 10 districts', Icon: Store },
          { label: 'Total customers', value: '2,418', hint: '+64 this week', Icon: Users },
          { label: 'Total orders', value: '18,902', hint: '312 today', Icon: ClipboardList },
          { label: 'Active delivery services', value: '3', hint: '1 suspended', Icon: Bike },
        ]}
      />

      <section className="dh-block">
        <div className="dh-block-head">
          <h3>Recent orders</h3>
          <Link to="/admin/orders">View all</Link>
        </div>
        <DataTable
          caption="Recent orders across the platform"
          columns={ORDER_COLUMNS}
          rows={adminOrders.slice(0, 5)}
          rowKey={(r) => r.id}
        />
      </section>

      <section className="dh-block">
        <div className="dh-block-head">
          <h3>Restaurant performance</h3>
          <Link to="/admin/restaurants">View all</Link>
        </div>
        <DataTable
          caption="Restaurant performance"
          columns={PERFORMANCE_COLUMNS}
          rows={adminRestaurants.slice(0, 5)}
          rowKey={(r) => r.name}
        />
      </section>

      <section className="dh-block">
        <div className="dh-block-head">
          <h3>Quick actions</h3>
        </div>
        <div className="dh-actions">
          {QUICK_ACTIONS.map(({ to, label, Icon, primary }) => (
            <Link key={label} to={to} className={`dh-action${primary ? ' is-primary' : ''}`}>
              <Icon size={16} strokeWidth={2} />
              {label}
            </Link>
          ))}
        </div>
      </section>

      <p className="dh-mock-note">
        Figures and rows on this dashboard are mock data. They are shaped like the tables they
        will read from, so connecting Supabase changes the source and not the screens.
      </p>
    </div>
  );
}
