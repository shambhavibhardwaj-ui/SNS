import { Navigate } from 'react-router-dom';
import { homeForRole } from '../services/authService';
import { RouteSpinner } from './RequireRole';
import { useAuth } from './useAuth';

/**
 * What "/" means depends on who is asking.
 *
 * A visitor who is not signed in gets the city to explore — discovery is public
 * on purpose. Anyone signed in goes to the home their role belongs to, so an
 * admin does not land in the customer ordering flow.
 */
export function RoleHome({ publicFallback }: { publicFallback: React.ReactNode }) {
  const { status, role } = useAuth();

  if (status === 'loading') return <RouteSpinner />;
  if (status === 'signed-in' && role) return <Navigate to={homeForRole(role)} replace />;

  return <>{publicFallback}</>;
}
