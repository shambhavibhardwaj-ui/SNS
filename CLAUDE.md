# SNS — Restaurant Onboarding

Class project. A restaurant onboarding and operations platform that applies client-defined
business rules to orders and ratings, with a generative AI layer on top.

## Computation models (what we tell the professor)

1. **Service-Oriented Computing** — the app is split into independent services.
2. **Rule-Based Computation** — the client's fixed business rules live inside those services and make every decision.
3. **Generative AI** — a supporting layer only. It drafts text (improvement plans, order suggestions); it never makes a decision, and a person always reviews its output before it's submitted.

Object-oriented programming is how the code is written, not a computation model.

## Services

| Service | Owns |
|---|---|
| Restaurant | Registration, restaurant details, delivery preference |
| Menu & Cuisine | Multiple cuisines, separate menus, menu items |
| Order | Orders, order history, delivery mode per order |
| Rating | Star ratings, written feedback, rating history |
| Performance | Checks RULE-01 and RULE-02, triggers plans and concessions |
| Fee | Aggregator fee, own-delivery fee, service-fee concession |
| Onboarding | The owner's own application: details, delivery choice, documents, submission |
| Delivery workforce | Delivery partners, their status, salary and insurance |

## Business rules (from the client — do not change without asking)

- **RULE-01:** rated below 3★ on more than 5 orders → improvement plan required
- **RULE-02:** rated above 4★ on 10 orders in a week → service-fee concession
- **RULE-03:** restaurant uses aggregator delivery → aggregator delivery fee
- **RULE-04:** restaurant uses its own delivery staff → alternative fee

Both rating rules are **derived from rating rows, never stored as a flag**. `ratings` keeps
one row per rated order rather than a per-restaurant average, because both rules count
*orders* — RULE-01 needs the number below 3★, RULE-02 needs the number above 4★ inside a
seven-day window — and an average can answer neither. The thresholds live in one place,
`services/adminService.ts`.

Fee percentages and the concession amount render as "Not set". The client has not given us
those numbers; inventing one would put a figure in front of an admin that nobody agreed.

These four numbers are the whole `RULE-nn` namespace — there is no RULE-05 or above, and
nothing else in the codebase should claim one. The requirement that a restaurant may carry
several cuisines with separate menus is core, but it is not a numbered rule.

### The same rules read per menu — a proposal, not a change

`ratings` carries the cuisine the order came from, so RULE-01 and RULE-02 can also be
counted per **(restaurant, cuisine)**: `getCuisinesRequiringAttention()` and
`getCuisineConcessionCandidates()` in `adminService`, shown on the analytics page under
"The same two rules, read per menu".

**The client's rules are untouched.** They are written about a restaurant and the original
functions still answer them exactly as written. The finer reading sits alongside so the two
can be compared before anyone proposes rewriting anything — `getGrainDifferences()` returns
every restaurant where they disagree.

Why it is worth comparing, from the seed as it stands:

- **Indian Spice House** — its Mughlai menu earns the concession while its Biryani menu
  needs a plan, in the same week. Read per restaurant it is flagged and rewarded at once,
  which is not an instruction anyone can act on.
- **Corner Wok** — seven low-rated orders as a restaurant, but Cantonese has four and
  Sichuan three. A plan aimed at the kitchen has no target.
- **Anna's Tiffin Room** — earns the concession on ten high-rated orders, but neither menu
  earned it alone (five and five).
- **Spice House** — one cuisine, so both readings agree. The finer grain must not invent a
  difference where there is none.

Both rules count orders and a restaurant's count is the sum of its menus', so a menu can
only trip a threshold its restaurant already tripped. Reading per menu never catches
*more* — it says *where*, and it stops a kitchen carrying the consequence of one menu.

## AI features

- **Improvement-plan draft:** when RULE-01 fires, read recent customer feedback and draft a plan. The restaurant edits and submits it — never auto-submit.
- **Order suggestions:** for customers, suggest items from the restaurant's own menu using selected cuisine, past orders, and preferences the user chose to share.

Neither is built yet.

## Stack

Vite 6 + React 18.3 + TypeScript 5.7 + Tailwind v3.4. `npm run dev` serves on :5173,
`npm run build` runs `tsc` then `vite build`, and oxlint is the linter (`npx oxlint src/`).

Tailwind supplies the reset and utilities; almost all real styling is bespoke CSS in
`src/index.css`, which is long because the isometric city, the dashboards and the analytics
charts each carry their own section.

`tsc` runs against the root `tsconfig.json` (ES2020 lib, `strict`). `tsconfig.app.json`
exists alongside it with different settings and is **not** what the build checks — verify
with `npm run build`, not with `tsc -p tsconfig.app.json`.

Also in use: `react-router-dom` 7, `@supabase/supabase-js` 2, `lucide-react`.

## Architecture

```
src/data/        Relational mock data. Shaped like the tables these become:
                 surrogate ids, FKs, join tables.
  data/admin/    Platform-side seed — restaurants, orders, ratings, applications,
                 delivery partners, analytics series.
src/data/        (also deliveryData.ts — the delivery workforce)
src/services/    The only way the UI reads data. Components must never import
                 src/data directly. Swapping in Supabase changes these bodies,
                 not the components.
src/auth/        Provider, role guard, and routeDecision — a pure function so
                 every guard combination can be tested without a browser.
src/components/  foodcity/ (iso projection, map, buildings), analytics/ (charts,
                 flow diagrams), dashboard/ (shared table, stat cards), admin/,
                 auth/, layout/, listing/, ui/
src/pages/       CustomerApp, admin/, delivery/, LoginPage, DashboardShell
src/theme/       brand.ts — the single source of colour, mirrored as CSS
                 custom properties in index.css
supabase/        SQL migrations. Roles and RLS live here, not in the client.
```

Map geometry lives in `components/foodcity/iso.ts` — district records carry no pixel
coordinates.

The rule that matters: a restaurant belongs to one district but offers many cuisines via
`restaurantCuisines`, and each (restaurant, cuisine) pair gets its own `Menu`. **Menus are
never merged.** Mumbai Spice is the worked example — North Indian, Mughlai and Chaat, three
separate menus. `data/menus.ts` builds one `Menu` row per (restaurant, cuisine) pair from a
per-cuisine dish catalogue, so a combined list cannot be produced even by accident, and
`getMenusForRestaurant` returns an array of per-cuisine menus rather than a flat item list —
the rule is in the return type, not only in the UI.

## Auth and roles

Supabase Auth, with Google and email/password. The role is a column on `profiles` that the
browser **cannot write** — column-level grants exclude it, and the update policy re-checks
it through a `SECURITY DEFINER` function. A trigger on `auth.users` creates the profile and
assigns the role; the only non-`customer` source is the `admin_bootstrap` allowlist table,
which has RLS on and **no policies at all**, so no API request can reach it.

Role checks in React are cosmetic — they decide what renders. What protects the data is row
level security. `/admin?role=admin` grants nothing.

There are four roles: `customer`, `admin`, `delivery` and `restaurant` — the last being the
restaurant *owner*, the person onboarding their kitchen. `HOME_FOR_ROLE` and `ROLE_BADGE`
are both typed by `AppRole` rather than inferred, so adding a fifth fails the build at every
site that enumerates them instead of silently indexing to `undefined`.

Migrations, in order: `0001` profiles and roles · `0002` tighten function grants ·
`0003` admin bootstrap allowlist · `0004` seed the demo admin and delivery accounts ·
`0005` add the `restaurant` role · `0006` seed the demo restaurant-owner account.

**`0005` and `0006` are two files for a reason.** Postgres will not let a new enum value be
used in the same transaction that adds it, and `0006` inserts a row carrying `'restaurant'`.
Combined they fail with "unsafe use of new value of enum type". Run them in order, separately.

No migration contains a password. The demo accounts are allowlisted addresses; the password
is chosen at sign-up and lives only in Supabase Auth, hashed.

Local config goes in `.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Anon key
only — a service-role key must never reach the bundle. With neither set the app still runs;
`supabase` is `null` and auth reports itself unconfigured.

## Current state

**Customer — the SNS city (public, no sign-in needed).** True 2:1 dimetric isometric city on a
diorama slab, depth-sorted by `gx + gy`. Ten cuisine districts, each with its own
architecture rather than a recoloured box — cone, dome-and-tandoor, pizza oven, tiered
eaves, stucco arches, greenhouse, lighthouse, leaf gable, stone parapet, tiled eaves. One
building per restaurant row, so the skyline is the data. Pan, zoom, pinch and four-way
rotation; a merged collapsible sidebar. Clicking a district opens its restaurant listing,
where the visual language deliberately drops to a clean light ordering interface.

**Admin.** Home/overview, restaurant applications (tabs, search, sort, session decisions),
the management tables, `/admin/analytics` — KPIs, order and revenue trends, onboarding
funnel and process diagram, order lifecycle, cuisine and restaurant tables, delivery-model
comparison, customer growth and conversion, ratings, business-rule monitoring, platform
health, activity timeline, top performers, cross-cutting filters and CSV export — and
`/admin/delivery`, Delivery Services.

**Delivery Services** (`/admin/delivery`) is a tab in that same shell, not a second
dashboard: the workforce of 24 riders, a status ring, shift cover, the salary bill, delivery
performance at three grains, orders per partner, the delivery status flow, insurance cover
with an expiry watch, and the two delivery models compared. `/admin/delivery-partners`
redirects to it — that route used to hold a four-row table of courier *companies*, also
titled "Delivery Services", and two near-identical names in one nav group helped nobody.

**Note the two senses of "delivery partner".** `data/admin/types.ts` has one — a courier
*company*, QuickDrop and the rest, which the platform buys capacity from.
`data/deliveryData.ts` has the other — a *person* who rides, with a salary, an insurance
policy and a shift. They are different tables that the brief gives the same English name,
so the rider rows call the company a `provider` and keep `partner` for the person.

**Delivery.** Home, assigned orders, completed deliveries, earnings, profile.

**Restaurant owner** (`/restaurant`). A registration flow, in five steps:
**details → documents → delivery method → submit → admin review**. An overview with the
stepper, a completeness meter, the admin's verdict when there is one, and a history log; the
details form with a live checklist; the document checklist; the delivery-method choice; and
a review-and-submit page. It is its own dashboard rather than a tab because the actor is
different — this is the person applying.

Its one rule: **the owner should never have to guess.** Every document states its position in
words, with the date it changed and, when it was returned, the admin's reason in full. The
stage, the percentage and the list of blockers are all derived in `onboardingService` from
the fields and documents on each read — nothing is stored as a conclusion, so the page cannot
disagree with the form underneath it. `submitApplication()` re-checks readiness in the
service, because a disabled button is a hint and not a rule.

A document the owner uploads always lands on `Uploaded`, never `Verified`: only an admin
verifies, and a function that let an owner do it would make the checklist decorative.

**Customer — ordering.** Restaurant page with one tab per cuisine and a separate menu
behind each, cart grouped by cuisine, checkout with address validation, and an order
confirmation carrying the same grouping through to the receipt. A cart holds one
restaurant at a time; switching is asked for, not done silently.

**Not built yet:** search, Foodie AI, order history, the restaurant owner's own dashboard,
and any real backend reads — every screen still reads mock data through the services.
Payment is not integrated and is not simulated: cash on delivery is the only method that
means anything, and the others are disabled rather than shown as working. Placed orders
live in memory, so a reload loses them.

Stubs, deliberately inert and marked `aria-disabled`: top-bar search, the cart control, and
the "Ask Foodie AI" launcher.

## Delivery salary

Every delivery partner is on the same flat **₹1,800 a month**, which is why no partner row
carries a `salary` field — a per-row number could silently disagree with the constant. The
bill is headcount × `BASE_MONTHLY_SALARY`, computed on read in `deliveryService`, so adding
a partner moves the card, the analytics panel and the eight-month graph together and none of
them can drift.

Who counts is one decision in one place, `isSalaryEligible()`: a rider **on leave is still
paid**, an **inactive one is not**. That is why the eligible count (21) is not the headcount
(24), and the page shows both so the gap is visible rather than mysterious.

The salary history counts, for each month, the eligible riders who had joined by the end of
it — real growth from the joining dates, not a drawn curve. Its one honest limit: a rider
inactive *today* is treated as having been ineligible throughout, because the mock rows
carry no employment history. Real data would carry a status log.

Delivery *performance* reads the same `dailySeries` the analytics page does, rather than a
series of its own. Every order on this platform is a delivery, so a second set of numbers
would let two admin pages report different totals for the same events.

## Onboarding

`data/onboarding.ts` is the owner's side of `data/admin/applications.ts` — the admin file is
a queue of other people's applications, this is the one belonging to the signed-in owner,
with the parts an admin never sees. The seed is deliberately part-finished: one document
verified, one returned with a reason, one never uploaded, so the "needs replacement" path is
shown to work rather than asserted.

Readiness has one deliberate asymmetry. A document that is merely `Uploaded` does **not**
block submission — waiting for an admin to verify it is an admin's job, and holding the
application for it would deadlock, since an admin only looks once it is submitted.

### The two dashboards are joined

`services/applicationQueue.ts` is the seam. The owner's record enters the admin queue when
it is **submitted**, and a decision made in the admin dashboard is written back onto that
record, so the owner sees it. Before this they were two unconnected arrays and neither side
could ever hear the other.

It is a module store with `subscribe` + `useSyncExternalStore`, not React state, because two
dashboards on two routes have to agree. **The snapshot is a version number, not the row
array** — `useSyncExternalStore` compares by identity and the array is rebuilt on every read,
so returning it would look changed every time and never settle.

Three behaviours worth keeping:

- A **draft is not in the queue**. Nobody else's business until it is sent.
- **"Needs changes" takes it back out** and clears `submittedAt`, so an admin is not reviewing
  an application they have just asked someone to change. Resubmitting clears the old decision
  with it, or the owner would read "Rejected" above an application back in the queue.
- Only **Approved or Rejected** completes the "Admin review" step. "Needs changes" is a
  decision but not an ending.

Decisions on the *seed* rows stay in session state — those fixtures have no owner behind
them, and the decision log marks which ones were actually written back.

The admin's `ApplicationReview` carries a Documents section, so one application is one page
as the brief asks. It renders only for the application that came through the restaurant
dashboard: the seed rows have no documents, and showing one owner's paperwork under another
applicant's name is worse than showing none. Read-only there — verifying a document is its
own decision with its own audit trail, and folding it into approve/reject would let one click
accept five documents nobody opened.

## Analytics

`/admin/analytics` follows one rule: **the page computes nothing.** Every figure, share,
percentage change and rule verdict arrives finished from `services/analyticsService.ts`.
Comparisons are the current window measured against the window before it, from the same
series — not stored change figures. The rule verdicts come from `adminService` rather than
being re-derived, so there is one definition and it cannot drift.

Charts and flow diagrams are hand-built SVG in `components/analytics/`, with no chart
library: a dependency would bring its own colour system, fonts and DOM conventions to argue
with the dashboard. `FlowDiagram` is reusable — nodes are ordinary HTML (so a node can be a
router `Link` and take focus) over an SVG edge layer, positioned arithmetically from a
`col`/`row` grid.

The day series is generated once at module load from a seeded PRNG. `Math.random()` would
redraw on every render and the tooltip would disagree with the line under the cursor;
`MOCK_TODAY` is fixed for the same reason the rules use it.

## Design

Two visual languages, on purpose. The city is an illustrated isometric world; everything
past it — listings, dashboards, analytics — is a clean, practical interface. Every drawn
element is original SVG, canvas or shader work; `src/assets/ATTRIBUTION.md` records that
there is no third-party art left in the project.

The sign-in screen's left panel is `components/ui/cloud-sky` — a WebGL sky of drifting
clouds, adapted from an Originkit component. It replaced a flat SVG skyline that repeated
the real isometric city badly. It stops for `prefers-reduced-motion`, paints one frame and
pauses in a hidden tab, and falls back to its flat background colour where WebGL is
unavailable. **Do not add `loseContext()` to its cleanup** — StrictMode runs effects twice,
`getContext` returns the same context object per canvas, and that call kills the context the
second run draws into.

**The whole sign-in screen is blue, and it is the one deliberate exception to the palette.**
Asked for. The sky runs `#0075FF` to `#B4D2F0`; the panel beside it redefines the `--app-*`
and `--teal-*` tokens inside `.lg-page`, the same technique the admin uses for plum — so
every rule already reads them and `var(--teal-800)` resolves to a deep blue here and stays
teal everywhere else.

Scoped to `.lg-page` on purpose: a blue token at `:root` would follow the user into the city
and the dashboards, which are not blue. The one screen a person sees before they are anyone
is allowed its own weather; everything past it is the house palette.

Two things stay put. The SNS mark keeps its plum and butter — a logo does not take the
theme. And errors stay crimson: a failure must not read as the accent colour.

Brand palette in `src/theme/brand.ts`, mirrored as CSS custom properties: deep teal
`#0A6A66`, butter `#FFF8B5`, soft pink `#FCA5D1`, hot magenta `#FF258E`, soft salmon
`#FC7494`, dark slate `#374151`. Roughly 60% teal and neutral, 25% warm light, 10% butter,
5% accents. Architectural materials (terracotta, sand, stone, timber) are materials, not
accents, and sit outside that budget.

`index.css` defines two token sets: the brand `--teal-*` / `--butter*` / `--cream*` family,
and an `--app-*` family for the light ordering and dashboard surfaces.

**The admin section runs its own palette** — Tangerine `#F89847` and Plum `#7F1633`. It is
one CSS block keyed off `.db[data-theme='plum']`, which redefines the brand tokens inside
that subtree: anything already written as `var(--teal-700)` resolves to a plum there, and
the accent that was magenta becomes tangerine. `DashboardShell` takes a `theme` prop, so
the delivery dashboard and the customer city keep the house teal without a second shell.

The staff rail collapses by section: a `NavGroup` with a title and more than one link
becomes a `components/ui/animated-dropdown` that opens in flow, and one with a single link
(or no title, as the delivery rail has) stays flat. The section holding the current page
opens itself; a choice made by hand sticks until the route moves to a different section.
Tangerine is light — white on it is about 2.2:1 — so labels sitting on the accent are dark
plum, not white.

Fonts: Fraunces (headings), Plus Jakarta Sans and Inter (body), IBM Plex Mono (labels and
figures).

## Conventions

- Components never import **rows** from `src/data`. Services are the only reader.
  Importing a type, or an enum label map such as `DELIVERY_MODEL_LABEL`, is fine — those
  are the shape, not the data. **Currently broken** by the staff mock screens:
  `pages/admin/adminSections.tsx`, `pages/delivery/deliverySections.tsx`,
  `pages/delivery/DeliveryHome.tsx` and `pages/delivery/ActiveDeliveries.tsx` all read
  `data/staffMock.ts` directly. They predate the service layer; route them through a
  service when they grow real behaviour.
- Nothing is stored as a conclusion. No `needsImprovementPlan: true`, no
  `changePercent: 12.4` — derive it where it is used, from the counts underneath.
- Don't invent a number the client has not given. "Not set" is an honest answer.
- Mock data should include cases that *fail* a rule, so a threshold is shown to bite
  rather than merely asserted.
- Run `npm run build` and `npx oxlint src/` before committing.

## Naming

The product is **SNS**. The illustrated isometric map inside it is "the city" — it was
called Food City until the brand settled, so the code still carries that name in places
that are not user-visible: the `components/foodcity/` directory, the `FoodCity` component
and the `fc-` CSS prefix. Those are identifiers, not copy; renaming them is churn with no
user-visible effect. Nothing a customer reads says "Food City".

## Open questions

- Real team member names
- Real fee percentages and the concession amount from the client
