import { createContext } from 'react';
import type { Customer } from '../data/types';
import type { AuthState } from '../services/authService';

export interface AuthContextValue {
  state: AuthState;
  customer: Customer | null;
  /** False when no identity provider is configured; the UI says so rather than failing. */
  configured: boolean;
  isDialogOpen: boolean;
  openSignIn: () => void;
  closeSignIn: () => void;
  /** Called with the raw Google credential once the user picks an account. */
  completeGoogleSignIn: (credential: string) => void;
  signOut: () => void;
}

/** Kept apart from the provider so each file exports one kind of thing. */
export const AuthContext = createContext<AuthContextValue | null>(null);
