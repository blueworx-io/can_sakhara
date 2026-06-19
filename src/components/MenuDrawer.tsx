"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type RefObject } from "react";

// Drawer links — exact Figma order/labels. Tops are 356 / 423 / 490 (67px
// pitch); rendered as flow with a 37.6px gap (67 − 29.4px line box).
const menuLinks = [
  { label: "Experience", href: "/#experience" },
  { label: "By Day", href: "/by-day" },
  { label: "By Night", href: "/by-night" },
];

// Thin white ✕ from the Figma close component (17×17 glyph).
function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 17 17"
      className="size-[17px] stroke-current"
      fill="none"
      strokeWidth="1.3"
    >
      <path d="M1 1 16 16M16 1 1 16" />
    </svg>
  );
}

// The slide-in menu: scrim + drawer. State is owned by the trigger so the same
// drawer can be driven from the home navbar or the subpage navbars. Pass the
// trigger's ref so focus returns to it on close.
export default function MenuDrawer({
  open,
  onClose,
  returnFocusRef,
  panelColor = "#422833",
}: {
  open: boolean;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
  panelColor?: string;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Esc to close; lock the scroll container while open; move focus to the
  // close button on open and back to the trigger on close.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const scroller =
      document.querySelector<HTMLElement>(".site-shell") ?? document.body;
    const previousOverflow = scroller.style.overflow;
    scroller.style.overflow = "hidden";

    const trigger = returnFocusRef?.current;
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      scroller.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open, onClose, returnFocusRef]);

  return (
    <>
      {/* Scrim — rgba(0,0,0,0.35); dims the hero but sits below the navbar so
          the wordmark stays crisp while the menu is open. */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/35 transition-opacity duration-500 ease-out ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        style={{ backgroundColor: panelColor }}
        className={`fixed inset-y-0 left-0 z-50 w-[450px] max-w-full text-white transition-[translate] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            tabIndex={open ? 0 : -1}
            className={`absolute right-[50px] top-[46px] grid size-[52px] place-items-center border border-white transition-[opacity,translate,background-color,color] duration-500 ease-out hover:bg-white hover:text-[#422833] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${
              open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
            }`}
            style={{ transitionDelay: open ? "120ms" : "0ms" }}
          >
            <CloseIcon />
          </button>

          <span
            aria-hidden="true"
            className="absolute left-[50px] top-[131px] h-px w-[350px] bg-white"
          />

          <span
            className={`absolute left-[50px] top-[201px] block h-[85px] w-[251px] transition-[opacity,translate] duration-500 ease-out ${
              open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
            style={{ transitionDelay: open ? "160ms" : "0ms" }}
          >
            <Image
              src="/images/logo-stacked-white.svg"
              alt="Can Sakhara"
              fill
              sizes="251px"
            />
          </span>

          <ul className="absolute left-[50px] top-[356px] flex flex-col gap-[37.6px]">
            {menuLinks.map((link, i) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  tabIndex={open ? 0 : -1}
                  className={`block font-display text-[21px] font-light uppercase leading-[1.4] tracking-[4.2px] text-white transition-[opacity,translate,color] duration-500 ease-out hover:text-white/70 ${
                    open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                  }`}
                  style={{ transitionDelay: open ? `${220 + i * 70}ms` : "0ms" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
