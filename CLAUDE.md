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
rotation; a collapsible sidebar. **Home and Cart sit in the top bar**, on the account side
of the search — they are true on every screen, the cart follows you out of the city, and
they group with the other control that is about the person rather than about the map. The
sidebar is about the map beside it: a collapse toggle and the district rail, opening
straight onto the districts. Home in the bar means the city, not the camera — the map
carries its own reset control, and from the bar the useful move is leaving a listing. Clicking a district opens its restaurant listing,
where the visual language deliberately drops to a clean light ordering interface. **Clicking
a building opens that restaurant's menu** — one building is one row, so the thing shaped like
a kitchen is the way into that kitchen; the click stops there rather than also entering the
street behind it.

**The owner's area is `/partner`, not `/restaurant`.** `/restaurant/:id` is the customer's
menu page, reached from the city and every listing, and a guarded `/restaurant/*` declared
above the public fallback swallowed all of them — a visitor clicking a kitchen was bounced to
the login screen.

**Admin.** The home is the eight figures and one chart — nothing else. It used to carry nine
blocks (the application queue, restaurant performance, both rule panels, recent orders,
recent customers, a delivery summary, quick actions), and every one of them had its own page
in the rail, so the home was a worse copy of the whole dashboard: shorter tables, no filters,
no sort, and a second place for the same number to be wrong in. The onboarding-status chart
stays because it is the one thing with nowhere else to live — the applications page lists
rows and does not sum them.

Two blocks moved rather than died, because their pages did not already show what they
showed: **restaurant performance** is on Active Restaurants (same kitchens read by how they
are doing, which that page's table cannot answer — no order count, no recent rating), and
the **RULE-02 qualifying counts** are on Service Fees (that table says whether the rule was
met, this says by how much). The rest were duplicates and were deleted.

Then: restaurant applications (tabs, search, sort, session decisions),
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

**Restaurant owner** (`/partner`). A registration flow, in five steps:
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

**Not built yet:** order history,
and any real backend reads — every screen still reads mock data through the services.
Payment is not integrated and is not simulated: cash on delivery is the only method that
means anything, and the others are disabled rather than shown as working. Placed orders
live in memory, so a reload loses them.

One stub remains, deliberately inert and marked `aria-disabled`: the cart control.

## Search

`services/searchService.ts`, behind the top bar. It searches the rows rather than an index
of labels, so every result carries a real `Restaurant`, `MenuItem` or `District` id and the
list cannot offer something the city has no way to open — the same rule as Foodie AI.

Three kinds, because those are the three things the city can show. **A cuisine is not one
of them.** `restaurantCuisines` is many-to-many, so "Italian" is not a place and has no
page; a cuisine match resolves instead to the districts that sell it, through the
`cuisineIds` FK already on the district row, and the row says *why* it is there — "Italian
is sold here". Inventing a cuisine route to make the search tidy would add a screen nobody
designed.

Ranking is by how the match landed — whole label, then word start, then anywhere inside —
and rating only breaks ties inside a band, so it can never lift a weak match above a strong
one. Word start rather than string start, or "tiffin" would not find Anna's Tiffin Room.
Under two characters it returns nothing: one letter matches most of the menu.

It navigates and there is no results page, because every result already has a destination.
A district is local state in `FoodCityExperience` rather than a route, so `SearchBox` takes
the same two callbacks the map uses instead of rendering `Link`s — entering a district from
the search is the same act as clicking it on the map, and the camera is not rebuilt.

## Reviews

`data/reviews.ts` — one row per rated order, the same grain as the admin's `ratedOrders`,
because both rating rules count *orders*. Reviews carry the cuisine they came from, so
"the biryani was cold" belongs to the biryani menu rather than to the kitchen, and the card
on the restaurant page says which menu it is about.

The headline figure beside them is the restaurant's **stored** rating over every order it has
taken, never an average of the four rows shown. Recomputing from a sample would put a number
on screen contradicting the one in the page header.

Generated deterministically, with authors and sentences drawn **without replacement** — drawn
independently, one restaurant showed the same name and the same opening line twice in four
cards, which is the tell that the section is generated.

Known gap: one- and two-star reviews are reachable but rare, because no restaurant in
`data/restaurants` is rated below 3.9. The admin side has Maíz y Humo tripping RULE-01 on six
orders below three stars, and that count lives in `data/admin/platform.ts` — the two datasets
describe the same kitchens and do not yet share rows.

## Foodie AI

`services/foodieService.ts`, opened from the city's docked launcher.

**It does not call a model from the browser, because it cannot.** A model API needs a key and
anything the browser reads is in the bundle — the rule that keeps the service-role key out of
this codebase applies to every provider. The real version is a Supabase Edge Function holding
the key; every signature here is already async and shaped like that call.

Two of the brief's rules are structural rather than aspirational:

- **Every suggestion carries a real `MenuItem` id**, because nothing in the file writes a dish
  name — it picks rows. When the model arrives it gets the same treatment: handed candidate
  rows and asked to choose and explain, never asked what the kitchen serves.
- **Nothing touches the cart.** Suggestions link to the dish on its menu and the person
  decides. The AI layer never acts.

**No reason, no suggestion.** If nothing about a request fired, it returns nothing and says
which part failed. "unicorn steak" used to return six dishes ranked by restaurant rating with
empty reason lists, which reads as an answer and is not one.

The parsed request is shown back on screen, so someone whose words were misread can see that
rather than wonder why the answers are odd.

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
with the parts an admin never sees.

**It starts empty**: every field blank, every document missing, no history. That is where a
real owner begins, and while it was pre-filled the empty-form behaviour was never once
exercised. `email` is blank rather than the account's address — prefilling it from the
signed-in profile is right and belongs in the service once it reads a real session.

One consequence: **"Needs Replacement" is now unreachable in a demo.** Only an admin can put
a document in that state and there is no per-document review screen yet — the admin decides
the whole application. The styling and the copy for it are still there and still correct;
nothing drives it.

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

**The city's chrome is navy with burgundy on hover** — `#10203F` sidebar, `#0A1730` top bar,
`#7B1E3A` hover. The map stays teal; the furniture around it does not. Both panels went from
translucent teal glass to solid: navy washed over a teal city reads as dirty teal, not navy.
Hover fills the whole row rather than colouring the label, because burgundy *as text* on navy
is 1.61:1 — as a background with white on it, it is 10.05:1.

**The onboarding flow runs Pink Lemonade and Slime Margarita** — `#FF5097` and `#E4F482`,
one block keyed off `.ob-shell`, the same scoped-token technique as the other two sections.

The pair cannot be used the way a colour-swatch poster uses it: pink on lime is 2.5:1 and
white on pink is 3.0:1 — fine at 90px, unreadable at 13px. So the two colours do the filling
and a near-black plum (`--on-bright: #2b0714`) does the talking: dark ink on pink measures
5.99:1. `--teal-800` becomes a deepened `#c9306e` for pink *text*, and `--pink-ink: #ad2a5e`
is deeper again for text on a pink *tint*, which is a wash pale enough that `#c9306e` only
reaches 3.96:1 on it. The modal's illustration is where the pair gets to be itself.

Lime carries "done" because green already did; pink carries the accent because magenta did.
**Pink means one thing: this row wants you.** Giving "awaiting review" pink as well put it
next to "needs replacement" reading as the same state, which on that page is the exact
failure it exists to prevent — waiting is not a task, so it is neutral.

**The admin home's eight figures are a bento**, and every card is its own pastel — the four
tints of the component it was modelled on plus four more in the same register: periwinkle
`#DADBF8`, peach `#FFE0C9`, pink `#FFCFE1`, lime `#DFF0C8`, sky `#CFE6F8`, cream `#FFFCE5`,
lilac `#ECD9F5`, mint `#D9EAE3`, with the reference's near-black for ink and its dark pill
as the icon chip. Asked for, and the second deliberate exception to the palette after the
sign-in screen. Scoped to `.sc-grid[data-variant='bento']`, so it colours that one row and
nothing else — the three-card delivery row further down the same page is the same component
and stays white.

All eight sit at the same lightness so no card shouts over its neighbours, and the hues are
spread right round the wheel (26, 53, 85, 155, 206, 238, 281, 338) so none is another one
slightly off. They are ordered warm against cool rather than by hue, or the row would read
as a sorted gradient and invite someone to look for a ranking in it.

The tints **are assigned by position and mean nothing**. These are not statuses; nothing in the row
is good or bad news, and a colour reading as a verdict on a number nobody has judged would
be worse than no colour. The ink is near-black rather than the dashboard's soft grey because
on tints this pale a grey label falls to about 4:1, where near-black measures 14–19:1.

Layout is 2 wide + 4 narrow + 2 wide. That is the only arrangement filling a four-column
grid exactly at eight cards; one wide card leaves a hole.

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
