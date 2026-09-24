import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { renderGoogleButton } from '../../services/providers/googleIdentity';

/**
 * Sign-in dialog.
 *
 * The button is rendered by Google's own script rather than drawn here: their
 * branding guidelines require it, and it is what carries the account chooser.
 */
export function SignInDialog() {
  const { isDialogOpen, closeSignIn, completeGoogleSignIn, configured } = useAuth();
  const buttonSlot = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState<string | null>(null);

  /* Escape closes, and focus starts inside the dialog. */
  useEffect(() => {
    if (!isDialogOpen) return;
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSignIn();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDialogOpen, closeSignIn]);

  useEffect(() => {
    if (!isDialogOpen || !configured) return;
    const slot = buttonSlot.current;
    if (!slot) return;

    let cancelled = false;
    setError(null);

    renderGoogleButton(
      slot,
      (credential) => {
        if (cancelled) return;
        try {
          completeGoogleSignIn(credential);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'That sign-in could not be completed.');
        }
      },
      (message) => {
        if (!cancelled) setError(message);
      },
    ).catch((e: unknown) => {
      if (!cancelled) setError(e instanceof Error ? e.message : 'Google sign-in failed to load.');
    });

    return () => {
      cancelled = true;
    };
  }, [isDialogOpen, configured, completeGoogleSignIn]);

  if (!isDialogOpen) return null;

  return (
    <div className="au-scrim" onClick={closeSignIn} role="presentation">
      <div
        className="au-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="au-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeButton}
          type="button"
          className="au-close"
          onClick={closeSignIn}
          aria-label="Close sign in"
        >
          <X size={17} strokeWidth={2.2} />
        </button>

        <p className="au-eyebrow">Food City</p>
        <h2 className="au-title" id="au-title">
          Sign in to order
        </h2>
        <p className="au-sub">
          Use your Google account. We read your name, email address and profile picture —
          nothing else, and nothing is posted on your behalf.
        </p>

        {configured ? (
          <>
            <div className="au-button-slot" ref={buttonSlot} />
            {error ? (
              <p className="au-error" role="alert">
                {error}
              </p>
            ) : null}
          </>
        ) : (
          <div className="au-setup" role="note">
            <p className="au-setup-title">Google sign-in is not configured yet</p>
            <p>
              Create an OAuth 2.0 <strong>Web application</strong> client in the Google Cloud
              console, add <code>http://localhost:5173</code> to its authorised JavaScript
              origins, then put the client ID in a <code>.env.local</code> file:
            </p>
            <pre>VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com</pre>
            <p className="au-setup-note">
              The client ID is public and safe to use here. The client <strong>secret</strong> is
              not — it belongs only to a server, never to this app.
            </p>
          </div>
        )}

        <p className="au-legal">
          Signing in creates a customer record so your orders can be saved to your account.
        </p>
      </div>
    </div>
  );
}
