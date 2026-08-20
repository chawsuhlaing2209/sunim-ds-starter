# Release review — Eyebrow

**Reviewed at** `2dbde8a` · branch `develop/release-gate` · 2026-08-20
**Figma node** `22:43` (set), variants `22:27` / `22:32` / `22:37` / `22:42`, read live over the Figma connection
**Against version** 0.1.0 (the version being cut; `package.json` still reads `0.0.1`, correctly — the bump is a human act)

---

## Verdict

**Blocked** — the published prop documentation states a default that the component
does not have, in four places, directly above a prop table that says the opposite.

This is the only blocker. Everything else on this component is in good order, and
several parts of it are better than the gate requires. The fix is one line, but
*which* line is a design call, not mine, and I do not make changes after a review.

---

## The seven gates

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Is it actually done? | **pass** | Registry row `reccID9uuD98wfKmd`: `Development` = `Completed`, `Synchronization %` = `100%`. All four `Staging Testing` rows read `Passed` — checked at the source rows, not the rollup (see Finding 3). No `Failed`, no `Fixed (To re-test)`. `npm run lint` exit 0; `npm test` 7/7 in 1 file. Implementation, styles and stories all exist; stories name node `22:43`. |
| 2 | Are the tokens clean? | **pass** | No raw hex, no raw px, no `--primitives-*` reached directly, nothing in the `unbound` quarantine — this is the only component in the batch with no gap block. All five colour tokens resolve correctly in `build/tokens/css/tokens.css`; four match the live Figma variable hex-for-hex, and the fifth is the ruled `accent-ink` drift (see Ruled, below). No *second* drifting token, which is the thing `decisions.md` says would signal a broken pipeline. |
| 3 | Is the public surface decided? | **pass** | `src/index.ts` exports `Eyebrow`, `EyebrowProps` and `EyebrowTone`. `EyebrowProps` references `EyebrowTone`, so both must be public and both are — a consumer can type a wrapper without a deep import. Eyebrow composes no sibling, so gate 3's usual failure (reaching a type you cannot import) has nothing to bite on here. |
| 4 | Are the names final? | **blocked** | Folder, symbol, CSS prefix `.sunim-Eyebrow`, intent `component` and registry row all read `Eyebrow`. All five props carry doc comments. `tone` and its four values match the node's `Tone` variant property exactly. But one of those doc comments is false — **Finding 1** — and the file's stated basis for the prop names does not survive a look at the node — **Finding 2**. |
| 5 | Are the states complete? | **pass** | All four `EyebrowTone` values have a story, each deep-linked to its own node id. There are no interaction states to get wrong, and I verified that rather than taking the claim: the rendered root has no `role`, no `tabindex`, and contains **0 focusable descendants**. `showLabel={false}` has its own story and genuinely drops the label. The three named glyphs each have a story. |
| 6 | Is the intent clear and documented? | **pass, with a deployment finding** | `Eyebrow.intent.json` is filled, placeholder-free, and — unusually — **true**. All nine `required_tokens` exist in the build and are referenced by the component. The docs page renders completely and answers all three consumer questions. It is not, however, reachable in production — **Finding 4**. |
| 7 | Do you understand what this version means? | **pass** | `VERSIONING.md` read. `since` = `0.1.0` is at the version being cut, not ahead of it. `status` = `settling`, not `stable`, which is the only honest option while the number starts with a zero. Sentence below. |

---

## The five perspectives

### 1 · The consumer who has never seen the code

The deployed docs page named in the brief does not exist — see Finding 4 — so I
did this against the same page served locally, and flagged the deployment gap
separately rather than letting it stand in for a content judgement.

On content the page is genuinely good. "What is this for" is answered in the
first line; "when should I not use it" is answered explicitly and unusually
honestly, including the `<span>`/heading trap; "what do I pass it" is a complete
five-row prop table with types, defaults and live controls. I did not need the
source for any of the three.

What I did need the source for was resolving a contradiction the page puts in
front of the reader: the prose says Sky is the default and the table says
`'Agentic'`. That is Finding 1, and this perspective is where it surfaces — a
consumer cannot resolve it, because both statements are on the same page with
equal authority.

### 2 · The engineer who inherits this in six months

The names are ones I would defend. `tone`, `mark`, `title`, `label`, `showLabel`
are all obvious at the call site, and `EyebrowTone`'s values are capitalised to
match the Figma variant values rather than lowercased to suit JavaScript taste —
a small consistency that pays for itself when someone is diffing against the node.

`title` shadowing React's native `title` attribute is the one costly decision,
and it is taken deliberately and documented at length. I would defend the
decision. What I could not verify is the reason given for it, which is Finding 2.
Worth being precise about the cost: changing `title` after 0.1.0 is a breaking
change and, under this repo's rules, a minor bump — so now is the only cheap
moment to look at it.

Nothing else here would puzzle an inheritor. The CSS is 122 lines, half of it
comments explaining decisions rather than restating code, and the class structure
is three flat BEM-ish slots with no nesting.

### 3 · The keyboard and the screen reader

I tabbed rather than read the field. The component is inert by construction: a
`<span>` with no `role`, no `tabindex`, and zero focusable descendants — so there
is nothing to tab into and nothing to tab out of, which is correct for a label.
The mark carries `aria-hidden="true"`, so a screen reader reads "Components /
Card" rather than announcing "white diamond". Title and label are ordinary text
in visual order.

This is the perspective that usually disagrees with the documentation. Here it
agrees with it completely, including on the uncomfortable parts — the intent
volunteers that the component carries no heading semantics and tells the consumer
to put a real `<h2>` underneath, which is exactly the misuse a component called
"Eyebrow" invites. That is a `dont_use_when` describing the real trap rather than
an imagined one, which is rarer than it should be.

I also checked one thing the intent does not claim, to see whether it should:
the root sets `overflow: hidden; white-space: nowrap`, which looked like silent
truncation waiting to happen given that native `title` is unavailable as a
fallback tooltip. It is not. Because the root is `inline-flex` and hugs, a long
title overflows its parent rather than clipping itself — measured at a 120px
constrained parent, the component rendered 313px and `scrollWidth === clientWidth`.
No finding.

### 4 · The designer

The node offers one axis, Tone, with four values, and the props reach all four.
There is no variant reachable in the set that the props cannot express, and no
prop that invents an axis the design does not have — with one caveat, `showLabel`,
covered in Finding 2.

On affordance rather than pixels: the component correctly refuses to compose Icon
Slot. The node carries the mark as a text layer (`22:24`, a `<text>` node
alongside Title and Label — confirmed directly), and the design file's rules page
names this as the system's one typographic exception. Importing Icon Slot here
would have been the convenient wrong answer and the component explicitly declines
it. That is the right call and it is recorded where the next person will find it.

The ~5px width delta against the node is real and reproduced — root 145.73px
against 151px, with the entire deficit in the mark at 8.10px against 14px. It is
correctly diagnosed as a missing glyph range in Instrument Sans rather than a
layout bug, correctly left unfixed, and correctly escalated upstream. I re-measured
rather than trusting it.

### 5 · The release

Sentence below. `VERSIONING.md` read in full. Nothing in this component claims
more than a `0.x` can carry.

---

## Findings

### Finding 1 — the documented default contradicts the actual default · **blocks**

**The claim.** Four places say Sky is the default tone:

- `src/components/Eyebrow/Eyebrow.tsx:41` — in the `tone` prop's doc comment, the
  text that becomes the published API documentation
- `src/components/Eyebrow/Eyebrow.stories.tsx:61` — the component description
- `src/components/Eyebrow/Eyebrow.stories.tsx:117` — the `Sky` story's comment
- `src/components/Eyebrow/Eyebrow.css:109` — the tone rule's comment

**The observation.** `src/components/Eyebrow/Eyebrow.tsx:66` reads `tone = 'Agentic'`.
The rendered docs prop table reports `Default: 'Agentic'`. The live node agrees
with the code, not the prose: `get_metadata` on the set returns `Tone=Agentic` as
the first and therefore default variant. I rendered `<Eyebrow />` with no `tone`
and read back `class="sunim-Eyebrow sunim-Eyebrow--Agentic"`, computed colour
`rgb(155, 111, 208)` = `--color-agentic-default`.

**Why it blocks.** CLAUDE.md is explicit that a component's props are its
documented API and that undocumented behaviour is a bug; a *mis*-documented
default is worse than an undocumented one, because the reader has no reason to
check. The concrete outcome is a consumer writing `<Eyebrow />` for an ordinary
section, having read that Sky is the default, and shipping the tone reserved for
marking an AI moment. The two statements sit on the same docs page with equal
authority, so the consumer cannot resolve it. 0.1.0 is the version where this
prop's documentation becomes a public promise, which makes this the moment to
settle it.

**Owner.** 🎨 Human decides which is correct — the prose is wrong, or the default
is. Then 🔨 Engineer applies it. I did not fix it, and I note that the two fixes
are not equivalent: changing the prose is free, changing the default silently
alters what every existing `<Eyebrow />` call renders.

### Finding 2 — the stated Figma basis for the prop names is not on the node · does not block

**The claim.** `src/components/Eyebrow/Eyebrow.tsx:11-13`: "Prop names and values
mirror the Figma properties exactly: Tone is the one variant property; Mark,
Title, Label and Show Label are the component properties." This claim is then
used at `Eyebrow.tsx:32-37` to justify omitting React's native `title` attribute
from the props — "The Figma property is called Title, CLAUDE.md requires the prop
to carry that name exactly."

**The observation.** Read live from the node: set `22:43` exposes exactly one
property, the `Tone` variant axis. Variant `22:27` contains three `<text>` layers
named `Mark`, `Title` and `Label`. Those are **layer names, not component
properties**, and no property named `Show Label` appears anywhere on the set —
`showLabel` is a sensible engineering addition to serve the label-less case, not
a mirror of anything in the design.

**Why it does not block.** Mapping props onto the node's layer names is a
defensible reading of the naming rule, and `showLabel` is a good prop. The names
are right; the provenance claim is wrong. But it matters that the *reason* given
for a permanent API cost — shadowing a native HTML attribute — rests on a premise
the node does not support, because the next person to weigh that trade-off will
read the comment and believe the question is already settled.

**Owner.** 🔨 Engineer, to correct the comment. 🎨 Human, if the `title` shadow is
worth revisiting — and 0.1.0 is the last cheap moment to revisit it.

### Finding 3 — `Synchronization %` cannot fail · does not block Eyebrow

**The observation.** In the `Components` table schema, `Synchronization %` is
`ROUND((fld88iBKmSezw6rzk / fldyYyEn5KfFGEuUu) * 100, 2)`. Both operands are
`count` fields configured on the **same** record-link field (`fldjU0dkzPmQJ0Z3W`,
the Staging Testing link), with no filter distinguishing them. The ratio is
therefore always 1. Confirmed across all four rows: Button 30/30, Chip 8/8,
Eyebrow 4/4, Icon Slot 3/3 — every one reads `100%`.

**Why it does not block.** Gate 1 asks for `Synchronization %` = 100% as evidence
that a component is in sync. That field reads 100% for every row unconditionally,
so it is not evidence of anything. I did not rely on it: I opened all four
Eyebrow `Staging Testing` rows and read `Passed` on each directly, which is what
gate 1 actually needs. Eyebrow is fine. The board column is not.

**Owner.** 📋 PM — it is a board-schema defect, it is repo-wide, and every future
release review will otherwise pass a gate on a constant.

### Finding 4 — the production docs page does not exist · does not block, but must land before 0.1.0 is public

**The observation.** `https://sunim-ds-starter.vercel.app/?path=/docs/components-eyebrow--docs`
returns "Couldn't find story matching 'components-eyebrow--docs'". The deployed
`index.json` contains 69 entries and **zero** of type `docs` — for any component,
not just Eyebrow. Locally the same page renders completely. The cause is a stale
deploy: `tags: ['autodocs']` was added to all four stories files in commit
`e46893c`, and production predates it.

**Why it matters.** `VERSIONING.md` says 0.1.0 promises that each component "has a
documented prop API and a documented intent". Today that documentation is not
public for any component in the set. The content exists and is good; the deploy is
behind.

**Why it does not block Eyebrow.** Nothing is wrong with the component or its
docs, and a release deploy resolves it. Blocking Eyebrow for a repo-wide stale
deploy would misattribute the problem.

**Owner.** 🚀 DevOps — redeploy production from a commit at or after `e46893c`,
then re-check that `index.json` carries a `docs` entry per component.

---

## Ruled, not re-argued

Both recorded against `decisions.md` and carried no further.

- **Day-mode contrast, all four tones.** Agentic 3.48, Sky 2.55, Ink 4.35, Gold
  2.16 — all below the 4.5:1 AA bar for normal text. Ruled 2026-08-19, accepted
  for this release. The intent file states this plainly rather than omitting it,
  which is the right handling.
- **`accent-ink` stale export.** `--color-accent-ink` resolves to `#1a78bd` via
  `--primitives-sky-600`; the live Figma variable reads `#166fb2`. Ruled
  2026-08-19, accepted and not scheduled. I checked the clause `decisions.md`
  leaves open — "any *other* token drifting … Report it" — and there is no second
  drift: `accent-agentic` `#9b6fd0`, `accent` `#2ba4ec`, `gold-deep` `#d9a017`
  and `text-faint` `#8497ac` each match the live variable exactly. One stale
  value, as ruled; not a broken pipeline.

---

## The version sentence

0.1.0 promises that a component called `Eyebrow` exists, is imported from this
package's entry point rather than a deep path, takes these five props under these
names, and renders a marked layer label whose four tones are the four the design
file defines — and that a human who did not build it has read all of that against
the node. It deliberately promises nothing about whether those names survive to
0.2.0, nothing about the colour values behind the tones (two of which are recorded
as accepted gaps), and nothing at all about the component being accessible in day
mode, where every tone knowingly falls below AA. It is `settling`, not stable, and
the leading zero is doing real work: a 0.x minor is allowed to break every one of
these names, and if `title` is going to stop shadowing the native attribute, that
is the bump it happens in.

---

## Not checked

- **Production Storybook behaviour.** The deployed build predates the current
  commit — Finding 4 — so the interaction, keyboard and measurement work in
  perspectives 3 and 4 was done against Storybook served locally at `2dbde8a`,
  not against the deployed site. The rendered numbers match what QA measured on
  staging (root 145.73×18, mark 8.10, title 82.24, label 39.39), which is why I
  am confident they transfer, but I did not verify them on the production URL.
- **Night mode.** Every measurement here, and every contrast figure in the ruling,
  is `data-theme="day"`. I did not evaluate any tone against the night surface,
  and `decisions.md` rules only on day. Whether the four tones clear AA in night
  mode is unexamined by this review.
- **Figma component properties, definitively.** I read the node's structure and
  variant axis over the Figma connection (`get_metadata`, `get_variable_defs`).
  Those return layers, variants and bound variables; I could not enumerate the
  set's component-property definitions directly to prove a negative. Finding 2
  says no `Show Label` property *appears* on the set — which is what I can
  support — rather than that none is defined.
- **Rendered appearance.** I read the DOM, the computed styles and the measured
  geometry. I did not compare a screenshot of the rendered component against a
  screenshot of the node; QA did that, and this gate is not a re-run of QA.
- **Automated coverage of Eyebrow.** `npm test` passes, but the suite is a single
  file, `src/tokens/token-binding.test.ts`, 7 tests, none of which render Eyebrow.
  Gate 1 asks that the tests pass and they do; it is worth knowing that no test
  would catch a regression in this component.
- **The other three components.** Reviewed separately and concurrently. Findings 3
  and 4 are repo-wide and will appear in those reviews too; I have not reconciled
  wording with them.
- **Board write-back.** By instruction, `Release Review` and `Release Verdict`
  were not written, and this report was not committed or pushed — the orchestrator
  commits all four together and transcribes the verdict, so the report URL can be
  pinned to the commit it actually lands in.
