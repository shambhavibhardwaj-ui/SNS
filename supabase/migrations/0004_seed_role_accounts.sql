-- Demo accounts for the two staff roles.
--
-- A marking demo needs a way into the admin and delivery dashboards that does
-- not depend on whose Google account is to hand. These two addresses are on
-- the allowlist, so the signup trigger gives them their role the moment the
-- account is created, and the browser still has no say in it.
--
-- Passwords are NOT here. They are chosen at sign-up on the login screen and
-- live only in Supabase Auth, hashed. A password written into a migration is a
-- password in git history for good.
--
-- Despite the table's name the allowlist carries any app_role, not just admin.

insert into public.admin_bootstrap (email, role, note) values
  ('admin@mail.com',    'admin',    'demo admin account'),
  ('delivery@mail.com', 'delivery', 'demo delivery account')
on conflict (email) do update
  set role = excluded.role,
      note = excluded.note;

-- Applies the role to accounts that already exist. Safe to re-run; it only
-- touches profiles whose email is on the allowlist and whose role is wrong.
update public.profiles p
set role = b.role
from public.admin_bootstrap b
where lower(p.email) = lower(b.email)
  and p.role is distinct from b.role;

-- ------------------------------------------------- the customer account --
--
-- The owner's own Gmail signs in as a customer, and customer is already the
-- default, so it is deliberately absent from the allowlist above.
--
-- An earlier draft of this setup listed that address as an admin. If that
-- version was ever run, these two statements undo it. Both are no-ops
-- otherwise, and neither touches any other account.

delete from public.admin_bootstrap
where lower(email) = lower('shambhavibhardwaj2x@gmail.com');

update public.profiles
set role = 'customer'
where lower(email) = lower('shambhavibhardwaj2x@gmail.com')
  and role is distinct from 'customer';
