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
