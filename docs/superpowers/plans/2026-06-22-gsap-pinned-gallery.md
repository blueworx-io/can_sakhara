# Pinned Scroll-Driven By Day / By Night Gallery — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the GSAP "horizontal scrolling gallery" effect to the shared By Day / By Night
image gallery: on desktop the gallery pins and scrolls horizontally through 6 images as the
user scrolls down, then the page continues — without changing any visual design.

**Architecture:** Split the existing `GalleryCarousel` into a thin wrapper + two focused
children. The wrapper duplicates the 3 images to 6 and routes by breakpoint / motion
preference, rendering exactly one child so only its effects run. `GalleryPeekStrip` is the
current carousel (drag / autoplay / infinite loop), moved verbatim, used on mobile and as the
reduced-motion desktop fallback. `GalleryScrollRow` is new: a desktop-only GSAP `ScrollTrigger`
that pins the gallery `<section>` and `scrub`-translates the existing track horizontally.

**Tech Stack:** Next.js App Router 16, React 19, TypeScript, Tailwind v4, GSAP 3.15 +
`@gsap/react` (ScrollTrigger), all already installed.

## Global Constraints

- **Do not change the visual design.** Slide sizes (desktop 460×663, mobile 278×400), gaps
  (desktop 30px, mobile 19px), the 1440px desktop frame, colours, and the mobile peek strip
  all stay exactly as they are. Reuse the existing `.gallery-viewport` / `.gallery-track` /
  `.gallery-slide` CSS unchanged.
- **Desktop = ≥768px; mobile = <768px.** No tablet design — desktop covers tablet.
- **No new libraries.** GSAP + `@gsap/react` are already dependencies.
- **The page scrolls inside `.site-shell` (the `<main>`), NOT the window.** Every
  `ScrollTrigger` must bind to it via `getScroller()` from `@/lib/motion/gsap`.
- **No page-file edits.** Both pages already render `<GalleryCarousel images={…} />` inside a
  `<section class="w-full bg-white py-[20px] md:py-[30px]">`; the pin target is found from the
  component via `rootRef.closest("section")`.
- **Images duplicated to 6 in sequence `[1,2,3,1,2,3]`** (no two identical slides adjacent).
- **No inner-image parallax.** Horizontal scroll only.
- **Lint policy:** run lint once as a final check; do not loop fix→lint. Present findings, do
  not auto-fix without approval.

## File Structure

- **Create** `src/components/GalleryPeekStrip.tsx` — the current `GalleryCarousel` body moved
  verbatim (mobile strip + the existing desktop draggable carousel), renamed. Responsibility:
  the drag / autoplay / infinite-loop carousel. Used on mobile and as reduced-motion desktop
  fallback.
- **Create** `src/components/GalleryScrollRow.tsx` — new desktop-only pinned scroll-driven row.
  Responsibility: the GSAP pin + `scrub` horizontal scroll.
- **Modify** `src/components/GalleryCarousel.tsx` — becomes a thin wrapper: duplicates images
  to 6 and routes by breakpoint / motion preference. Keeps exporting `type GalleryImage`.
- **No change** to `src/app/globals.css`, `src/lib/motion/gsap.ts`, or the page files.

Flat `src/components/` placement matches the existing convention (`SiteHeader`, `SiteFooter`,
`ExperienceCarousel`, `GalleryCarousel`).

---

### Task 1: Extract `GalleryPeekStrip` (behaviour-preserving refactor)

Move the current carousel into its own component and have the wrapper render it on every
breakpoint, passing images through unchanged. No behaviour change — this is a safe checkpoint.

**Files:**
- Create: `src/components/GalleryPeekStrip.tsx`
- Modify: `src/components/GalleryCarousel.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `GalleryPeekStrip({ images }: { images: GalleryImage[] })` (default export) —
  the existing carousel behaviour. `GalleryCarousel` still exports `type GalleryImage`.

- [ ] **Step 1: Create `GalleryPeekStrip.tsx` as a verbatim move of the current component.**

Copy the **entire current contents** of `src/components/GalleryCarousel.tsx` into the new file
`src/components/GalleryPeekStrip.tsx` with only these changes:
- Rename the default export function `GalleryCarousel` → `GalleryPeekStrip`.
- Replace the local `export type GalleryImage = …` with a type-only import:
  `import type { GalleryImage } from "./GalleryCarousel";`
- Keep `"use client"`, all hooks, refs, the `useGSAP` desktop entrance reveal, the drag /
  autoplay / loop logic, the JSX, and the `gallery-*` class names **exactly as they are now**.

(The body is an exact copy of the existing 266-line component; do not alter any logic.)

- [ ] **Step 2: Replace `GalleryCarousel.tsx` with a thin wrapper that renders the strip.**

```tsx
"use client";

import GalleryPeekStrip from "./GalleryPeekStrip";

export type GalleryImage = { src: string; alt: string };

// Wrapper for the By Day / By Night gallery. For now it simply renders the existing
// peek-strip carousel; later tasks add the desktop scroll-driven row and the 6-image set.
export default function GalleryCarousel({ images }: { images: GalleryImage[] }) {
  return <GalleryPeekStrip images={images} />;
}
```

- [ ] **Step 3: Typecheck.**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors. (Confirms the type-only import and the move are sound.)

- [ ] **Step 4: Visual regression check (dev server + Playwright MCP).**

Start the dev server once (reuse it for later tasks):
Run (background): `npm run dev`  → wait for "Ready" on http://localhost:3000

Using the Playwright MCP:
- `browser_resize` to 1440×900, `browser_navigate` to `http://localhost:3000/by-day`.
- Scroll to the gallery; confirm it looks identical to before: the 1440px frame with three
  460×663 slides, draggable, auto-rotating, looping. `browser_take_screenshot`.
- `browser_resize` to 390×844; confirm the mobile peek strip (278px slides) is unchanged.

Expected: no visible change from the pre-refactor gallery on either viewport.

- [ ] **Step 5: Commit.**

```bash
git add src/components/GalleryPeekStrip.tsx src/components/GalleryCarousel.tsx
git commit -m "Extract GalleryPeekStrip from GalleryCarousel (no behaviour change)"
```

---

### Task 2: Duplicate the image set to 6 in the wrapper

Give the gallery 6 images (`[1,2,3,1,2,3]`). Still renders `GalleryPeekStrip` on all
breakpoints, so the only change is that the carousel now cycles 6 images.

**Files:**
- Modify: `src/components/GalleryCarousel.tsx`

**Interfaces:**
- Produces: `GalleryCarousel` now passes a 6-element `GalleryImage[]` to its child.

- [ ] **Step 1: Duplicate the images in the wrapper.**

Edit `src/components/GalleryCarousel.tsx` so the body builds the sextet and passes it down:

```tsx
export default function GalleryCarousel({ images }: { images: GalleryImage[] }) {
  // Duplicate the 3 designed images to 6 ([1,2,3,1,2,3]) so the desktop scroll effect
  // (added next) has real horizontal travel; no two identical slides sit adjacent.
  const sextet = [...images, ...images];
  return <GalleryPeekStrip images={sextet} />;
}
```

- [ ] **Step 2: Typecheck.**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 3: Visual check (Playwright MCP).**

- Desktop 1440×900, `http://localhost:3000/by-day`: the carousel now cycles **6** images
  (let it auto-rotate / drag past the original 3 — images keep coming, loop is seamless).
- Repeat on `http://localhost:3000/by-night`.
- Mobile 390×844: the peek strip loops over 6 images, styling unchanged.

Expected: 6 images present on both pages, both viewports; no styling change.

- [ ] **Step 4: Commit.**

```bash
git add src/components/GalleryCarousel.tsx
git commit -m "Duplicate gallery images to 6 for horizontal scroll travel"
```

---

### Task 3: Add `GalleryScrollRow` (desktop pin + scrub) and wire routing

Create the desktop scroll-driven row, route to it only on desktop with motion allowed, and
drop the now-dead desktop entrance reveal from `GalleryPeekStrip`.

**Files:**
- Create: `src/components/GalleryScrollRow.tsx`
- Modify: `src/components/GalleryCarousel.tsx`
- Modify: `src/components/GalleryPeekStrip.tsx`

**Interfaces:**
- Consumes: `GalleryImage` (from `GalleryCarousel`), `gsap`, `useGSAP`, `getScroller`
  (from `@/lib/motion/gsap`).
- Produces: `GalleryScrollRow({ images }: { images: GalleryImage[] })` (default export) —
  renders the same `.gallery-viewport` / `.gallery-track` / `.gallery-slide` markup, driven by
  a pinned `ScrollTrigger` instead of the index/drag/autoplay logic.

- [ ] **Step 1: Create `GalleryScrollRow.tsx`.**

```tsx
"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, getScroller } from "@/lib/motion/gsap";
import type { GalleryImage } from "./GalleryCarousel";

// Desktop-only pinned, scroll-driven horizontal gallery. Renders the same fixed 1440px frame
// and 460×663 slides as the rest of the site (reusing the .gallery-* CSS), but instead of the
// index/drag/autoplay carousel it pins the surrounding <section> and translates the track
// horizontally with the page scroll (GSAP ScrollTrigger `scrub`). Mounted only at ≥768px with
// motion allowed (the wrapper decides), so it never runs on mobile or under reduced motion.
export default function GalleryScrollRow({ images }: { images: GalleryImage[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!root || !track || !viewport) return;

      // Defensive: the wrapper only mounts this at ≥768px with motion allowed, but guard
      // anyway so a stray mount can never pin under reduced motion or on a phone.
      const mm = gsap.matchMedia();
      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { isDesktop, reduced } = ctx.conditions as {
            isDesktop: boolean;
            reduced: boolean;
          };
          if (!isDesktop || reduced) return;

          const section = root.closest("section");
          if (!section) return;

          // Distance the track must travel so its last slide reaches the frame's right edge.
          // Function-based (+ invalidateOnRefresh) so it recomputes on resize.
          const distance = () => track.scrollWidth - viewport.clientWidth;

          gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              scroller: getScroller() ?? undefined,
              pin: true,
              start: "top top",
              end: () => "+=" + distance(),
              scrub: 1,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          });
        },
      );

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="flex justify-center">
      <div
        ref={viewportRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="Gallery"
        className="gallery-viewport"
      >
        <div ref={trackRef} className="gallery-track">
          {images.map((image, i) => (
            <div
              key={`${image.src}-${i}`}
              aria-roledescription="slide"
              className="gallery-slide"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                draggable={false}
                sizes="460px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Route to the scroll row on desktop (motion allowed) in the wrapper.**

Replace `src/components/GalleryCarousel.tsx` with:

```tsx
"use client";

import { useEffect, useState } from "react";
import GalleryPeekStrip from "./GalleryPeekStrip";
import GalleryScrollRow from "./GalleryScrollRow";

export type GalleryImage = { src: string; alt: string };

// By Day / By Night gallery wrapper. Duplicates the 3 designed images to 6 and renders exactly
// one child so only its effects run: the pinned scroll row on desktop when motion is allowed,
// otherwise the peek-strip carousel (mobile, and the reduced-motion desktop fallback).
export default function GalleryCarousel({ images }: { images: GalleryImage[] }) {
  const sextet = [...images, ...images];

  // false during SSR / first paint (→ peek strip), so server and client first render match.
  const [useScrollRow, setUseScrollRow] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setUseScrollRow(desktop.matches && !reduce.matches);
    update();
    desktop.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      desktop.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  return useScrollRow ? (
    <GalleryScrollRow images={sextet} />
  ) : (
    <GalleryPeekStrip images={sextet} />
  );
}
```

- [ ] **Step 3: Remove the now-dead desktop entrance reveal from `GalleryPeekStrip`.**

In `src/components/GalleryPeekStrip.tsx`, delete the desktop entrance `useGSAP(...)` block (the
one that sets `clipPath` on the first three visible slides via `gsap.matchMedia()` /
`scrollTriggerVars`). The strip now only renders on mobile or under reduced motion, where that
reveal never fired, so it is dead code. Remove any imports from `@/lib/motion/gsap` that become
unused as a result (e.g. `useGSAP`, `gsap`, `EASE`, `DUR`, `scrollTriggerVars`) — keep only
what the remaining strip logic still references.

- [ ] **Step 4: Typecheck.**

Run: `npx tsc --noEmit`
Expected: exits 0 (no unused-import or type errors).

- [ ] **Step 5: Verify the desktop scroll effect (Playwright MCP).**

Desktop 1440×900, `http://localhost:3000/by-day`:
- Scroll down to the gallery. Expected: the white gallery band **pins** (stays in place) and
  the row of slides translates left as you keep scrolling.
- Continue scrolling: the row travels through all 6 images until the last slide reaches the
  right edge, then the band **unpins** and the page continues to "Balearic Bliss".
- Screenshot at start (slides 1–3 visible), mid-scroll, and end (slides 4–6 visible).
- Confirm: no autoplay, no drag, no infinite loop while pinned; slide sizes unchanged (460×663).
- Watch-item: on `http://localhost:3000/by-night`, check the pinned white band against the dark
  page background looks acceptable during the pin. If the gap below the band reads poorly,
  switch `start: "top top"` → `start: "center center"` in `GalleryScrollRow` and re-verify.

- [ ] **Step 6: Verify mobile + reduced motion unchanged (Playwright MCP).**

- Mobile 390×844, both pages: the peek strip is unchanged (drag / autoplay / loop, 278px
  slides), no pin, no scroll-jack.
- Reduced motion: in the Playwright context emulate reduced motion
  (`browser_run_code_unsafe`/`browser_evaluate` is not needed — use
  `browser_navigate` with an emulated media feature if available, otherwise set
  `prefers-reduced-motion` via the page's emulation). At desktop width with reduced motion the
  gallery must render the peek strip (manual carousel, no pin/scrub) with all 6 images reachable.

- [ ] **Step 7: Commit.**

```bash
git add src/components/GalleryScrollRow.tsx src/components/GalleryCarousel.tsx src/components/GalleryPeekStrip.tsx
git commit -m "Add desktop pinned scroll-driven gallery (GalleryScrollRow)"
```

---

### Task 4: Acceptance pass + lint + close-out

Final cross-page verification, a single lint check, and closing the Domscribe annotation.

**Files:** none (verification + process).

- [ ] **Step 1: Full acceptance matrix (Playwright MCP).**

Confirm all of the following, capturing a screenshot for each page/viewport:
- By Day desktop: pin + horizontal scroll through 6 images → release → page continues. ✅
- By Night desktop: same. ✅
- By Day mobile + By Night mobile: peek strip unchanged. ✅
- Reduced-motion desktop (both pages): peek-strip fallback, all images reachable, no pin. ✅
- No console errors in `browser_console_messages` on any page.

- [ ] **Step 2: Production build sanity.**

Run: `npm run build`
Expected: build succeeds (no type or build errors). This is the one heavy check; run it once.

- [ ] **Step 3: Lint (single pass, present findings — do not auto-fix).**

Run: `npm run lint`
Report any findings to the user; only fix after approval (per project lint policy).

- [ ] **Step 4: Close the Domscribe annotation.**

The work is for Domscribe annotation `ann_vH145tcK` (already `processing`). Once verified:
- Call `domscribe.annotation.respond` with `annotationId: "ann_vH145tcK_1782114523461"` and a
  summary of what was implemented (split components, desktop pin+scrub, 6 images, mobile/reduced
  fallbacks, both pages).
- Then `domscribe.annotation.updateStatus` → `status: "processed"`.

- [ ] **Step 5: Finish the branch.**

Use the `superpowers:finishing-a-development-branch` skill to integrate
`worktree-gsap-carousel-day-night`. Note for the operator: the earlier
`domscribe-gsap-day-night-carousel` branch in the main checkout is superseded by this worktree
branch (it only carried the spec commit) and should be deleted during close-out.

## Self-Review

**Spec coverage:**
- Desktop-only pin+scrub → Task 3 (`GalleryScrollRow`, routing). ✅
- Mobile strip unchanged → Tasks 1–3 (`GalleryPeekStrip` verbatim; routed mobile). ✅
- Replace autoplay/drag/loop on desktop → Task 3 (scroll row has none; routing excludes strip
  on desktop+motion). ✅
- 6 images `[1,2,3,1,2,3]` → Task 2 (`[...images, ...images]`). ✅
- 1:1 scroll length → Task 3 (`end: "+=" + distance()`, `distance = scrollWidth - clientWidth`). ✅
- Reduced-motion fallback → Task 3 wrapper routing + defensive guard. ✅
- No design change / reuse CSS → Global Constraints; Tasks reuse `.gallery-*`. ✅
- No page edits → pin via `closest("section")`. ✅
- `.site-shell` scroller → Task 3 `getScroller()`. ✅
- No inner parallax → not implemented (Global Constraints). ✅
- Both pages → shared component, verified per page in Tasks 1–4. ✅
- Verification via Playwright (no unit tests) → Tasks 1–4 steps. ✅

**Placeholder scan:** No TBD/TODO; all new code shown in full; the only "verbatim move" (Task 1)
is an explicit copy of an existing file, not a placeholder.

**Type consistency:** `GalleryImage` defined/exported in `GalleryCarousel.tsx`; imported
type-only by both children. `GalleryScrollRow` / `GalleryPeekStrip` both take
`{ images: GalleryImage[] }`. Refs typed `HTMLDivElement`. Consistent across tasks.
