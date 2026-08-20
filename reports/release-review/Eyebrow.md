# Release review — Eyebrow

**Reviewed at** `e723a0a` · branch `main` · 2026-08-20 · **third review**
**Figma node** `22:43` (set), variants `22:27` / `22:32` / `22:37` / `22:42`, read live over the Figma connection
**Against version** 0.1.0 (the version being cut; `package.json` reads `0.0.1`, correctly — the bump is a human act)
**Deployment** production, `https://sunim-ds-starter.vercel.app`
**Supersedes** the review at `7ec481f`, which superseded the one at `2dbde8a`. What changed is at the end.

---

## Verdict

**Cleared** — the blocker is fixed, ruled, and verified gone from the published
page. The one finding that remains is a false comment, and correcting it changes
no exported name, no rendered pixel and no version number.

The blocking finding of the last two reviews was that the prop documentation
stated a default the component did not have. The owner has ruled the prose right,
`Eyebrow.tsx` now defaults `tone` to `Sky`, and I confirmed on production that a
rendered `<Eyebrow />` with no tone set is Sky — not from the docgen table, but
from the live DOM.

One finding remains open and does not block. It is the same one, unchanged in
substance and slightly worse in reach, and it is stated at full weight below
because "does not block" is a judgement rather than a dismissal.

---

## The seven gates

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Is it actually done? | **pass** | Row `reccID9uuD98wfKmd`: `Development` (`fldOLGT24LDXAzsZ7`) = `Completed`, `Synchronization %` = `100%`. All four `Staging Testing` rows read `Passed`, opened and read at the source records (`reccI1RkFj6JLFa1Y`, `recWs4gPeRfOMEyiK`, `recMrHL1MQ221ByGa`, `recg9owTH4vpIkdm4`), not taken from the rollup. No `Failed`, no `Fixed (To re-test)` — and a filtered query across the whole `Staging Testing` table for any row not `Passed` returns **0 records**. `npm run lint` exit 0; `npm test` **36/36** across 2 files, up from 25. Implementation, styles and stories exist; stories name node `22:43`. Gate not rested on `Synchronization %` — see Finding 2. |
| 2 | Are the tokens clean? | **pass** | Script: no raw hex, no raw px, no `--primitives-*` reached directly, nothing in the unbound quarantine. All nine bound tokens re-read on production: `--color-agentic-default` `#9b6fd0`, `--color-accent-default` `#2ba4ec`, `--color-gold-deep` `#d9a017`, `--color-text-faint` `#8497ac`, `--font-eyebrow` `600 12px/18px`, `--font-eyebrow-strong` `700 12px/18px`, `--type-ls-eyebrow` `.72px`, `--spacing-space-2` `8px`. `--color-accent-ink` `#1a78bd` is the single ruled drift; no second drift, so the clause `decisions.md` leaves open is satisfied. No token file changed between `7ec481f` and `e723a0a`. |
| 3 | Is the public surface decided? | **pass** | `src/index.ts` exports `Eyebrow`, `EyebrowProps`, `EyebrowTone`. `EyebrowProps` references `EyebrowTone` and both are public, so a consumer can type a wrapper without a deep import. Eyebrow composes no sibling, so gate 3's usual failure has nothing to bite on. |
| 4 | Are the names final? | **pass, with a finding** | Folder, symbol, CSS prefix `.sunim-Eyebrow`, intent `component` and registry row all read `Eyebrow`. All five props carry doc comments. `tone` and its four values match the node's `Tone` axis exactly, read live. The doc comment that was false is now true and carries its ruling with it. The file's stated *provenance* for the prop names is still wrong — **Finding 1** — which is a wrong sentence about right names. |
| 5 | Are the states complete? | **pass** | All four `EyebrowTone` values have a story, each deep-linked to its node id. Verified in **production** across all 17 rendered instances on the docs page: no `role`, no `tabindex`, **0 focusable descendants**, `aria-hidden="true"` on every mark. `showLabel={false}` genuinely removes the label element on all four tones. There are no interaction states to wire wrongly, and that is a property of the node, not an omission. |
| 6 | Is the intent clear and documented? | **pass** | `Eyebrow.intent.json` is filled, placeholder-free, and true. Its nine `required_tokens` are exactly the nine `var()` references in the component, and all nine resolve on the deployed page. `dont_use_when` names the real trap — using the eyebrow *as* the heading — rather than an imagined one. The docs page renders completely in production. |
| 7 | Do you understand what this version means? | **pass** | `VERSIONING.md` read in full. `since` = `0.1.0` is at the version being cut, not ahead of it. `status` = `settling`, not `stable`, which is the only honest option while the number starts with a zero. Sentence below. |

---

## The five perspectives

### 1 · The consumer who has never seen the code

Done where it is supposed to be done — the production docs page, no source, no
Figma, read before anything else in this review.

All four questions now answer from the page alone. "What is this for" is the
first line. "When should I not use it" is answered explicitly and
uncomfortably — it volunteers the `<span>`/heading trap, points at Chip for
statuses, and rules out anything clickable. "What do I pass it" is a five-row
prop table with types, defaults and live controls.

**The fourth question is gone.** At `7ec481f` the `tone` row's description said
"Sky is the default" while the Default cell in that same row read `'Agentic'` —
a page contradicting itself inside one eye movement. Read at `e723a0a`, that row
now reads:

| cell | content |
|---|---|
| Name | `tone` |
| Description | "… **Sky is the default.** … Note the default is deliberately not the node's first variant, which is `Agentic`. … Recorded in `decisions.md`; a test asserts it …" |
| Default | `'Sky'` |

The row agrees with itself. Better than that, it now explains itself: a consumer
who knows the Figma file and expects `Agentic` is told in the same breath why the
code says otherwise and where the decision is recorded. That is a stronger
outcome than a silently corrected string, because the divergence from the node is
real and permanent and the page no longer hides it.

I scanned every line of the rendered page for a surviving claim that `Agentic` is
the default. There is none. The only remaining sentences pairing "Agentic" with
"default" are the ruling's own explanation and the contrast table, where
`--color-agentic-default` is a token name.

### 2 · The engineer who inherits this in six months

The names are ones I would defend. `tone`, `mark`, `title`, `label`, `showLabel`
are obvious at the call site, and `EyebrowTone`'s values stay capitalised to match
the Figma variant values rather than being lowercased to suit JavaScript taste.

`title` shadowing React's native `title` attribute is still the one costly
decision, and I would still defend the decision. What does not survive checking
is the reason given for it — Finding 1 — and this review found that reason has
now been copied into a second file. Stated plainly: changing `title` after 0.1.0
is a breaking change and, under `VERSIONING.md`, a minor bump. Now is the last
cheap moment.

The `tone` doc comment is the model of what an inheritor needs. It states the
default, states that the default deliberately contradicts the node, says who
ruled it and why, and points at both `decisions.md` and the test that holds it in
place. An inheritor who wants `Agentic` back cannot do it by accident.

### 3 · The keyboard and the screen reader

I tabbed rather than read the field, on the deployed build.

The component is inert by construction: a `<span>`, no `role`, no `tabindex`,
zero focusable descendants across all 17 instances rendered on the docs page.
There is nothing to tab into and nothing to tab out of, which is correct for a
label. The mark carries `aria-hidden="true"` on every instance, so a screen
reader reads "Components / Card" rather than announcing "white diamond". Title
and label are ordinary text in visual order.

`decisions.md` rules colour contrast out of scope repo-wide and explicitly leaves
focus visibility, target size, keyboard reachability and accessible names live. I
checked each of those four against this component. There is no focus to make
visible, no target to size, nothing to reach by keyboard, and no accessible name
to get wrong — every one of them is `n/a` because the component is not
interactive, and that is the node's design rather than an omission. Nothing in
the live half of the ruling is unmet.

This is the perspective that usually disagrees with the documentation. Here it
agrees, including on the uncomfortable parts.

### 4 · The designer

Read live: set `22:43` exposes one axis, `Tone`, with four symbols — `Tone=Agentic`
`22:27`, `Tone=Sky` `22:32`, `Tone=Ink` `22:37`, `Tone=Gold` `22:42`. The props
reach all four. No variant in the set is unreachable through the props, and no
prop invents an axis the design does not have.

**On the default now diverging from the node.** The set's first variant is
`Agentic`; the code ships `Sky`. That is a deliberate, ruled divergence and I
record it against `decisions.md` rather than re-arguing it. It is worth noting
what the ruling bought: the design file itself asks the Agentic tone to stay rare
on any one screen, and a default of `Agentic` meant every careless `<Eyebrow />`
spent it. The ruling makes the code disagree with the node in order to agree with
the design's intent — which is the kind of divergence that needs to be written
down, and is.

On affordance rather than pixels: the component correctly refuses to compose Icon
Slot. The node carries the mark as a `<text>` layer (`22:24`, alongside Title
`22:25` and Label `22:26` — confirmed directly on the node this review), and the
design file's rules page names this as the system's one typographic exception.

**On the width delta, having read `Eyebrow.css` first as instructed.** The block
is accurate and I reproduced every number on production: root 145.73×18 against
the node's 151×18, with the entire deficit in the mark at 8.10px against 14px,
while Title measures 82.24 against 82 and Label 39.39 against 39. The canvas probe
CLAUDE.md prescribes confirms the diagnosis rather than the symptom: `◇` measures
**7.38px in Instrument Sans and 7.38px in a deliberately bogus family** —
byte-identical, the signature of a face that never arrived for that character —
while the control string `Components` measures 75.04 real against 64.68 bogus,
proving the typeface itself loaded. `◻` and `☀` behave the same way (12.00 and
12.00 each). This is a missing glyph range, not a layout bug, it is correctly left
unfixed and escalated upstream, and it has not moved. No finding.

### 5 · The release

`VERSIONING.md` read in full. Sentence below. Nothing in this component claims
more than a `0.x` can carry.

---

## Findings

### Finding 1 — the stated Figma basis for the prop names is not on the node · **does not block**

Raised at `2dbde8a`, re-confirmed at `7ec481f`, **still not fixed**, and now
present in a second file. I was asked to re-judge whether it blocks. It does not,
and the reasoning is below rather than asserted.

**The claim.** `src/components/Eyebrow/Eyebrow.tsx:11-13`: "Prop names and values
mirror the Figma properties exactly: Tone is the one variant property; Mark,
Title, Label and Show Label are the component properties." That claim is then used
at `Eyebrow.tsx:32-37` to justify omitting React's native `title` attribute — "The
Figma property is called Title, CLAUDE.md requires the prop to carry that name
exactly, and React's native `title` … would otherwise collide with it."

**The observation.** Read live this review. Set `22:43` exposes one axis, `Tone`,
with four symbols and nothing else. Inside variant `22:27` are three `<text>`
layers named `Mark` (`22:24`), `Title` (`22:25`) and `Label` (`22:26`). Those are
**layer names, not component properties**, and no property named `Show Label`
appears anywhere on the set — `showLabel` is a sensible engineering addition for
the label-less case, not a mirror of anything in the design.

**New since `7ec481f`.** The same false premise has been copied into the test
suite. `src/components/accessible-props.test.tsx:121-124` now reads: "Eyebrow
omits `title` from its inherited attributes on purpose, because the Figma property
is called Title and the prop has to carry that name; it is skipped rather than
expected to pass." That comment did not exist at `7ec481f` — the file had no
Eyebrow in it at all. The claim has gone from one site to two, and in its new site
it is the written justification for skipping a test case at line 142.

**Why it does not block.** Three reasons, in the order that decided it.

1. **The release does not make it permanent.** A blocking finding is one where
   cutting the version freezes something wrong or makes fixing it expensive.
   This is a comment. It can be corrected in any patch, at any time, with no
   consumer impact, no API change and no version implication. What 0.1.0 *does*
   freeze is the `title` omission itself — and that decision is independently
   correct: `title` is the right name for the loud half whether it came from a
   layer name or a property name, and React's native `title` genuinely would
   collide. **The decision survives its bad reasoning.**
2. **No consumer sees it.** Both sites are `/* */` block comments outside the
   JSDoc that react-docgen publishes. I checked the rendered production page:
   neither the file header nor the `title`-omission rationale appears anywhere on
   it. This is an internal-comment defect, not a published-API defect — which is
   precisely what separated it from the finding that *did* block the last two
   reviews, and that one blocked because it was public and a consumer could act
   on it wrongly.
3. **The names it describes are right.** Mapping props onto the node's layer
   names is a defensible reading of CLAUDE.md's naming rule, and `showLabel` is a
   good prop. Nothing renames. `decisions.md` leaves "any other prop name or value
   diverging" unruled — and no prop name here diverges. The sentence is wrong; the
   surface it describes is not.

**Why it is still worth fixing before 0.1.0 rather than after.** The hazard the
last review named is real and has now doubled: the next person weighing whether to
stop shadowing `title` will read a comment saying the question is settled by a
design constraint that does not exist, and will now find the same statement
seconded by the test suite. The trade-off has never been made on true grounds. It
may well come out the same way — I think it would — but that should be somebody's
decision rather than an inherited misreading.

**Owner.** 🔨 Engineer, to correct both comments to say what the node actually
exposes. 🎨 Human, if the `title` shadow is worth revisiting on the corrected
premise — and 0.1.0 is the last cheap moment.

### Finding 2 — `Synchronization %` is not evidence, and cannot be shown to be broken either · does not block Eyebrow

Carried forward from `7ec481f` unchanged, deliberately not re-argued. The prior
review declined to assert the column "cannot fail" and named what would settle it;
that judgement was right and I am not reopening it.

**Re-checked, briefly.** `fld88iBKmSezw6rzk` and `fldyYyEn5KfFGEuUu` are both
`count` fields on the same record-link field, and the Meta API returns each
config as `{isValid, recordLinkFieldId}` with no filter block — so a filtered and
an unfiltered count remain byte-identical through this API. A filtered query for
any `Staging Testing` row not reading `Passed` returns **0 records**, so the tie
is still unbroken: the data fits "the filter works and everything passed" exactly
as well as "there is no filter".

**Unchanged.** The two checks that would settle it — one component row linked to a
non-`Passed` test record, or a human opening the field editor for
`fld88iBKmSezw6rzk` in the Airtable UI — are both still outstanding.

**Why it does not block Eyebrow.** Gate 1 wants evidence that this component's
tests passed. I did not take that from this column; I opened all four Eyebrow
`Staging Testing` records and read `Passed` on each.

**Owner.** 📋 PM. Repo-wide, not a release question.

---

## Ruled, not re-argued

Recorded against `decisions.md` and carried no further.

- **Colour contrast, repo-wide.** Ruled 2026-08-20, superseding the day-mode
  ruling of 2026-08-19 and widening it to every component and every mode. All four
  Eyebrow tones and the faint label fall under it. Recorded; no finding; no
  measurement re-litigated. I read the *what is not ruled* clause and checked the
  four questions it keeps live — focus visibility, target size, keyboard
  reachability, accessible names — against this component in perspective 3. All
  four are `n/a` on a non-interactive `<span>`, and none is unmet.
- **Eyebrow's default tone is `Sky`, not the node's first variant.** Ruled
  2026-08-20, scope Eyebrow, permanent. The code's divergence from node `22:43` is
  the ruling, not a finding. **Verified complete and consistent** — see the section
  below. Its *what is not ruled* clause names only this default; any other default
  diverging from its node stays reportable, and I found none.
- **`accent-ink` stale export.** Ruled 2026-08-19. `--color-accent-ink` renders
  `#1a78bd`; the live Figma variable reads `#166fb2`. I checked the clause the
  ruling leaves open — "any *other* token drifting … Report it" — against all nine
  tokens this component binds, on production. There is no second drift.

---

## The ruling, verified everywhere

The owner's ruling required the code to move to `Sky` and the prose to stay. I
checked every place either could disagree.

| Site | Reads | Verified |
|---|---|---|
| `Eyebrow.tsx:70` — the actual default | `tone = 'Sky'` | source at `e723a0a` |
| `Eyebrow.tsx:41-49` — the `tone` prop doc | "`Sky` is the default", plus the divergence, the ruling and the test | source |
| `Eyebrow.stories.tsx:61` — component description | "Sky is the default." | source **and** rendered on production |
| `Eyebrow.stories.tsx:117` — the Sky story comment | "Sky — the default." | source |
| `Eyebrow.css:109` — the tone rule comment | "Sky — the default." | source |
| Production docs prop table — Description cell | "Sky is the default" | rendered |
| Production docs prop table — **Default cell** | `'Sky'` | rendered |
| Production runtime, `tone` unset | `class="sunim-Eyebrow sunim-Eyebrow--Sky"`, computed `rgb(43, 164, 236)` = `--color-accent-default` `#2ba4ec` | **live DOM** |
| `accessible-props.test.tsx:176-182` | asserts `sunim-Eyebrow--Sky` | 36/36 pass |
| `decisions.md` | ruled, scoped, permanent, with a *what is not ruled* clause | read |

Two notes on how this was verified, because both matter.

**The runtime check is not the docgen check.** The `'Sky'` in the Default cell is
extracted statically from source at build time, so on its own it proves only what
was compiled. I rendered the Playground story on production with `tone` forced to
`undefined` and read the class off the live DOM. The deployed component's actual
behaviour is `Sky`. That is the claim the docs make, tested the way the docs would
fail.

**The diff is the minimum.** `git diff 7ec481f..e723a0a` on this component touches
one file, eight insertions and one deletion: the default flipped and the
explanatory comment added. Nothing in the CSS, stories, intent or tokens moved —
which is expected, because all four already said `Sky`; only the code was wrong.
Consistency was reached by moving the one thing the owner ruled wrong, and nothing
else was disturbed on the way.

---

## The version sentence

0.1.0 promises that a component called `Eyebrow` exists, is imported from this
package's entry point rather than a deep path, takes these five props under these
names, and renders a marked layer label whose four tones are the four the design
file defines — that a human who did not build it has read all of that against the
node — and that an `<Eyebrow />` written with no tone renders `Sky`, which is a
promise the package now keeps in code, in its published table and in a test, and
which deliberately contradicts the node's first variant because the owner ruled it
so. It promises nothing about whether those names survive to 0.2.0, nothing about
the colour values behind the tones, one of which is a recorded stale export,
nothing about the mark rendering at its designed width while the bound typeface
carries no glyph for it, and nothing at all about colour contrast, which is ruled
out of scope for this release in every mode and every component. It is `settling`,
not stable, and the leading zero is doing real work: a 0.x minor is allowed to
break every one of these names, and if `title` is going to stop shadowing the
native attribute, that is the bump it happens in.

---

## What changed from the previous verdict

The verdict moves from **Blocked** to **Cleared**.

| | At `7ec481f` | At `e723a0a` |
|---|---|---|
| The documented default | **blocked** — prose said `Sky`, code said `Agentic`, both published in one table row | **fixed, ruled, closed** — code defaults `Sky`, verified on the live DOM; the row agrees with itself and explains the node divergence; `decisions.md` covers it with a *what is not ruled* clause |
| Figma provenance of the prop names | does not block | **does not block — re-judged, not carried over.** Reasoning stated in full; severity raised: the claim is now in two files and justifies a skipped test |
| Contrast | measured tone by tone against a day-mode-only ruling | **ruled repo-wide, every mode.** Recorded, not measured, not argued. The live half of the clause checked and unmet in no respect |
| `Synchronization %` | correctly declined to assert the column is broken | **unchanged**, re-checked in two calls, not reopened |
| Tests | 25 across 2 files, **none rendering Eyebrow** | **36 across 2 files.** Eyebrow is in the passthrough loop, its `title` omission skipped as a documented exception, and its default asserted |
| Gate 4 | blocked | **pass**, with a non-blocking finding |

The previous review was right to block, and right that the two fixes available to
it were not equivalent — the owner picked the one that changes what every existing
`<Eyebrow />` renders, which is exactly why it was not the reviewer's to pick.

**A note on what this verdict does mechanically.** `Development`
(`fldOLGT24LDXAzsZ7`) is a formula that returns `Released` when `Astro Link`
(`fldmIejCh2VfmBkmP`) **and** `Release Review` (`fldH6pgPqvGWVE4pU`) are both set
**and** `Release Verdict` (`fld2T74aO1z1bZJIJ`) = `Cleared`. Writing `Cleared` is
therefore not an inert record. Eyebrow's `Astro Link` is empty today, so the row
would stay `Completed` — but `Release Review` currently points at the `7b7310c`
report, and whoever transcribes this verdict should repoint it at the commit this
report lands in, or the row will carry a `Cleared` verdict beside a review that
concluded `Blocked`.

---

## Not checked

- **Night mode, and every mode but day.** Every measurement here is
  `data-theme="day"` — that is what the deployed Storybook served, confirmed on
  the page. The contrast ruling now covers every mode, so nothing turns on this
  for contrast; but I did not evaluate the tones against any other surface, and a
  token that resolves differently per mode would not have been seen.
- **Figma component properties, definitively.** I read the node's structure and
  variant axis over the Figma connection (`get_metadata` on `22:43` and `22:27`).
  Those return layers, variants and sizes. I could not enumerate the set's
  `componentPropertyDefinitions` directly, so Finding 1 says no `Show Label`
  property *appears* on the set — which is what I can support — rather than that
  none is defined.
- **Whether `Synchronization %` is filtered.** Open by construction — Finding 2.
  The Meta API cannot answer it and the current data cannot break the tie.
- **Rendered appearance against the node.** I read the DOM, computed styles and
  measured geometry on production. I did not compare a screenshot of the component
  against a screenshot of the node; QA did that, and this gate is not a re-run
  of QA.
- **That production serves exactly `e723a0a`.** The deploy carries no commit
  stamp I could read. What I can say is that the page renders prose that exists
  only at `e723a0a` — the `tone` doc comment's ruling paragraph — and that the
  live runtime default is `Sky`. Both are post-ruling. I did not verify the
  build's provenance beyond that.
- **Whether correcting Finding 1 would change the `title` decision.** I judged the
  decision defensible on corrected grounds. I did not make that decision, and it
  is not mine to make.
- **The other three components.** Reviewed separately and concurrently. Finding 2
  is repo-wide and will appear in those reviews too; I have not reconciled wording
  with them.
- **Board write-back and commit.** By instruction: `Release Review` and
  `Release Verdict` were **not** written and the verdict is returned for
  transcription; this report was overwritten in the working tree on `main` and
  **not committed or pushed**, which departs from this skill's standing
  instruction to commit and push, and from 📦 Release's standing rule to write only
  on a `release/<version>` branch. Both deviations were directed by the human
  running the review, because three reviews are running concurrently on this tree
  and the orchestrator commits them together so each report URL can be pinned to
  the commit it actually lands in.
