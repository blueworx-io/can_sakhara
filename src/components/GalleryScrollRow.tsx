"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, getScroller } from "@/lib/motion/gsap";
import type { GalleryImage } from "./GalleryCarousel";

// Desktop-only scroll-driven horizontal gallery.
//
// The band is held in place with native CSS `position: sticky`, NOT ScrollTrigger's
// JS pin. Inside the custom `.site-shell` scroller, ScrollTrigger's transform-pin has
// to rewrite a transform every frame to counteract the scroll, which lags real momentum
// scrolling by a frame and makes the band visibly bounce up and down. Sticky is handled
// by the browser on the compositor, so the band stays perfectly still and GSAP only has
// to scrub the row horizontally.
//
// Layout: a tall transparent wrapper provides the scroll distance; a full-viewport sticky
// child holds the white band at the top while you scroll through it; the white band lives
// here (not on the page <section>) so the area below it stays transparent and shows the
// page background — matching the existing By Day (white) / By Night (dark) look.
// Mounted only at >=768px with motion allowed.
export default function GalleryScrollRow({ images }: { images: GalleryImage[] }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const outer = outerRef.current;
      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!outer || !track || !viewport) return;

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

          // How far the row must travel so the last slide reaches the frame's right edge.
          const travel = () => track.scrollWidth - viewport.clientWidth;
          // Give the wrapper exactly `travel` px of scroll beyond one viewport, so the
          // sticky band holds for precisely the horizontal distance (1:1 scroll-to-travel).
          outer.style.height = `calc(100dvh + ${travel()}px)`;

          gsap.to(track, {
            x: () => -travel(),
            ease: "none",
            scrollTrigger: {
              trigger: outer,
              scroller: getScroller() ?? undefined,
              start: "top top",
              end: "bottom bottom",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        },
      );

      return () => mm.revert();
    },
    { scope: outerRef },
  );

  return (
    <div ref={outerRef} className="relative">
      <div className="sticky top-0 h-[100dvh]">
        <div className="bg-white py-[20px] md:py-[30px]">
          <div className="flex justify-center">
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
        </div>
      </div>
    </div>
  );
}
