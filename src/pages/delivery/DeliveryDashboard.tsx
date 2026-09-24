import { Route, Routes } from 'react-router-dom';
import {
  CheckCircle2,
  IndianRupee,
  LayoutDashboard,
  PackageCheck,
  Truck,
  UserRound,
} from 'lucide-react';
import { DashboardShell, type NavGroup } from '../DashboardShell';
import { ActiveDeliveries } from './ActiveDeliveries';
import { DeliveryHome } from './DeliveryHome';
import {
  AssignedOrders,
  CompletedDeliveries,
  DeliveryProfile,
  Earnings,
} from './deliverySections';

const NAV: NavGroup[] = [{ items: [
  { to: '/delivery', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/delivery/assigned', label: 'Assigned Orders', Icon: PackageCheck },
  { to: '/delivery/active', label: 'Active Deliveries', Icon: Truck },
  { to: '/delivery/completed', label: 'Completed', Icon: CheckCircle2 },
  { to: '/delivery/earnings', label: 'Earnings', Icon: IndianRupee },
  { to: '/delivery/profile', label: 'Profile', Icon: UserRound },
] }];

export function DeliveryDashboard() {
  return (
    <DashboardShell
      title="Delivery Dashboard"
      lede="Your assigned runs, what is on the road, and what you have earned."
      kicker="Delivery partner"
      groups={NAV}
      accent="#0E8480"
    >
      <Routes>
        <Route index element={<DeliveryHome />} />
        <Route path="assigned" element={<AssignedOrders />} />
        <Route path="active" element={<ActiveDeliveries />} />
        <Route path="completed" element={<CompletedDeliveries />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="profile" element={<DeliveryProfile />} />
        <Route path="*" element={<DeliveryHome />} />
      </Routes>
    </DashboardShell>
  );
}
