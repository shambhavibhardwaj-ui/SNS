import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bike, Heart, LogOut, ReceiptText, ShieldCheck, Store, UserRound, type LucideIcon } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import type { AppRole } from '../../services/authService';

/* Typed by `AppRole` rather than inferred, so adding a role to the enum fails
   the build here instead of indexing to `undefined` at runtime. */
const ROLE_BADGE: Record<AppRole, { label: string; Icon: LucideIcon; to: string }> = {
  admin: { label: 'Admin', Icon: ShieldCheck, to: '/admin' },
  delivery: { label: 'Delivery', Icon: Bike, to: '/delivery' },
  restaurant: { label: 'Restaurant', Icon: Store, to: '/partner' },
  customer: { label: 'Customer', Icon: UserRound, to: '/customer' },
};

/** Top-bar account control: sign-in prompt, or the signed-in person's menu. */
export function AccountButton() {
  const { status, profile, role, signOut } = useAuth();
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

  if (status !== 'signed-in' || !profile || !role) {
    return (
      <Link to="/login" className="fc-profile is-action">
        <span className="fc-profile-avatar" aria-hidden="true">
          <UserRound size={15} strokeWidth={2.2} />
        </span>
        <span>Sign in</span>
      </Link>
    );
  }

  const badge = ROLE_BADGE[role];
  const initial = profile.name.charAt(0).toUpperCase() || 'G';

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
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" referrerPolicy="no-referrer" />
          ) : (
            initial
          )}
        </span>
        <span>{role === 'customer' ? profile.name.split(' ')[0] : badge.label}</span>
      </button>

      {open ? (
        <div className="au-menu" role="menu">
          <div className="au-menu-head">
            <p className="au-menu-name">{profile.name}</p>
            <p className="au-menu-email">{profile.email}</p>
            <p className="au-menu-role">
              <badge.Icon size={12} strokeWidth={2.4} />
              {badge.label}
            </p>
          </div>

          {role === 'customer' ? (
            <>
              <MenuLink to="/customer/profile" Icon={UserRound} label="Profile" onGo={() => setOpen(false)} />
              <MenuLink to="/customer/orders" Icon={ReceiptText} label="Orders" onGo={() => setOpen(false)} />
              <MenuLink to="/customer/favorites" Icon={Heart} label="Favorites" onGo={() => setOpen(false)} />
            </>
          ) : (
            <MenuLink to={badge.to} Icon={badge.Icon} label={`${badge.label} dashboard`} onGo={() => setOpen(false)} />
          )}

          <button
            type="button"
            className="au-menu-item"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
          >
            <LogOut size={15} strokeWidth={2} />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  to,
  Icon,
  label,
  onGo,
}: {
  to: string;
  Icon: typeof UserRound;
  label: string;
  onGo: () => void;
}) {
  return (
    <Link to={to} className="au-menu-item" role="menuitem" onClick={onGo}>
      <Icon size={15} strokeWidth={2} />
      {label}
    </Link>
  );
}
