# QA — Button (staging)

| | |
|---|---|
| **Component** | Button |
| **Figma node** | `19:231` — the Button component set, in file `mFnN1Sr8MAmOdmx0ABXPsb` |
| **Tested against** | `https://sunim-ds-staging.vercel.app` (staging Storybook, deployed) |
| **Date** | 2026-08-19 |
| **Matrix** | 3 variants × 2 sizes × 5 states = **30 cases** |
| **Result** | **30 passed · 0 failed** |
| **Verdict** | Passes. Six design gaps recorded — none of them an engineering defect. |

The registry row read `Ready for Testing` with a `Staging Storybook` link, so the gate was
satisfied. Nothing local was tested; every measurement below comes from the deployed staging
build.

---

## 1 · The gate, and what the expectations were built from

The expected matrix was read from Figma over the MCP connection — `get_metadata` on `19:231`
for the variant list and real pixel dimensions, `get_design_context` per node for the token
bindings, `get_variable_defs` to confirm a binding, `get_screenshot` for the visual compare.
The story file was used only to reconcile coverage, never as the source of truth.

**Reconciliation: 30 Figma variants ↔ 30 stories, one to one, no orphans either way.**
Every node in the set has a story, and every matrix story maps to a node.

---

## 2 · The mode trap — read this before disputing any colour

The Figma file renders in the **`open`** season mode. The staging Storybook renders in
**`day`** (the preview's default global). The two modes agree on some semantic tokens and
differ on others, and both are correct:

| Semantic token | `day` (what staging renders) | `open` (what Figma renders) | Same? |
|---|---|---|---|
| `--color-accent-ink` | `#1a78bd` | `#1a78bd` | yes |
| `--color-accent-ink-deep` | `#125c93` | `#14639b` | **no** |
| `--color-accent-soft` | `#e3f1fa` | `#e2f2fd` | **no** |
| `--color-line-default` | `#e7ebf2` | `#e0ebf5` | **no** |

Every hover case in this matrix resolves `--color-accent-ink-deep`, so a naive raw-hex
comparison against the Figma canvas would have produced twelve false failures, plus more from
`accent-soft` and `line-default`. **The component binds semantic tokens throughout, so it
resolves correctly in all eight modes.** Findings below name tokens, never raw values.

Confirmed independently: Figma's exported arrow asset for Secondary Hover bakes `#14639B`
(open-mode `accent-ink-deep`), while the same case in staging measures `rgb(18, 92, 147)` =
`#125c93` (day-mode `accent-ink-deep`). Same token, different mode. Not a defect.

---

## 3 · Method

**Fonts were confirmed loaded before any width was reported.** `document.fonts.check()`
returns `true` for a font that is merely fallible, so it was not trusted. The label string was
measured on a canvas in `"Schibsted Grotesk"` (135.03px) and again in a deliberately bogus
family (121.12px, identical to `serif`). The 13.9px difference proves the real face is loaded,
so the widths below mean something.

Every number came from `getComputedStyle` and `getBoundingClientRect` in the deployed build.
Nothing was judged by eye.

**States were driven, not merely rendered:**

- **Focus** — a real `Tab` keypress moved focus to the button, which then matched
  `:focus-visible` and painted `--effect-focus-ring`. The pinned `Focus` story and the real
  keyboard focus agree. A programmatic `.focus()` was deliberately not used.
- **Hover** — a real pointer hover on the *unpinned* `Default` story reproduced the pinned
  `Hover` appearance exactly (`rgb(18, 92, 147)`).
- **Disabled** — a real pointer click fired **zero** handlers, the button is not focusable, and
  `cursor: not-allowed`.
- **Loading** — a real pointer click fired **zero** handlers, `aria-busy="true"` is present, and
  the spinner's transform matrix was sampled twice 250 ms apart and had changed, so the
  animation genuinely runs rather than sitting on frame one.

---

## 4 · The matrix

Geometry is consistent across every case, so it is stated once rather than repeated 30 times:

| Size | Figma | Staging | Δ |
|---|---|---|---|
| Md | 196 × 37 | 195.04 × 36.20 | −0.96 w, −0.80 h |
| Md, Loading | 194 × 37 | 193.04 × 36.20 | −0.96 w, −0.80 h |
| Lg | 232 × 47 | 231.04 × 46.60 | −0.96 w, −0.40 h |
| Lg, Loading | 230 × 47 | 229.04 × 46.60 | −0.96 w, −0.40 h |

The −0.96px width delta is **identical on all 30 cases** — text rasterises differently in Figma
than in a browser. The height delta is explained in Gap 6. Neither is charged to the component;
per the test skill, the same delta on every case points at something systemic, and a delta on
one case would be the real finding. There was none.

The 2px narrower Loading footprint is correct: the trailing frame shrinks from the 16px icon to
the 14px spinner, in both the node and the build.

### Primary

| # | Case | Expected (from the node) | Measured | Result |
|---|---|---|---|---|
| 1 | Primary · Md · Default | `--color-accent-ink` fill, `--color-text-on-accent` label, `--effect-shadow-button` | fill `rgb(26,120,189)`, label `#fff`, shadow `0 16px 30px -12px rgba(22,111,178,.7)` | **Passed** |
| 2 | Primary · Md · Hover | fill → `--color-accent-ink-deep`, shadow retained | fill `rgb(18,92,147)`, shadow retained | **Passed** |
| 3 | Primary · Md · Focus | `--effect-focus-ring` **replaces** `--effect-shadow-button` | `rgba(43,164,236,.4) 0 0 0 3px`, button shadow gone | **Passed** |
| 4 | Primary · Md · Disabled | opacity `0.5`, shadow removed, fill unchanged | opacity `0.5`, `box-shadow: none` | **Passed** |
| 5 | Primary · Md · Loading | opacity `0.85`, shadow **retained**, 14px spinner | opacity `0.85`, shadow retained, spinner 14×14 | **Passed** |
| 6 | Primary · Lg · Default | as #1 with `--spacing-step-14/26`, `--font-action-lg` | padding `14px 26px`, font `700 15.5px` | **Passed** |
| 7 | Primary · Lg · Hover | fill → `--color-accent-ink-deep` | fill `rgb(18,92,147)` | **Passed** |
| 8 | Primary · Lg · Focus | ring replaces button shadow | ring only | **Passed** |
| 9 | Primary · Lg · Disabled | opacity `0.5`, shadow removed | opacity `0.5`, no shadow | **Passed** |
| 10 | Primary · Lg · Loading | opacity `0.85`, shadow retained, spinner | matches | **Passed** |

Node `19:74` carries the ring **only** — no button shadow. Node `19:80` carries **no** shadow at
all. Node `19:85` carries the button shadow **and** `opacity-85`. The build reproduces all three
distinctions exactly; this is the detail most implementations get wrong.

### Secondary

| # | Case | Expected (from the node) | Measured | Result |
|---|---|---|---|---|
| 11 | Secondary · Md · Default | `--color-surface-card` fill, `--color-accent-ink` label, 1px **inside** stroke `--color-line-default` | `#fff`, `rgb(26,120,189)`, `inset 0 0 0 1px rgb(231,235,242)`, width 195.04 = Primary Md | **Passed** |
| 12 | Secondary · Md · Hover | fill → `--color-accent-soft`, label → `--color-accent-ink-deep`, stroke retained | `rgb(227,241,250)`, `rgb(18,92,147)`, stroke retained | **Passed** |
| 13 | Secondary · Md · Focus | stroke **and** ring both present, label stays `--color-accent-ink` | `inset …1px` + `rgba(43,164,236,.4) 0 0 0 3px`, label `rgb(26,120,189)` | **Passed** |
| 14 | Secondary · Md · Disabled | opacity `0.5`, stroke retained | opacity `0.5`, stroke retained | **Passed** |
| 15 | Secondary · Md · Loading | opacity `0.85`, stroke retained, spinner in `--color-accent-ink` | matches | **Passed** |
| 16 | Secondary · Lg · Default | as #11 at Lg | width 231.04 = Primary Lg | **Passed** |
| 17 | Secondary · Lg · Hover | `--color-accent-soft` / `--color-accent-ink-deep` | matches | **Passed** |
| 18 | Secondary · Lg · Focus | stroke + ring | matches | **Passed** |
| 19 | Secondary · Lg · Disabled | opacity `0.5`, stroke retained | matches | **Passed** |
| 20 | Secondary · Lg · Loading | opacity `0.85`, stroke retained | matches | **Passed** |

The inside stroke is drawn as `box-shadow: inset`, not `border`. **This is correct, not a
workaround.** A Figma stroke set to inside adds nothing to the frame, so Secondary and Primary
are both 196 wide at Md in the node; a real `border` would have pushed the pill 2px wider than
Primary. Measured: Secondary Md 195.04px, Primary Md 195.04px — they align, as designed.

Node `19:132` was checked specifically because it is easy to get wrong: Secondary Focus keeps
the label on `--color-accent-ink`, **not** the deep variant. The build agrees.

### Ghost

| # | Case | Expected (from the node) | Measured | Result |
|---|---|---|---|---|
| 21 | Ghost · Md · Default | no fill, no shadow, `--color-accent-ink` label | `rgba(0,0,0,0)`, `none`, `rgb(26,120,189)` | **Passed** |
| 22 | Ghost · Md · Hover | fill `--color-accent-soft`, label `--color-accent-ink-deep`, no stroke | `rgb(227,241,250)`, `rgb(18,92,147)`, no stroke | **Passed** |
| 23 | Ghost · Md · Focus | `--effect-focus-ring`, label stays `--color-accent-ink` — see Gap 5 | ring drawn, label `rgb(26,120,189)` | **Passed** |
| 24 | Ghost · Md · Disabled | opacity `0.5`, no fill | opacity `0.5`, transparent | **Passed** |
| 25 | Ghost · Md · Loading | opacity `0.85`, no fill, spinner | matches | **Passed** |
| 26 | Ghost · Lg · Default | no fill, `--font-action-lg` | matches | **Passed** |
| 27 | Ghost · Lg · Hover | `--color-accent-soft` / `--color-accent-ink-deep` | matches | **Passed** |
| 28 | Ghost · Lg · Focus | ring — see Gap 5 | ring drawn | **Passed** |
| 29 | Ghost · Lg · Disabled | opacity `0.5` | matches | **Passed** |
| 30 | Ghost · Lg · Loading | opacity `0.85`, spinner | matches | **Passed** |

---

## 5 · Icon geometry — verified against Figma's own exports

The build inlines the arrow and spinner as SVG rather than using exported assets. That decision
was checked rather than taken on trust, by downloading the assets Figma exports for these nodes
and diffing them against the code:

- **Arrow** — Figma exports `M1.6 3.93333H8.26667M5.93333 6.26667L8.26667 3.93333L5.93333 1.6`,
  `stroke-width="3.2"`, round cap and join, on a 9.867 × 7.867 vector. The code's `<Arrow>`
  renders that path, that stroke width, those caps and joins, translated by `(3.06667, 4.06667)`
  inside the 16px frame. **Identical.**
- **Spinner** — the `d` attribute in the code is byte-for-byte the exported path, with the same
  `stroke-width="4"`, the same inside-mask, and the same 14 × 14 clip. **Identical.**

The exports also justify the inlining: Figma bakes the colour per variant (`white` on Primary,
`#1A78BD` / `#14639B` on Secondary and Ghost). An `<img>` cannot inherit `currentColor`, so a
single exported asset would have been the wrong colour on 20 of the 30 variants. Measured
trailing stroke follows the label on every case, including the hover shift to
`--color-accent-ink-deep`.

---

## 6 · Design gaps — reported as gaps, not charged to the engineer

Gaps 1–5 were raised by the engineer in the build. **I verified each independently against the
node and I agree with all five.** They are recorded here so they are not lost, not re-discovered.

| # | Gap | Evidence from the node | Where it lives in code |
|---|---|---|---|
| 1 | Disabled opacity `0.5` is unbound | `19:80` emits a bare `opacity-50`, no variable | `--sunim-Button-unbound-opacity-disabled` |
| 2 | Loading opacity `0.85` is unbound | `19:85` emits a bare `opacity-85` | `--sunim-Button-unbound-opacity-loading` |
| 3 | Secondary stroke **weight** `1px` is unbound | `19:126` binds the stroke *colour* to `line-color` but the weight is a bare `border` | `--sunim-Button-unbound-border-width` |
| 4 | Icon frame `16px` is unbound | every node emits `size-[16px]` with no variable | `--sunim-Button-unbound-icon-size` |
| 5 | Spinner frame `14px` is unbound | `19:85` emits `size-[14px]` with no variable | `--sunim-Button-unbound-spinner-size` |

The engineer quarantined all five in one block instead of mapping them onto a semantic token
that happens to share the number. That is the right call — mapping them would have disguised a
design gap as a binding and hidden it from the next person. They become `var(--token)` the
moment design binds them in Figma.

### Gap 5 (the Ghost focus ring) — confirmed, and it is a Figma rendering limit, not a miss

Node `19:190` **does** bind the `focus/ring` effect
(`DROP_SHADOW, #2BA4EC66, offset (0,0), radius 0, spread 3`). But because Ghost has no fill,
Figma renders it as a spread-less `drop-shadow(0px 0px 0px …)` and the ring is **invisible on
the canvas** — visible in the downloaded component-set render at
`reports/Button/_figma-node-19-231-component-set.png`, row 5 and row 6, column 3, where the
Ghost focus cell shows no ring at all while Primary and Secondary focus clearly do.

The code draws it as a real 3px ring. That is faithful to the binding and it is the accessible
outcome; a keyboard user would otherwise have no focus indicator on a tertiary action. I have
passed cases 23 and 28 on that basis. **Design should confirm the intent and, if it agrees, the
node needs the ring made visible so the canvas stops disagreeing with the build.**

### Gap 6 — new, and it is not Button's

Not raised before. `--font-action-md` and `--font-action-lg` bake a `1.2` line-height
(`16.2px` and `18.6px`), while the Figma text layers use **auto** leading (`leading-[normal]`,
≈`1.23–1.26` for Schibsted Grotesk). That is the entire source of the height shortfall:

- Md — Figma content row 17px → 37px tall; build 16.2px → 36.2px. Δ 0.80px
- Lg — Figma content row 19px → 47px tall; build 18.6px → 46.6px. Δ 0.40px

Both under 1px, both identical across all 30 cases, and both originate in the **generated token
file**, not in `Button.css` — the component correctly consumes `var(--font-action-md)` /
`var(--font-action-lg)`. `build/tokens/` is generated and must never be hand-edited, so this is
a token-pipeline item for 🎨 Design: it will shift every component that uses `--font-action-*`,
not only Button. **Recorded as a gap; no case failed on it.**

---

## 7 · Token audit

No raw hex, px, rem, or font value appears in `Button.tsx` or `Button.css` outside the five
declared gap variables above. The single regex hit in `Button.css` is the word "2px" inside an
explanatory comment. Tokens consumed:

`--color-accent-ink` · `--color-accent-ink-deep` · `--color-accent-soft` · `--color-line-default`
· `--color-surface-card` · `--color-text-on-accent` · `--effect-focus-ring` ·
`--effect-shadow-button` · `--font-action-md` · `--font-action-lg` · `--radius-radius-pill` ·
`--spacing-space-2` · `--spacing-step-10` · `--spacing-step-14` · `--spacing-step-18` ·
`--spacing-step-26`

All semantic. No component references a primitive directly.

---

## 8 · The four non-matrix stories

`Playground`, `WithoutTrailing`, `WithCustomIcon` and `LongLabel` have **no node in the
component set**, so no node expectation was invented for them and none of them can pass or fail
the matrix. They exercise the three non-variant Figma component properties — `Label`,
`Show Trailing`, `Icon` — so they are legitimate stories, and they are recorded here rather than
dropped. They rendered without error:

| Story | Exercises | Rendered |
|---|---|---|
| Playground | controls | 195.04 × 36.20, identical to Primary Md Default |
| WithoutTrailing | `Show Trailing = false` | 171.04px — exactly 24px narrower (16px icon + 8px gap), so the slot is removed rather than hidden |
| WithCustomIcon | `Icon` override | custom `<svg>` in the trailing slot, arrow replaced |
| LongLabel | `Label` | 482.80px, `white-space: nowrap`, no clipping — the pill grows to hug |

**No registry rows were written for these four**, because a row per case is what
`Synchronization %` counts and four rows with no node behind them would inflate the denominator
against nothing.

---

## 9 · Screenshots

All 34 stories were captured from the **deployed staging build** at 2× device scale and saved
beside this report in `reports/Button/`, named by case
(`primary-md-focus.png`, `ghost-lg-loading.png`, …). The Figma reference render of the whole
component set is `reports/Button/_figma-node-19-231-component-set.png`.

**The `Attachment` field on all 30 registry rows was left empty.** Airtable attachments require
a publicly reachable URL, and I have no public host for these PNGs. The field is empty rather
than carrying a link that would not resolve — the screenshots are on disk at the paths above.
Stating this plainly is the point; a silently empty field would read as an oversight.

---

## 10 · Registry

30 rows written to `Staging Testing`, one per variant × size × state, each with `Composed In`
linked to Button's `Components` row and `Testing Results` = `Passed`.

Confirmed after writing: `Total Staging Tests` = 30, `Staging Passed Count` = 30,
`Synchronization %` = **100%**, and `Development` moved itself from `Ready for Testing` to
**`To be deployed`**. No status column was written by hand.

> **One observation for 🎨 the registry owner, not for this component:** the `Staging Passed
> Tests` rollup on `Components` reads `0` while `Staging Passed Count` reads `30` and
> `Synchronization %` correctly reads `100%`. The rollup's own description says it feeds
> `Synchronization %`, but the percentage is evidently fed by the count field instead. The
> rollup looks misconfigured. It did not affect this run and I have not touched it.

---

## 11 · Verdict

**All 30 cases passed. Button is clear to deploy.**

No engineering defect was found. The component reproduces every variant, size and state of node
`19:231`, binds semantic tokens throughout so it survives all eight modes, and its disabled,
loading, focus and hover states were driven and behave correctly rather than merely looking
correct.

Six design gaps stand open. Five are the engineer's, independently confirmed. The sixth — the
`--font-action-*` line-height — is new, belongs to the token pipeline, and will move more than
this component when it is fixed. **All six are 🎨 Design's to close, and none of them blocks
this deploy.**

No verdict here is final until a human reads it.
