-- 0007 — give every existing auth user a profile
--
-- WHY THIS EXISTS
--
-- `handle_new_user()` runs AFTER INSERT ON auth.users, so it only ever fires
-- for accounts created once the trigger is in place. Anyone who signed in
-- before 0001 was applied has a row in auth.users and no row in profiles, and
-- nothing in 0001 or 0003 backfills them — 0003 updates the role of profiles
-- that already exist, which is not the same thing.
--
-- The effect is not a missing name on a settings page. `fetchProfile()` throws
-- when there is no row, `AuthProvider` catches that and sets the status back to
-- `signed-out`, so the person completes Google sign-in, returns, and the app
-- tells them they are not signed in. There is no way out of it from the
-- browser, because the client cannot insert into profiles — by design.
--
-- Safe to run repeatedly: it inserts only where no profile exists.

insert into public.profiles (user_id, name, email, avatar_url, role)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'full_name', ''),
    nullif(u.raw_user_meta_data ->> 'name', ''),
    split_part(coalesce(u.email, 'guest@unknown'), '@', 1)
  ),
  coalesce(u.email, ''),
  u.raw_user_meta_data ->> 'avatar_url',
  /* The same two sources the trigger uses, in the same order: the allowlist
     if the address is on it, otherwise customer. Nothing the user controls
     reaches this. */
  coalesce(
    (
      select b.role
      from public.admin_bootstrap b
      where lower(b.email) = lower(coalesce(u.email, ''))
    ),
    'customer'
  )
from auth.users u
left join public.profiles p on p.user_id = u.id
where p.user_id is null
on conflict (user_id) do nothing;

-- Re-apply the allowlist, in case an account was created before its address
-- was added to it. Identical to the statement at the foot of 0003.
update public.profiles p
set role = b.role
from public.admin_bootstrap b
where lower(p.email) = lower(b.email)
  and p.role is distinct from b.role;
