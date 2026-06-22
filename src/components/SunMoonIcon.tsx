// The By Day (sun) and By Night (moon) marks, inlined from /images/sun.svg and
// /images/moon.svg so DrawSVG can animate their path strokes — the same reason
// the header centre logo is inlined. They are decorative (the "By Day" / "By
// Night" headings carry the text), and they self-draw via the shared `drawSelf`
// helper, wired up in the motion choreography by the `data-anim="draw-icon"`
// hook. Stroke-only line art (no fill), exactly matching the source assets:
// white stroke, 2px width, miterlimit 10. Size is set by the caller's className.

// Sun — a circle and eight rays (Figma sun.svg, viewBox 0 0 180 180).
export function SunIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      data-anim="draw-icon"
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M90 134.182C114.401 134.182 134.182 114.401 134.182 90C134.182 65.5991 114.401 45.8182 90 45.8182C65.5991 45.8182 45.8182 65.5991 45.8182 90C45.8182 114.401 65.5991 134.182 90 134.182Z"
        stroke="white"
        strokeWidth={2}
        strokeMiterlimit={10}
      />
      <path d="M159.031 89.994H180" stroke="white" strokeWidth={2} strokeMiterlimit={10} />
      <path d="M0 89.994H20.9691" stroke="white" strokeWidth={2} strokeMiterlimit={10} />
      <path d="M89.994 159.031V180" stroke="white" strokeWidth={2} strokeMiterlimit={10} />
      <path d="M89.994 0V20.9691" stroke="white" strokeWidth={2} strokeMiterlimit={10} />
      <path d="M138.814 41.1855L153.642 26.3578" stroke="white" strokeWidth={2} strokeMiterlimit={10} />
      <path d="M26.3578 153.642L41.1855 138.814" stroke="white" strokeWidth={2} strokeMiterlimit={10} />
      <path d="M41.1855 41.1855L26.3578 26.3578" stroke="white" strokeWidth={2} strokeMiterlimit={10} />
      <path d="M153.642 153.642L138.814 138.814" stroke="white" strokeWidth={2} strokeMiterlimit={10} />
    </svg>
  );
}

// Moon — a single crescent (Figma moon.svg, viewBox 0 0 180 180).
export function MoonIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      data-anim="draw-icon"
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M161 114.303C150.241 141.652 123.653 161 92.5533 161C51.9316 161.012 19 127.996 19 87.2699C19 56.4305 37.8856 30.0176 64.6918 19C64.995 26.7463 67.1177 57.7074 91.9953 83.7798C119.359 112.455 154.123 114.121 161 114.303Z"
        stroke="white"
        strokeWidth={2}
        strokeMiterlimit={10}
      />
    </svg>
  );
}
