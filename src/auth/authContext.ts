import { createContext } from 'react';
import type { AppRole, AuthStatus, Profile } from '../services/authService';

export interface AuthContextValue {
  status: AuthStatus;
  profile: Profile | null;
  /**
   * Convenience for rendering only. What actually protects admin data is row
   * level security on the server, not this value.
   */
  role: AppRole | null;
  /** Message to show the person when something went wrong. */
  error: string | null;
  clearError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  /** Resolves true when the account needs its email confirmed before use. */
  signUpWithPassword: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

/** Kept apart from the provider so each file exports one kind of thing. */
export const AuthContext = createContext<AuthContextValue | null>(null);
