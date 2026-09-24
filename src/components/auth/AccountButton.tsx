import { useEffect, useRef, useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';

/** Top-bar account control: signed-out prompt, or the signed-in person's menu. */
export function AccountButton() {
  const { customer, openSignIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!customer) {
    return (
      <button type="button" className="fc-profile is-action" onClick={openSignIn}>
        <span className="fc-profile-avatar" aria-hidden="true">
          <User size={15} strokeWidth={2.2} />
        </span>
        <span>Sign in</span>
      </button>
    );
  }

  const initial = (customer.givenName ?? customer.name ?? customer.email).charAt(0).toUpperCase();

  return (
    <div className="au-account" ref={wrap}>
      <button
        type="button"
        className="fc-profile is-action"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="fc-profile-avatar" aria-hidden="true">
          {customer.avatarUrl ? (
            <img src={customer.avatarUrl} alt="" referrerPolicy="no-referrer" />
          ) : (
            initial
          )}
        </span>
        <span>{customer.givenName ?? customer.name}</span>
      </button>

      {open ? (
        <div className="au-menu" role="menu">
          <div className="au-menu-head">
            <p className="au-menu-name">{customer.name}</p>
            <p className="au-menu-email">{customer.email}</p>
          </div>
          <button
            type="button"
            className="au-menu-item"
            role="menuitem"
            onClick={() => {
              signOut();
              setOpen(false);
            }}
          >
            <LogOut size={15} strokeWidth={2} />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
