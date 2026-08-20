# Release review — Chip

**Verdict: Cleared.** The single blocker is gone. `tone="Figma"` is now `tone="Quiet"`,
the owner has ruled it in `decisions.md`, and the rename is complete and consistent
everywhere I could reach — the type rejects `'Figma'`, the CSS class ships as
`.sunim-Chip--Quiet`, and the deployed story ids read `components-chip--quiet-sm` and
`--quiet-md`. Nothing else blocks. Three findings remain, all non-blocking, and two of
them are new consequences of the rename rather than defects in the component.

| | |
|---|---|
| Reviewed at | `e723a0a` (`Merge pull request #10 from chawsuhlaing2209/develop/review-followups`), on `main` |
| Working tree | clean — `git status --porcelain` empty at review time |
| Version reviewed against | `0.1.0` (`package.json` reads `0.0.1`; the bump is a human act) |
| Registry row | `recgIvFjPq1iIhLCF` · `Development` = `Completed` · `Synchronization %` = `100%` · `Release Verdict` = `Blocked` (the prior verdict, now transcribed) |
| Figma | node `21:79`, read live over the Figma MCP |
| Deployed Storybook | <https://sunim-ds-starter.vercel.app/?path=/docs/components-chip--docs> |
| Script | `npm run release-review -- Chip --version 0.1.0` → `CLEAR`, 19 passed · 2 warned · 0 failed · 7 awaiting judgement |
| Previous review | Blocked at `7ec481f` on finding 1 (`tone="Figma"`) |

`CLEAR` from the script means the mechanical half passed. The seven items it handed over
are below.

---

## What changed since the previous review

| Prior finding | Status now | Evidence |
|---|---|---|
| 1 · `tone="Figma"` in the public API | **Ruled, and the ruling is implemented.** Blocker cleared. | `decisions.md` → *"Accepted: Chip's fourth tone is `Quiet`, which the node calls `Figma`"*, ruled 2026-08-20, scope Chip, permanent. Rename verified complete in five places — see **Rename verification** below. |
| 2 · `ChipProps` permits a keyboard trap | **Re-judged. Still non-blocking.** Surface unchanged. | `ChipProps` is still `Omit<HTMLAttributes<HTMLSpanElement>, 'children'>`. I reached a different route to the same score, and I found the prior review's central claim slightly overstated — see Finding 1. |
| 3 · Contrast in 6 of 7 modes | **Ruled repo-wide.** Recorded, not re-argued. | `decisions.md` → *"Accepted: colour contrast is out of scope for this release, repo-wide"*, ruled 2026-08-20, every component, every mode. It names Chip's `open` (4.11) and `sunrise` (4.13) cases explicitly. Not a finding in this review. |
| 4 · No test renders Chip | **Addressed.** | Suite is 2 files / **36 tests**, up from 25. Chip is in the `passthrough` loop for `id`, `title`, `data-testid` and `aria-describedby`, and `Chip is Default and Sm` asserts both defaults. |
| 5 · Long label overflows | **Reproduced exactly. Still non-blocking.** | 36-character label → **251px** chip inside a **122px** host, overflowing. See Finding 3. |

---

## Rename verification — `Figma` → `Quiet`

The task this review was asked to do first. Five places, all consistent:

| Where | Evidence |
|---|---|
| Type | `Chip.tsx:29` — `export type ChipTone = 'Default' \| 'Gold' \| 'Agentic' \| 'Quiet';` |
| Type, empirically | Compiled `const revert: ChipTone = 'Figma'` against the real type: **`error TS2322: Type '"Figma"' is not assignable to type 'ChipTone'`**. `'Quiet'` compiled clean. The old value is genuinely gone, not merely shadowed. |
| CSS class | `.sunim-Chip--Quiet` in `Chip.css:114`, and present in the **deployed** stylesheet — I enumerated `document.styleSheets` and got exactly 8 Chip selectors, `.sunim-Chip--Quiet` among them, no `.sunim-Chip--Figma`. |
| Stories | `QuietSm` / `QuietMd` at nodes `21:73` / `21:78`; `argTypes.tone.options` reads `['Default','Gold','Agentic','Quiet']`; `AllTones` renders `tone="Quiet"`. |
| Deployed story ids | Production `/index.json`: `components-chip--quiet-sm`, `components-chip--quiet-md`. **No `--figma-*` id exists.** |
| Deployed prop table | The docs page control for `tone` renders `Default Gold Agentic Quiet`, default `'Default'`. |

**The ruling covers it.** `decisions.md` names the value, names the collision with CLAUDE.md,
gives the reasoning, and states the carve-out: *"any other prop name or value diverging"* is
**not** ruled. This review found no second divergence — the node's variant properties are
`Tone` and `Size`, and `tone`, `size` map to them exactly; `label`, `showIcon`, `icon` follow
the component properties.

**How the divergence is pinned.** `decisions.md`'s two other ruled divergences each name a
test that makes reverting deliberate. `Quiet` has no such test — but it does not need one:
the stories pass `tone="Quiet"` through `StoryObj<typeof meta>`, so reverting the union
fails `npm run lint` (`tsc --noEmit`). The pin exists, by typecheck rather than by
assertion. Recorded so nobody reads the missing test as a hole.

**One place the rename did not reach** — Finding 2, and it is consumer-facing.

---

## The seven gates

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Is it actually done? | **Pass** | Registry read at review time: `Development` = `Completed`, `Synchronization %` = `100%`. All 8 Staging Testing rows fetched individually — every one reads `Passed`, none reads `Failed` or `Fixed (To re-test)`. `npm run lint` (`tsc --noEmit`) exit 0. `npm test` — 2 files, **36** tests, all passed. Implementation, styles and stories exist; the stories name node `21:79`. |
| 2 | Are the tokens clean? | **Pass** | No raw hex, no raw px outside the `--sunim-Chip-unbound-*` quarantine, no `--primitives-*` reached directly. All five quarantined values confirmed **still unbound on the live node** — see Note A. No second token drift — see Note B. |
| 3 | Is the public surface decided? | **Pass, with Finding 1 against it** | `Chip`, `ChipProps`, `ChipTone`, `ChipSize` exported from `src/index.ts`; `IconSlot`, `IconSlotProps`, `IconSlotSize` exported too, so the composed dependency is itself on the surface. Nothing is exported that is not meant to be. The *width* of `ChipProps` is a live question — Finding 1, non-blocking. |
| 4 | Are the names final? | **Pass** *(was Blocked)* | Folder, exported symbol, CSS prefix `.sunim-Chip`, intent `component` and the registry row all read `Chip`. All 5 props carry doc comments. Prop names verified against the live node, not the file: variant properties are `Tone` and `Size`. The one value diverging from the node is `Quiet`, **ruled**. Finding 2 is against the docs prose, not the names. |
| 5 | Are the states complete? | **Pass** | All 4 `ChipTone` and both `ChipSize` values have a story. The 8 deployed story ids map one-for-one onto the 8 symbols `get_metadata` reports for `21:79` (`21:43`…`21:78`). The set defines **no State property**, so there is no hover, focus, pressed, disabled or loading to test, and none has been invented. Confirmed on the deployed build: 8 chips, **zero** focusable elements inside any of them, no `role`, no `tabindex`, no `aria-label`. |
| 6 | Is the intent clear and documented? | **Pass** | `Chip.intent.json` exists, every field filled, no placeholders. All 17 `required_tokens` resolve in the build and are referenced by `Chip.css`. The intent renders on the deployed docs page and, read clause by clause against the component, it is **true** — including the `dont_use_when` clause that names the trap. |
| 7 | Do you understand what this version means? | **Pass** | `VERSIONING.md` read in full. `since` = `0.1.0` is at the version being cut, not ahead of it. `status` = `settling` — correctly does not claim `stable` while the version starts with a zero. Sentence below. |

---

## The five perspectives

### 1 · The consumer who has never seen the code

Opened the docs page only. All three questions answerable without a source file: what it is
for (a status tag at Sm, a credential at Md, with a meaning given for each tone), when not to
use it (anything clickable — with the mechanism, the consequence and three named
alternatives; a section label, use Eyebrow; a sentence), and what to pass it (the generated
table lists all five props with types, defaults, required markers and full doc comments).

**One thing sent me back to the source, and that is the gate 6 test.** The page's own prose
says *"The Figma component set is Tone (Default, Gold, Agentic, **Figma**)"* — while the
control two blocks below offers `Quiet`. A consumer who trusts the prose writes
`tone="Figma"` and gets a type error. Finding 2.

### 2 · The engineer who inherits this in six months

`Chip` / `.sunim-Chip` / `ChipProps` / `ChipTone` / `ChipSize` are consistent and obvious.
`showIcon` and `icon` follow the convention Button and IconSlot already set. `Sm` / `Md` keep
Figma's casing as a house rule.

**`Quiet` I would defend**, which is the gate's actual test and the reason the prior block is
gone. It names what the tone does — the pill stays quiet, the mark carries the colour — and
the doc comment records what the node calls it, so the pipeline's disagreement is discoverable
rather than mysterious.

Two things I would not block on: the intent's `radius.radius.pill` / `spacing.space.2`
doubling (truthful — the build really emits `--radius-radius-pill` — so the convention is
broken by the token export's collection naming, repo-wide, not by Chip), and the two dead CSS
declarations in Finding 3.

### 3 · The keyboard and the screen reader

Probed the deployed `AllTones` story. Eight chips, every one a bare `<span>`: no `role`, no
`tabindex`, no `aria-label`, and **zero** focusable descendants. The mark renders
`<span class="sunim-IconSlot sunim-IconSlot--14" aria-hidden="true">`, so assistive
technology gets `Early bird` and nothing else. Colour is never the only carrier — every tone
ships a word.

**`decisions.md` explicitly keeps this perspective live.** The contrast ruling's carve-out
names *"focus visibility, target size, keyboard reachability and accessible names"* as still
reportable. So I checked them rather than treating the ruling as covering the area: target
size and reachability are not applicable to a non-interactive label, the accessible name is
the required `label`, and focus visibility is Finding 1.

**On IconSlot dropping `label`: it changes nothing for Chip, and I checked rather than
assumed.** IconSlot now derives `const name = ariaLabelProp` — the `label ?? ` fallback is
gone entirely. Chip calls `<IconSlot size="14" icon={icon} />` with no `label` and no
`aria-label`, so `name` is `undefined`, and the mark renders `aria-hidden="true"` with no
`role` — confirmed on the deployed build. Chip never passed `label`, so there was nothing to
break. Chip also exposes no way to reach the inner slot, which is right rather than a gap:
`label` is required, so the text always carries the meaning and the mark is always decorative.
IconSlot is still exported, so gate 3's composed-sibling condition still holds.

### 4 · The designer

Read against node `21:79` live. The set is `Tone (Default, Gold, Agentic, Figma) × Size
(Sm, Md)` = 8 symbols, and every one is reachable through the props — the fourth through
`tone="Quiet"`, by ruling. No variant exists in the set that a consumer cannot get to.
`showIcon` and `icon` add two affordances beyond the matrix, both asked for by the design
description, both with stories.

Two things the design does not offer and the component therefore cannot: no State property,
and no behaviour for a label longer than the one the variants are drawn with — Finding 3.

### 5 · The release

`VERSIONING.md` read in full. The sentence is below.

---

## Findings

### Finding 1 — `ChipProps` still permits building a keyboard trap · **non-blocking** · gate 3

*The prior review's finding 2, re-judged on request. I reach the same score by a different
route, and I found its central claim overstated.*

**What I verified.** `ChipProps` is unchanged: `Omit<HTMLAttributes<HTMLSpanElement>,
'children'>`. On the deployed build I gave a Chip `role="button"` and `tabindex="0"`; it
took focus. I then enumerated every `:focus` rule in the entire deployed document:

```
.sunim-Chip, .sunim-Chip--Sm, .sunim-Chip--Md, .sunim-Chip--Default,
.sunim-Chip--Gold, .sunim-Chip--Agentic, .sunim-Chip--Quiet, .sunim-Chip__label
   → 8 Chip selectors, ZERO with :focus

focus rules in the whole document → 4, all Storybook's own chrome
   (.sb-hidden-until-focus, #storybook-highlights-menu button:focus-visible)
```

**Where I disagree with the prior review.** It concluded a keyboard user "shows nothing." I
could not reproduce that as stated: programmatic `.focus()` does not trigger `:focus-visible`,
and Chip ships no `outline: none` either — so what a keyboard user actually sees falls to the
host application's reset or the UA default. The defensible claim is narrower and still worth
recording: **this package ships no focus appearance for Chip**, so it makes no promise about
one. That is a weaker finding than the previous review's, not a stronger one.

**Why non-blocking for 0.1.0.** As shipped there is nothing to focus — eight chips, zero
focusable descendants, verified on production. Nothing in the package invites the misuse: no
story renders an interactive chip, and the docs steer to Button, `<button>` and
`<input type="checkbox">` by name. The intent states the trap, the mechanism and the
consequence — the most honest `dont_use_when` in the repo. It is the house pattern all four
components share, so narrowing Chip alone would make it the odd one out on one reviewer's
preference. And `status` reads `settling` against a version that promises nothing survives
to 0.2.0.

**Who owns it.** 🎨 Human, as a ruling on the house pattern for all four components at once.
If a minor is ever spent renaming something, narrowing this in the same bump costs nothing
extra.

**Not ruled in `decisions.md`** — and note the contrast ruling explicitly does *not* cover it.

---

### Finding 2 — The deployed docs page still lists `Figma` as a tone · **non-blocking, new** · gates 4 and 6

**What I saw**, on the production docs page, in the component description:

> **The matrix.** The Figma component set is Tone (Default, Gold, Agentic, **Figma**) × Size
> (Sm, Md) = 8 variants, and there is one story per variant, each deep-linked to its node.

Two blocks below, on the same page, the generated control for `tone` reads
`Default  Gold  Agentic  Quiet`, and the story headings read `Quiet Sm` and `Quiet Md`.

**Where.** `src/components/Chip/Chip.stories.tsx:53` — the `parameters.docs.description.
component` string. It is the **only** consumer-facing place `Figma` still appears as a tone
value; every other occurrence on the page is either a node deep-link or the `tone` doc
comment's deliberate *"the node calls this tone `Figma`"*, which is the ruling working
as intended.

**Why it is a finding and not a nitpick.** The sentence is not false — it describes the Figma
set, and the Figma set genuinely is `Tone=Figma`. But it is the page's only enumeration of
the tones, it is placed above the prop table, and nothing in that paragraph tells the reader
the code says something different. This is precisely the failure the previous review's gate 6
was about: a consumer answering "what do I pass it?" from the page gets a value the compiler
rejects. The ruling was applied to the type, the CSS, the stories and the story ids, and
stopped one string short.

**Why non-blocking.** The prop table is generated from the type, so the authoritative answer
on the same page is correct, and the `tone` doc comment explains the divergence a few lines
later. A consumer who writes `tone="Figma"` gets a compile error immediately, not a silent
wrong render.

**Who owns it.** 🔨 Engineer — the stories prose is the engineer's, by that file's own
comment. One string, in the file the rename already touched.

---

### Finding 3 — A long label grows the pill without limit and overflows its container · **non-blocking** · design gap

*Carried forward. Re-judged on request; reproduced on the deployed build.*

**What I measured**, cloning a deployed chip into a fixed 120px host:

```
label 36 chars → chip 251px inside a 122px host → overflows: true
white-space: nowrap   overflow: hidden   text-overflow: clip
label word-break: break-word
scrollWidth 251 === clientWidth 251
```

**Where.** `src/components/Chip/Chip.css`. `.sunim-Chip` is `display: inline-flex` with
`white-space: nowrap`, so it hugs its content and grows without bound. Two declarations that
look like they handle this cannot:

- `overflow: hidden` never fires — the pill is always exactly content-sized, so
  `scrollWidth === clientWidth` and there is nothing to clip.
- `word-break: break-word` on `.sunim-Chip__label` is dead under the inherited `nowrap`.

**Why still non-blocking.** The design is silent: the eight variants are drawn at fixed widths
with one fixed label, so there is no node behaviour Chip failed to match. The intent warns
(*"the pill does not wrap the way a paragraph does — keep the chip to a word or two"*), and
0.1.0 promises nothing here. This does not need Chip to change before the name goes public.

**What I would still record.** The warning understates the failure mode — the chip does not
merely fail to wrap, it escapes the card, table cell or list row that `placement` tells you
to put it in. And the two dead declarations actively imply a clipping behaviour that cannot
occur, which will cost the next engineer an afternoon.

**Who owns it.** 🎨 Human first (does Chip cap its width, and does it truncate or wrap?), then
🔨 Engineer. If the answer is "callers control it", `overflow: hidden` and `word-break` should
stop implying otherwise.

---

## Notes that are not findings

**A · The five unbound values are genuinely still open in Figma — verified, not assumed.**
`get_variable_defs` on `21:79` returns `"10px":"10"`, `"3px":"3"` and `"7px":"7"` as **raw
literals with no variable name**, and returns no border-width variable of any kind. That
matches `Chip.css`'s quarantine exactly. The engineer's refusal to map these onto the
same-numbered `--spacing-step-*` tokens holds: the same call returns `var(--space-4)` for Md's
*horizontal* padding, so one axis is bound and the other four are not — the asymmetry is the
tell that this is an oversight rather than a chosen scale.

**B · Still exactly one token drift, so the pipeline is not broken.** `accent-ink` reads
`#166fb2` live and `#1a78bd` in the build — `decisions.md` → *"Accepted: the token export lags
Figma on `accent-ink`"*. Its carve-out (*"a second one is a broken pipeline"*) sent me to check
the rest. I measured all four tones on the deployed build and compared to the node: `accent-soft`
`#e3f1fa`, `line-quiet` `#e2ecf6`, `gold-ink` `#b57a16`, `gold-soft` `#fff4e0`, `gold-line`
`#f2dfbb`, `agentic` `#9b6fd0`, `agentic-soft` `#f3eef9`, `agentic-line` `#e7dcf4`,
`text-heading` `#101828`, `surface-card` `#ffffff`, `line-default` `#e7ebf2` — **all 11 match
hex-for-hex.** No second drift. Geometry, radius, gap and fonts also match the QA rows exactly.

**C · Contrast: ruled repo-wide, recorded, not re-argued.** `decisions.md` → *"Accepted:
colour contrast is out of scope for this release, repo-wide"* supersedes the day-mode ruling
and names Chip's `open` (4.11) and `sunrise` (4.13) cases explicitly — the two the previous
review reported as new. The token pairs I measured are unchanged from that ruling's table, so
no ratio has moved and nothing suggests a token drifted. Not a finding in this review.

**D · Two Staging Testing rows name a story id that no longer exists.** `recQQrpSckJNSa2hz`
and `recmXxxXVhHM4vWbF` carry `Story ID` = `components-chip--figma-sm` / `--figma-md` and are
named `Chip · Figma · Sm` / `Md`. Production `/index.json` has only `--quiet-sm` / `--quiet-md`,
so those two evidence links are dead. The rows' substance survives — each names its node
(`21:73`, `21:78`) and carries full measurements — and `Case` = `Figma` is still true of the
node, so this is a stale deep link rather than lost evidence. Flagged for 🚦 QA or 📋 PM.
**Not my column to write.**

**E · The registry's `Commit` for Chip is stale.** It points at `4433336`
(`Merge Chip into staging`), which predates the rename, the intent rewrite and the test
additions — three of this review's inputs. Not a Chip defect and not my column; flagged for
🔨 Engineer or 📋 PM.

**F · `Astro Link` is empty on Chip's row.** The `Development` formula requires `Astro Link`
**and** `Release Review` **and** `Release Verdict = Cleared` before a row can read `Released`,
so Chip cannot reach `Released` until 🚀 DevOps writes that link after the reference site is
deployed. Noted so nobody reads its absence as a review failure. **Not my column.**

**G · `VERSIONING.md`'s worked example is now historical.** *"`ChipTone` loses `Figma`"* has
happened. `decisions.md` acknowledges this in the ruling itself, so it is recorded rather than
reported. The same line is mirrored at `docs/src/content/docs/start/versioning.md:43`; the
ruling's acknowledgement covers it in substance.

**H · Every staging test row is `state: idle`.** All 8 cover tone × size and nothing else.
That is correct rather than thin — the set has no State property — but worth saying plainly
that no interaction state of Chip has ever been tested, because there is none to test.

---

## The version sentence

**Gate 7, in my own words:**

> 0.1.0 promises that a component called `Chip` exists, is imported from this package's root
> rather than a deep path, takes `tone`, `size`, `label`, `showIcon` and `icon`, and renders
> the eight tone × size variants of Figma node `21:79` using semantic tokens for every visual
> value it has one for — and that a consumer can read all of that on a published page instead
> of in the source. New to this version, it promises that the fourth tone is called `Quiet`
> and not `Figma`: that is a deliberate, ruled divergence from the design file, made before
> publication so it costs no migration, and it is the one place in this component where the
> code and the node disagree on purpose. It promises nothing about whether those five prop
> names, or the four values of `ChipTone`, are the names they will still have at 0.2.0 — the
> intent says `settling`, and the leading zero says the minor is the breaking-change slot. It
> does not promise WCAG AA: six of the eight variants fail it in day mode, that is measured,
> ruled out of scope repo-wide, and this version ships it knowingly. It does not promise that
> Chip stays non-interactive — only that it will not help you if you make it interactive, and
> specifically that it ships no focus appearance, which is what the documentation now says.
> And it does not promise a token value is final; two are recorded as accepted gaps.

---

## Not checked

- **Whether a real keyboard user sees a focus ring on a misused Chip.** I established the
  package ships no `:focus` rule for Chip and that no global rule catches it. I did not drive
  a real Tab key through a host application with its own reset, so what such a user actually
  sees is host-dependent and unmeasured here. This is why Finding 1 is scored narrower than
  the previous review scored it.
- **Whether the `onClick` handler fires in a live browser.** I verified `role` and `tabIndex`
  attach and that focus lands. I did not mount a React tree and dispatch a click. The intent
  claims it fires and the previous review cites corroboration; I am repeating that rather than
  reproducing it.
- **The `Show Icon` Figma property name.** I confirmed the variant properties `Tone` and
  `Size` from the live symbol names. `get_metadata` does not expose
  `componentPropertyDefinitions`, so the boolean's exact name still rests on the engineer's
  header comment. `showIcon` is the obvious camelCase of it either way.
- **The rendered appearance of the six non-`day` modes.** Contrast is ruled out of scope, so
  I measured day mode only — enough to confirm no token pair moved. I did not judge how the
  other six *read*.
- **The Sm/Md geometry against the node.** I confirmed the deployed computed values match the
  QA rows exactly, but I did not independently re-measure against the node. That is QA's
  question, not this gate's.
- **The Astro reference site.** `Astro Link` is empty — Note F. Gate 6 is satisfied by the
  deployed Storybook docs page, so the site is not a condition of this review.
- **Whether the wide `HTMLAttributes` surface is right for Button, Eyebrow or IconSlot.**
  Finding 1 is a repo-wide pattern and I say so, but one component at a time.
- **The packaged consumer experience end to end.** I did not run `npm pack` or install the
  tarball into an empty folder — those are release-prepare's steps 6 and 7, and this review
  says nothing about them.
- **Anything about Button, Eyebrow or IconSlot as components.** IconSlot appears here only
  where Chip composes it, and only far enough to confirm its `label` removal changes nothing
  for Chip.
- **A stable branch.** Three other reviews share this machine, and `main` moved under me
  mid-review: `HEAD` went `e723a0a` → `c470a9e` (*"Let the reference site take whatever port
  it is given"*). I checked rather than assumed — that commit touches `.claude/launch.json`
  and `docs/astro.config.mjs` only. Nothing under `src/`, no ruling, no version, nothing
  Chip reads. Every finding above was gathered at `e723a0a` and is unchanged at `c470a9e`.
  The only modified files in the tree are the three concurrent reviews' own reports.
- **A stable browser session.** I created my own tab rather than reusing the one already open
  on IconSlot, and ran every measurement there from a clean load.

---

*No file under `src/` was edited. No version was bumped. Nothing was published, tagged or
deployed. This file was overwritten but not committed or pushed, per the deviations set for
this run, and no Airtable column was written — the verdict below is returned for
transcription by a human.*

**For transcription to the board** (row `recgIvFjPq1iIhLCF`):

| Column | Value |
|---|---|
| `Release Verdict` | `Cleared` |
| `Release Review` | the URL of this file at `e723a0a`, once committed |
