import { Route, Routes } from 'react-router-dom';
import {
  BadgePercent,
  BarChart3,
  Bike,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Star,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react';
import { DashboardShell, type DashboardSection } from '../DashboardShell';
import { AdminHome } from './AdminHome';
import {
  AdminAnalytics,
  AdminCustomers,
  AdminDeliveryServices,
  AdminImprovementPlans,
  AdminOrders,
  AdminRatings,
  AdminRestaurants,
  AdminServiceFees,
  AdminSettings,
} from './adminSections';

const SECTIONS: DashboardSection[] = [
  { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/admin/restaurants', label: 'Restaurants', Icon: Store },
  { to: '/admin/customers', label: 'Customers', Icon: Users },
  { to: '/admin/orders', label: 'Orders', Icon: ClipboardList },
  { to: '/admin/delivery', label: 'Delivery Services', Icon: Bike },
  { to: '/admin/ratings', label: 'Ratings & Reviews', Icon: Star },
  { to: '/admin/improvement-plans', label: 'Improvement Plans', Icon: TrendingUp },
  { to: '/admin/fees', label: 'Service Fees', Icon: BadgePercent },
  { to: '/admin/analytics', label: 'Analytics', Icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', Icon: Settings },
];

export function AdminDashboard() {
  return (
    <DashboardShell title="Admin Dashboard" kicker="Platform admin" sections={SECTIONS} accent="#FF258E" showSearch>
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="restaurants" element={<AdminRestaurants />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="delivery" element={<AdminDeliveryServices />} />
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
