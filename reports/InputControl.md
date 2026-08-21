# 🔍 QA — Input Control

**Tested** 2026-08-21 · **Figma node** `31:41` (component set), read live over the Figma MCP
connection · **Build under test** the staging Storybook deployment recorded in the registry
row, pinned to commit `aa7a4ff`

**Verdict — all 12 checks across 5 cases pass. Three design gaps and one open design
question go to a human, not to the engineer.**

---

## What was tested, and against what

The expected matrix came from `get_metadata` on the component set, not from the story file:

```
<frame id="31:41" name="Input Control" width="440" height="460">
  <symbol id="31:28" name="State=Default"  width="320" height="44" />
  <symbol id="31:31" name="State=Filled"   width="320" height="44" />
  <symbol id="31:34" name="State=Focus"    width="320" height="44" />
  <symbol id="31:37" name="State=Error"    width="320" height="44" />
  <symbol id="31:40" name="State=Disabled" width="320" height="44" />
</frame>
```

**One axis, `State` × 5. There is no Variant axis and no Size axis in the set.** The
engineer's matrix is confirmed against the node — nothing was missed and nothing was
invented. The five stories reconcile one-to-one with the five symbols. `AllStates` and
`Playground` have no node behind them and are correctly not matrix rows.

### The staging gate

The registry row carries a per-deployment Vercel URL rather than the usual alias. That URL
was tested, and it does contain Input Control — `document.querySelector('.sunim-InputControl')`
resolves and the five stories render. No local Storybook was started at any point.

### The font gate, before any width was reported

`document.fonts.check()` returned `true`, which proves nothing. Measured instead, on a
canvas, against a deliberately bogus family:

| Family | Real | Bogus fallback | Loaded? |
|---|---|---|---|
| Instrument Sans | 318.33px | 283.65px | **yes** |

The component declares only Instrument Sans, and it genuinely arrived. Every width and
height below is therefore the component's, not a missing face's.

---

## The matrix

| # | Case | Node | Geometry | Fill | Stroke / ring | Text | Result |
|---|---|---|---|---|---|---|---|
| 1 | Default | `31:28` | 320 × 44.398 | `--color-surface-raised` #fbfcfe ✓ | inset 1.5px `--color-line-quiet` #e2ecf6 ✓ | `--color-text-faint` #8497ac ✓ | **Passed** |
| 2 | Filled | `31:31` | 320 × 44.398 | `--color-surface-raised` ✓ | inset 1.5px `--color-line-quiet` ✓ | `--color-text-body` #22344e ✓ | **Passed** |
| 3 | Focus | `31:34` | 320 × 44.398 | `--color-surface-raised` ✓ | inset 1.5px `--color-accent-default` #2ba4ec + ring `0 0 0 3px rgba(43,164,236,0.4)` ✓ | `--color-text-body` ✓ | **Passed** |
| 4 | Error | `31:37` | 320 × 44.398 | `--color-surface-raised` ✓ | inset 1.5px `--color-gold-deep` #d9a017 ✓ | `--color-text-body` ✓ | **Passed** |
| 5 | Disabled | `31:40` | 320 × 44.398, opacity 0.5 ✓ | `--color-surface-sunk` #eef2f7 ✓ | inset 1.5px `--color-line-quiet` ✓ | `--color-text-faint` ✓ | **Passed** |

Radius `11px` (`--radius-radius-input`) and padding `11px 13px`
(`--spacing-step-11` / `--spacing-step-13`) measured exact on all five.

Every colour matched the node hex-for-hex. Nothing here rests on
`get_variable_defs` alone — the runtime `:root` values and the node's own bindings agree,
so there was no mode ambiguity to adjudicate.

### States driven, not merely looked at

| State | What was driven | Result |
|---|---|---|
| Focus | Real pointer click on the **Default** story | `:focus-visible` matched; box-shadow **byte-identical** to the pinned Focus story. The pinned story is honest. |
| Typing | Typed `qa@sunim.test` into Default | Landed in `.value`; text rendered in `--color-text-body`, reaching Filled's colour from the other direction |
| Error | Real click + `aria-invalid` | `aria-invalid="true"` on the real input — announced, not merely drawn |
| Disabled | Click, `.focus()`, and typing | Click did not focus. **Programmatic `.focus()` refused** — `activeElement` stayed `BODY`. Typing `should-not-appear` left `.value` empty. Genuinely inert. |

The inset ring is a faithful translation of the node's inside stroke, which adds nothing to
the frame — not a defect.

---

## Findings

None of these is an engineering defect, and none fails a case. All four need a human.

### Gap 1 — the node disagrees with itself on line height (**not covered by `decisions.md`**)

```
Input Control · every case
Expected  node frame height 44 — Body/Base line-height 22px
Saw       44.398 — --font-body-base resolves to 400 14px/22.4px "Instrument Sans"
Where     tokens/tokens.json, Body/Base lineHeight: 22.4
```

The text node binds the Spacing collection's `22px`; the `Body/Base` text style exports
`22.4`. Confirmed live on both `31:41` and `31:40`. The component binds the semantic type
token, which is correct, so it inherits the split: 22.4 + 11 + 11 = 44.398.

**This is a second drifting token, and `decisions.md` explicitly does not cover it.** The
`accent-ink` ruling is scoped to that one value and says so in terms: *"any other token
drifting… One known-stale value is a decision; a second one is a broken pipeline. Report
it."* So it is reported. The engineer raised the same split twice more on Nav's node, which
is what makes it a pipeline question rather than a one-off.

Fix is upstream — rebind in Figma or re-export `tokens/tokens.json`. Not the engineer's:
`tokens/` is Observer-level and hand-editing `build/tokens/` is forbidden.

### Gap 2 — the 1.5px stroke weight is unbound in Figma

Confirmed live: `get_variable_defs` on `31:41` and `31:40` returns no variable for the
stroke weight. The engineer transcribed it exactly and quarantined it in
`--sunim-InputControl-unbound-border-width` with a comment, rather than mapping it onto a
semantic token that happens to share the number. That is the correct handling of a gap.
Design gap, not a defect.

### Gap 3 — the 0.5 disabled opacity is unbound in Figma

Same check, same result on `31:40`. Handled the same way, in
`--sunim-InputControl-unbound-opacity-disabled`. Design gap, not a defect.

### Open question — the set defines no Error + Focus appearance

```
Input Control · Error, focused
Expected  no node exists to test against — the set has one axis
Saw       gold stroke kept, accent ring added:
          rgb(217,160,23) 0 0 0 1.5px inset, rgba(43,164,236,0.4) 0 0 0 3px
Where     InputControl.css, .sunim-InputControl.is-error:focus-visible
```

Verified live on the deployed build by focusing the Error story with a real pointer. A real
field can be both invalid and focused, and the component composes the two states the set
*does* define rather than inventing a third appearance — which is the right instinct. It
still needs design to confirm the composition is what they want.

### Closed — the `State` choice list had no `filled`; a human ruled, and it does now

`Staging Testing`'s `State` column offered no `filled`. Under the registry contract as
written — *"If a value you need is not in the list of choices, that is a gap. Report it. Do
not add a choice to make your write succeed."* — the Filled row was recorded as `idle` and
the gap was reported rather than worked around.

The human then ruled, in response to this report, that **QA may create a choice on a select
column when the value it needs does not exist.** On that ruling `filled` was added to the
column, in the column's own lowercase convention (`idle`, `hovered`, `focus`, …) rather than
the node's `State=Filled` capitalisation, and the row was corrected from `idle` to `filled`.
`Variants` still reads `State=Filled`, unchanged — that column carries the node's own name on
all five rows and was never the workaround.

Adding the choice disturbed neither rollup: `Development` still reads `To be deployed` and
`Synchronization %` still reads 100%.

The ruling is scoped to a value the design genuinely defines that the column lacks. It is not
licence to invent a choice when the real answer is that the value is wrong — that remains a
gap to report.

---

## Checked and dismissed — not findings

- **The two console errors reported at handover did not reproduce.** Verified rather than
  assumed: with console and network tracking active across two full reloads of the
  deployment, there were **zero** console errors and **no request to `vercel.live` at all**.
  The only message was a Storybook deprecation warning from its own
  `sb-manager/globals-runtime.js` about `ariaLabel` on `PopoverProvider` — Storybook's
  manager code, not Input Control's. Nothing here is logged against the component either
  way.
- **Schibsted Grotesk and Caveat measure as fallback in the story iframe.** Expected: the
  browser only downloads a face it actually renders, and this component uses neither.
- **Width 320.** The node's frame is a fixed 320; the component fills its container and each
  story pins 320 to match. Measured 320.000 on all five. The reasoning is documented in the
  CSS and is sound for a form control — noted for design's awareness, not logged.
- **Colour contrast** — out of scope repo-wide per `decisions.md`, 2026-08-20.
- **Nav** is not in this deployment and was not tested. Its row correctly reads `To-do`.

---

## Tokens

No raw hex, no raw font value, and no unaccounted raw px in `InputControl.tsx` or
`InputControl.css`. The only two literals are the pair above, both genuinely unbound in
Figma, both quarantined and commented. Everything else is `var(--token)`.

---

## Screenshots

`reports/InputControl/`

| File | What it shows |
|---|---|
| `figma-node-31-41-set.png` | the Figma node, all five states |
| `state-default.png` · `state-filled.png` · `state-focus.png` · `state-error.png` · `state-disabled.png` | each case on the deployed staging build |
| `all-states.png` | all five together, for direct comparison with the node render |

Placed side by side, the deployed component and the node agree state for state.

The Error + Focus composition was confirmed live in the browser and its computed value
recorded above. No file is included for it: Storybook args would not compose the two
classes, and rather than ship a capture labelled as something it is not, the measurement
stands as the evidence.

`Attachment` on the registry rows is intentionally empty — these files are local, with no
public host to attach from. The same convention was used for Eyebrow.

---

## Why five passes and not five failures

Every case renders exactly the token the node binds. The three gaps and the open question
can only be closed upstream, in Figma or the token export. Failing the rows would drive
`Development` to `To be fixed` and hand the engineer work that `CLAUDE.md` and the path
trust levels forbid them from doing — no hand-edit of `build/tokens/`, no invented token, no
raw hex. The gaps escalate to a human through this report instead, which is where they can
actually be resolved. This follows the precedent set on Eyebrow.

Said plainly so a human can overrule it: **the 0.398px height delta is real, systemic, and
traceable to a token — and it is not Input Control's defect.**

---

## Registry

Five rows in `Staging Testing`, one per case, each linked to the Input Control row through
`Composed In`. `Synchronization %` reads 100%. `Development` moved from `Ready for Testing`
to `To be deployed` on its own — no status was written by hand, and no column owned by
another agent was touched.

**Verdict → passed. Input Control is ready for DevOps. The three design gaps and the
Error + Focus question are for a human, and are not blockers on the deploy.**
