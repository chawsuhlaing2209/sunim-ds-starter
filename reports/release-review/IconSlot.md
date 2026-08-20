# Release review — IconSlot

**Commit reviewed** `7ec481f` on `main` · **Registry row** `Icon Slot` (`recvDIEckmxBp6SGT`)
**Figma node** 9:24, file `mFnN1Sr8MAmOdmx0ABXPsb` · **Version under review** 0.1.0
**Reviewed** 2026-08-20 · **Re-review**, superseding the verdict written at `27afeb5`

Working tree at review time carried one unrelated modification —
`reports/release-review/Eyebrow.md`, a concurrent review — and nothing else.
Nothing in `src/` was touched by this review.

---

## Verdict

**Blocked** — on one finding, down from four.

Three of the previous four are genuinely closed, and I verified each against the
deployed build rather than against the commit message. What remains is **F1**:
`label` still means an invisible accessible name on IconSlot and visible required
text on Button, Chip and Eyebrow. A doc comment now points at the collision. That
documents the problem; it does not remove it, and gate 4 is the one gate whose
entire purpose is to stop a name before it is public.

The previous review was right to block and right about all four findings. Where I
depart from it is severity, not substance: F1's *harm* has changed. It used to
compound into a silent accessibility regression, because a consumer who avoided
`label` and reached for `aria-label` got silence. That is fixed. F1 is now an API
hygiene blocker on its own — smaller, but sitting squarely in the gate that exists
for exactly this.

`npm run release-review -- IconSlot --version 0.1.0` reads **CLEAR** — 17 passed,
2 warned, 0 failed. F1 sits in the 7 items it marked REVIEW, as it did last time.
Nothing mechanical has ever caught a bad name, which is the script's own point.

---

## The gates

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Is it actually done? | **Pass** | Board read live at review time: `Development` = Completed, `Synchronization %` = 100% (3/3), all three `Staging Testing` rows Passed, none `Failed` or `Fixed (To re-test)`. `npm run lint` clean. `npm test` **25 passed across 2 files**, up from 7 across 1 — and this time some of them exercise IconSlot. One note below (N1). |
| 2 | Are the tokens clean? | **Pass** | No raw hex, no raw px outside the `--sunim-IconSlot-unbound-*` quarantine, no `--primitives-*`. Re-confirmed against the live node: `get_variable_defs` on 9:24 returns exactly one binding for the whole set. |
| 3 | Is the public surface decided? | **Pass** | `IconSlot`, `IconSlotProps`, `IconSlotSize` all exported from `src/index.ts`. Composition closed in both directions. F5 recorded, not blocking. |
| 4 | Are the names final? | **Blocked** | **F1**. `size` matches the node's only variant property exactly, verified against 9:24. Folder / symbol / CSS prefix / intent all agree. All 3 props carry doc comments. N2 recorded. |
| 5 | Are the states complete? | **Pass** | Node has one variant property and no state property — re-confirmed live. All three sizes plus all five example stories render correctly on the deployed build; measured, not assumed. |
| 6 | Is the intent clear and documented? | **Pass** | **F4 closed** — the docs page exists in production and perspective 1 ran for the first time. **F3 closed** — `dont_use_when` is now true of the component that ships. Residual tension recorded as N3, non-blocking. |
| 7 | Do you understand what this version means? | **Pass** | `VERSIONING.md` read. `since: "0.1.0"` is at the version being cut. `status: "experimental"`, not `stable`, at 0.x. Sentence below; `experimental` re-judged. |

---

## What changed since the previous review, and how I checked it

I took none of these on the strength of a commit message.

### F2 — fixed. Verified in source, in a test, and on production.

`IconSlot.tsx` now destructures `aria-label`, `aria-hidden` and `role` out of
`...rest` before the spread:

```tsx
'aria-label': ariaLabelProp,
'aria-hidden': ariaHiddenProp,
role: roleProp,
...rest
```

with `const name = label ?? ariaLabelProp`, and `role`/`aria-hidden` falling back
to the caller's value when given. That is the right shape: two spellings of one
idea with a stated precedence, and the two attributes a caller might have a reason
to force left forceable.

Three independent confirmations, because "the fix is in the file" is not the same
claim as "the fix is in production":

1. **Executed.** `src/components/accessible-props.test.tsx` renders the real
   component and asserts the markup. `<IconSlot size="16" aria-label="Next" />`
   yields `role="img"`, `aria-label="Next"`, and no `aria-hidden`. All three name
   cases are covered, plus the deliberate `aria-hidden={false}` override. 25 tests
   pass. This is the execution evidence the previous review explicitly could not
   get, and it closes that gap rather than restating it.
2. **Live, for the storied cases.** `components-iconslot--labelled` on production
   renders `role="img" aria-label="Next"` with `aria-hidden` absent;
   `components-iconslot--all-sizes` renders all three decorative, `aria-hidden="true"`,
   no role, nothing focusable in the subtree.
3. **The deployed bundle is the fixed one.** The `label` prop's doc comment —
   "Note this is the opposite of `label` on Button, Chip and Eyebrow" — landed in
   `3d7c9e6`, the same commit as the fix. That sentence renders on the production
   docs page today. The deployed build therefore contains `IconSlot.tsx` at
   `3d7c9e6` or later; the fix cannot be in one without the other.

### F4 — fixed. Verified.

The deployed `index.json` has **74 entries, 4 of type `docs`**, one per component,
`components-iconslot--docs` among them. All eight IconSlot story ids resolve.
Perspective 1 ran; see below.

### F3 — closed. The field is now true.

`dont_use_when` no longer claims every production use passes a real icon. It says
the arrow is the default Button and Chip ship **today**, drops the fourth-size case
a closed union already forbids, and names the misuse the component actually invites
— that it needs no props at all and draws a complete, plausible arrow.

I re-confirmed the premise on production rather than trusting the rewrite:

| Deployed story | Renders | Path `d` |
|---|---|---|
| `components-button--primary-md-default` | `sunim-IconSlot--16`, `aria-hidden="true"` | matches `GLYPH['16']` byte-for-byte |
| `components-chip--default-md` | `sunim-IconSlot--14`, `aria-hidden="true"` | matches `GLYPH['14']` byte-for-byte |

The field describes what ships. Gate 6's named failure mode — an intent describing
a component that does not exist yet — no longer applies. The open question
underneath it (*is* placeholder-by-default the design?) is raised, unresolved, and
correctly a human's; see N3.

### The dead reference-site links — fixed, and I re-derived the claim.

`parseStoryIds` hyphenated only at a lower→upper boundary, so `Size14` became
`size14` where Storybook derives `size-14`. `461d6c0` adds the letter→digit split.

I did not take the commit's "62 of 62" on faith. I imported the fixed
`parseStoryIds` from `scripts/lib/contract.mjs`, derived every story id from every
`*.stories.tsx` in the repo, and checked each against the deployed index:
**62 derived, 0 missing.** Independently reproduced.

---

## The five perspectives

### 1 · The consumer who has never seen the code

**Ran for the first time.** Docs page only, no source, no Figma. All three
questions answer cleanly off the page:

- *What is this for?* "Reserving a square, correctly sized, correctly coloured box
  for an icon inside another component." Plus the sizing rule of thumb — 14 for UI
  text, 16 for buttons and chips, 22 for icon tiles.
- *When should I not use it?* Four cases, including the honest one: it needs no
  props and draws a plausible arrow, so shipping the placeholder is the path of
  least resistance.
- *What do I pass it?* `size`, `icon`, `label` — each with a description, a type,
  a default and a control.

I did not reach for the source to answer any of them. That is the standard the
skill sets and this page meets it.

One thing the page does that is worth naming as a positive: the `label` row tells
the consumer, at the point of use, that the name collides with the siblings and
that `aria-label` reads less ambiguously. This perspective is where I first
noticed that the docs recommend an alternative to the prop — which is what turns
F1 from a carried complaint into a self-evident one. See F1.

### 2 · The engineer who inherits this in six months

Holding up: `IconSlot` / `.sunim-IconSlot` / `IconSlotProps` / `IconSlotSize` all
agree. `size` with `'14' | '16' | '22'` is the node's own vocabulary, and the
source comment defends the string-union-of-numerals rather than leaving the next
reader to wonder. `icon` follows the convention Button already set. The
quarantine block explains not just what is unbound but why `--spacing-step-14`
must not be substituted for it — that is a comment written for the person who will
be tempted, which is the useful kind.

The destructure comment added in `3d7c9e6` explains the old defect, not just the
new code. Six months from now that is the comment that stops someone "simplifying"
the spread back to where it was.

Not holding up: `label`. **F1.**

### 3 · The keyboard and the screen reader

Driven on the deployed build. This perspective now **agrees** with the
documentation in every case I could reach, which is the change from last time.

| Case | Deployed DOM | Matches intent? |
|---|---|---|
| no name (`all-sizes`, all three) | `aria-hidden="true"`, no role, no name | yes |
| `label="Next"` (`labelled`) | `role="img"`, `aria-label="Next"`, no `aria-hidden` | yes |
| `aria-label` alone | `role="img"`, `aria-label="Next"`, no `aria-hidden` | yes — asserted in test, not storied |
| `aria-hidden={false}` override | honoured | yes — asserted in test, not storied |

Nothing focusable in any story subtree: 0 focusable descendants under
`#storybook-root` on `all-sizes`. The component adds nothing to the tab order, as
the intent claims.

Contrast remains out of scope by construction and the intent says so. The retint
mechanism works on the deployed build — `components-iconslot--retinted` resolves
`--sunim-IconSlot-color` to `#dcebf7` and `#2ba4ec` on a `rgb(16,24,40)` surface,
both real values rather than the fallback.

The two cases still not exercised by any *story* are the two the new unit tests
cover. That is a reasonable division — a raw `aria-label` has no visual difference
to look at, so a story would show nothing a test does not — but it does mean the
a11y panel in Storybook cannot demonstrate them. Recorded, not blocking.

### 4 · The designer

`get_metadata` on 9:24 returns the frame `Icon Slot` and three symbols — `Size=14`,
`Size=16`, `Size=22`. One variant property, no state property. `get_variable_defs`
returns `{"var(--text-body)":"#22344e"}` — one binding for the whole set, matching
the `rgb(34, 52, 78)` I measured on the deployed component.

No variant in the set is unreachable through the props. The prop name `size`
matches the Figma property `Size` exactly, per CLAUDE.md.

The structural point from the previous review still stands and is still not a
defect: `icon` and `label` have no Figma counterpart because a component set
cannot express "an arbitrary child". The design meant to offer a swap and could
only name it. The consequence — two of three public props fall outside
design-parity testing entirely — is now partly mitigated, because the new test
file exercises `label` and the attribute passthrough even though Figma cannot.

### 5 · The release

See the version sentence. `experimental` re-judged there. F5 carried.

---

## Findings

### F1 · `label` means the opposite of what it means in every sibling — gate 4 · **BLOCKING**

Carried from the previous review, still open, re-argued from scratch rather than
inherited.

**What I saw.** Four components on the public surface, one prop name, two meanings:

| Component | `label` | Visible? |
|---|---|---|
| Button | the text of the action | yes, required |
| Chip | the chip's text | yes, required |
| Eyebrow | the eyebrow's text | yes |
| **IconSlot** | **an accessible name for a screen reader** | **never** |

And, from the deployed docs page for this component, in the `label` row of the
props table:

> "Note this is the opposite of `label` on Button, Chip and Eyebrow, where it is
> visible required text. Passing `aria-label` instead does the same thing here and
> reads less ambiguously beside them."

**Why the doc comment is not enough, which is the actual question I was asked.**

That sentence is the strongest argument for blocking, not against it. The package
is now shipping a public prop whose own documentation recommends a different
spelling. If the documented best practice is *don't use this prop*, the prop
should not be entering the public surface under that name. Documentation of a
footgun is an annotation, not a fix — the next consumer to reach for `label`
having learned it from Button will still reach for it, and will reach for it in
Button's own file, where both meanings appear a few lines apart.

There is a real counter-argument and I want it on the record, because it nearly
moved me. Read in isolation, `label` is a perfectly ordinary name: IconSlot has no
visible text, so `label` can only mean the accessible name, and the failure is now
*visible* — pass `label="Delete"` expecting text and you see nothing render, so
you find out immediately. That is genuinely better than the silent hiding F2 used
to cause. If this component shipped alone, I would clear the name.

It does not ship alone. A design system is read as a set, that is its premise, and
`label` was not inherited from Figma — the node has only `Size`, so `label` was
invented here, and it was invented to collide. Gate 4's bar is "would I defend
this in six months", and I would not defend a prop I would have to explain every
time it came up.

**Cost of not fixing now.** Unchanged and still the decisive point. IconSlot has
never been public, so the rename is free today. After 0.1.0, `VERSIONING.md` makes
changing a prop's meaning a minor bump.

**Owner.** 🎨 Human picks the name; 🔨 Engineer applies it. `iconLabel`, `alt` and
`a11yLabel` are the obvious candidates — and a fourth option now exists that did
not before: **drop `label` entirely and keep `aria-label`**, which already works,
is standard, collides with nothing, and is what the docs already recommend. That
would make the public surface smaller rather than larger, which is the rare kind
of fix. The choice is not mine to make.

---

### F5 · `experimental` is load-bearing for two `settling` components — gate 3 / gate 7 · **not blocking**

Carried. Re-judged, as asked, rather than restated.

`VERSIONING.md` says 0.1.0 promises nothing "at all about a component whose
`status` reads `experimental`". IconSlot is the only `experimental` component in
the release. Button and Chip read `settling`, and both render IconSlot on their
default path — which I re-verified in the deployed DOM, not inferred.

**My judgement, independent of the previous review's:** the status is honest about
the component and the disclaimer is over-broad about the package. Those are two
different claims and only the second is wrong.

`experimental` is honest because IconSlot's surface genuinely is not settled — F1
is open, and the visible default is a placeholder for an icon file that is not in
this repository. This is not the failure gate 7 usually catches, which is a
component overstating its own stability. IconSlot is understating its *reach*.

The disclaimer is over-broad because "anything at all" cannot survive composition.
A consumer relying on Button's trailing mark is relying on IconSlot whether the
package promises anything about it or not. `VERSIONING.md` was written imagining
an experimental component as an isolated preview; this one is a dependency of
two-thirds of the released surface.

**What I would add that the previous review did not:** this is now the *last*
governance question standing between IconSlot and `settling`. If a human settles
F1, the case for keeping IconSlot `experimental` largely evaporates — the surface
would be decided, the docs are live, the a11y story is tested. Settling F1 and
settling F5 are more nearly one decision than they were a day ago.

Smaller, related, unchanged: `--sunim-IconSlot-color` is a documented
consumer-facing contract that cannot be exported from `src/index.ts`, so it is
promised through a channel `VERSIONING.md` declares non-public. Worth settling
before 1.0.0; not urgent at 0.1.0.

**Owner.** 🎨 Human — `VERSIONING.md` is governance, not code.

---

## Notes — recorded, not blocking

### N1 · The board's recorded commit predates the code being reviewed — gate 1

The registry row's commit field points at `b26ed39`. The component's directory has
changed twice since: `3d7c9e6` (the a11y fix) and `056ca6f` (the intent rewrite).
QA's three `Passed` rows were therefore recorded against an older build than the
one in this release.

**Why it does not block.** The three rows test rendering geometry at 14, 16 and
22; `3d7c9e6` changed attribute plumbing only and `056ca6f` touched no code at
all. And I did not rely on that reasoning alone — I re-measured all three sizes on
the current deployed build and they render 14×14, 16×16, 22×22 at
`rgb(34, 52, 78)`, which is what the rows record.

`docs/registry-status.json` is *not* stale, for what it is worth: `readAt`
`2026-08-20T07:37:25Z` is 17 seconds after the last change to the component
directory. It is the Airtable commit field specifically that has fallen behind.

**Owner.** 🔨 Engineer or 📋 PM — the row should point at the commit the component
actually ships from.

### N2 · `Icon Slot` on the board, `IconSlot` in code — gate 4

I was asked to decide this for myself rather than inherit the previous review's
"not a finding". I reach the same conclusion by a different route, and I think the
previous review under-recorded it.

`.claude/skills/registry/SKILL.md` says, in as many words, that "two systems
disagreeing about a name is a finding for 📦 Release's gate 4, not a detail to
absorb quietly", and `registryEntryFor` in `scripts/lib/contract.mjs` carries the
same comment. So the repo explicitly asks gate 4 to *surface* this. The previous
review declared it not a finding and cited neither. It should be recorded — which
is what this note is.

**But it should not block.** The two names are the same word under two conventions
that each side mandates: the registry row mirrors Figma, which names the node
"Icon Slot", and CLAUDE.md mandates PascalCase in code, which makes `IconSlot` the
prescribed spelling of that same name. The mapping is documented in the registry
skill and implemented in `registryEntryFor`, which matches with spacing ignored.
Renaming the row to `IconSlot` would break the registry's own rule that the row
mirrors Figma. There is nothing here to fix; there was something here to say.

IconSlot is the first two-word component, which is why the convention is only now
visible. The next two-word component will hit it too, and the handling is already
in place.

### N3 · The docs page still calls the arrow "scaffolding" two paragraphs above calling it the shipped default — gate 6

F3's field is fixed. The page it renders on has not caught up.

The engineer's blurb at the top of the production docs page reads "Every
production use should pass `icon`", and the component header comment calls the
arrow "scaffolding". The Intent block below, on the same page, says "Inside Button
and Chip the arrow is the default both ship today".

**Why this is a note and not F3 reopened.** Gate 6 asks whether the *intent* is
true, and it is. The two sentences are not strictly contradictory either — one
states an aspiration, the other states a fact, and both are accurate. 📝 Doc
Generator left the blurb alone deliberately: the stories file is 🔨 Engineer's, and
staying out of it is the boundary working rather than a job half done.

**What is genuinely still open** is the question underneath both sentences, which
📝 Doc Generator raised in `reports/IconSlot-intent.md` and could not settle: is
placeholder-by-default the intended design, or a gap waiting on a Sunim Icon file?
If the second, both consumers should be passing real icons, the intent wants
another pass, and the header comment is right after all. That is a human's ruling
and neither agent should have taken it. Not in `decisions.md`, so unruled.

**Owner.** 🎨 Human rules; 🔨 Engineer owns the blurb; 📝 Doc Generator re-runs after.

---

## The version sentence

**0.1.0 says: there is a component called `IconSlot`, you import it and its types
from the package root, it draws a square box at 14, 16 or 22 pixels that takes its
colour from whatever it sits inside and can be retinted through
`--sunim-IconSlot-color`, and it stays out of the accessibility tree entirely
unless you name it — with `label` or with `aria-label`, either of which now
works. That is all it says.**

It does not say the word `label` will still mean that in 0.2.0. Given that this
component's own documentation recommends `aria-label` instead, `label` is the part
of this surface most likely to move, and the version number is being honest by not
defending it. Nor does it say the arrow you see is the arrow you keep: it is a
placeholder for a Sunim Icon file that is not in this repository, and Button and
Chip both ship it today.

**On whether `experimental` is the honest claim** — I asked this fresh and land
where the previous reviewer did, for reasons I worked out independently. It is
right about the component and too strong as `VERSIONING.md` words it. Right,
because one prop name should still move and the visible default is scaffolding.
Too strong, because "nothing at all is promised" cannot hold for a component that
two `settling` components render by default. The status is not overstating
IconSlot's stability — it is understating IconSlot's reach, which is the more
unusual error and still the one worth writing down.

---

## Not checked

- **Whether the three unbound sizes are still a *wanted* design gap.** I confirmed
  live against 9:24 that only `text/body` is bound, so the gap is real today and
  not a stale export. I did **not** confirm with 🎨 Human that an icon-size scale
  is wanted rather than deliberately withheld. Gate 2 asks for that and I could
  not get it. Not in `decisions.md`, so unruled. Unchanged from the previous
  review.
- **The raw `aria-label` case in a browser.** Now asserted by an executing test
  against the real component, and the deployed bundle is provably at or after the
  fix — but no *story* passes a raw `aria-label`, so I could not drive it through
  the deployed a11y panel. Two of the four name cases are test-only.
- **Screen-reader output.** Verified the accessibility tree — roles, names,
  `aria-hidden`, tab order — on the deployed build. Did not run NVDA, JAWS or
  VoiceOver, so what is *announced* is inferred from correct markup.
- **Contrast in any mode.** Out of scope by construction; the component inherits
  its colour and the intent assigns contrast to the consumer. The `decisions.md`
  ruling covers Chip and Eyebrow, not IconSlot.
- **Modes other than `day`.** All live checks ran in the deployed default.
- **The Astro reference site.** `Astro Link` is empty on the row and the site is
  not deployed, so I reviewed the docs page Storybook serves. The story-id fix in
  `461d6c0` I verified by re-deriving all 62 ids against the deployed Storybook
  index — which is the authority — but I could not open a rendered reference-site
  page, because there is not one. `Astro Link` is 🚀 DevOps's field and not mine to
  write.
- **Any behaviour of the built package.** This review reads the repository and the
  deployed Storybook. Whether `IconSlot` survives the build, packs, installs and
  renders from a tarball is release-prepare's steps 5–7.
- **The other three components.** IconSlot only. F5 is visibly a whole-surface
  governance question and N1 may well apply to other rows; I confirmed neither
  beyond what IconSlot required.

---

## What must happen before this reads Cleared

| # | Fix | Owner |
|---|---|---|
| F1 | Settle `label` — rename it, rename it in the three siblings, or drop it in favour of `aria-label` | 🎨 Human decides, 🔨 Engineer applies |
| F5 | Optional before 0.1.0 — settle what `experimental` promises when it is composed into `settling`. Likely one decision with F1 | 🎨 Human |
| N3 | Optional — rule on whether placeholder-by-default is the design, then reconcile the blurb and the header comment | 🎨 Human rules |
| N1 | Housekeeping — point the row's commit at what ships | 🔨 Engineer / 📋 PM |

F1 is free today and costs a minor bump after 0.1.0 is cut. It is the only entry
on this table that blocks.

---

*Reviewed against the seven gates in `.claude/skills/release-review/SKILL.md`.
Nothing in `src/` was modified. No version was bumped. Nothing was published, and
nothing was written to the board — this run was asked to return its verdict for
transcription.*
