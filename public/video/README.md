# Landing-page video

**This folder is empty on purpose, and the page is finished without it.**

`components/landing/FoodVideo` plays a file if one is here and renders a
composed gradient-and-grain panel in the house palette when there is not. A
missing file is a supported state, not a broken `<video>` — there is nothing to
fix before showing the page.

## Why no footage is committed

`src/assets/ATTRIBUTION.md` records that every drawn element in this project is
original, and that a photographic video was taken out again because its licence
was never settled. Shipping stock food footage would reverse a decision that
was made deliberately and written down, so it is left to whoever owns the
licence to add.

## What to drop in, if you want video

Four files, each referenced by one section. Any that are absent fall back.

| File | Section | Suggested shot |
|---|---|---|
| `hero-kitchen.mp4` | the hero | a pan tossing, a flame, something sizzling |
| `city-flyover.mp4` | "A city full of flavour" | slow overhead of a busy kitchen or market |
| `table.mp4` | "Built to be looked at closely" | dishes being set down on a table |
| `kitchen-pass.mp4` | the sign-in section | a quiet pass, plated food under lights |

Keep each **under about 3 MB** and **H.264 in an MP4**. These are decorative
backgrounds behind a scrim, so 1280×720 is plenty — the previous photographic
background cost 2.1 MB and that was already too much to send to a phone.

They are muted, looping and `playsInline`, and each pauses when its section is
off screen, so audio tracks are wasted bytes — strip them.

A matching `poster` still image can be passed per section in
`components/landing/sections.tsx` if you want a frame to show before the video
has buffered.
