# Third-party assets

Every *drawn* element in the project is original SVG, CSS or canvas work. The
exception is three video clips on the landing page, below.

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
