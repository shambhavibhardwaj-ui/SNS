# Third-party assets

## material-hills.jpg

Backdrop behind the isometric city (`.fc-map-wrap::before` in `src/index.css`).

- **Source:** GetLayers — https://getlayers.ai
- **Original:** `material-hills.jpg`, 2400×1792, unwatermarked source still
- **In the repo:** resized to 1600×1194 and re-encoded at quality 45 (~150 KB).
  It is heavily tinted and partly transparent in use, so compression artefacts
  do not show.
## material-hills.mp4

The moving version of the same backdrop, layered over the still.

- **Same source and licence question as above.**
- **Original:** 2888×2160, 30 fps, 14.07 s, ~26 Mbps, 44 MB, with an audio track
- **In the repo:** 1280×958, re-encoded with ffmpeg and ~2.1 MB:

  ```bash
  ffmpeg -i material-hills.mp4 -an -vf "scale=1280:-2" \
    -c:v libx264 -preset slower -crf 28 -profile:v high \
    -pix_fmt yuv420p -g 60 -movflags +faststart material-hills.mp4
  ```

  All 422 frames are kept, so the loop's seam is intact — trimming it would
  put a visible jump at every pass. The audio is dropped: a background loop
  has no use for it, and a silent track is what keeps autoplay allowed.

  A VP9/WebM version was tried and came out *larger* (2.4 MB) on this content,
  so there is only the one file.

**Check the licence before this goes anywhere public.** The download carries a
copyright line and no explicit grant, so the terms for redistribution,
modification and commercial use need confirming with GetLayers. Everything else
in the project is original work.
