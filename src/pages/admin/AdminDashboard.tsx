import { Route, Routes } from 'react-router-dom';
import {
  BadgePercent,
  Bike,
  ClipboardList,
  LayoutDashboard,
  Star,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react';
import { DashboardShell, SectionPlaceholder, type DashboardSection } from '../DashboardShell';

/** §5 — structure and routing now, features later. */
const SECTIONS: DashboardSection[] = [
  { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard, blurb: 'Platform health at a glance: orders today, active restaurants, flagged accounts.' },
  { to: '/admin/restaurants', label: 'Restaurants', Icon: Store, blurb: 'Onboarding queue, cuisines, menus and delivery preference per restaurant.' },
  { to: '/admin/customers', label: 'Customers', Icon: Users, blurb: 'Customer accounts, order history and support lookups.' },
  { to: '/admin/orders', label: 'Orders', Icon: ClipboardList, blurb: 'Every order across the platform, with status and delivery mode.' },
  { to: '/admin/delivery', label: 'Delivery Services', Icon: Bike, blurb: 'Aggregator fleet and restaurants running their own delivery staff.' },
  { to: '/admin/ratings', label: 'Ratings & Reviews', Icon: Star, blurb: 'Star ratings and written feedback, the input to RULE-01 and RULE-02.' },
  { to: '/admin/improvement-plans', label: 'Improvement Plans', Icon: TrendingUp, blurb: 'Plans required when a restaurant falls below 3★ on more than 5 orders.' },
  { to: '/admin/fees', label: 'Service Fees', Icon: BadgePercent, blurb: 'Aggregator and own-delivery fees, and concessions earned under RULE-02.' },
];

export function AdminDashboard() {
  return (
    <DashboardShell title="Admin" kicker="Platform admin" sections={SECTIONS} accent="#FF258E">
      <Routes>
        {SECTIONS.map(({ to, label, blurb, Icon }) => (
          <Route
            key={to}
            path={to === '/admin' ? '/' : to.replace('/admin/', '')}
            element={<SectionPlaceholder title={label} blurb={blurb} Icon={Icon} />}
          />
        ))}
        <Route
          path="*"
          element={
            <SectionPlaceholder
              title="Not found"
              blurb="That admin section does not exist."
              Icon={LayoutDashboard}
            />
          }
        />
      </Routes>
    </DashboardShell>
  );
}
