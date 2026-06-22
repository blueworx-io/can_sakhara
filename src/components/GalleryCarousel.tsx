"use client";

import GalleryPeekStrip from "./GalleryPeekStrip";

export type GalleryImage = { src: string; alt: string };

// Wrapper for the By Day / By Night gallery. For now it simply renders the existing
// peek-strip carousel; later tasks add the desktop scroll-driven row and the 6-image set.
export default function GalleryCarousel({ images }: { images: GalleryImage[] }) {
  return <GalleryPeekStrip images={images} />;
}
