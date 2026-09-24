-- Admin bootstrap allowlist.
--
-- The problem this solves: the first admin has to be made by hand in the SQL
-- editor, which is tedious when you are setting up or testing.
--
-- The tempting shortcut is a list of admin emails in the frontend. That does
-- not work: anything in the bundle is public and editable, so the role check
-- stops being a fact and becomes a suggestion. This keeps the list in the
-- database, where the browser cannot read it, let alone change it.
--
-- Put an email here BEFORE its first sign-in and the signup trigger assigns
-- the role. Add one afterwards and the statement at the bottom applies it.

create table if not exists public.admin_bootstrap (
  email       text primary key,
  role        public.app_role not null default 'admin',
  note        text,
  created_at  timestamptz not null default now()
);

-- Nobody reaches this through the API. It names privileged accounts, which is
-- exactly the list an attacker would want, and no screen has any reason to
-- show it. Only the SQL editor and SECURITY DEFINER functions touch it.
revoke all on table public.admin_bootstrap from anon, authenticated;
alter table public.admin_bootstrap enable row level security;
alter table public.admin_bootstrap force row level security;
-- No policies at all: with RLS on and none defined, every API request is denied.

-- ------------------------------------------------ signup trigger, updated --

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  seeded public.app_role;
begin
  /* Case-insensitive: nobody types their own address consistently. */
  select b.role into seeded
  from public.admin_bootstrap b
  where lower(b.email) = lower(coalesce(new.email, ''));

  insert into public.profiles (user_id, name, email, avatar_url, role)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(coalesce(new.email, 'guest@unknown'), '@', 1)
    ),
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'avatar_url',
    /* Still defaults to customer. The allowlist is the only other source, and
       it is not reachable from the browser. */
    coalesce(seeded, 'customer')
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- --------------------------------------------- apply to existing accounts --

-- Safe to re-run. Only touches profiles whose email is on the allowlist.
update public.profiles p
set role = b.role
from public.admin_bootstrap b
where lower(p.email) = lower(b.email)
  and p.role is distinct from b.role;

-- ----------------------------------------------------------------- usage --
--
-- Add yourself, then sign in (or sign out and back in if you already have):
--
--   insert into public.admin_bootstrap (email, role, note)
--   values ('you@example.com', 'admin', 'project owner')
--   on conflict (email) do update set role = excluded.role;
--
--   update public.profiles p set role = b.role
--   from public.admin_bootstrap b
--   where lower(p.email) = lower(b.email) and p.role is distinct from b.role;
--
-- Removing someone from this list does not demote them; change the profile
-- directly, or use set_user_role() as an admin.
