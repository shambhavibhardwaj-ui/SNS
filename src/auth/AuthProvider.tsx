import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  customerFromGoogleCredential,
  getSession,
  isAuthConfigured,
  signIn as persistSignIn,
  signOut as clearSession,
  type AuthState,
} from '../services/authService';
import { AuthContext, type AuthContextValue } from './authContext';

/** Holds the signed-in customer for the whole app. */
export function AuthProvider({ children }: { children: ReactNode }) {
  /* Read once on mount so a reload keeps the person signed in. */
  const [state, setState] = useState<AuthState>(() => getSession());
  const [isDialogOpen, setDialogOpen] = useState(false);

  const completeGoogleSignIn = useCallback((credential: string) => {
    const customer = customerFromGoogleCredential(credential);
    setState(persistSignIn(customer));
    setDialogOpen(false);
  }, []);

  const signOut = useCallback(() => setState(clearSession()), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      customer: state.status === 'signed-in' ? state.customer : null,
      configured: isAuthConfigured(),
      isDialogOpen,
      openSignIn: () => setDialogOpen(true),
      closeSignIn: () => setDialogOpen(false),
      completeGoogleSignIn,
      signOut,
    }),
    [state, isDialogOpen, completeGoogleSignIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
