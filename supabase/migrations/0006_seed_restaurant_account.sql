-- The demo restaurant-owner account.
--
-- Run 0005 first; this file uses the enum value that one adds.
--
-- Same shape as the admin and delivery demo accounts in 0004: the address goes
-- on the allowlist, and the signup trigger reads it to assign the role at the
-- moment the account is created. The browser still has no say in the matter —
-- `role` is not writable by the `authenticated` database role at all, so
-- signing up with this address is the *only* way to get it.
--
-- The password is NOT here, deliberately, exactly as in 0004. It is chosen at
-- sign-up on the login screen and lives only in Supabase Auth, hashed. A
-- password written into a migration is a password in git history for good —
-- and this one has been shared in plain text in a chat, so treat it as a demo
-- credential and nothing more: it must never guard anything real.

insert into public.admin_bootstrap (email, role, note) values
  ('onboard@mail.com', 'restaurant', 'demo restaurant-owner account')
on conflict (email) do update
  set role = excluded.role,
      note = excluded.note;

-- Applies the role to the account if it was created before this ran. A no-op
-- otherwise, and it touches nothing that is not on the allowlist.
update public.profiles p
set role = b.role
from public.admin_bootstrap b
where lower(p.email) = lower(b.email)
  and p.role is distinct from b.role;
