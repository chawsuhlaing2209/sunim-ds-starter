# QA — Button (staging, post-refactor re-sweep)

| | |
|---|---|
| **Component** | Button |
| **Figma node** | `19:231` — the Button component set, in file `mFnN1Sr8MAmOdmx0ABXPsb` |
| **Tested against** | `https://sunim-ds-staging.vercel.app` (staging Storybook, deployed) |
| **Build under test** | **Post-refactor** — Button consumes `IconSlot`; the private `Arrow()` is gone |
| **Date** | 2026-08-20 |
| **Matrix** | 3 variants × 2 sizes × 5 states = **30 cases** |
| **Result** | **30 passed · 0 failed** |
| **Verdict** | Passes. No new findings. Four known design gaps unchanged. |

> **This sweep is against the post-refactor build.** The previous report (2026-08-19) measured
> the build in which Button drew its own arrow. That code no longer exists in `staging`. Every
> number below was re-measured against the deployed build that consumes `IconSlot`.

---

## 1 · The gate

Button's registry row carries a `Staging Storybook` link, so a deployed build exists and the
gate is satisfied. The row reads `Completed` rather than `Ready for Testing` only because a
`Production Storybook` link outranks staging in the status formula — the ladder has no state
for "shipped, then changed underneath". This re-sweep was authorised explicitly to close that
gap. Nothing local was tested.

Worth recording for whoever picks this up: the row's `Commit` column already points at
`2572273`, *Merge Button's Icon Slot refactor into staging*, so **staging and the registry
agree**. The `Production Storybook` link is the one pointing at the pre-refactor build. That
column is DevOps's, and this report does not touch it.

Staging was confirmed to actually *be* the post-refactor build, not assumed: the deployed DOM
emits `IconSlot`'s class names, which the pre-refactor build could not have produced.

---

## 2 · Where the expectations came from

`get_metadata` on `19:231` for the variant list and real pixel dimensions; `get_variable_defs`
per node for the bindings; `get_screenshot` for the visual compare. The story file was used
only to reconcile coverage.

**Reconciliation: 30 Figma variants ↔ 30 stories, one to one, no orphans either way.** The
four extra stories (Playground, WithoutTrailing, WithCustomIcon, LongLabel) exercise non-variant
properties and have no node; they are not matrix rows and are not counted.

---

## 3 · Method, and two traps handled

**Fonts confirmed loaded before any width was reported.** `document.fonts.check()` returned
`true` and was not trusted. The label was measured on a canvas in `"Schibsted Grotesk"`
(135.03px) and in a deliberately bogus family (121.12px, identical to `serif`). The 13.9px
gap proves the real face arrived, so the widths below mean what they say.

**The spinner was frozen before any Loading geometry was compared.** `getAnimations()` was
used to pause the rotation and pin `currentTime = 0` on all six Loading cases before
measuring. Frozen, the spinner measures exactly 14×14, matching
`--sunim-Button-unbound-spinner-size`.

One honest caveat: the measuring pane ran hidden (`document.hidden === true`), which throttles
timers, so unfrozen sampling read a constant 14 and I could **not** independently reproduce
the 14 → 19.8 spread reported to me. `prefers-reduced-motion` is `false` and the animation
(`sunim-Button-spin`) is present and live, so the rotation is genuinely declared. The freeze
was applied regardless, which is the measurement that counts. The spread *did* show up in the
screenshot pass — see §7.

**The mode trap.** The Figma file renders in the `open` season mode; staging renders the
default `day` mode. `--color-accent-ink-deep` is `#14639b` in `open` and `#125c93` in `day`;
`--color-accent-soft` and `--color-line-default` differ likewise. Verified against
`build/tokens/css/tokens.css`, which defines these per mode. A raw-hex comparison would have
produced twelve false failures on hover alone. **Every finding below names a token, never a
raw value.**

---

## 4 · The matrix

Geometry: Figma frame vs measured box. The width delta is **−0.96px on all 30 cases** and the
height delta is −0.8 (Md) / −0.4 (Lg) — identical within each size, which is the text
rasteriser, not the component. Figma resolves the Action line box at ~1.26 × font size, the
browser at 1.2. Systemic, so not charged against any case.

| # | Case | Figma | Measured | Fill | Label + arrow | Arrow is IconSlot | Result |
|---|---|---|---|---|---|---|---|
| 1 | Primary · Md · Default | 196×37 | 195.04×36.2 | `--color-accent-ink` | `--color-text-on-accent` | yes | **Passed** |
| 2 | Primary · Md · Hover | 196×37 | 195.04×36.2 | `--color-accent-ink-deep` | `--color-text-on-accent` | yes | **Passed** |
| 3 | Primary · Md · Focus | 196×37 | 195.04×36.2 | `--color-accent-ink` | `--color-text-on-accent` | yes | **Passed** |
| 4 | Primary · Md · Disabled | 196×37 | 195.04×36.2 | `--color-accent-ink` | `--color-text-on-accent` | yes | **Passed** |
| 5 | Primary · Md · Loading | 194×37 | 193.04×36.2 | `--color-accent-ink` | `--color-text-on-accent` | spinner | **Passed** |
| 6 | Primary · Lg · Default | 232×47 | 231.04×46.6 | `--color-accent-ink` | `--color-text-on-accent` | yes | **Passed** |
| 7 | Primary · Lg · Hover | 232×47 | 231.04×46.6 | `--color-accent-ink-deep` | `--color-text-on-accent` | yes | **Passed** |
| 8 | Primary · Lg · Focus | 232×47 | 231.04×46.6 | `--color-accent-ink` | `--color-text-on-accent` | yes | **Passed** |
| 9 | Primary · Lg · Disabled | 232×47 | 231.04×46.6 | `--color-accent-ink` | `--color-text-on-accent` | yes | **Passed** |
| 10 | Primary · Lg · Loading | 230×47 | 229.04×46.6 | `--color-accent-ink` | `--color-text-on-accent` | spinner | **Passed** |
| 11 | Secondary · Md · Default | 196×37 | 195.04×36.2 | `--color-surface-card` | `--color-accent-ink` | yes | **Passed** |
| 12 | Secondary · Md · Hover | 196×37 | 195.04×36.2 | `--color-accent-soft` | `--color-accent-ink-deep` | yes | **Passed** |
| 13 | Secondary · Md · Focus | 196×37 | 195.04×36.2 | `--color-surface-card` | `--color-accent-ink` | yes | **Passed** |
| 14 | Secondary · Md · Disabled | 196×37 | 195.04×36.2 | `--color-surface-card` | `--color-accent-ink` | yes | **Passed** |
| 15 | Secondary · Md · Loading | 194×37 | 193.04×36.2 | `--color-surface-card` | `--color-accent-ink` | spinner | **Passed** |
| 16 | Secondary · Lg · Default | 232×47 | 231.04×46.6 | `--color-surface-card` | `--color-accent-ink` | yes | **Passed** |
| 17 | Secondary · Lg · Hover | 232×47 | 231.04×46.6 | `--color-accent-soft` | `--color-accent-ink-deep` | yes | **Passed** |
| 18 | Secondary · Lg · Focus | 232×47 | 231.04×46.6 | `--color-surface-card` | `--color-accent-ink` | yes | **Passed** |
| 19 | Secondary · Lg · Disabled | 232×47 | 231.04×46.6 | `--color-surface-card` | `--color-accent-ink` | yes | **Passed** |
| 20 | Secondary · Lg · Loading | 230×47 | 229.04×46.6 | `--color-surface-card` | `--color-accent-ink` | spinner | **Passed** |
| 21 | Ghost · Md · Default | 196×37 | 195.04×36.2 | none | `--color-accent-ink` | yes | **Passed** |
| 22 | Ghost · Md · Hover | 196×37 | 195.04×36.2 | `--color-accent-soft` | `--color-accent-ink-deep` | yes | **Passed** |
| 23 | Ghost · Md · Focus | 196×37 | 195.04×36.2 | none | `--color-accent-ink` | yes | **Passed** |
| 24 | Ghost · Md · Disabled | 196×37 | 195.04×36.2 | none | `--color-accent-ink` | yes | **Passed** |
| 25 | Ghost · Md · Loading | 194×37 | 193.04×36.2 | none | `--color-accent-ink` | spinner | **Passed** |
| 26 | Ghost · Lg · Default | 232×47 | 231.04×46.6 | none | `--color-accent-ink` | yes | **Passed** |
| 27 | Ghost · Lg · Hover | 232×47 | 231.04×46.6 | `--color-accent-soft` | `--color-accent-ink-deep` | yes | **Passed** |
| 28 | Ghost · Lg · Focus | 232×47 | 231.04×46.6 | none | `--color-accent-ink` | yes | **Passed** |
| 29 | Ghost · Lg · Disabled | 232×47 | 231.04×46.6 | none | `--color-accent-ink` | yes | **Passed** |
| 30 | Ghost · Lg · Loading | 230×47 | 229.04×46.6 | none | `--color-accent-ink` | spinner | **Passed** |

Shared across every case and measured on each: `--radius-radius-pill` (999px), gap
`--spacing-space-2` (8px), padding `--spacing-step-10 / --spacing-step-18` (Md) and
`--spacing-step-14 / --spacing-step-26` (Lg), type `--font-action-md` / `--font-action-lg`,
`white-space: nowrap`. Opacity 1 on Default/Hover/Focus, 0.5 on Disabled, 0.85 on Loading.
Shadow: `--effect-shadow-button` on Primary (dropped on Disabled, replaced by
`--effect-focus-ring` on Focus); inset `--color-line-default` ring on Secondary; none on Ghost.

---

## 5 · The arrow colour — checked on all 30, not sampled

This was the specific silent-failure risk: `IconSlot` defaults to `--color-text-body` unless a
consumer sets `--sunim-IconSlot-color`, and Button sets it once on `.sunim-Button`. If that
declaration were missing or out-specified on any variant, that variant's arrow would quietly
become the wrong colour.

The computed stroke of the arrow was read on **every one of the 30 cases**. Result:

- `--sunim-IconSlot-color` computes to `currentColor` on all 30.
- The arrow's resolved stroke equals the button's own `color` on all 30 — white on Primary,
  accent ink on Secondary and Ghost, accent-ink-deep on all six Hover cases.
- `--color-text-body` is `#22344e` = `rgb(34, 52, 78)`. **That value appears on none of the 30.**

The control that makes this conclusive: `IconSlot` rendered standalone, with no Button around
it, resolves `rgb(34, 52, 78)` — its own documented default. So the fallback is live and
reachable, and Button's override is what keeps it from firing. This is a differential
measurement, not a reading of the CSS.

Corroborating from the design side: no node in the `19:231` set carries a `text-body` binding
at all. Presence or absence of a binding is mode-independent, so this holds regardless of which
mode the Figma file is open in.

---

## 6 · Composition, and the `icon` prop

**The composition is real, not a copy.** Button's trailing slot emits:

```
<span class="sunim-IconSlot sunim-IconSlot--16" aria-hidden="true"><span class="sunim-IconSlot__glyph"><svg viewBox="0 0 16 16" …
```

Compared against `IconSlot`'s own story markup, the two strings are **byte-identical** — same
class names, same `viewBox`, same `translate(3.06667 4.06667)`, same `d`, same `stroke-width="3.2"`.
Button emits IconSlot's markup because it renders IconSlot.

**The `icon` prop still works, unwrapped and unstretched.** A consumer icon renders bare in the
trailing slot with no `IconSlot` wrapper (`wrappedInIconSlot: false`), at its own declared
16×16, and its `currentColor` stroke resolves to the button's colour. The engineer's choice of
`icon ?? <IconSlot size="16" />` rather than routing the consumer icon through IconSlot behaves
as described.

---

## 7 · The "byte-identical output" claim, independently falsified where it could be

The engineer asserted 30/30 byte-identical output before and after, self-verified by hashing
geometry and paint properties. Rather than accept that, this run tested it in a medium the
engineer did not use: **rendered pixels**.

All 30 matrix cases were re-captured from the deployed staging build with headless Chrome at
2× scale, and hashed against the pre-refactor captures archived in git from the 2026-08-19 run.

| Outcome | Count | Cases |
|---|---|---|
| SHA-256 identical to pre-refactor | 24 | every non-Loading case |
| Differed | 6 | every Loading case |

The six differences are **not** a refactor regression, on two independent grounds:

1. **Logic.** Loading renders the spinner, not IconSlot. Those six cases contain no IconSlot
   at all, so the refactor cannot reach them.
2. **Experiment.** Three captures of the *same* post-refactor build, same flags, produced two
   different hashes for `primary-lg-loading`. The same control on `primary-lg-default` was
   perfectly reproducible across captures. The rotating spinner makes the capture
   non-deterministic — the pixel form of the very trap flagged for the geometry pass.

The four non-matrix stories (`with-custom-icon`, `without-trailing`, `long-label`, `playground`)
are also byte-identical to their pre-refactor captures.

So the claim survives the strongest independent test available here: every case whose rendered
output the refactor could possibly have changed is pixel-for-pixel unchanged.

---

## 8 · States driven, not just rendered

| State | How it was driven | Result |
|---|---|---|
| Hover | Real pointer over the button, not the pinned story | `:hover` matched; fill `--color-accent-ink-deep`; agrees with the pinned `is-hover` story exactly |
| Focus | Real `Tab` keypress, not `.focus()` | `:focus-visible` true, `--effect-focus-ring` present, `outline: none`, ring replaces the button shadow |
| Disabled | Real click at the button's coordinates, then `Tab` | Handler fired **0** times; `Tab` skipped it; `cursor: not-allowed` |
| Loading | Real click, then `Tab` | Handler fired **0** times; `Tab` skipped it; `aria-busy="true"` |

---

## 9 · Tokens

No raw hex, and no raw font value, anywhere in `Button.css` or `Button.tsx`. The only literal
dimensions are the quarantined unbound block.

**Known and already on the record — not new findings, and not engineering defects:**

| Unbound value | What it is |
|---|---|
| `--sunim-Button-unbound-opacity-disabled: 0.5` | node opacity on State=Disabled |
| `--sunim-Button-unbound-opacity-loading: 0.85` | node opacity on State=Loading |
| `--sunim-Button-unbound-border-width: 1px` | stroke weight on Variant=Secondary |
| `--sunim-Button-unbound-spinner-size: 14px` | trailing frame on State=Loading |

Four, unchanged by the refactor. `--sunim-Button-unbound-icon-size` left this block because the
icon dimension is now IconSlot's to state; it did not close, it moved to
`--sunim-IconSlot-unbound-size-16`. The repo-wide unbound count is unchanged. All of this is
design-side and belongs to a human, not to the engineer.

Also unchanged and previously recorded: Ghost's focus ring is drawn as a real ring in code,
where Figma renders it as a filter drop-shadow that is invisible on the canvas because Ghost
has no fill. Design to confirm.

---

## 10 · Screenshots

**Screenshots have no public host.** They are saved beside this report in `reports/Button/`,
one PNG per case, and are *not* attached to the registry rows — the `Attachment` column is
left empty rather than filled with a link that would not open.

- 30 matrix cases: `reports/Button/<variant>-<size>-<state>.png`
- 4 non-matrix stories: `with-custom-icon`, `without-trailing`, `long-label`, `playground`
- Figma render of the whole set: `reports/Button/_figma-node-19-231-component-set.png`

Captured from the deployed staging build with headless Chrome at 2× device scale. The
pre-refactor captures they replace remain in git history at commit `7ca2e65`, which is what
made the comparison in §7 possible.

---

## 11 · Verdict

**30 of 30 passed. No findings. Nothing goes back to the engineer.**

The refactor changed how the arrow is produced without changing what is produced. The one
mechanism that could have failed silently — per-variant arrow colour through
`--sunim-IconSlot-color` — was checked on every case and holds on every case, verified against
a live fallback rather than by reading the stylesheet.

No verdict here is final until a human reads it. Two things are worth a human's attention, and
neither is a defect in the code:

1. **The production link is stale.** `Production Storybook` still points at the pre-refactor
   build. Testing the arrow's colour on production would be testing the old vector. That column
   belongs to DevOps.
2. **The ladder cannot express this state.** A shipped component that changed underneath reads
   `Completed` throughout, and only a human instruction caused it to be re-tested at all. The
   next such refactor will be just as invisible.
