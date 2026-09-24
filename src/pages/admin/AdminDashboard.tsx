import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  Archive, BadgePercent, BarChart3, Bike, ClipboardList, FileSearch,
  LayoutDashboard, Settings, Star, Store, TrendingUp, Users,
} from 'lucide-react';
import { DashboardShell, type NavGroup } from '../DashboardShell';
import { AdminHome } from './AdminHome';
import { ApplicationsPanel } from '../../components/admin/ApplicationsPanel';
import { ApplicationReview } from '../../components/admin/ApplicationReview';
import type { ApplicationStatus, RestaurantApplication } from '../../data/admin/types';
import {
  AdminAnalytics, AdminCustomers, AdminDeliveryServices, AdminImprovementPlans,
  AdminOrders, AdminRatings, AdminRestaurants, AdminServiceFees, AdminSettings,
} from './adminSections';

/** Grouped so fourteen links stay navigable. */
const NAV: NavGroup[] = [
  { title: 'Overview', items: [{ to: '/admin', label: 'Dashboard', Icon: LayoutDashboard }] },
  {
    title: 'Restaurants',
    items: [
      { to: '/admin/restaurants/applications', label: 'Restaurant Applications', Icon: FileSearch },
      { to: '/admin/restaurants/active', label: 'Active Restaurants', Icon: Store },
      { to: '/admin/restaurants/offboarded', label: 'Offboarded Restaurants', Icon: Archive },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/admin/orders', label: 'Orders', Icon: ClipboardList },
      { to: '/admin/customers', label: 'Customers', Icon: Users },
      { to: '/admin/delivery-partners', label: 'Delivery Partners', Icon: Bike },
    ],
  },
  {
    title: 'Performance',
    items: [
      { to: '/admin/ratings', label: 'Ratings & Reviews', Icon: Star },
      { to: '/admin/improvement-plans', label: 'Improvement Plans', Icon: TrendingUp },
      { to: '/admin/fees', label: 'Service Fees', Icon: BadgePercent },
    ],
  },
  { title: 'Analytics', items: [{ to: '/admin/analytics', label: 'Analytics', Icon: BarChart3 }] },
  { title: 'System', items: [{ to: '/admin/settings', label: 'Settings', Icon: Settings }] },
];

export function AdminDashboard() {
  return (
    <DashboardShell
      title="Overview"
      lede="Monitor restaurant onboarding, platform activity and operations."
      kicker="RestaurantOnboarding"
      groups={NAV}
      accent="#FF258E"
      showSearch
    >
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="restaurants/applications" element={<ApplicationsPage />} />
        <Route path="restaurants/active" element={<AdminRestaurants />} />
        <Route path="restaurants/offboarded" element={<AdminRestaurants offboarded />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="delivery-partners" element={<AdminDeliveryServices />} />
        <Route path="ratings" element={<AdminRatings />} />
        <Route path="improvement-plans" element={<AdminImprovementPlans />} />
        <Route path="fees" element={<AdminServiceFees />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="*" element={<AdminHome />} />
      </Routes>
    </DashboardShell>
  );
}

/** The whole onboarding queue, unclipped — reached from "View all applications". */
function ApplicationsPage() {
  const [reviewing, setReviewing] = useState<RestaurantApplication | null>(null);
  const [, setDecisions] = useState<Record<string, ApplicationStatus>>({});

  return (
    <section className="dh">
      <header className="dh-head">
        <h2>Restaurant Applications</h2>
        <p>Review and manage restaurant applications.</p>
      </header>

      <ApplicationsPanel onReview={setReviewing} />

      {reviewing ? (
        <ApplicationReview
          application={reviewing}
          onClose={() => setReviewing(null)}
          onDecide={(id, status) => {
            setDecisions((d) => ({ ...d, [id]: status }));
            setReviewing(null);
          }}
        />
      ) : null}

      <p className="dh-mock-note">
        Decisions are local for now — this is where the Supabase update will go.
      </p>
    </section>
  );
}
