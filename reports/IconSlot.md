# Icon Slot — staging test report

| | |
|---|---|
| Component | Icon Slot |
| Tested against | Figma node `9:24` (component set), file `mFnN1Sr8MAmOdmx0ABXPsb` |
| Tested on | Deployed staging Storybook, `https://sunim-ds-staging.vercel.app` |
| Registry status at start | `Ready for Testing` |
| Matrix | 3 cases · **3 passed · 0 failed** |
| Screenshots | `reports/IconSlot/` |
| Verdict | **Pass** — clear to unblock the Button refactor |

---

## The matrix — built from the node, not from the story file

`get_metadata` on `9:24` returns three symbols and nothing else:

```
<frame id="9:24" name="Icon Slot" width="196" height="86">
  <symbol id="9:17" name="Size=14" width="14" height="14" />
  <symbol id="9:20" name="Size=16" width="16" height="16" />
  <symbol id="9:23" name="Size=22" width="22" height="22" />
</frame>
```

One `Size` axis, three variants, **no state axis and no second variant axis** — confirmed from
the node, not taken on trust. Three cases, three registry rows.

| # | Case | Variant | Node | Expected (from the node) | Measured on staging | Result |
|---|---|---|---|---|---|---|
| 1 | Icon Slot · Size=14 | `Size=14` | `9:17` | 14×14; stroke `text/body`; stroke-width 3.2; glyph inset 29.17% / 35.42% | 14×14; `rgb(34,52,78)`; 3.2px; inset 4.083 / 4.958 | **Passed** |
| 2 | Icon Slot · Size=16 | `Size=16` | `9:20` | 16×16; stroke `text/body`; stroke-width 3.2; glyph inset 29.17% / 35.42% | 16×16; `rgb(34,52,78)`; 3.2px; inset 4.667 / 5.667 | **Passed** |
| 3 | Icon Slot · Size=22 | `Size=22` | `9:23` | 22×22; stroke `text/body`; stroke-width 3.2; glyph inset 29.17% / 35.42% | 22×22; `rgb(34,52,78)`; 3.2px; inset 6.417 / 7.792 | **Passed** |

Every number above is a `getBoundingClientRect` / `getComputedStyle` reading off the deployed
build. None is an impression.

### Glyph centring — measured, both axes

The node places the vector at a constant percentage inset at every size, so the check is whether
the rendered glyph sits at that inset and is symmetric.

| Size | Node inset (h / v) | Expected px | Measured left / right | Measured top / bottom |
|---|---|---|---|---|
| 14 | 29.17% / 35.42% | 4.084 / 4.959 | 4.083 / 4.083 | 4.958 / 4.958 |
| 16 | 29.17% / 35.42% | 4.667 / 5.667 | 4.667 / 4.667 | 5.667 / 5.667 |
| 22 | 29.17% / 35.42% | 6.417 / 7.792 | 6.417 / 6.417 | 7.792 / 7.792 |

Symmetric on both axes at all three sizes, and equal to the node's stated inset. The offsets in
the component's `GLYPH` table reproduce the formula `(size - bbox) / 2 - 1.6` exactly.

### Path geometry — compared against the node's own exports

The three `d` strings in the component match the SVG Figma exports for each variant **byte for
byte**, as does `stroke-width="3.2"`, `stroke-linecap="round"` and `stroke-linejoin="round"`:

| Size | Node export `d` | Component `d` | Match |
|---|---|---|---|
| 14 | `M1.6 3.64167H7.43333M5.39167 5.68333L7.43333 3.64167L5.39167 1.6` | identical | ✓ |
| 16 | `M1.6 3.93333H8.26667M5.93333 6.26667L8.26667 3.93333L5.93333 1.6` | identical | ✓ |
| 22 | `M1.6 4.80833H10.7667M7.55833 8.01667L10.7667 4.80833L7.55833 1.6` | identical | ✓ |

---

## The swap affordance — the component's stated purpose

The design documentation is explicit that this component exists to be replaced: *"Icon Slot is a
placeholder, not an icon. Its whole job is to be swapped."* Tested as a first-class behaviour
rather than a side note.

| Check | Result |
|---|---|
| `icon` replaces the placeholder outright | ✓ one path in the DOM, the arrow geometry gone |
| Swapped icon is stretched to the slot | ✓ a 16-unit `viewBox` icon renders 22×22 in the 22 slot |
| Swapped icon inherits `currentColor` | ✓ computed stroke equals the slot's computed `color` |
| Fill rule is size-independent | ✓ deployed CSS `.sunim-IconSlot__glyph > *` is not size-scoped |
| Retint via `--sunim-IconSlot-color` | ✓ resolves to `--color-text-on-inverse` and `--color-icon-accent` as set |
| Decorative by default | ✓ `aria-hidden="true"`, no `role` |
| Announced when `label` is set | ✓ `role="img"`, `aria-label`, inner `<svg>` stays `aria-hidden` |
| Not focusable | ✓ `tabIndex` -1 — correct, the node has no state axis |

The swap works. The refactor of Button onto Icon Slot is not blocked by this component.

---

## The mode question — resolved before any colour was judged

Staging renders `day`; the Figma file answers in the `open` season mode, so a raw hex comparison
could have produced a false failure. Both sides were resolved to the token before comparing:

- Figma `get_variable_defs` on `9:24` → `text/body` = `#22344e`, answered in `open`.
- Staging root carries `data-theme="day"`; `--color-text-body` → `--primitives-ink-700` = `#22344e`.
- `--primitives-ink-700` is defined once at `:root` with no per-mode override, and
  `--color-text-body` resolves to it in `:root` and in every mode except `night`.

So `open` and `day` agree on this token by construction, and the comparison is sound. **No colour
finding here is a mode artefact.** In `night`, `--color-text-body` correctly moves to
`--primitives-night-text`; the component follows the token and needs no change.

## Fonts

Icon Slot contains no text, so no reported measurement depends on a font. Checked anyway, because
a missing face would matter for anything measured beside it: the first canvas probe showed
Schibsted Grotesk resolving to a fallback, but that is only because an icon-only page never
requests a face. After `document.fonts.load()`, the real face measured 117.06px against a
104.43px bogus-family fallback — **genuinely loaded, self-hosted, same-origin `.woff2`**, per
`CLAUDE.md`. No CDN, no CSP violation.

---

## Findings

No case failed. Four things are worth the engineer's and the designer's attention; **none of them
blocks the Button refactor**, and the first three are design-side gaps rather than engineering
defects.

### 1 · Frame size is unbound in Figma — design gap (confirmed, agree)

```
Icon Slot · all three sizes
Expected  frame width/height to carry a variable binding
Saw       plain numbers on the node — 14, 16, 22, no binding
Where     Figma node 9:17 / 9:20 / 9:23; quarantined in IconSlot.css lines 28–32
```

Independently confirmed. The engineer's quarantine into
`--sunim-IconSlot-unbound-size-{14,16,22}` is the correct handling, and matches the precedent
Button already set with `--sunim-Button-unbound-icon-size`. The near-miss is real and worth
restating: `--spacing-step-14` exists and carries exactly 14px, so a substitution here would
have been invisible and wrong — a spacing step means padding, not an icon edge. Not logged
against the engineer. **Closes when design adds an icon-size scale.**

One correction to the reasoning in the source comment, which does not change the conclusion:

```
Icon Slot · IconSlot.css line 18
Expected  the comment's justification to match the generated token set
Saw       "There is no step-16 or step-22 at all" — but --spacing-step-22: 22px does exist
Where     build/tokens/css/tokens.css line 199
```

`--spacing-step-16` genuinely does not exist; `--spacing-step-22` does. The decision not to bind
is still right for the reason given — a spacing step is not an icon size — but the stated evidence
is half wrong, and a future reader could be misled into thinking the token set was checked more
carefully than it was. Comment accuracy only; no rendered behaviour depends on it.

### 2 · Stroke binds to `text/body`, not an icon role — drift risk (confirmed, agree)

```
Icon Slot · all three sizes
Expected  an icon-specific semantic role for an icon stroke
Saw       the node binds text/body; --color-icon-line exists and is unused
Where     Figma node 9:24 description; IconSlot.css line 43
```

Confirmed, and confirmed harmless today: `--color-text-body` and `--color-icon-line` resolve to
`--primitives-ink-700` in `:root` and in all seven modes, and both move together to
`--primitives-night-text` in `night`. There is no visual defect in any mode.

Worth being precise about where this belongs: the component is **correct** to use
`--color-text-body`, because that is what the node binds. Switching the code to
`--color-icon-line` would make the code disagree with the design. The gap is design-side — the
node should bind an icon role — so this is for the designer, not the engineer.

### 3 · Constant 3.2 stroke at all three sizes — verified as the node's own behaviour

```
Icon Slot · all three sizes
Expected  confirmation that a non-scaling stroke is intended, not a transcription error
Saw       the node's exports pad every vector by exactly 1.6 on all sides at every size
Where     Figma exports for 9:16 / 9:19 / 9:22
```

Confirmed independently and arithmetically: the export insets (`-27.43%`/`-39.18%` at 14,
`-24%`/`-34.29%` at 16, `-17.45%`/`-24.94%` at 22) each resolve to exactly 1.6px of padding —
half of a 3.2 stroke — while the glyph bbox scales with the frame. The strokes therefore read
optically heavier at 14 than at 22, and that is the design's choice, not a defect. It is also
the correct justification for transcribing three vectors rather than scaling one. **No action.**

### 4 · The swap is only demonstrated at one of three sizes — story coverage

```
Icon Slot · story coverage
Expected  the component's primary affordance exercised across the size axis
Saw       WithCustomIcon exists only at size 22; no story pairs a custom icon with 14 or 16
Where     src/components/IconSlot/IconSlot.stories.tsx
```

Not a matrix failure — there is no node row behind a swapped icon, so this gets no registry row
and does not affect `Synchronization %`. The mechanism is verified sound at all three sizes from
the deployed CSS (`.sunim-IconSlot__glyph > *` is not size-scoped) and from the exact slot boxes
measured at 14, 16 and 22. But given that Button is about to consume this component at size 16,
a swapped-icon story at 16 would be cheap insurance. Suggestion, not a defect.

---

## Stories with no node behind them

The story file carries five stories beyond the matrix. They exercise `icon` and `label` — real
component properties with no variant row in the Figma set. They were checked and behave
correctly, but they get **no registry rows**, because rows with no node behind them inflate the
denominator of `Synchronization %`.

| Story | Exercises | Node row | Checked |
|---|---|---|---|
| `AllSizes` | the three variants side by side | none | ✓ renders 14 / 16 / 22 |
| `Playground` | controls | none | ✓ |
| `WithCustomIcon` | the `icon` swap | none | ✓ swap, fill, `currentColor` |
| `Retinted` | `--sunim-IconSlot-color` override | none | ✓ both tokens resolve |
| `Labelled` | the `label` prop | none | ✓ `role="img"` + `aria-label` |

## Token hygiene

- No raw hex in the component. The single `#22344E` in `IconSlot.tsx` is inside a comment
  explaining why the arrow is inlined rather than exported.
- No raw px in `IconSlot.css` outside the documented unbound block.
- Every token referenced by the stories exists in the generated set: `--spacing-space-4/5/6`,
  `--radius-radius-card`, `--color-surface-inverse`, `--color-text-on-inverse`,
  `--color-icon-accent`.
- The deployed stylesheet matches source — the `var()` references survive the build unmangled.

## A registry gap surfaced while writing the rows

The `Size` column in `Staging Testing` is a t-shirt scale — `xs` `sm` `md` `lg` `xl` `comfort`
`compact` `null`. Icon Slot's size axis is numeric (`14`, `16`, `22`), so none of the choices fit.

Per the registry contract, a value that is not in the list of choices is a gap to report, not a
choice to add, so **no choice was added**. Each row carries `Size = null` and the real variant is
recorded in `Variants` (`Size=14` / `Size=16` / `Size=22`) and in the case name, so nothing is
lost. Flagging it because every future icon-scale component will hit the same wall: either the
`Size` choices grow a numeric branch, or `Variants` stays the field of record for non-t-shirt
axes. That is a decision for whoever owns the schema, not for QA.

## A note on the deployed Storybook, not on the component

URL arg overrides (`&args=size:14`) are inert on this deployment — verified against `Playground`,
whose size did not change either. This affects every story on the build, not Icon Slot, and is
recorded here only so the next tester does not mistake it for a component defect.

## Screenshots

Saved beside this report in `reports/IconSlot/`, at 1× (true size) and 12× (legible):

| File | What it is |
|---|---|
| `size-14-1x.png` · `size-14-12x.png` | Size=14 as deployed |
| `size-16-1x.png` · `size-16-12x.png` | Size=16 as deployed |
| `size-22-1x.png` · `size-22-12x.png` | Size=22 as deployed |
| `figma-set-9-24.png` | the Figma render of the set, for comparison |

**The `Attachment` field on each registry row is empty, deliberately.** Airtable attachments
require a publicly fetchable URL and these captures have no public host. The field is not
overlooked — the evidence is the path above, and each row's `Expected Results` names its file.

---

## Verdict

**All 3 matrix cases pass.** Geometry, colour, stroke and glyph placement match node `9:24` at
every size; the swap affordance — the reason this component exists — works, retints, and
inherits colour correctly; the accessibility contract is right in both directions.

The three items already on the record from the engineer are independently confirmed and I agree
with all three, with one correction to the reasoning behind the first. All are design-side gaps
or intended behaviour; none is an engineering defect and none blocks consumption.

**The Button refactor onto Icon Slot is not blocked by this component.**

No verdict here is final until a human reads it.
