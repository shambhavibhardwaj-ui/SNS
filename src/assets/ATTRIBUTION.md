# Third-party assets

Every *drawn* element in the project is original SVG, CSS or canvas work. The
exceptions are the landing page's three video clips and six food photographs,
both below.

## Landing-page food images — SOURCE TO BE CONFIRMED

`public/food/` carries five PNG cut-outs (one is used twice), downloaded from
`https://cdn.21st.dev/assets/mirror/` where they ship as the demo assets of a
`hero-section-7` component:

| File | Subject | CDN path (prefix `assets/mirror/`) |
|---|---|---|
| `burger.png` | cheeseburger | `cc/cc7d7fbb538d93322e189b55ae4c6eed95aab7da267a9a095b39216070ef65b0.png` |
| `dumplings.png` | bamboo steamer | `95/95bc0d9d69e76d3729ca42f9525bafd449fd27fa41c9393d1deccb85d79b0639.png` |
| `pizza.png` | pizza slice | `6e/6e4600ac05444d9dc0396906da4174dcfe42a64c14082d939f0f57cb2ed8113d.png` |
| `basil.png` | basil leaf | `8e/8ec4fbab8445c1769d3200d674cd3731a0550b21c87bb8bc6938cb3a05932e5b.png` |
| `tomato.png` | tomato slice | `e7/e758e9c35a8360f201c40d0bf3e3433c2b6ff3f759763eb697cbc3803af80e18.png` |

**Asked for explicitly, and the licence is not established.** The CDN serves
them without a stated grant, and a component's demo assets are not
automatically licensed for reuse in another product. They are downloaded rather
than hotlinked so the page does not depend on that host at runtime, but that
does not settle the question — it only moves the copy.

Before this is shown anywhere that matters, find the component's own licence
terms and record them here, or swap these for images with a grant you can point
at. `components/landing/FloatingFoodHero` reads a plain list of six `src`
strings, so replacing them is one edit to one array.

## Landing-page video — SOURCE TO BE CONFIRMED

`public/video/` carries three clips, supplied by the project owner and
re-encoded here (720p, H.264, audio stripped, 742 KB – 1.7 MB each):

| File | Shot | Original filename |
|---|---|---|
| `hero-kitchen.mp4` | wok over a flame | `79900-570532758_medium.mp4` |
| `table.mp4` | overhead table spread | `149935-797511795_medium.mp4` |
| `kitchen-pass.mp4` | pastries in a display case | `26865-361107766_medium.mp4` |

**The source and licence are not recorded yet, and they must be.** The
filenames match the pattern a well-known free-stock library uses, but a guess
is not a licence. Whoever downloaded them should fill in, per clip: the site,
the clip URL or ID, the licence name, and whether attribution is required.

This matters because of what happened last time, immediately below: a
photographic asset was removed from this project *specifically* because its
licence was never settled. Repeating that with three files would be the same
mistake with more of them. Until the table above is filled in, treat these as
provisional — they are easy to swap, and `components/landing/FoodVideo`
renders a drawn fallback the moment a file is absent, so removing one breaks
nothing.

## Removed: material-hills.jpg / material-hills.mp4

A photographic landscape (GetLayers, https://getlayers.ai) sat behind the city
for a few commits and has been taken out again — recover it from `9aa934b` if
it is ever wanted. It went for three reasons, in order of weight:

1. Its licence was never settled. The download carried a copyright line and no
   explicit grant, so redistribution and modification needed confirming with
   GetLayers and never were. Nothing else in the project had that question
   hanging over it.
2. It was not in the palette. Lime green, white and pale blue against a world
   meant to be roughly sixty per cent deep teal — it only worked composited
   under a teal gradient with `background-blend-mode: color`, which is a lot of
   machinery to hide most of a photograph.
3. It cost 2.1 MB of H.264 to move, and had to be withheld from narrow screens
   and from anyone asking for reduced motion, so a third of visitors saw a
   still anyway.

`components/ui/grid-pulse` replaced it: drawn on a canvas, in the house colours
by construction, and it answers the pointer, which a photograph cannot.
