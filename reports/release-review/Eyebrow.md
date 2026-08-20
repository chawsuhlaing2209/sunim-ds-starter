# Release review — Eyebrow

**Reviewed at** `7ec481f` · branch `main` · 2026-08-20 · **re-review**
**Figma node** `22:43` (set), variants `22:27` / `22:32` / `22:37` / `22:42`, read live over the Figma connection
**Against version** 0.1.0 (the version being cut; `package.json` reads `0.0.1`, correctly — the bump is a human act)
**Supersedes** the review at `2dbde8a`. What changed is at the end.

---

## Verdict

**Blocked** — the published prop documentation states a default the component does
not have. That finding was raised at `2dbde8a`, has not been ruled on, has not
been fixed, and is now **public**: the contradiction is live on the production
docs page, inside a single table row.

This is the only blocker, and it is the same one. Everything else on this
component is in good order, and one finding from the previous review is now
verified fixed. One finding from the previous review was wrong and is corrected
below.

---

## The seven gates

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Is it actually done? | **pass** | Row `reccID9uuD98wfKmd`: `Development` = `Completed`. All four `Staging Testing` rows read `Passed` — opened and read at the source records (`reccI1RkFj6JLFa1Y`, `recWs4gPeRfOMEyiK`, `recMrHL1MQ221ByGa`, `recg9owTH4vpIkdm4`), not taken from the rollup. No `Failed`, no `Fixed (To re-test)`. `npm run lint` exit 0; `npm test` 25/25 across 2 files. Implementation, styles and stories exist; stories name node `22:43`. I did **not** rest this gate on `Synchronization %` — see Finding 3. |
| 2 | Are the tokens clean? | **pass** | Script: no raw hex, no raw px, no `--primitives-*` reached directly, nothing in the unbound quarantine. Verified independently against the live node: `accent-agentic` `#9b6fd0`, `accent` `#2ba4ec`, `gold-deep` `#d9a017`, `text-faint` `#8497ac` each match the rendered production value hex-for-hex. `accent-ink` is the single ruled drift. No second drift — the clause `decisions.md` leaves open is satisfied. |
| 3 | Is the public surface decided? | **pass** | `src/index.ts` exports `Eyebrow`, `EyebrowProps`, `EyebrowTone`. `EyebrowProps` references `EyebrowTone` and both are public, so a consumer can type a wrapper without a deep import. Eyebrow composes no sibling, so gate 3's usual failure has nothing to bite on. |
| 4 | Are the names final? | **blocked** | Folder, symbol, CSS prefix `.sunim-Eyebrow`, intent `component` and registry row all read `Eyebrow`. All five props carry doc comments. `tone` and its four values match the node's `Tone` axis exactly. But one doc comment is false — **Finding 1** — and the file's stated basis for the prop names is not what the node exposes — **Finding 2**. |
| 5 | Are the states complete? | **pass** | All four `EyebrowTone` values have a story, each deep-linked to its node id. Verified in **production**, not locally: the rendered root has no `role`, no `tabindex`, and **0 focusable descendants**; clicking it leaves `document.activeElement` on `BODY`. `showLabel={false}` genuinely removes the label element on all four tones, not merely hides it. There are no interaction states to wire wrongly, and that is a property of the node, not an omission. |
| 6 | Is the intent clear and documented? | **pass** | `Eyebrow.intent.json` is filled, placeholder-free, and true. Its nine `required_tokens` are exactly the nine `var()` references in the component — no over-declaration, no under-declaration — and all nine resolve in `build/tokens/css/tokens.css`. The docs page renders completely **in production**, which it did not at the last review. |
| 7 | Do you understand what this version means? | **pass** | `VERSIONING.md` read in full. `since` = `0.1.0` is at the version being cut, not ahead of it. `status` = `settling`, not `stable`, which is the only honest option while the number starts with a zero. Sentence below. |

---

## The five perspectives

### 1 · The consumer who has never seen the code

**Runnable for the first time.** The production docs page now resolves, so this
perspective was done where it is supposed to be done — against
`?path=/docs/components-eyebrow--docs`, no source, no Figma.

On content the page is genuinely good, and it survives being read cold. "What is
this for" is the first line. "When should I not use it" is answered explicitly
and uncomfortably — it volunteers the `<span>`/heading trap, points at Chip for
statuses, and rules out anything clickable. "What do I pass it" is a five-row
prop table with types, defaults and live controls. I did not need the source for
any of the three.

I needed the source for a fourth question the page raises by itself. The `tone`
row's own description reads "Sky is the default"; the Default cell **in that same
row** reads `'Agentic'`. At the last review these two statements were at least on
different parts of the page. Rendered, they are one row apart, and a reader
scanning the table left-to-right crosses both in a single eye movement. A
consumer cannot resolve it — both carry the page's authority, and one of them is
the machine-extracted truth. That is Finding 1, and this is the perspective where
it does its damage.

### 2 · The engineer who inherits this in six months

The names are ones I would defend. `tone`, `mark`, `title`, `label`, `showLabel`
are obvious at the call site, and `EyebrowTone`'s values stay capitalised to match
the Figma variant values rather than being lowercased to suit JavaScript taste —
a small consistency that pays for itself when someone is diffing against the node.

`title` shadowing React's native `title` attribute is the one costly decision. It
is taken deliberately and documented at length, and I would defend the decision
itself. What does not survive checking is the reason given for it — Finding 2.
The cost is worth stating plainly: changing `title` after 0.1.0 is a breaking
change and, under this repo's rules, a minor bump. Now is the only cheap moment.

Nothing else here would puzzle an inheritor. The CSS is 122 lines, over half of
it comments explaining decisions rather than restating code, and the class
structure is three flat slots with no nesting.

### 3 · The keyboard and the screen reader

I tabbed rather than read the field, and this time on the deployed build.

The component is inert by construction: a `<span>`, no `role`, no `tabindex`,
zero focusable descendants, and clicking it does not move focus. There is nothing
to tab into and nothing to tab out of, which is correct for a label. The mark
carries `aria-hidden="true"`, so a screen reader reads "Components / Card" rather
than announcing "white diamond". Title and label are ordinary text in visual
order.

This is the perspective that usually disagrees with the documentation. Here it
agrees completely, including on the uncomfortable parts — the intent volunteers
that the component carries no heading semantics and tells the consumer to put a
real `<h2>` underneath, which is precisely the misuse a component called
"Eyebrow" invites. That is a `dont_use_when` describing the real trap rather than
an imagined one.

### 4 · The designer

The node offers one axis, `Tone`, with four values, and the props reach all four.
No variant in the set is unreachable through the props, and no prop invents an
axis the design does not have — with the `showLabel` caveat covered in Finding 2.

On affordance rather than pixels: the component correctly refuses to compose Icon
Slot. The node carries the mark as a `<text>` layer (`22:24`, alongside Title
`22:25` and Label `22:26` — confirmed directly on the node), and the design file's
rules page names this as the system's one typographic exception. Importing Icon
Slot would have been the convenient wrong answer, and the component declines it
in writing, where the next person will find it.

**On the width delta, having read `Eyebrow.css` first as instructed.** The block
is accurate and I reproduced every number it claims, on production rather than
locally: root 145.73px against the node's 151px, with the entire deficit in the
mark at 8.10px against 14px, while Title measures 82.24 against 82 and Label 39.39
against 39. The canvas probe CLAUDE.md prescribes confirms the diagnosis rather
than the symptom: `◇` measures **7.38px in Instrument Sans and 7.38px in a
deliberately bogus family** — byte-identical, the signature of a face that never
arrived for that character — while the control string `Components` measures 75.04
real against 64.68 bogus, proving the typeface itself loaded correctly. `◻` and
`☀` behave the same way. This is a missing glyph range, not a layout bug, and it
is correctly left unfixed and escalated upstream. No finding.

### 5 · The release

`VERSIONING.md` read in full. Sentence below. Nothing in this component claims
more than a `0.x` can carry.

---

## Findings

### Finding 1 — the documented default contradicts the actual default · **blocks**

Raised at `2dbde8a`. **Not fixed. Not ruled on.** It stands, and it is now public.

**The claim.** Four places in the tree say Sky is the default tone:

- `src/components/Eyebrow/Eyebrow.tsx:41` — the `tone` prop's doc comment, which
  is the text that becomes the published API documentation
- `src/components/Eyebrow/Eyebrow.stories.tsx:61` — the component description
- `src/components/Eyebrow/Eyebrow.stories.tsx:117` — the `Sky` story's comment
- `src/components/Eyebrow/Eyebrow.css:109` — the tone rule's comment

**The observation.** `src/components/Eyebrow/Eyebrow.tsx:66` reads
`tone = 'Agentic'`. The production docs prop table reports `Default: 'Agentic'`.
The node agrees with the code: `get_metadata` on set `22:43` returns
`Tone=Agentic` as the first and therefore default variant. On the deployed
Agentic story the rendered root reads
`class="sunim-Eyebrow sunim-Eyebrow--Agentic"` with computed colour
`rgb(155, 111, 208)` = `--color-agentic-default`.

**What is new since `2dbde8a`.** The docs page is now deployed, so the
contradiction has moved from a local build into the published documentation. And
it renders tighter than it reads in source: the doc comment and the extracted
default are rendered as the *description* and the *Default* cell **of the same
table row**. The page now contradicts itself within one row.

**Why it blocks.** CLAUDE.md is explicit that a component's props are its
documented API and that undocumented behaviour is a bug; a *mis*-documented
default is worse than an undocumented one, because the reader has no reason to
check. The concrete outcome is a consumer writing `<Eyebrow />` for an ordinary
section, having read that Sky is the default, and shipping the tone reserved for
marking an AI moment. 0.1.0 is the version where this prop's documentation
becomes a public promise.

**Owner.** 🎨 Human decides which is wrong — the prose, or the default. Then
🔨 Engineer applies it. The two fixes are **not** equivalent and that is why this
is not mine to pick: changing the prose is free; changing the default silently
alters what every existing `<Eyebrow />` call renders, and under `VERSIONING.md`
changing a prop's meaning is a minor bump, not a patch.

### Finding 2 — the stated Figma basis for the prop names is not on the node · does not block

Raised at `2dbde8a`. **Not fixed.** Re-confirmed against the live node.

**The claim.** `src/components/Eyebrow/Eyebrow.tsx:11-13`: "Prop names and values
mirror the Figma properties exactly: Tone is the one variant property; Mark,
Title, Label and Show Label are the component properties." That claim is then
used at `Eyebrow.tsx:32-37` to justify omitting React's native `title` attribute
— "The Figma property is called Title, CLAUDE.md requires the prop to carry that
name exactly."

**The observation.** Read live: set `22:43` exposes one axis, `Tone`, with four
symbols. Inside variant `22:27` are three `<text>` layers named `Mark` (`22:24`),
`Title` (`22:25`) and `Label` (`22:26`). Those are **layer names, not component
properties**, and no property named `Show Label` appears anywhere on the set —
`showLabel` is a sensible engineering addition for the label-less case, not a
mirror of anything in the design.

**Why it does not block.** Mapping props onto the node's layer names is a
defensible reading of the naming rule, and `showLabel` is a good prop. The names
are right; the provenance claim is wrong. It matters because the *reason* given
for a permanent API cost — shadowing a native HTML attribute — rests on a premise
the node does not support, and the next person to weigh that trade-off will read
the comment and conclude the question is already settled.

**Owner.** 🔨 Engineer, to correct the comment. 🎨 Human, if the `title` shadow is
worth revisiting — and 0.1.0 is the last cheap moment.

### Finding 3 — `Synchronization %` is not evidence, and cannot be shown to be broken either · does not block Eyebrow

**This corrects Finding 3 of the previous review, which overstated what the
evidence supports.** That review asserted the ratio "is always 1" and that the
column "cannot fail". I cannot support that claim, and neither could it.

**What is actually observable.** In the `Components` schema,
`Synchronization %` (`fldmDi7UodNK4c2xZ`) is
`IF({fldyYyEn5KfFGEuUu} = 0, "0%", ROUND(({fld88iBKmSezw6rzk} / {fldyYyEn5KfFGEuUu}) * 100, 2) & "%")`.
Both operands are `count` fields on the same record-link field
(`fldjU0dkzPmQJ0Z3W`, the Staging Testing link). The Meta API returns a count
field's config as `{isValid, recordLinkFieldId}` and **nothing else** — there is
no filter block in the response, so a filtered count and an unfiltered count are
byte-identical through this API. I confirmed that on the schema response itself.

**Why the row data does not break the tie.** All four rows show the operands
equal — Button 30/30, Chip 8/8, Eyebrow 4/4, Icon Slot 3/3, every one reading
`100%`. That looks like a constant. But I read all **45** records in
`Staging Testing` and **every single one reads `Passed`**. With no failing row
anywhere in the table, a correctly-filtered "passed" count and a plain total
count produce identical numbers on every row. The data is exactly as consistent
with "the filter works and everything passed" — which is what QA recorded — as
with "there is no filter". Concluding the column is broken from this evidence is
not warranted.

**What would settle it, precisely.** Either of:

1. **One Components row linked to at least one `Staging Testing` record whose
   status is not `Passed`.** If `fld88iBKmSezw6rzk` then reads below
   `fldyYyEn5KfFGEuUu` and `Synchronization %` drops under 100%, the field is
   filtered and the column works. If it stays at 100%, the column is a constant
   and the gate is resting on nothing. No such row exists today, which is why the
   question is open rather than answered.
2. **A human opening the field editor for `fld88iBKmSezw6rzk` in the Airtable
   UI**, where a count field's "only include records that meet certain
   conditions" toggle is visible. The Meta API cannot show this; the UI can.

**Why it does not block Eyebrow either way.** Gate 1 wants evidence that the
component's tests passed. I did not take that from this column — I opened all
four Eyebrow `Staging Testing` records and read `Passed` on each. That is the
evidence the gate actually needs, and it is sound regardless of how the column
resolves.

**Owner.** 📋 PM, to run check 1 or check 2. Not urgent for this release; it is a
question about whether a gate has a real sensor behind it, and it is repo-wide.

### Finding 4 (previous review) — the production docs page does not exist · **CLOSED, verified fixed**

The deployed `index.json` now carries **74 entries, 4 of type `docs`**, up from 69
and zero. `?path=/docs/components-eyebrow--docs` resolves and renders completely:
description, intent block, five-row prop table with controls, and all eight
stories. Perspective 1 was runnable against production for the first time, and
perspectives 3, 4 and 5 were re-done there rather than locally.

No action. Recorded closed so the next reviewer does not re-raise it.

---

## Ruled, not re-argued

Both recorded against `decisions.md` and carried no further. I re-measured both
because `decisions.md` states that a ratio which has **moved** is not covered by
the ruling — so confirming the numbers have not moved is part of honouring it,
not part of re-arguing it.

- **Day-mode contrast, all four tones.** Measured on production at
  `data-theme="day"` against `--color-surface-page` `#f4f6fb`: Agentic 3.48, Sky
  2.55, Ink 4.35, Gold 2.16, and the faint label 2.77 on all four. Every figure
  matches the ruling exactly — nothing has moved. Title renders 12px/700, which is
  normal text (the large-text exemption starts at 18.66px bold), so the bar is
  4.5:1. Ruled 2026-08-19, accepted for this release. The intent states this
  plainly rather than omitting it, which is the right handling.
- **`accent-ink` stale export.** `--color-accent-ink` renders `rgb(26, 120, 189)`
  = `#1a78bd` via `--primitives-sky-600`; the live Figma variable reads `#166fb2`.
  Ruled 2026-08-19, accepted and not scheduled. I checked the clause the ruling
  leaves open — "any *other* token drifting … Report it" — against all five
  colours this component binds. There is no second drift. One stale value, as
  ruled; not a broken pipeline.

---

## The version sentence

0.1.0 promises that a component called `Eyebrow` exists, is imported from this
package's entry point rather than a deep path, takes these five props under these
names, and renders a marked layer label whose four tones are the four the design
file defines — and that a human who did not build it has read all of that against
the node. It deliberately promises nothing about whether those names survive to
0.2.0, nothing about the colour values behind the tones, two of which are recorded
as accepted gaps, and nothing at all about the component being accessible in day
mode, where every tone knowingly falls below AA. It is `settling`, not stable, and
the leading zero is doing real work: a 0.x minor is allowed to break every one of
these names, and if `title` is going to stop shadowing the native attribute, that
is the bump it happens in.

---

## What changed from the previous verdict

The verdict is unchanged — **Blocked**, on the same finding. What moved:

| | At `2dbde8a` | At `7ec481f` |
|---|---|---|
| Finding 1 (documented default) | blocks | **still blocks** — unfixed, unruled, and now published |
| Finding 2 (Figma provenance) | does not block | **unchanged** — re-confirmed live on the node |
| Finding 3 (`Synchronization %`) | asserted the column "cannot fail" | **corrected** — the claim is not supported; what would settle it is now stated |
| Finding 4 (no production docs) | does not block | **closed, verified fixed** |
| Perspectives 1, 3, 4 | done against a local build | **done against production** |
| Gate 1 test evidence | 7 tests, 1 file | 25 tests, 2 files — still none rendering Eyebrow |

The previous review was right about Finding 1 and right to block on it. It was
right about Finding 2. Its Finding 3 reached further than its evidence did, and
I have said so above rather than repeating it. Its Finding 4 has been resolved by
🚀 DevOps and is closed.

**A note on what this verdict does mechanically.** `Development`
(`fldOLGT24LDXAzsZ7`) is a formula that reads `Release Verdict`: it returns
`Released` when `Astro Link` **and** `Release Review` are both set **and**
`Release Verdict` = `Cleared`. Writing `Cleared` is therefore not an inert record
— combined with an `Astro Link`, it advances the row's status. Eyebrow's
`Astro Link` is currently empty, so `Cleared` alone would not flip it today, but
whoever transcribes a verdict should know the column is load-bearing.

---

## Not checked

- **Night mode.** Every measurement here, and every contrast figure in the ruling,
  is `data-theme="day"` — that is what the deployed Storybook served. I did not
  evaluate any tone against the night surface, and `decisions.md` rules only on
  day. Whether the four tones clear AA in night mode is unexamined by this review,
  as it was by the last one.
- **Figma component properties, definitively.** I read the node's structure and
  variant axis over the Figma connection (`get_metadata`, `get_variable_defs`).
  Those return layers, variants and bound variables. I could not enumerate the
  set's `componentPropertyDefinitions` directly, so Finding 2 says no `Show Label`
  property *appears* on the set — which is what I can support — rather than that
  none is defined.
- **Whether `Synchronization %` is filtered.** Open by construction — see Finding
  3. The Meta API cannot answer it and the current data cannot break the tie. I
  have stated the two checks that would.
- **Rendered appearance.** I read the DOM, the computed styles and the measured
  geometry on production. I did not compare a screenshot of the rendered component
  against a screenshot of the node; QA did that, and this gate is not a re-run of
  QA.
- **Automated coverage of Eyebrow.** The suite grew since the last review — 25
  tests across `src/tokens/token-binding.test.ts` and
  `src/components/accessible-props.test.tsx`. The new file covers Button and Icon
  Slot only. **No test renders Eyebrow**, so no test would catch a regression in
  it — including a change to the default tone, which is the subject of the
  blocking finding.
- **The other three components.** Reviewed separately and concurrently. Finding 3
  is repo-wide and will appear in those reviews too; I have not reconciled wording
  with them.
- **Board write-back and commit.** By instruction, `Release Review` and
  `Release Verdict` were not written, and this report was written but not
  committed or pushed — three reviews are running concurrently on this tree and
  the orchestrator commits them together, so the report URL can be pinned to the
  commit it actually lands in.
