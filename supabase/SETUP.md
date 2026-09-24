# Supabase setup — Food City

Project: `naowkebtohxtilbzcpnr`
Base URL: `https://naowkebtohxtilbzcpnr.supabase.co`

Four steps. Do them in order — step 4 fails silently if step 2 has not run.

---

## 1. Publishable key into `.env.local`

Dashboard → **Project Settings → API Keys** → copy the **`anon` / publishable**
key (a long string beginning `eyJ…`, or a `sb_publishable_…` key on newer
projects).

Paste it into `.env.local`, which already has the URL:

```
VITE_SUPABASE_ANON_KEY=<paste here>
```

Then restart the dev server — Vite only reads env files at startup.

> **Not the `service_role` key.** That one bypasses row level security
> completely. Anything in a `VITE_` variable is sent to the browser, so putting
> it here would hand every visitor full read/write access to the database.

---

## 2. Run the database migration

Dashboard → **SQL Editor → New query** → paste the whole of
[`migrations/0001_profiles_and_roles.sql`](migrations/0001_profiles_and_roles.sql)
→ **Run**.

This creates the `profiles` table, the role enum, row level security, and the
trigger that gives every new sign-in a `customer` profile.

Check it worked:

```sql
select tablename, rowsecurity from pg_tables where tablename = 'profiles';
-- rowsecurity must be true

select tgname from pg_trigger where tgname = 'on_auth_user_created';
-- one row
```

---

## 3. Enable Google sign-in

**In Google Cloud Console** → APIs & Services → Credentials → create an
**OAuth client ID → Web application**:

- Authorised JavaScript origins: `http://localhost:5173`
- Authorised **redirect URI** — this one is Supabase's, not the app's:

```
https://naowkebtohxtilbzcpnr.supabase.co/auth/v1/callback
```

Copy the client ID **and** client secret.

**In Supabase** → Authentication → **Sign In / Providers → Google** → enable,
and paste both values there.

> The client secret goes into the Supabase dashboard, where it stays on their
> server. It must not go into this repo or any `VITE_` variable.

**In Supabase** → Authentication → **URL Configuration**:

- Site URL: `http://localhost:5173`
- Redirect URLs: add `http://localhost:5173/login`

That last one matters: the app asks to be returned to `/login`, and Supabase
refuses any redirect target not on this list.

---

## 4. Make yourself an admin

Sign in through the app once, so the trigger creates your profile. Then, in the
SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

There is no way to do this from the browser, by design — the `role` column is
not writable by the `authenticated` database role. The SQL editor runs with
privileges no browser session has, which is why the first admin has to be made
here.

After that, an admin can promote others from inside the app:

```sql
select public.set_user_role('them@example.com', 'delivery');
```

That function checks the caller is already an admin, so it cannot be used to
create the first one.

---

## Checking the security actually holds

Signed in as a customer, in the browser console:

```js
const { data, error } = await window.__sb.from('profiles')
  .update({ role: 'admin' }).eq('user_id', (await window.__sb.auth.getUser()).data.user.id).select();
console.log({ data, error });
```

It must fail, or update nothing. If it returns a row with `role: 'admin'`,
step 2 did not run properly — stop and fix it before going further.

(`window.__sb` is only exposed when running the dev server; see
`src/services/supabaseClient.ts`.)
