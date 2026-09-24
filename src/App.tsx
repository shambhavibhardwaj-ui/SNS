import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { RequireRole } from './auth/RequireRole';
import { RoleHome } from './auth/RoleHome';
import { CustomerApp } from './pages/CustomerApp';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DeliveryDashboard } from './pages/delivery/DeliveryDashboard';

/**
 * Routing.
 *
 * Discovery is public — a visitor can wander Food City before signing in, which
 * is the whole point of the city. Everything that belongs to an account sits
 * behind a role guard, and each guard redirects to the signer's own home rather
 * than to a dead end.
 *
 * The guards decide what renders. What actually protects the data is row level
 * security in Supabase; see supabase/migrations/0001_profiles_and_roles.sql.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Signed out: explore the city. Signed in: go to your own home. */}
          <Route path="/" element={<RoleHome publicFallback={<CustomerApp />} />} />

          <Route
            path="/customer/*"
            element={
              <RequireRole allow={['customer']}>
                <CustomerApp />
              </RequireRole>
            }
          />

          <Route
            path="/admin/*"
            element={
              <RequireRole allow={['admin']}>
                <AdminDashboard />
              </RequireRole>
            }
          />

          <Route
            path="/delivery/*"
            element={
              <RequireRole allow={['delivery']}>
                <DeliveryDashboard />
              </RequireRole>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
