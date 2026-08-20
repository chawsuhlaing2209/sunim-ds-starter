# QA — Chip

**Build under test** Deployed staging Storybook, `https://sunim-ds-staging.vercel.app`
**Design under test** Figma node `21:79` — the Chip component set
**Tested** 2026-08-20
**Registry status on pickup** `Ready for Testing` (staging link present — gate satisfied)

Testing was done against the deployed staging build only. Local Storybook was never started.

---

## The matrix

The Figma set has two variant properties — `Tone` (Default, Gold, Agentic, Figma) × `Size`
(Sm, Md) = **8 variants**. Confirmed from the node, not from the story file.

**There is no State property in the set.** I checked the component set and all eight symbols:
each carries exactly two properties. So Chip has no hover, focus, pressed, disabled or loading
appearance, none was invented in the code, and none was expected here. Every case is the
component's single resting state.

| # | Case | Node | Figma | Measured (staging, `day`) | Contrast | Result |
|---|---|---|---|---|---|---|
| 1 | Default · Sm | `21:43` | 94 × 23 | 93.59 × 23.25 | 4.08 | **Passed** |
| 2 | Default · Md | `21:48` | 115 × 36 | 114.56 × 35.60 | 4.08 | **Passed** |
| 3 | Gold · Sm | `21:53` | 94 × 23 | 93.59 × 23.25 | 3.35 | **Passed** |
| 4 | Gold · Md | `21:58` | 115 × 36 | 114.56 × 35.60 | 3.35 | **Passed** |
| 5 | Agentic · Sm | `21:63` | 94 × 23 | 93.59 × 23.25 | 3.30 | **Passed** |
| 6 | Agentic · Md | `21:68` | 115 × 36 | 114.56 × 35.60 | 3.30 | **Passed** |
| 7 | Figma · Sm | `21:73` | 94 × 23 | 93.59 × 23.25 | 17.75 | **Passed** |
| 8 | Figma · Md | `21:78` | 115 × 36 | 114.56 × 35.60 | 17.75 | **Passed** |

**8 cases · 8 passed · 0 failed.** Three findings below, all owned by design.

### Per-case token bindings — all confirmed correct

| Property | Sm | Md |
|---|---|---|
| Font | `--font-ui-tag` → 700 11.5px/17.25px Instrument Sans | `--font-ui-tag-lg` → 700 13.5px/21.6px |
| Padding | 3px / 10px — **unbound in Figma** | 7px **unbound** / `--space-4` (16px) **bound** |
| Stroke | 1px inside — **unbound** | 1.5px inside — **unbound** |
| Radius | `--radius-pill` → 999px | `--radius-pill` → 999px |
| Gap | `--space-2` → 8px | `--space-2` → 8px |
| Mark | Icon Slot instance, 14 × 14 | Icon Slot instance, 14 × 14 |

| Tone | Background | Label + mark | Stroke |
|---|---|---|---|
| Default | `--color-accent-soft` #e3f1fa | `--color-accent-ink` #1a78bd | `--color-line-quiet` #e2ecf6 |
| Gold | `--color-gold-soft` #fff4e0 | `--color-gold-ink` #b57a16 | `--color-gold-line` #f2dfbb |
| Agentic | `--color-agentic-soft` #f3eef9 | `--color-agentic-default` #9b6fd0 | `--color-agentic-line` #e7dcf4 |
| Figma | `--color-surface-card` #ffffff | `--color-text-heading` #101828 | `--color-line-default` #e7ebf2 |

Every colour in the deployed CSS resolves through a semantic token. No raw hex anywhere.

---

## Method notes

**Fonts were confirmed loaded before any width was reported.** `document.fonts.check()` returned
true, which proves nothing. Measuring the same string on a canvas gave 121.41px in
`"Instrument Sans"` against 118.89px in a deliberately bogus family — different, so the real face
arrived. The deployed build serves both weights from its own origin
(`/assets/instrument-sans-latin-{400,700}-normal-*.woff2`), not a CDN, which is what the CSP
requires.

**Geometry deltas are the renderer, not the component.** Every case is 0.41px narrower than its
node and every Sm is 0.25px taller / every Md 0.40px shorter. The delta is identical across all
eight cases, which points at text rasterisation and the line-height rounding noted in Finding 4 —
not at Chip. No case is dimensionally wrong.

**The inside stroke is correctly translated.** Figma draws an inside stroke, which adds nothing to
the frame; the node measures exactly content + padding. Chip uses an inset `box-shadow`, so the
box stays the node's size. A real `border` would have made every pill 2–3px larger. Correct.

**Two cases initially returned no element** when I measured all eight in parallel iframes. That was
a load race in my harness, not a defect — both re-measured cleanly by direct navigation and are
reported on their real numbers.

### The mode trap

The two sides answer in different modes, and this had to be resolved before any colour could be
called wrong:

- **Staging renders `day`** — `data-theme="day"` on the root element of every story.
- **The Figma file is open in `open`** — `get_variable_defs` returned `--accent-ink` = `#166fb2`,
  which is the `open`-mode value, not `day`.

These are different variables resolving through different primitives. In `day`,
`--color-accent-ink` resolves via `--primitives-sky-600`; in `open` it resolves via
`--primitives-season-open-accent-ink`. Comparing the Figma answer directly against the staging
pixel would have produced a false failure on all four Default cases.

**Limitation, stated plainly:** `get_variable_defs` answers only in the mode the Figma file is
currently open in, so I could confirm the `open`-mode values against Figma but **not** the
`day`-mode ones. Day-mode colours were verified against the committed token export and the live
deployed CSS, which agree with each other. If design wants day-mode parity confirmed against
Figma directly, the file has to be opened in `day` and re-read.

---

## Findings

All four are design-owned. None is an engineering defect and none is logged against the engineer.

### Finding 1 — Contrast: 6 of 8 variants fail WCAG AA in day mode

**Verified independently. I agree with the finding on the record, and my numbers match it exactly.**

| Tone | Ink on soft | Ratio | AA 4.5:1 |
|---|---|---|---|
| Default | `--color-accent-ink` on `--color-accent-soft` | 4.08 | ✗ |
| Gold | `--color-gold-ink` on `--color-gold-soft` | 3.35 | ✗ |
| Agentic | `--color-agentic-default` on `--color-agentic-soft` | 3.30 | ✗ |
| Figma | `--color-text-heading` on `--color-surface-card` | 17.75 | ✓ |

Six cases fail (both sizes of Default, Gold and Agentic); the two Figma cases pass.

**The large-text exemption does not apply.** WCAG's 3:1 threshold needs 18.66px bold or larger.
Chip's type is 11.5px bold (Sm) and 13.5px bold (Md) — both well under it, so the 4.5:1
normal-text threshold is the one that governs. The mark carries the same colour as the label but
is `aria-hidden` and decorative, so SC 1.4.11 does not add a separate failure.

**Night mode passes throughout** — Default 8.66, Gold 8.26, Agentic 6.51, Figma 14.08. The problem
is specific to the light modes; `open` mode is equally affected (Default 4.11, Gold 3.35,
Agentic 3.30).

**Where** The tokens, not the component. Chip binds exactly the pairs the node specifies.

### Finding 2 — Five unbound values in `Chip.css`

**Verified. I agree the values are unbound, and I agree with how the engineer handled them.**

`get_variable_defs` on the node reports `10px`, `3px` and `7px` as bare literals with no variable
behind them, while `--space-4` (16) comes back as a proper binding. The two stroke weights do not
appear in the variable map at all. So all five are genuine design gaps.

**The near-miss is real and worth design's attention.** `--spacing-step-3`, `--spacing-step-7` and
`--spacing-step-10` all exist in the export carrying exactly 3px, 7px and 10px. Combined with the
fact that Chip's Md *horizontal* padding **is** bound to `--space-4`, the asymmetry looks like an
oversight rather than a decision.

I nonetheless **agree with the engineer's choice not to bind them.** Mapping an unbound value onto
a same-numbered token from a different scale would assert an intent the design never stated, and
would disguise the gap so it could never be found again. `--space-*` (4, 8, 12, 16, 20, 24…) and
`--spacing-step-*` (2, 3, 5, 6, 7, 9, 10…) are two distinct scales; the numbers coinciding is not
evidence they are the same thing. Quarantining under named `--sunim-Chip-unbound-*` properties is
the correct handling under `CLAUDE.md`.

**There is no border-width scale in the export at all** — no token carries 1px or 1.5px, so the two
stroke weights have nowhere to resolve. Button quarantines the same gap
(`--sunim-Button-unbound-border-width`). One border-width scale would close all three.

**Ask of design:** bind the four paddings in Figma (or confirm the asymmetry is deliberate), and
add a border-width scale.

### Finding 3 — `--color-accent-ink` is stale in the committed export

**Verified. I agree the export is stale. It affects none of the eight cases.**

Figma's live variable reads `#166fb2`; the committed export carries `#1a78bd`. The export needs
re-exporting.

**It changes no case tested here**, and this is the part worth being precise about. The stale value
sits on the `open`-mode primitive. Staging renders `day`, where `--color-accent-ink` resolves
through `--primitives-sky-600` — a different primitive entirely. All four Default cases render
`#1a78bd` from the day chain, and they would render `#1a78bd` whether or not the open-mode
primitive were refreshed.

Were the app rendered in `open` mode, the four Default cases would shift, and the contrast would
move slightly *in the right direction* (`#166fb2` is darker than `#1a78bd`) — though not far enough
to clear AA on its own.

**Chip is not failed for this**, as instructed and as is correct: the component consumes the token,
it does not define it.

### Finding 4 — Line-height tokens disagree with the Figma type styles (new observation)

Not previously on the record. Reporting it as a token gap, not against the engineer.

| Style | Figma line height | Token in export |
|---|---|---|
| UI/Tag | 17px | `--font-ui-tag` → 17.25px |
| UI/Tag Lg | 22px | `--font-ui-tag-lg` → 21.6px |

The export appears to have resolved line height as a multiplier (11.5 × 1.5, 13.5 × 1.6) where
Figma states explicit pixel values. This is the direct cause of the height deltas in the matrix —
Sm renders 0.25px tall, Md 0.40px short. Visually it is nothing, and no case is failed for it, but
it is the root cause of the only geometric disagreement in the report and it will drift further on
any component with more stacked text.

**Where** The token build, `--font-ui-tag` / `--font-ui-tag-lg`. Chip consumes both correctly.

---

## Composition — Chip × Icon Slot

**The composition holds. Chip has not reached into Icon Slot's internals, and has not reproduced
its markup.** Verified in the deployed DOM and the deployed CSS, not in the source.

- Chip emits Icon Slot's own markup verbatim on all eight variants:
  `<span class="sunim-IconSlot sunim-IconSlot--14"><span class="sunim-IconSlot__glyph"><svg viewBox="0 0 14 14">…`
- The rendered slot measures 14 × 14 on all eight. The node agrees — the `Icon` instance is 14 × 14
  on Sm *and* Md (checked on `21:43`, `21:48`, `21:53`, `21:78`), so size 14 rather than 16 at Md
  is correct, not an oversight.
- The deployed `Chip` stylesheet contains exactly one reference to Icon Slot — the custom property
  `--sunim-IconSlot-color: currentColor`, set once on `.sunim-Chip`. There is **no** selector
  targeting `.sunim-IconSlot` or any of its internals.
- The mark's computed colour equals the label's computed colour on all eight cases, so the
  documented override is doing the work.

This is the override used exactly as Icon Slot documents it.

---

## Stories with no node behind them

Noted, not given registry rows, as they have no Figma variant to test against:

`All Tones` · `Text Only` · `With Custom Icon` · `Playground`

The eight matrix stories reconcile one-to-one with the eight Figma variants. No Figma variant is
missing a story, and no matrix story lacks a node.

---

## The rule applied to contrast, and why

**A contrast failure caused by the colours the design binds is recorded as `Passed` with a design
finding, not `Failed`.** Applied uniformly to all eight cases.

The reasoning:

1. **A case fails when the component disagrees with its node.** On all six low-contrast cases Chip
   renders precisely the token pair the node specifies. There is no version of Chip that is
   "fixed" while still matching the design.
2. **`Failed` routes work to the engineer.** In the registry a `Failed` row derives
   `To be fixed`, which is the engineer's queue. The engineer cannot resolve this without editing
   token values — and tokens are design-owned and human-owned. Failing these rows would aim the
   work at someone who is not allowed to do it, and stall the component indefinitely.
3. **`CLAUDE.md` already sets the precedent:** a value the design left unbound is a design gap, not
   an engineering defect, and is reported as a gap. A colour pair the design chose that fails AA is
   the same class of thing.

**This is emphatically not a silent pass.** The failure is recorded on all six affected registry
rows in both `Expected Results` and `Suggestion for Improvement`, and it is Finding 1 of this
report. It is design's call to make, and it is now in front of them with numbers attached.

If the house rule is that accessibility failures should block regardless of ownership, that is a
reasonable policy and it would flip these six rows to `Failed` — but it is a policy decision for a
human, not one I should make silently on a component that matches its design.

---

## Screenshots

**These have no public host.** They are saved beside this report in `reports/Chip/` and are not
attached to the registry rows — the `Attachment` column takes a file or a URL, and there is nowhere
public to serve these from. The `Attachment` cell is empty on all eight rows for that reason.

| File | What it shows |
|---|---|
| `reports/Chip/chip-default-sm.png` | Default · Sm, deployed staging |
| `reports/Chip/chip-default-md.png` | Default · Md, deployed staging |
| `reports/Chip/chip-gold-sm.png` | Gold · Sm, deployed staging |
| `reports/Chip/chip-gold-md.png` | Gold · Md, deployed staging |
| `reports/Chip/chip-agentic-sm.png` | Agentic · Sm, deployed staging |
| `reports/Chip/chip-agentic-md.png` | Agentic · Md, deployed staging |
| `reports/Chip/chip-figma-sm.png` | Figma · Sm, deployed staging |
| `reports/Chip/chip-figma-md.png` | Figma · Md, deployed staging |
| `reports/Chip/figma-node-21-79-component-set.png` | The Figma component set, all 8 variants |

All eight staging captures were taken headlessly against the deployed URL at 3× with the real
self-hosted font, and match the Figma render tone for tone.

---

## Verdict

**All 8 cases pass. Chip is a faithful implementation of node `21:79`.**

Every variant matches its node on geometry, colour, type, radius, spacing and stroke; every colour
resolves through a semantic token; the Icon Slot composition is clean and uses the documented
override rather than reaching inside. The registry row moved to `To be deployed` on its own.

**Four things need a human before this ships, and three of them are design's:**

1. **Contrast — 6 of 8 variants below WCAG AA in day mode.** The most consequential item here.
   Chip is not the defect and cannot fix it; the token values have to change. Agentic (3.30) is the
   worst and arguably the most important to get right, since it marks AI moments.
2. **Five unbound values** — four paddings and two stroke weights need binding in Figma, plus a
   border-width scale that does not currently exist.
3. **`tokens.json` needs re-exporting** — `--color-accent-ink` is stale. Harmless to Chip today.
4. **Line-height tokens** disagree with the Figma type styles by a fraction of a pixel.

No verdict here is final until a human reads it.

---

## One registry observation, for the PM

Chip's row carries two counters of passed tests and they disagree:

| Field | Reads |
|---|---|
| `Total Staging Tests` (count) | 8 ✓ |
| `Staging Passed Count` (count) | 8 ✓ |
| `Staging Passed Tests` (rollup) | **0** ✗ |
| `Synchronization %` (formula) | 100% ✓ |

All eight rows read `Passed`, so the rollup is the odd one out. I read the row twice, several
minutes apart, and it stayed at 0 — so this is not a recompute lag.

The rollup's own description says it "Counts only test rows marked Passed. Feeds
Synchronization %." That cannot be true as written: it reads 0 while `Synchronization %` reads
100%, so the percentage is evidently fed by `Staging Passed Count` instead. Either the rollup is
misconfigured or its description is stale. Worth checking before anyone builds a report on it —
a stuck-at-zero rollup would read as "nothing has passed" on any component.

Flagging rather than touching it: count, rollup and formula columns have no agent owner and are
not mine to write.
