import { gsap, ScrollTrigger, EASE, DUR } from "./gsap";
import {
  fadeUp,
  staggerReveal,
  splitLinesReveal,
  charsReveal,
  revealExistingChars,
  clipImageReveal,
  drawLine,
} from "./animations";

const $ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) =>
  Array.from(root.querySelectorAll<T>(sel));
const one = <T extends Element = HTMLElement>(root: ParentNode, sel: string) =>
  root.querySelector<T>(sel);

// Shared across every page (the footer is on all three routes).
export function buildCommonChoreography(shell: HTMLElement): void {
  const footer = one(shell, ".site-footer");
  if (footer) {
    const marks = $(footer, "[data-anim='footer-item']");
    if (marks.length) staggerReveal(marks, { trigger: footer });
  }
}

// --- Home ---

// Above-the-fold page load. Runs immediately (pre-paint), no font wait.
export function buildHomeHero(shell: HTMLElement): void {
  const wordmark = one(shell, ".hero-wordmark");
  const choices = $(shell, ".hero-choice");
  const heroImg = one(shell, ".hero-section > img");

  const tl = gsap.timeline({ defaults: { ease: EASE } });

  // Transform-only settle on the LCP image (never opacity).
  if (heroImg) {
    gsap.set(heroImg, { scale: 1.04, transformOrigin: "center center" });
    tl.to(heroImg, { scale: 1, duration: 1.6 }, 0);
  }
  if (wordmark) {
    gsap.set(wordmark, { autoAlpha: 0, y: 20 });
    tl.to(wordmark, { autoAlpha: 1, y: 0, duration: DUR.hero }, 0.1);
  }
  if (choices.length) {
    gsap.set(choices, { autoAlpha: 0, y: 16 });
    tl.to(
      choices,
      { autoAlpha: 1, y: 0, duration: DUR.reveal, stagger: 0.1 },
      0.5,
    );
  }
}

// Below-the-fold scroll/text reveals. Runs after webfonts settle.
export function buildHomeScroll(shell: HTMLElement): void {
  // --- Welcome ---
  const wTop = one(shell, ".welcome-line-top");
  if (wTop) drawLine(wTop, "y");

  const wEyebrow = one(shell, ".welcome-heading .section-eyebrow");
  if (wEyebrow) fadeUp(wEyebrow);

  // Brand lockup: reveal the EXISTING per-char spans (justify layout untouched).
  const lockupChars = $(shell, ".welcome-lockup-line > span");
  if (lockupChars.length) {
    revealExistingChars(lockupChars, {
      trigger: one(shell, ".welcome-lockup") ?? lockupChars[0],
    });
  }

  const wSubtitle = one(shell, ".welcome-heading .section-subtitle");
  if (wSubtitle) splitLinesReveal(wSubtitle);

  const mapArt = one(shell, ".map-art");
  if (mapArt) fadeUp(mapArt);

  const copyItems = [
    ...$(shell, ".welcome-copy > p"),
    ...$(shell, ".welcome-copy .outline-button"),
  ];
  if (copyItems.length) {
    staggerReveal(copyItems, {
      trigger: one(shell, ".welcome-copy") ?? copyItems[0],
    });
  }

  const featuresTitle = one(shell, ".features-title");
  if (featuresTitle) fadeUp(featuresTitle);
  const featureCells = $(shell, ".features-grid > div");
  if (featureCells.length) {
    staggerReveal(featureCells, {
      trigger: one(shell, ".features-grid") ?? featureCells[0],
    });
  }

  const wBottom = one(shell, ".welcome-line-bottom");
  if (wBottom) drawLine(wBottom, "y");
}

// --- By Day / By Night (identical structure) ---

export function buildDayNightHero(shell: HTMLElement): void {
  void shell;
}

export function buildDayNightScroll(shell: HTMLElement): void {
  void shell;
}

// Re-exported so callers need a single import surface.
export {
  gsap,
  ScrollTrigger,
  EASE,
  DUR,
  fadeUp,
  staggerReveal,
  splitLinesReveal,
  charsReveal,
  revealExistingChars,
  clipImageReveal,
  drawLine,
};
