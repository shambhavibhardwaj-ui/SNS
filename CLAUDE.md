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

## Business rules (from the client — do not change without asking)

- **RULE-01:** rated below 3★ on more than 5 orders → improvement plan required
- **RULE-02:** rated above 4★ on 10 orders in a week → service-fee concession
- **RULE-03:** restaurant uses aggregator delivery → aggregator delivery fee
- **RULE-04:** restaurant uses its own delivery staff → alternative fee

## AI features

- **Improvement-plan draft:** when RULE-01 fires, read recent customer feedback and draft a plan. The restaurant edits and submits it — never auto-submit.
- **Order suggestions:** for customers, suggest items from the restaurant's own menu using selected cuisine, past orders, and preferences the user chose to share.

## Stack

Vite + React + TypeScript + Tailwind v4. `npm run dev` serves on :5173.
Tailwind supplies the reset and is there for the card-heavy screens still to come
(restaurant page, cart); the illustrated city is bespoke CSS in `src/index.css`.

## Architecture

```
src/data/        Relational mock data — Cuisine, District, Restaurant,
                 RestaurantCuisine (join), Menu, MenuItem, Order, Rating.
                 Shaped like Supabase tables: surrogate ids, FKs, join tables.
src/services/    The only way the UI reads data. Components must never import
                 src/data directly. Swapping in Supabase changes these bodies,
                 not the components.
src/components/  foodcity/ (map, districts, SVG art), layout/, ui/
```

The rule that matters: a restaurant belongs to one district but offers many
cuisines via `restaurantCuisines`, and each (restaurant, cuisine) pair gets its
own `Menu`. Menus are never merged. Mumbai Spice (North Indian + Chinese) is the
worked example in the seed data.

Map geometry lives in `components/foodcity/mapLayout.ts`, never in `src/data` —
district records carry no pixel coordinates.

## Current state — customer dashboard, phase A+B

Built: the Food City landing page and interactive cuisine districts.

- Illustrated SVG city: parchment ground, a boulevard and two streets around a
  central plaza, six neighbourhoods in a 2x3 grid, ambient steam/lanterns/
  scooters/strollers.
- **One building is drawn per restaurant row**, so the skyline is the data.
- Hover a district: buildings lift in sequence, the name plate swaps for a card
  with restaurant count, top rating and cuisines.
- Click: the whole scene pans and zooms to that block (one CSS transform on the
  camera group) while the left column turns to that district's page.
- Escape, the back button and the district rail all return to the city.
- Keyboard-navigable districts, `prefers-reduced-motion` honoured, responsive
  (the two columns stack under 880px).

Stubs, deliberately inert and marked `aria-disabled`: top-bar search, the profile
control, and the "Ask Foodie AI" launcher.

Not built yet: restaurant discovery (clicking a storefront), restaurant pages,
cuisine tabs, menus, cart, checkout, search, Foodie AI, auth, admin and
restaurant dashboards, backend.

## Design

Cozy illustrated food village, drawn as original SVG — no external art.
Warm parchment and terracotta; each district has its own roof silhouette
(pagoda, gable, dome, scallop, flat, clay) so blocks are distinguishable across
the map. Fonts: Fraunces (headings), Inter (body), IBM Plex Mono (labels).
Tokens on `:root`: `--flame`, `--saffron`, `--herb`, `--crust`, `--paper*`.

## Open questions

- What SNS stands for (the logo tagline currently says "Restaurant Onboarding")
- Real team member names
- Real fee percentages from the client
