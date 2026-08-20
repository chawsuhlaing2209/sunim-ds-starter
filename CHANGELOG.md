# Changelog

Every released version, and what it means for somebody who has the previous one
installed. `VERSIONING.md` says what a number promises and what it deliberately
does not.

## 0.1.0 — 2026-08-20

**The first published version.** Four components enter the public surface at once,
so there is no "what changed" for this one — there is only what is now there, and
what it is honest to expect of it.

Below `1.0.0` a minor bump is allowed to break anything. That is the semver
contract rather than a warning, and it is why the number starts with a zero.

### Added

- **`Button`** — the action. Three variants (Primary, Secondary, Ghost), two sizes,
  five states. Renders a native `<button>`: `disabled` disables it, a caller's
  `aria-busy` survives, and `type` defaults to `button` rather than `submit`, so
  dropping one into a form to open a dialog does not submit the form.
- **`Chip`** — a status tag or a credential. Four tones, two sizes. Non-interactive
  by default; it ships no focus appearance, so it will not help you if you make it
  interactive through prop spread.
- **`Eyebrow`** — the marked layer label above a section head. Four tones. Carries no
  heading semantics: put a real `<h2>` underneath it.
- **`IconSlot`** — a square, correctly sized, correctly coloured box for an icon
  inside another component. Name it with `aria-label` and it becomes `role="img"`;
  leave it off and it is decorative and hidden. The arrow it ships is a placeholder.
- **`dist/styles.css`** — one stylesheet carrying the token layer and the component
  CSS, in that order. Components resolve nothing but `var(--token)`, so the order is
  not cosmetic. `dist/tokens.css` ships the token layer alone.
- **Seven Figma modes.** Set `data-theme` on any ancestor and everything inside
  follows. Components bind token names, never values.
- **Types for everything on the surface**, so a consumer can type a wrapper.

### Known limitations, stated rather than discovered

- **Colour contrast is out of scope for this release.** Several tone-on-surface
  pairs fall below WCAG AA in several modes. This is measured, ruled and recorded
  in `decisions.md`, not an oversight — and each component's documentation states
  its own case. Nothing else in accessibility is waived.
- **`Button` at `state="Loading"`** disables the button, which removes it from the
  tab order and drops focus. `aria-busy` is set but announces nothing on its own;
  if the wait needs announcing, put a live region beside the button.
- **`Chip`** does not wrap or truncate. A long label grows the pill past its
  container.
- **`Eyebrow`'s** mark renders narrower than its design, because the bound typeface
  carries no glyph for it. The fix is upstream in the type or the export.
- **`IconSlot` is `experimental`** — the placeholder arrow is scaffolding for an
  icon set that is not in this package yet, and `Button` and `Chip` both render it
  on their default path.

### Two names that deliberately differ from the design file

Both were decided before publication, so neither cost a migration. Both are in
`decisions.md` with the reasoning.

- `ChipTone` ships **`Quiet`** where the Figma node says `Figma`. A public type
  union naming the design tool told a consumer neither what the tone means nor what
  it looks like.
- `Eyebrow` defaults to **`Sky`**, where the node's first variant is `Agentic`. An
  eyebrow with no tone set should be the ordinary one, not the AI-moment one.

### Requires

React 18 or later, as a peer dependency. This package never bundles it.
