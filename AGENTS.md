Build this project as a responsive marketing website from a completed Figma design.

Stack:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS

Deployment:
- Published with **Netlify**. Do not run local zip/manual-deploy steps; Netlify
  builds and deploys from the repository.

## Designs (source of truth)

- **Exact desktop and mobile Figma designs are provided. Use them exactly —
  never guess, infer, or approximate any design value** (fonts, widths, colors,
  spacing, sizing, etc.).
- **Only mobile and desktop designs exist.** There is **no tablet design** —
  use the **desktop design for tablet**.
- If a design value is genuinely missing from the provided designs, **ask** —
  do not invent it.

Rules:
- Match the provided Figma designs exactly (see **Designs** above).
- Build mobile-first, then desktop. Only the mobile and desktop designs are
  authoritative; tablet uses the desktop design.
- Use reusable components.
- Keep styling in Tailwind unless there is a clear reason not to.
- Do not add new libraries without asking first.
- Do not change unrelated files.
- Commit-ready changes only.
- Ask for clarification when design details are missing.

## Design fidelity (non-negotiable)

These rules apply to every page, section, and component built from Figma:

- **No fluid scaling unless the design shows it.** Do not fluidly scale between
  breakpoints. Elements keep their designed widths, spacing, proportions, and
  alignment until the next defined breakpoint.
- **No dynamic/viewport sizing where fixed values are designed.** Do not use
  percentage-based resizing, flexible stretching, or viewport-based sizing
  (`vw`/`vh`/fluid `clamp`) where Figma specifies fixed values. Use the exact
  fixed widths, paddings, and gaps from the design.
- **Breakpoint-specific layouts only.** Layout changes happen at defined
  breakpoints, not continuously.
- **Components must not scale with screen size.** Components are fixed to their
  designed sizes at each breakpoint — they do not grow, shrink, or stretch with
  the viewport between breakpoints.
- **Use exact Figma values, never approximations,** when exact values are
  available: container widths, component widths, section widths, font families,
  font sizes, font weights, line heights, letter spacing, text alignment,
  colors, button sizing, card/grid spacing, section padding, element alignment,
  icon sizing, image sizing, border radius, and shadows.
- **Match all interactive states from the design:** button hover, link hover,
  and active states.
- **Honour mobile and desktop spacing** exactly as designed at each breakpoint.
  There is no tablet design — tablet uses the **desktop** spacing and layout.

## Working method (non-negotiable)

- **Inspect the existing implementation before editing.** Compare every page,
  section, and component against the Figma design before changing anything.
- Keep changes **small, focused, and reviewable**. Do not make broad layout
  changes unless required, and do not rewrite working code unnecessarily.
- Do not change unrelated logic or functionality.
- Use the existing tech stack and styling approach (Tailwind first).

## Layout (non-negotiable)

- **Use flexbox and grid for layout and positioning.** Create spacing with
  `padding`, `margin`, and `gap`. Centre and align with flex/grid
  (`justify-*`/`align-*`/`margin: auto`), not with positional offsets.
- **Do not translate Figma coordinates into an absolute `top`/`left` canvas.**
  Express the design's fixed measurements as flow layout — exact fixed widths on
  elements, exact fixed gaps as `margin`/`padding`/`gap`. This still honours the
  "exact Figma values / no fluid scaling" rules above; it just expresses them in
  normal document flow so elements align by construction rather than by
  coincidental arithmetic.
- **Use `position: absolute` only when flex/grid genuinely cannot achieve the
  result** — e.g. overlaying content on a full-bleed background image, or
  Next.js `<Image fill>` (which is inherently absolute). Prefer a grid stack or
  a `relative` + flow container first.

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
