import { useEffect, useRef, useState } from 'react';

/**
 * A background food video, with an honest fallback.
 *
 * **There is no stock footage in this project, on purpose.** A photographic
 * video sat behind the city for a few commits and was taken out again because
 * its licence was never settled — `src/assets/ATTRIBUTION.md` records that, and
 * that nothing third-party is left. So this component does not ship a video: it
 * plays one if a file is present at `src` and renders an original drawn
 * fallback when there is not.
 *
 * That is not a placeholder in the sense of something broken. A missing file
 * produces a composed gradient-and-grain panel in the house palette, and the
 * page reads as finished either way — which is the only version of this that
 * can be committed without an asset licence attached to it.
 *
 * Autoplay rules: muted and `playsInline` or iOS refuses outright, and a
 * rejected `play()` is caught rather than thrown — a browser declining to
 * autoplay is a policy, not an error.
 */
export function FoodVideo({
  src, poster, className, tone = 'teal',
}: {
  /** A file under `public/video/`. Absent is a supported state. */
  src?: string;
  poster?: string;
  className?: string;
  tone?: 'teal' | 'warm' | 'plum';
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    const node = ref.current;
    if (!node || !src) return;

    /* Pause while off screen. A looping video behind a section nobody is
       looking at is decode work for nothing, and on a laptop it is the
       difference between a warm fan and a quiet one. */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void node.play().catch(() => undefined);
        else node.pause();
      },
      { threshold: 0.01 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [src]);

  if (failed) {
    return <div className={['lp-video-fallback', className].filter(Boolean).join(' ')} data-tone={tone} aria-hidden="true" />;
  }

  return (
    <video
      ref={ref}
      className={['lp-video', className].filter(Boolean).join(' ')}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      onError={() => setFailed(true)}
    />
  );
}
