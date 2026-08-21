# Release review — IconSlot

**Commit reviewed** `e723a0a` on `main` · **Registry row** `Icon Slot` (`recvDIEckmxBp6SGT`)
**Figma node** 9:24, file `mFnN1Sr8MAmOdmx0ABXPsb` · **Version under review** 0.1.0
**Reviewed** 2026-08-20 · **Third review**, superseding the verdict written at `7ec481f`

Working tree clean at review time. Nothing in `src/` was touched by this review.

**On the commit.** `main` moved during the review, from `e723a0a` to `c470a9e`
("Let the reference site take whatever port it is given"), a concurrent agent's
work. The diff is two files — `.claude/launch.json` and `docs/astro.config.mjs`
— and `git diff e723a0a c470a9e -- src/` is empty. The component under review is
byte-identical at both commits, so the review stands at the commit it was asked
for. Recorded rather than absorbed, because a moving `main` is exactly the thing
a review is supposed to notice.

---

## Verdict

**Cleared.**

The one blocker is ruled, and the ruling took the option this review's own
predecessor surfaced last: `label` is not renamed, it is **gone**. That matters
more than it sounds. A rename would have moved the collision to a new word and
kept the surface the same size; dropping it removed a prop and added nothing,
because `aria-label` was already inherited and, since `3d7c9e6`, already worked.
The public surface of this component is smaller than it was when it was blocked.

Nothing else on the table blocks. F5 I was asked to re-judge with F1 closed, and
I re-judged it downward — it is a note now, and I explain below why settling F1
did **not** dissolve it the way the previous review predicted it would. N2 is
recorded, unchanged, per the registry contract that says a two-system name
disagreement is a gate-4 finding to surface. Contrast is ruled repo-wide and I
did not measure it; the parts of accessibility that ruling explicitly leaves live
— accessible names above all — are this component's entire job, and those I drove
on the deployed build rather than reading off a field.

One new note, N4, which is a small side effect of the ruling that nobody has
looked at yet: `aria-label` is now the naming API by ruling, and it is the one row
on the published props table with an empty description.

`npm run release-review -- IconSlot --version 0.1.0` reads **CLEAR** — 17 passed,
2 warned, 0 failed, 7 REVIEW. Note the count of props it checked went from 3 to
**2**. That is the ruling, visible in the mechanical half.

---

## The gates

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Is it actually done? | **Pass** | Board read live via Airtable at review time, not from `docs/registry-status.json`: `Development` = Completed, `Synchronization %` = 100%, 3 linked `Staging Testing` rows, rollup reads `["Passed"]` only — no `Failed`, no `Fixed (To re-test)`. `npm run lint` (`tsc --noEmit`) clean. `npm test` **36 passed across 2 files**, up from 25. N1 below, carried and worsened. |
| 2 | Are the tokens clean? | **Pass** | No raw hex, no raw px outside the `--sunim-IconSlot-unbound-*` quarantine, no `--primitives-*`. Re-confirmed live: `get_variable_defs` on 9:24 returns exactly `{"var(--text-body)":"#22344e"}` — one binding for the whole set, so the three size gaps are real today and not a stale export. |
| 3 | Is the public surface decided? | **Pass** | `IconSlot`, `IconSlotProps`, `IconSlotSize` all exported from `src/index.ts`. IconSlot composes nothing; Button and Chip compose it and it is exported, so composition is closed in both directions. The surface **shrank** this round. |
| 4 | Are the names final? | **Pass** — was Blocked | **F1 closed by ruling**, verified six ways below. `size` matches the node's only variant property exactly, re-confirmed live on 9:24. Folder / symbol / CSS prefix / intent all agree. Both declared props carry doc comments. N2 and N4 recorded. |
| 5 | Are the states complete? | **Pass** | `get_metadata` on 9:24 returns one variant property and no state property. All three sizes measured on the deployed build: 14×14, 16×16, 22×22 at `rgb(34, 52, 78)`. |
| 6 | Is the intent clear and documented? | **Pass** | Every field filled and true of the component that ships. The `a11y` field now states the absence of `label` and names `aria-label` as the only spelling — the intent describes the ruling rather than lagging it. `required_tokens` is `color.text.body`, which exists in the build and is referenced. N3 carried. |
| 7 | Do you understand what this version means? | **Pass** | `VERSIONING.md` read. `since: "0.1.0"` is at the version being cut. `status: "experimental"`, not `stable`, at 0.x. Sentence below; F5 re-judged and downgraded. |

---

## F1 — closed. Verified six ways, none of them a commit message.

`decisions.md` records the ruling: **"Accepted: IconSlot has no `label` prop"**,
2026-08-20, scope Icon Slot, permanent. I did not re-argue it. I verified it,
because a ruling is a decision about what *should* be true and this gate is about
what *is*.

**1 · The type no longer declares it.** `IconSlotProps` is `size?` and `icon?`,
extending `Omit<HTMLAttributes<HTMLSpanElement>, 'children'>`. `aria-label`
arrives through that inheritance rather than through anything this component
added.

**2 · The type actively rejects it, and that is executed, not asserted.**
`accessible-props.test.tsx:92` carries `// @ts-expect-error` above the `label`
call site. `tsc --noEmit` passes. A `@ts-expect-error` on a line that is *not* an
error is itself an error, so lint passing is positive proof that
`<IconSlot label="Next" />` does not type-check. This is stronger evidence than
the absence of a line in an interface, and it is the kind that stays true.

**3 · Nothing in `src/` passes or documents it.** Every `<IconSlot` call site in
the repository: `Button.tsx:167` and `Chip.tsx:83` pass `size` and `icon` only;
the stories pass `size`, `icon`, `style` and `aria-label`; the tests pass
`aria-label`, `aria-hidden` and the one deliberate `label`. Every other occurrence
of the word in `src/components/IconSlot/` is prose explaining the absence — the
28-line comment block in `IconSlot.tsx`, the intent's `a11y` field, and the test's
comment. Documenting why a prop is gone is not documenting the prop.

**4 · The stories use `aria-label`.** `36e2f4f` swapped the `argTypes` row from
`label` to `'aria-label'`, the `Labelled` story's args from `label: 'Next'` to
`'aria-label': 'Next'`, and the meta description's prose with it. The `Labelled`
story *is* the raw-`aria-label` case now — which quietly closes a gap the previous
review had to log under "not checked", where no story exercised the standard
attribute and only a unit test did.

**5 · The deployed props table no longer advertises it.** This was the specific
thing to check, and it is the sharpest of the six. The previous review's decisive
argument was that the package was shipping a public prop whose own published
documentation recommended a different spelling. On the production docs page today
the table reads `size`, `icon`, `aria-label` — three rows, no `label`, and no
sentence anywhere recommending an alternative to a prop that is on the table. The
self-contradiction is not fixed by explanation; it is gone because the prop is.

**6 · The three name cases behave, on the deployed build.**

| Case | Where I drove it | Deployed DOM |
|---|---|---|
| `aria-label` names it | `components-iconslot--labelled` | `role="img"` `aria-label="Next"`, no `aria-hidden` |
| `aria-label` names it, raw | `components-iconslot--playground` with `&args=aria-label:Zed` | `role="img"` `aria-label="Zed"`, no `aria-hidden` |
| nothing names it | `components-iconslot--all-sizes`, all three | `aria-hidden="true"`, no role, no name |
| `aria-hidden={false}` wins | **test only** — see below | `aria-hidden="false"` |
| passing `label` names nothing | **test only** — see below | `aria-hidden="true"`, no `aria-label` |

Nothing focusable in any subtree: 0 focusable descendants under
`#storybook-root` on both `labelled` and `all-sizes`. The component adds nothing
to the tab order, as the intent claims.

**Why the last two are test-only, and how I know it is not my technique.** I
tried to drive both through the deployed Storybook with URL args and got a
negative result for `label` — which would have been evidence, except that a
negative from a filtered arg is not a negative from the component. So I checked
the mechanism: navigating with `&args=id:probe;aria-label:Zed` applied
`aria-label` and dropped `id`. Storybook filters URL args to declared `argTypes`,
so neither `label` nor `aria-hidden` ever reached the component and both probes
were inconclusive by construction. I record them as unverifiable live rather than
as verified, which is the honest reading of a probe that could not have failed
differently.

Both are asserted by executing tests instead, and the test's stated reasoning is
itself true: I rendered `<span label="Next">` through this repo's own
`react-dom/server` and it emits `label="Next"`. So `label` does survive the spread
as an inert attribute that names nothing — a visible failure rather than a silent
one, exactly as the test comment claims. The comment is not aspirational.

**What I would say to whoever made this call.** The ruling picked the option that
makes the surface smaller, and it did so before publication, so it cost no
migration. `VERSIONING.md` would have priced this as a minor bump one version
later. That is the cheap half of getting a name wrong, taken at the only moment it
is still cheap.

---

## The five perspectives

### 1 · The consumer who has never seen the code

Docs page only, no source, no Figma — and I read the page before opening a single
file this session, which is the only way this perspective means anything.

- *What is this for?* "Reserving a square, correctly sized, correctly coloured box
  for an icon inside another component." Plus the sizing rule: 14 for UI text, 16
  for buttons and chips, 22 for icon tiles.
- *When should I not use it?* Four cases, including the honest one — it needs no
  props and draws a plausible arrow, so shipping the placeholder is the path of
  least resistance.
- *What do I pass it?* `size`, `icon`, `aria-label`.

I did not reach for the source to answer any of them. But the third answer is
now weaker than it was, and this is where I found it — see **N4**. The row that
carried the richest description on the table last time was `label`, and it is
gone. `aria-label` inherited its job and did not inherit its documentation.

The Accessibility block a few inches above the table does explain it, in full and
correctly, including *why* there is no `label`. So the page answers the question.
The props table, which is where a consumer looks for exactly this, does not.

### 2 · The engineer who inherits this in six months

Holding up, and better than last time. `IconSlot` / `.sunim-IconSlot` /
`IconSlotProps` / `IconSlotSize` all agree. `size` with `'14' | '16' | '22'` is
the node's own vocabulary and the source defends the string-union-of-numerals
rather than leaving the next reader to wonder. `icon` follows the convention
Button set.

The 28-line comment where `label` used to be is the thing I would most want to
find in six months. It records what the prop meant, why it collided, why removal
beat renaming, and what to use instead — with the two-line usage example that
makes the answer obvious without reading the paragraph. That is a comment written
for the person who will be tempted to add it back, which is the useful kind. The
quarantine block in the CSS does the same job for `--spacing-step-14`.

Nothing left on this perspective's list. Last time it ended with "not holding up:
`label`."

### 3 · The keyboard and the screen reader

Driven on the deployed build. Results in the F1 table above; all four reachable
cases agree with the intent.

Contrast is ruled repo-wide in `decisions.md` — every component, every mode — so
I did not measure a ratio and I do not report one. That ruling names colour
contrast and explicitly leaves live: focus visibility, target size, keyboard
reachability, accessible names, and what is announced versus hidden. **Accessible
names are this component's entire job**, so the ruling removes nothing from this
review; if anything it sharpens what the perspective is for here. Those I drove
rather than read.

Two of the five cases are test-only, for the structural reason given above, and
that means Storybook's a11y panel cannot demonstrate them. Recorded, not blocking:
a story passing a raw `aria-hidden={false}` would show a consumer nothing a test
does not already assert, because there is no visual difference to look at.

### 4 · The designer

`get_metadata` on 9:24 returns the frame `Icon Slot` and three symbols — `Size=14`
at 14×14, `Size=16` at 16×16, `Size=22` at 22×22. One variant property, no state
property. `get_variable_defs` returns one binding, `var(--text-body)` → `#22344e`,
matching the `rgb(34, 52, 78)` I measured on all three deployed sizes.

No variant in the set is unreachable through the props. `size` matches the Figma
property `Size` exactly, per CLAUDE.md.

The structural point stands and is still not a defect: `icon` has no Figma
counterpart because a component set cannot express "an arbitrary child". The
design meant to offer a swap and could only name it. What changed this round is
the arithmetic — the component used to have two of three public props outside
design-parity testing; it now has one of two, and that one is exercised by both a
story and a test. The gap did not close, but it stopped growing, and the honest
way to say that is that removing `label` removed a prop Figma could never have
tested.

### 5 · The release

See the version sentence. F5 re-judged there and downgraded.

---

## Findings

None blocking.

---

## Notes — recorded, not blocking

### N-F5 · `experimental` while two `settling` components depend on it — gate 3 / gate 7

I was asked to re-judge this now that F1 is closed, including whether it blocks.

**Does it block? No.** Gate 7's named failure mode is a component *overstating*
its stability — claiming `stable` under a 0.x version. IconSlot does the opposite.
A status that under-promises cannot mislead a consumer into relying on something,
which is the harm the gate exists to prevent. And the incoherence lives in a
sentence in `VERSIONING.md`, a governance file IconSlot does not own; blocking a
component on the wording of a document it cannot edit would hold it hostage to
someone else's paragraph.

**Is `experimental` still the right claim? Yes — and here I depart from my
predecessor.** The previous review predicted that if a human settled F1, "the case
for keeping IconSlot `experimental` largely evaporates." A human settled F1. The
case did not evaporate, and I think the prediction was too strong, because F1 was
never the only thing unsettled about this component. Two things remain, and both
are **unruled**:

1. The visible default is a placeholder for a Sunim Icon file that is not in this
   repository (N3), and whether placeholder-by-default is the *design* has never
   been ruled.
2. The three sizes carry no Figma binding at all — confirmed live on the node this
   session, not inferred. An icon-size scale is missing from the export.

Both are about what the component *is*, not what it is called. F1 was an API
question and the API is now decided; these are content and token questions and
they are not. `experimental` remains the honest word for a component whose visible
default and whose size scale are both open. The distinction worth writing down is
that IconSlot moved from *three* kinds of unsettled to *two*, and the one it shed
was the only one a rename could have fixed.

**What is still wrong, unchanged.** `VERSIONING.md` promises "anything at all"
about an `experimental` component — meaning nothing at all — and that cannot
survive composition. I re-verified the premise live rather than inferring it: the
board's `Composed Into` on the Icon Slot row links **Button and Chip**, both
`settling`; `components-button--primary-md-default` renders
`sunim-IconSlot--16 aria-hidden="true"` with the arrow path matching `GLYPH['16']`
byte-for-byte, and `components-chip--default-sm` renders `sunim-IconSlot--14`
matching `GLYPH['14']`. A consumer relying on Button's trailing mark is relying on
IconSlot whether the package promises anything about it or not.

The status is not overstating IconSlot's stability. It is understating IconSlot's
reach, and that is a wording problem in the governance file. It is worth settling
before 1.0.0, when the disclaimer starts doing real work.

Smaller, related, unchanged: `--sunim-IconSlot-color` is a documented
consumer-facing contract that cannot be exported from `src/index.ts`, so it is
promised through a channel `VERSIONING.md` declares non-public. Not urgent at
0.1.0.

**Owner.** 🎨 Human — `VERSIONING.md` is governance, not code.

### N4 · `aria-label` is the naming API by ruling, and the published props table describes it with a blank — gate 4 / gate 6 · **new**

**What I saw.** On the production docs page, the props table:

| Name | Description | Default | Control |
|---|---|---|---|
| `size` | full paragraph | `'14'` | radio |
| `icon` | two full paragraphs | — | — |
| `aria-label` | *(empty)* | — | Set string |

**Where it came from.** `36e2f4f` swapped the `argTypes` entry from
`label: { control: 'text' }` to `'aria-label': { control: 'text' }`. Storybook
sourced the old row's description from the `label` doc comment on
`IconSlotProps`. `aria-label` has no member on that interface — it is inherited
from `HTMLAttributes`, which is the entire point of the ruling — so there is
nothing for Storybook to read, and the row renders bare. This is a side effect of
the fix, introduced with it, and neither the previous review nor the script could
have seen it: the previous review predates the commit, and the script counts
doc comments on *declared* props, which is why it now reports "all 2 props carry
a doc comment" and is correct to.

**Why it is worth recording.** CLAUDE.md says a component's props are its
documented API, and `decisions.md` makes `aria-label` the only way to name this
slot. So the one prop the ruling elevated to being the naming API is the one row
on the published table that says nothing about itself. The gate-4 question — would
I defend this in six months — is not about the name here; the name is `aria-label`
and it is the standard. It is that a consumer scanning the table for "how do I
name this" finds an empty cell.

**Why it does not block.** The Intent → Accessibility block renders on the same
page, above the table, and answers the question completely: which attribute, what
it produces, what happens without it, and why there is no `label`. Perspective 1
answered "what do I pass it?" off the page without reaching for source. Nobody is
misled — the cell is blank, not wrong — and the fix is a `description` on the
`argTypes` entry, which changes no API and costs nothing at any version.

**Owner.** 🔨 Engineer — `IconSlot.stories.tsx` is the engineer's file, and the
`argTypes` block is where the fix goes.

### N2 · `Icon Slot` on the board, `IconSlot` in code — gate 4

Recorded, unchanged, and I reach the same conclusion as the previous review by the
same route — which I checked rather than assumed.

`.claude/skills/registry/SKILL.md` states that two systems disagreeing about a
name is a finding for 📦 Release's gate 4 rather than a detail to absorb quietly,
and `registryEntryFor` in `scripts/lib/contract.mjs` carries the same comment and
matches with spacing ignored. The registry row reads `Icon Slot` — confirmed live
this session — and the Figma frame is named `Icon Slot`, confirmed live on 9:24.
CLAUDE.md mandates PascalCase in code, which makes `IconSlot` the prescribed
spelling of that same name.

So: the contract asks gate 4 to *surface* it, and the same contract supplies the
mapping that makes it harmless. Renaming the row would break the registry's own
rule that the row mirrors Figma. There is nothing here to fix; there is something
here to say, and this is the third review to say it. IconSlot is the first
two-word component; the next one will hit the same thing and the handling is
already in place.

### N3 · The docs page calls the arrow "scaffolding" two paragraphs above calling it the shipped default — gate 6

Carried, unchanged, still unruled — not in `decisions.md`, which I checked.

On the production docs page today, the engineer's blurb reads "the arrow it ships
with is scaffolding" and "Every production use should pass `icon`". The Intent
block below, same page, reads "Inside Button and Chip the arrow is the default
both ship today."

Both sentences are accurate — one states an aspiration, the other a fact — so the
intent is *true*, which is what gate 6 asks, and F3 stays closed. The open
question underneath is whether placeholder-by-default is the intended design or a
gap waiting on a Sunim Icon file. That is a human's ruling and neither agent
should take it. It is now also load-bearing for N-F5: it is one of the two things
keeping IconSlot honestly `experimental`.

**Owner.** 🎨 Human rules; 🔨 Engineer owns the blurb; 📝 Doc Generator re-runs after.

### N1 · The board's recorded commit predates the code being reviewed — gate 1 · **worse than last time**

The registry row's commit field still points at `b26ed39`. The component's
directory has now changed **three** times since: `3d7c9e6` (the a11y fix),
`056ca6f` (the intent rewrite) and `36e2f4f` (the ruling that removed `label`).
QA's three `Passed` rows were recorded against a build that still had the `label`
prop on the public type.

This is the same note the previous review filed, and it has got worse rather than
stale — one more commit behind, and the new one is the API change.

**Why it still does not block.** The three rows test rendering geometry at 14, 16
and 22. None of the three commits changed geometry. And I did not rely on that
reasoning: I re-measured all three sizes on the current deployed build and they
render 14×14, 16×16 and 22×22 at `rgb(34, 52, 78)`, which is what the rows record.
The rows' claims are true of the build that ships; it is the pointer that is
wrong.

**Owner.** 🔨 Engineer or 📋 PM — the row should point at the commit the component
actually ships from.

---

## The version sentence

**0.1.0 says: there is a component called `IconSlot`, you import it and its types
from the package root, it draws a square box at 14, 16 or 22 pixels that takes its
colour from whatever it sits inside and can be retinted through
`--sunim-IconSlot-color`, and it stays out of the accessibility tree entirely
unless you name it with `aria-label` — which is the only way to name it, because
it is the standard attribute and this component adds no second spelling of its
own. That is all it says.**

What it deliberately does not say: that the arrow you see is the arrow you keep.
It is a placeholder for a Sunim Icon file that is not in this repository, and
Button and Chip both ship it today. Nor does it say the three sizes are a settled
scale — Figma binds no variable to any of them, so they are transcribed numbers
in a quarantine block waiting for a token that does not exist yet. Nor, being a
0.x version, does it promise that any of it survives to 0.2.0.

What it says that it could not say a day ago: **the naming surface is not going
to move.** The previous version of this sentence had to carry a caveat that
`label` was the part of the surface most likely to change, because the component's
own documentation recommended against it. That caveat is gone, and it is gone by
subtraction — there is no new name to defend, only one fewer thing to explain.
That is the strongest form this sentence has taken.

**On whether `experimental` is the honest claim** — yes, for the two reasons in
N-F5, and I record that it is honest for *fewer* reasons than it used to be. The
status is not overstating IconSlot's stability; it is understating IconSlot's
reach, which remains the more unusual error and the one still worth writing down.

---

## Not checked

- **The `aria-hidden={false}` override, and the `label`-names-nothing case, on the
  deployed build.** Both are asserted by executing tests. I tried to drive both
  through the deployed Storybook with URL args and could not, because Storybook
  filters URL args to declared `argTypes` — which I confirmed as the mechanism
  rather than assumed, by watching `id:probe` get dropped in the same navigation
  where `aria-label:Zed` applied. Two of five name cases are therefore test-only.
- **Whether the three unbound sizes are a *wanted* design gap.** I confirmed live
  on 9:24 that only `text/body` is bound, so the gap is real today and not a stale
  export. I did not confirm with 🎨 Human that an icon-size scale is wanted rather
  than deliberately withheld. Gate 2 asks for that and I could not get it. Not in
  `decisions.md`, so unruled. Unchanged across all three reviews.
- **Screen-reader output.** I verified the accessibility tree — roles, names,
  `aria-hidden`, tab order — on the deployed build. I did not run NVDA, JAWS or
  VoiceOver, so what is *announced* is inferred from correct markup.
- **Contrast, in any mode.** Ruled out of scope repo-wide in `decisions.md`, every
  component, every mode. I did not measure a ratio and report none. Recorded
  against the ruling.
- **Modes other than `day`.** All live checks ran in the deployed default.
- **The Astro reference site.** `Astro Link` is empty on the row — confirmed live —
  and the site is not deployed, so I reviewed the docs page Storybook serves. I
  could not open a rendered reference-site page because there is not one.
  `Astro Link` is 🚀 DevOps's field and not mine to write. Note that the commit
  which landed on `main` during this review touches `docs/astro.config.mjs`, so
  that may be changing; it had not changed at `e723a0a`.
- **Any behaviour of the built package.** This review reads the repository and the
  deployed Storybook. Whether `IconSlot` survives the build, packs, installs and
  renders from a tarball is release-prepare's steps 5–7, and no gate here covers
  it.
- **The other three components.** IconSlot only. N-F5 is visibly a whole-surface
  governance question, N4's mechanism (an inherited attribute in `argTypes` with
  no interface member to source a description from) could apply to any component
  that does the same thing, and N1 may well apply to other rows. I confirmed none
  of those beyond what IconSlot required.

---

## What is outstanding — none of it blocking

| # | Item | Owner |
|---|---|---|
| N-F5 | Settle what `experimental` promises when it is composed into `settling`. Worth doing before 1.0.0, not required for 0.1.0 | 🎨 Human |
| N4 | Add a `description` to the `aria-label` `argTypes` entry so the naming API is documented where consumers look for it | 🔨 Engineer |
| N3 | Rule on whether placeholder-by-default is the design, then reconcile the blurb and the header comment. Feeds N-F5 | 🎨 Human rules |
| N2 | Nothing to fix. Recorded because the registry contract asks gate 4 to surface it | — |
| N1 | Point the row's commit at what ships. Three commits behind now | 🔨 Engineer / 📋 PM |

---

*Reviewed against the seven gates in `.claude/skills/release-review/SKILL.md`.
Nothing in `src/` was modified. No version was bumped. Nothing was published, and
nothing was written to the board — this run was asked to return its verdict for
transcription, and to leave this report uncommitted.*
