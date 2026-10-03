import { Route, Routes } from 'react-router-dom';
import { FileCheck2, LayoutDashboard, Send, Store, Truck } from 'lucide-react';
import { DashboardShell, type NavGroup } from '../DashboardShell';
import { OnboardingHome } from './OnboardingHome';
import { RestaurantDetails } from './RestaurantDetails';
import { DeliveryMethod } from './DeliveryMethod';
import { Documents } from './Documents';
import { SubmitApplication } from './SubmitApplication';

/**
 * The restaurant owner's dashboard.
 *
 * A dashboard of its own rather than a tab somewhere, because the actor is
 * different: this is the person applying, and nothing they do here is anything
 * an admin, a customer or a rider does. They share the shell — same sidebar,
 * header and layout as admin and delivery — and nothing else.
 *
 * Flat navigation on purpose. Five links in the order the work happens; the
 * collapsing sections the admin rail uses exist to tame fourteen links, and
 * imposing them on five would hide a list you can read whole.
 */
const NAV: NavGroup[] = [{ items: [
  { to: '/restaurant', label: 'Overview', Icon: LayoutDashboard },
  { to: '/restaurant/details', label: 'Restaurant Details', Icon: Store },
  { to: '/restaurant/delivery', label: 'Delivery Method', Icon: Truck },
  { to: '/restaurant/documents', label: 'Documents', Icon: FileCheck2 },
  { to: '/restaurant/submit', label: 'Submit Application', Icon: Send },
] }];

export function RestaurantDashboard() {
  return (
    <DashboardShell
      title="Onboarding"
      lede="Register your restaurant, choose how orders are delivered, and send it for review."
      kicker="Restaurant owner"
      accent="#0E8480"
      groups={NAV}
    >
      <Routes>
        <Route index element={<OnboardingHome />} />
        <Route path="details" element={<RestaurantDetails />} />
        <Route path="delivery" element={<DeliveryMethod />} />
        <Route path="documents" element={<Documents />} />
        <Route path="submit" element={<SubmitApplication />} />
        <Route path="*" element={<OnboardingHome />} />
      </Routes>
    </DashboardShell>
  );
}
