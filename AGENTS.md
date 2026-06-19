Build this project as a responsive marketing website from a completed Figma design.

Stack:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS

Rules:
- Match the Figma design as closely as possible.
- Build mobile-first, then desktop.
- Use reusable components.
- Keep styling in Tailwind unless there is a clear reason not to.
- Do not add new libraries without asking first.
- Do not change unrelated files.
- Commit-ready changes only.
- Ask for clarification when Figma details are missing.

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
- **Use exact Figma values, never approximations,** when exact values are
  available: container widths, component widths, section widths, font sizes,
  font weights, line heights, letter spacing, text alignment, button sizing,
  card/grid spacing, section padding, element alignment, icon sizing, image
  sizing, border radius, and shadows.
- **Match all interactive states from the design:** button hover, link hover,
  and active states.
- **Honour mobile, tablet, and desktop spacing** exactly as designed at each
  breakpoint.

## Working method (non-negotiable)

- **Inspect the existing implementation before editing.** Compare every page,
  section, and component against the Figma design before changing anything.
- Keep changes **small, focused, and reviewable**. Do not make broad layout
  changes unless required, and do not rewrite working code unnecessarily.
- Do not change unrelated logic or functionality.
- Use the existing tech stack and styling approach (Tailwind first).

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
