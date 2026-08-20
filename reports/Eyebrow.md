# QA · Eyebrow

**Tested** the deployed staging Storybook — `https://sunim-ds-staging.vercel.app`, opening at
`components-eyebrow--agentic`. Nothing local was started; local Storybook is not what shipped.

**Against** Figma node `22:43` in file `mFnN1Sr8MAmOdmx0ABXPsb`, read live over the Figma MCP
connection.

**Render mode** — staging serves `data-theme="day"`. See *The mode question* below; the Figma
file turned out to answer in `day` too, which is not what the handover assumed.

---

## The matrix

The node is a component set with **one axis**: `Tone = Agentic | Sky | Ink | Gold`, four symbols,
each `151 × 18`. `get_metadata` confirms no Size property and no State property — the axis list I
was given is the axis list the node carries, and there is no undeclared fifth axis.

Each variant has exactly three **text** children, and no instance children:

| Child | Node id | Node box |
|---|---|---|
| Mark | `22:24` | 14 × 18 |
| Title | `22:25` | 82 × 18 |
| Label | `22:26` | 39 × 18 |

Gaps derived from the node's child offsets: 22 − 14 = **8**, 112 − 104 = **8**, matching
`--spacing-space-2`.

### Results

| # | Case | Variant | Size | State | Result |
|---|---|---|---|---|---|
| 1 | Eyebrow · Agentic | Tone=Agentic | null | idle | **Passed** (2 findings) |
| 2 | Eyebrow · Sky | Tone=Sky | null | idle | **Passed** (2 findings) |
| 3 | Eyebrow · Ink | Tone=Ink | null | idle | **Passed** (3 findings) |
| 4 | Eyebrow · Gold | Tone=Gold | null | idle | **Passed** (2 findings) |

4 cases · 4 passed · 0 failed. Every case carries at least one finding; see *Verdict*.

### Measured, per case

All four render identically except colour, so the geometry row is shared.

| Property | Node | Staging | Verdict |
|---|---|---|---|
| Root box | 151 × 18 | 145.73 × 18 | height exact; width −5.27 → **Finding 1** |
| Mark | 14 | 8.10 | −5.90 → **Finding 1** |
| Title | 82 | 82.24 | +0.24, sub-pixel ✓ |
| Label | 39 | 39.39 | +0.39, sub-pixel ✓ |
| Gap mark→title | 8 | 8.00 | exact ✓ |
| Gap title→label | 8 | 8.00 | exact ✓ |
| Mark/Title type | `Eyebrow-Strong` | 700 12px/18px "Instrument Sans" | `--font-eyebrow-strong` ✓ |
| Label type | `Eyebrow` | 600 12px/18px "Instrument Sans" | `--font-eyebrow` ✓ |
| Letter-spacing | `ls/eyebrow` 0.72 | 0.72px on all three | `--type-ls-eyebrow` ✓ |
| Structure | 3 text nodes | 3 spans, 0 `svg`, 0 Icon Slot | ✓ |
| Mark semantics | decorative | `aria-hidden="true"` | ✓ |

| Case | Node binds | Token | Staging | Verdict |
|---|---|---|---|---|
| Agentic | `accent-agentic` | `--color-agentic-default` | `#9b6fd0` | exact ✓ |
| Sky | `accent` | `--color-accent-default` | `#2ba4ec` | exact ✓ |
| Ink | `accent-ink` | `--color-accent-ink` | `#1a78bd` | Figma live `#166fb2` → **Finding 3** |
| Gold | `gold-deep` | `--color-gold-deep` | `#d9a017` | exact ✓ |
| Label (all four) | `text-faint` | `--color-text-faint` | `#8497ac` | exact ✓ |

The width delta reconciles exactly: Title +0.24, Label +0.39, Mark −5.90 → net **−5.27**, which is
the whole root delta. Nothing is unaccounted for in the layout.

### Icon Slot — checked, correctly absent

The design intent says the mark is typographic and Icon Slot must not be swapped in. Verified from
both directions: the node's three children are all `text` nodes, and the deployed DOM contains
0 `svg` elements and 0 Icon-Slot-classed nodes inside `.sunim-Eyebrow`. The source imports no Icon
Slot — the only mention is a comment explaining why it is absent. **No finding.**

### Stories with no node

`AllTones`, `WithoutLabel`, `Glyphs`, `Playground` render but have no Figma row behind them. They
are documented in the story file as non-matrix, so they are noted here and carry **no registry
row** — counting them would inflate `Synchronization %` against cases the design never specified.
No matrix row is missing a story, and no matrix story is missing a node.

---

## Findings

Three findings, all upstream of the component. Numbered consistently with the registry rows.

### Finding 1 — the mark glyph is not in the bound typeface

```
Eyebrow · all four tones
Expected  mark cell 14px wide, root 151px; mark drawn in --font-body (Instrument Sans)
          at --font-eyebrow-strong
Saw       mark 8.10px, root 145.73px — the entire -5.27px delta sits in the mark
Where     upstream: Instrument Sans carries no glyph for U+25C7 / U+25FB / U+2600.
          src/components/Eyebrow/Eyebrow.css binds the mark to --font-eyebrow-strong
```

Verified with the canvas probe `CLAUDE.md` requires, at 12px/700 — real family against a
deliberately bogus one:

| String | Instrument Sans | bogus family | Reading |
|---|---|---|---|
| `Components` | 75.04 | 64.68 | face **is** loaded |
| `/ Card` (600) | 35.06 | 33.00 | face **is** loaded |
| `◇` U+25C7 | 7.38 | 7.38 | **no glyph** |
| `◻` U+25FB | 12.00 | 12.00 | **no glyph** |
| `☀` U+2600 | 12.00 | 12.00 | **no glyph** |

The controls matter as much as the failures: Instrument Sans is loading correctly and drawing the
Latin text, so this is not the silent CDN-font failure `CLAUDE.md` warns about, and the widths in
the table above are trustworthy. Only this character range is missing, so Figma and the browser
each fall back to a different face and disagree on the mark's width. The Figma render shows a
visibly larger, wider diamond than staging — visible side by side in the screenshots.

**I independently agree with this finding as recorded.** My numbers are marginally more precise
(145.73 not 146, a −5.27 root delta of which the mark contributes −5.90) but the diagnosis,
the method, and the conclusion all hold.

Not the engineer's to fix: a hardcoded 14px would invent an untokenised value, an icon is
explicitly forbidden by the design, and a new glyph-bearing family is a type decision. The fix is
upstream — bind the mark to a family carrying the glyphs, or ship them in the export.

### Finding 2 — no tone clears WCAG AA in day mode

```
Eyebrow · all four tones, and the faint label
Expected  4.5:1 against --color-surface-page for normal text
Saw       3.48 / 2.55 / 4.35 / 2.16, label 2.77 — all below the bar
Where     upstream: these are exactly the colours the node binds
```

Re-measured from the deployed DOM against `--color-surface-page` `#f4f6fb`:

| Tone | Token | Value | Ratio | AA 4.5:1 |
|---|---|---|---|---|
| Agentic | `--color-agentic-default` | `#9b6fd0` | 3.48 | fail |
| Sky | `--color-accent-default` | `#2ba4ec` | 2.55 | fail |
| Ink | `--color-accent-ink` | `#1a78bd` | 4.35 | fail (near miss) |
| Gold | `--color-gold-deep` | `#d9a017` | 2.16 | fail |
| Label | `--color-text-faint` | `#8497ac` | 2.77 | fail |

12px at weight 700 is **normal** text — the large-text exemption begins at 18.66px bold — so 4.5:1
is the correct bar, not 3:1. **I independently agree with the recorded numbers**; all five
reproduce to the second decimal.

### Finding 3 — the committed token export is stale for `--color-accent-ink`

```
Eyebrow · Ink
Expected  --color-accent-ink, which the live Figma variable accent-ink sets to #166fb2
Saw       #1a78bd — --color-accent-ink → --primitives-sky-600 → #1a78bd
Where     upstream: tokens/tokens.json → primitives.sky.600.
          Re-export from Figma and run npm run build:tokens
```

Eyebrow binds the correct token. The wrong value sits behind it.

**I agree with this finding, and I am correcting one premise of it.** The handover said the Figma
file renders `open` while staging renders `day`, which would have made this a cross-mode comparison
and therefore not a finding at all. It is not: **Figma is answering in `day`.**

The discriminator is `accent`, the one variable whose binding differs between the two modes:

| | day binding | open binding |
|---|---|---|
| Token source | `primitives.sky.500` = `#2ba4ec` | `primitives.season.open.from` = `#3fabee` |
| Figma live returned | `#2ba4ec` ← **matches day** | — |

The other variables on this node (`agentic`, `gold-deep`, `text-faint`) resolve identically in both
modes, so they cannot discriminate — `accent` is the only one that can, and it says `day`. The
comparison is therefore like-for-like and the export genuinely lags the design.

This matters beyond bookkeeping: with the live `#166fb2`, Ink measures **4.92:1 and would clear
AA**. The stale export is the entire difference between pass and fail on the one tone that comes
close. Fixing the export removes a fifth of Finding 2.

### Note — the Glyphs story: one gap, one finding

`Glyphs` exercises `◇`, `◻` and `☀`. All three probe identically in the real and bogus family, and
the three marks render at three different widths (8.10, 12.73, 12.73) — the signature of three
different fallback faces resolving three characters absent from one typeface.

The engineer flagged that this could be written up as three findings. **I have reported it as
one.** There is a single root cause — Instrument Sans lacks that character range — and a single
upstream fix closes all three. Three rows would triple the apparent severity of one gap and imply
three independent repairs. The individual glyph measurements are kept in the table under Finding 1
so nothing is lost by the consolidation.

---

## Screenshots

Saved beside this report in `reports/Eyebrow/`. **There is no public host for these**, so the
`Attachment` column on all four registry rows is deliberately empty, with the local paths named in
`Expected Results` instead. A link is only written after the thing it points at exists and opens.

| File | What it shows |
|---|---|
| `eyebrow-agentic.png` | Case 1, deployed staging |
| `eyebrow-sky.png` | Case 2, deployed staging |
| `eyebrow-ink.png` | Case 3, deployed staging |
| `eyebrow-gold.png` | Case 4, deployed staging |
| `eyebrow-all-tones.png` | all four together, for the Figma comparison |
| `eyebrow-glyphs.png` | the three marks, evidence for Finding 1 |
| `figma-node-22-43.png` | the Figma render of node 22:43 — compare against `eyebrow-all-tones.png` |

---

## The rule I applied

Stated explicitly so the parallel Chip run can be reconciled against it.

> **A case is `Failed` when closing the gap requires a change inside the component's own source.
> A case is `Passed`, with the finding recorded, when the component faithfully implements what the
> Figma node binds and the gap can only be closed upstream — in the design, in the Figma variables,
> or in the committed token export.**

The reasoning is about routing, not leniency. `Testing Results` drives `Development`: a single
`Failed` row moves the component to `To be fixed` and hands it to the engineer. Every finding here
is one the engineer is *forbidden* to close — `CLAUDE.md` prohibits hardcoding a hex, inventing a
token, and hand-editing `build/tokens/`, and the design file explicitly forbids substituting an
icon for the mark. Marking these `Failed` would route work to an agent that cannot legally do it,
and the row would come back untouched. The status would be describing a repair that nobody is
allowed to make.

So the findings escalate to the human through this report, and the rows record what they actually
measured: a component that matches its node everywhere the component controls.

Applied identically to all four cases. Under this rule nothing here fails, and I want to be plain
about what that does **not** mean: it does not mean Eyebrow is ready to ship. Findings 1 and 2 are
real, user-visible, and one of them is an accessibility failure across every tone.

---

## Verdict

**All 4 cases passed.** The component is a faithful implementation of node `22:43`: correct
structure, correct tokens, exact geometry everywhere except the mark, no raw hex or px anywhere in
the source, and Icon Slot correctly absent.

It does **not** follow that Eyebrow should be deployed. Three findings stand, none of them the
engineer's:

1. **Design** — bind the mark to a glyph-bearing family, or ship `◇ ◻ ☀` in the export.
2. **Design** — no tone clears WCAG AA in day mode. This is an accessibility failure on every
   variant and the most serious thing in this report.
3. **Tokens** — re-export `tokens/tokens.json`; `primitives.sky.600` is stale. This one is cheap
   and lifts Ink over the AA bar on its own.

The registry has moved Eyebrow to `To be deployed` because that is what four passing rows derive.
**That derived status should not be acted on until a human rules on Finding 2.** Shipping a
component that fails AA on all four tones is a decision for a person, not a formula — and per
`CLAUDE.md`, no agent approves its own work.

Recommended: **hold deployment; route Findings 1 and 2 to design and Finding 3 to the token
build.** Nothing goes back to the engineer.
