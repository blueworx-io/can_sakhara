# Scroll-driven (pinned) By Day / By Night gallery — design

**Date:** 2026-06-22
**Branch:** `domscribe-gsap-day-night-carousel`
**Source:** Domscribe annotation `ann_vH145tcK` — "On the 'by day' & 'by night' pages,
this carousel needs an animation from GSAP
(https://demos.gsap.com/demo/horizontal-scrolling-gallery/). Implement on both pages."

## Goal

Add the GSAP "horizontal scrolling gallery" effect to the By Day and By Night image
gallery: on desktop, as the user scrolls down, the gallery **pins** and its row scrolls
**horizontally** until the last image clears, then vertical scrolling of the page resumes.

The **visual design does not change** — slide sizes, gaps, framing, and the mobile strip
all stay exactly as they are today. We are adding a scroll-driven interaction only; we are
not resizing anything and not adding inner-image parallax.

Both pages share `src/components/GalleryCarousel.tsx`, so a single component change covers
both. **No page files are edited.**

## Decisions (locked with the user)

- **Breakpoint scope:** desktop only (`min-width: 768px`). Mobile (<768px) keeps the
  existing 278px peek strip (drag / autoplay / infinite loop) **unchanged**.
- **Desktop interaction:** the pinned, scroll-driven horizontal scroll **replaces** the
  desktop autoplay / drag / infinite-loop. While pinned, scroll position == row position.
  A finite run through the images, then the page continues.
- **Image count:** duplicate the 3 passed images to **6**, in sequence `[1,2,3,1,2,3]`
  (no two identical slides adjacent), to create real horizontal travel.
- **Scroll length:** 1:1 — 1px of vertical scroll == 1px of horizontal travel
  (`end: "+=" + (scrollWidth - frameWidth)`), ~1470px on desktop. Tunable later.
- **No inner-image parallax** — out of scope; the images fill their frames as they do now.
- **Code structure:** split (option A, see below).

## Geometry

Desktop frame (`.gallery-viewport`) = **1440px**, `overflow: hidden`, centred.
Row of 6 slides: `6 × 460px + 5 × 30px gap = 2910px`.
Horizontal travel: `2910 − 1440 = 1470px`. End distance = 1470px of vertical scroll.

## Architecture — split into focused pieces (option A)

`GalleryCarousel` becomes a thin wrapper that renders exactly one child based on the
breakpoint, so the two now-distinct interaction models never share state:

```
GalleryCarousel (wrapper)
  ├─ GalleryPeekStrip   — mobile (<768px): the CURRENT strip code, relocated verbatim
  │                       (drag + autoplay + infinite loop), now running over 6 images
  └─ GalleryScrollRow   — desktop (≥768px): NEW pinned, scroll-driven horizontal row
```

- The wrapper owns the image duplication (3 → 6) and **all routing**: it picks the active
  child from breakpoint + motion preference (both via `matchMedia`, matching the existing
  pattern) and renders only that one, so only that child's effects run. Routing table:
  - mobile (<768px) → `GalleryPeekStrip`
  - desktop (≥768px) + reduced motion → `GalleryPeekStrip` (manual carousel, no scroll-jack)
  - desktop (≥768px) + motion OK → `GalleryScrollRow`

  `GalleryScrollRow` therefore assumes motion is allowed; its internal `gsap.matchMedia`
  reduced-motion guard is defensive only.
- `GalleryPeekStrip` is the existing component logic moved as-is (no behavioural rewrite),
  parameterised by the (now 6) images. Its existing desktop-only entrance clip-reveal is
  dropped — on desktop the scroll row is used instead, so the reveal has no consumer.
- `GalleryScrollRow` is new and small: it renders the same `.gallery-viewport` /
  `.gallery-track` / `.gallery-slide` markup and CSS (so the band looks identical at rest),
  but the track is driven by GSAP, not the `--gallery-i` CSS transform.

### `GalleryScrollRow` — GSAP setup

Using `useGSAP` (scoped to the root) and `gsap.matchMedia()` so the trigger only exists on
desktop and is reverted automatically on resize to mobile or on unmount:

```
mm.add(
  {
    isDesktop: "(min-width: 768px)",
    reduced: "(prefers-reduced-motion: reduce)",
  },
  (ctx) => {
    if (!ctx.conditions.isDesktop) return;          // desktop only
    if (ctx.conditions.reduced) return;             // reduced-motion: no pin/scrub

    const track = trackRef.current;
    const frame = viewportRef.current;              // 1440px frame
    const section = rootRef.current.closest("section"); // the white band; pin target

    const distance = () => track.scrollWidth - frame.clientWidth; // ~1470

    gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        scroller: getScroller() ?? undefined,       // .site-shell, not window
        pin: section,
        start: "top top",
        end: () => "+=" + distance(),
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });
  }
);
```

- `pin: section` (found via `rootRef.closest("section")`) keeps the full-width white band
  fixed while the inner row translates, so **no page markup changes** are required.
- Bound to `.site-shell` via the existing `getScroller()` (the page scrolls inside `<main>`,
  not the window).
- `x` and `end` are function-based with `invalidateOnRefresh` so resize / breakpoint
  changes recompute travel correctly.
- Reduced-motion desktop branch: no pin/scrub. Fallback is the manual carousel
  (drag enabled, autoplay already disabled under reduced motion) so every image remains
  reachable without motion. (Implementation: under reduced motion the wrapper renders
  `GalleryPeekStrip` at desktop too, which already handles reduced-motion by disabling
  autoplay.)

## Data flow

`page.tsx` (3 images) → `GalleryCarousel` (duplicates to 6, picks breakpoint) →
active child renders the 6-slide row. Scroll position (desktop) or pointer/timer (mobile)
drives the track transform.

## Out of scope

- The home-page Experience carousel bug (separate Domscribe annotation `ann_cyVWPT61`).
- Inner-image parallax.
- Any change to slide sizes, gaps, colours, or the mobile strip.
- Page-file edits.

## Risks / validation notes

- **Custom-scroller pin:** pinning inside `.site-shell` (not the window) uses ScrollTrigger's
  transform-pin path. Known-good but quirk-prone; verify pin engage/release positioning and
  that the band doesn't jump.
- **`scroll-behavior: smooth`** on `.site-shell` (globals.css) can fight `scrub`. If it
  causes lag, neutralise smooth behaviour during the pinned range.
- **Pin length:** the pin adds ~1470px of scroll length on desktop — intended (the
  scroll-jack region).
- **Entrance reveal removal:** confirm no other consumer relies on the desktop clip-reveal.

## Verification

No unit tests — this is a visual scroll effect. Verify with the Playwright MCP:

1. Desktop viewport (≥768px), By Day: scroll to the gallery → band pins, row travels through
   all 6 images, then the page releases and continues down. Screenshot at start / mid / end.
2. Repeat on By Night.
3. Mobile viewport (<768px): confirm the peek strip is unchanged (drag/autoplay/loop) on both.
4. Reduced-motion: confirm no pin/scroll-jack and all images reachable.
