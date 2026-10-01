import { Navigate, Route, Routes } from 'react-router-dom';
import {
  Archive, BadgePercent, BarChart3, Bike, ClipboardList, FileSearch,
  LayoutDashboard, Settings, Star, Store, TrendingUp, Users,
} from 'lucide-react';
import { DashboardShell, type NavGroup } from '../DashboardShell';
import { AdminHome } from './AdminHome';
import { RestaurantApplications } from './RestaurantApplications';
import { AdminAnalytics } from './Analytics';
import { DeliveryServices } from './DeliveryServices';
import {
  AdminCustomers, AdminImprovementPlans,
  AdminOrders, AdminRatings, AdminRestaurants, AdminServiceFees, AdminSettings,
} from './adminSections';

/**
 * Sections, not a list.
 *
 * A group with several links collapses behind its own heading; a group with
 * one link is just that link. Twelve links in a single column was the whole
 * problem.
 */
const NAV: NavGroup[] = [
  { title: 'Overview', items: [{ to: '/admin', label: 'Dashboard', Icon: LayoutDashboard }] },
  {
    title: 'Restaurants',
    Icon: Store,
    items: [
      { to: '/admin/restaurants/applications', label: 'Restaurant Applications', Icon: FileSearch },
      { to: '/admin/restaurants/active', label: 'Active Restaurants', Icon: Store },
      { to: '/admin/restaurants/offboarded', label: 'Offboarded Restaurants', Icon: Archive },
    ],
  },
  {
    title: 'Operations',
    Icon: ClipboardList,
    items: [
      { to: '/admin/orders', label: 'Orders', Icon: ClipboardList },
      { to: '/admin/customers', label: 'Customers', Icon: Users },
      /* One entry, not two. The old /admin/delivery-partners screen was a
         four-row table of courier companies also titled "Delivery Services";
         keeping both would put two near-identical names in one group. Its
         route still resolves — it redirects — so no existing link breaks. */
      { to: '/admin/delivery', label: 'Delivery Services', Icon: Bike },
    ],
  },
  {
    title: 'Performance',
    Icon: Star,
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
      accent="#F89847"
      theme="plum"
      showSearch
    >
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="restaurants/applications" element={<RestaurantApplications />} />
        <Route path="restaurants/active" element={<AdminRestaurants />} />
        <Route path="restaurants/offboarded" element={<AdminRestaurants offboarded />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="delivery" element={<DeliveryServices />} />
        <Route path="delivery-partners" element={<Navigate to="/admin/delivery" replace />} />
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
