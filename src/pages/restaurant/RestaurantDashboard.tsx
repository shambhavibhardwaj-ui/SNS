import { Route, Routes } from 'react-router-dom';
import { OnboardingLayout } from './OnboardingLayout';
import { OnboardingHome } from './OnboardingHome';
import { RestaurantDetails } from './RestaurantDetails';
import { DeliveryMethod } from './DeliveryMethod';
import { Documents } from './Documents';
import { SubmitApplication } from './SubmitApplication';

/**
 * The restaurant owner's dashboard.
 *
 * Registration is a sequence, so it gets `OnboardingLayout` rather than the
 * staff `DashboardShell`: the left column here is five steps with an order and
 * a state each, which a list of links cannot express. See that file.
 */
export function RestaurantDashboard() {
  return (
    <Routes>
      <Route element={<OnboardingLayout />}>
        <Route index element={<OnboardingHome />} />
        <Route path="details" element={<RestaurantDetails />} />
        <Route path="documents" element={<Documents />} />
        <Route path="delivery" element={<DeliveryMethod />} />
        <Route path="submit" element={<SubmitApplication />} />
        <Route path="*" element={<OnboardingHome />} />
      </Route>
    </Routes>
  );
}
