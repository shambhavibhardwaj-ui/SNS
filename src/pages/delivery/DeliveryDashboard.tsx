import { Route, Routes } from 'react-router-dom';
import { CheckCircle2, LayoutDashboard, PackageCheck, Truck, UserRound } from 'lucide-react';
import { DashboardShell, SectionPlaceholder, type DashboardSection } from '../DashboardShell';

/** §6 — structure and routing now, the delivery system later. */
const SECTIONS: DashboardSection[] = [
  { to: '/delivery', label: 'Dashboard', Icon: LayoutDashboard, blurb: 'Today at a glance: what is waiting, what is out, what is done.' },
  { to: '/delivery/assigned', label: 'Assigned Orders', Icon: PackageCheck, blurb: 'Orders handed to you and not yet picked up.' },
  { to: '/delivery/active', label: 'Active Deliveries', Icon: Truck, blurb: 'On the road now, with addresses and delivery instructions.' },
  { to: '/delivery/completed', label: 'Completed Deliveries', Icon: CheckCircle2, blurb: 'Finished runs, for your own record and for payouts.' },
  { to: '/delivery/profile', label: 'Profile', Icon: UserRound, blurb: 'Your details and availability.' },
];

export function DeliveryDashboard() {
  return (
    <DashboardShell title="Delivery" kicker="Delivery partner" sections={SECTIONS} accent="#0E8480">
      <Routes>
        {SECTIONS.map(({ to, label, blurb, Icon }) => (
          <Route
            key={to}
            path={to === '/delivery' ? '/' : to.replace('/delivery/', '')}
            element={<SectionPlaceholder title={label} blurb={blurb} Icon={Icon} />}
          />
        ))}
        <Route
          path="*"
          element={
            <SectionPlaceholder
              title="Not found"
              blurb="That delivery section does not exist."
              Icon={LayoutDashboard}
            />
          }
        />
      </Routes>
    </DashboardShell>
  );
}
