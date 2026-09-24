-- Food City — profiles, roles and row level security.
--
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
--
-- The whole point of this file is that a role can never be set by the browser.
-- Profiles are created by a trigger the client cannot reach, and the `role`
-- column is not writable by the `authenticated` database role at all — so a
-- customer editing requests in devtools cannot make themselves an admin.

-- ---------------------------------------------------------------- types --

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('customer', 'admin', 'delivery');
  end if;
end
$$;

-- --------------------------------------------------------------- table --

create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users (id) on delete cascade,
  name        text not null default '',
  email       text not null,
  avatar_url  text,
  role        public.app_role not null default 'customer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists profiles_user_id_idx on public.profiles (user_id);
create index if not exists profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------- column privileges --

-- Supabase grants ALL on new public tables to anon/authenticated by default,
-- so start by taking that away and hand back only what the app needs.
--
-- This is the strongest guard in the file: `role` is simply not in the UPDATE
-- grant, so an attempt to change it is refused by Postgres before any policy
-- is consulted. `email` and `user_id` are withheld for the same reason —
-- they come from the verified identity, not from the client.
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (name, avatar_url, updated_at) on table public.profiles to authenticated;

-- ------------------------------------------------------------ RLS setup --

alter table public.profiles enable row level security;
-- Applies the policies to the table owner too, so nothing slips past.
alter table public.profiles force row level security;

-- Reading the caller's role from inside a policy on `profiles` would recurse.
-- SECURITY DEFINER runs as the function owner and bypasses RLS, breaking the
-- cycle. It is deliberately narrow: it returns one enum for the current user
-- and takes no arguments, so it cannot be used to read anyone else's row.
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where user_id = auth.uid()
$$;

revoke all on function public.current_app_role() from public;
grant execute on function public.current_app_role() to authenticated;

-- --------------------------------------------------------------- policies --

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "admins read every profile" on public.profiles;
create policy "admins read every profile"
  on public.profiles for select to authenticated
  using (public.current_app_role() = 'admin');

-- Belt and braces alongside the column grant: even if someone later widens the
-- grant by mistake, the new row's role must still equal the stored one.
drop policy if exists "update own profile without changing role" on public.profiles;
create policy "update own profile without changing role"
  on public.profiles for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and role = public.current_app_role());

-- No INSERT or DELETE policy for `authenticated`, and no grant either.
-- Profiles appear only through the trigger below, and disappear only when the
-- auth user is deleted (on delete cascade).

-- -------------------------------------------------- first-login profile --

-- Runs as the function owner, so it can insert a row the client is not allowed
-- to insert. `role` is hard-coded: nothing the user sends can influence it.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
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
    'customer'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------ updated_at --

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------- provisioning a role --

-- The only supported way to change a role from inside the app. It checks the
-- caller is already an admin, so it cannot be used to bootstrap one.
create or replace function public.set_user_role(target_email text, new_role public.app_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_app_role() is distinct from 'admin' then
    raise exception 'Only an admin can change roles';
  end if;

  update public.profiles set role = new_role where email = target_email;

  if not found then
    raise exception 'No profile with that email';
  end if;
end;
$$;

revoke all on function public.set_user_role(text, public.app_role) from public;
grant execute on function public.set_user_role(text, public.app_role) to authenticated;

-- ------------------------------------------------------ first admin --
--
-- There is no admin yet, so the first one has to be made here, in the SQL
-- editor, which runs with privileges no browser session has. Sign in through
-- the app once with the account you want to promote, then run:
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
--
-- Delivery accounts are provisioned the same way, or by an admin calling
-- set_user_role() once the admin dashboard has that screen.
