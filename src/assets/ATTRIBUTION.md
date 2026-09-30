# Third-party assets

**There are none.** Every drawn element in the project is original SVG, CSS or
canvas work.

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
