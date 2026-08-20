# Release review — Chip

**Verdict: Blocked.** One blocker remains, down from three. `tone="Figma"` still puts
the design tool's name in a shipped public type union, and no ruling has been made. The
two findings that carried the previous block are both resolved and verified resolved:
Chip's docs page now exists and is reachable, and the intent it ships is now true of the
component it describes. Everything else that blocks is waiting on a human, not on work.

| | |
|---|---|
| Reviewed at | `7ec481f` (`Merge pull request #9 from chawsuhlaing2209/develop/intent-and-links`), on `main` |
| Working tree | clean — `git status --porcelain` empty at review time |
| Version reviewed against | `0.1.0` (`package.json` reads `0.0.1`; the bump is a human act) |
| Registry row | `recgIvFjPq1iIhLCF` · `Development` = `Completed` · `Synchronization %` = `100%` · `Release Verdict` = `Blocked` (the previous verdict, not yet transcribed) |
| Figma | node `21:79`, read live over the Figma MCP |
| Deployed Storybook | <https://sunim-ds-starter.vercel.app/?path=/docs/components-chip--docs> |
| Script | `npm run release-review -- Chip --version 0.1.0` → `CLEAR`, 19 passed · 2 warned · 0 failed · 7 awaiting judgement |
| Previous review | Blocked at `2dbde8a` on findings 1, 2 and 3 |

`CLEAR` from the script means the mechanical half passed. The seven items it handed over
are below; two of them came back as findings, one of them blocking.

---

## What changed since the previous review

| Prior finding | Status now | Evidence |
|---|---|---|
| 1 · No docs page in any deployed Storybook | **Resolved** | `/index.json` on production now returns 74 entries, **4** of `type: "docs"`. `components-chip--docs` is one of them, `tags` include `autodocs`, and the page renders the full component description, the intent block and the generated prop table. Perspective 1 ran for the first time. |
| 2 · `dont_use_when` described the default render, not the surface | **Resolved as a documentation defect** | The false phrase "non-interactive **by construction**" is gone. Both `dont_use_when` and `a11y` now name the mechanism, the consequence and the alternatives, and every clause I checked is true. The surface is unchanged — see Finding 2 below, which is a narrower and different question. |
| 3 · `tone="Figma"` in the public API | **Still stands. No ruling.** | `ChipTone` still exports `'Figma'`; node `21:73` is still named `Tone=Figma`. Nothing in `decisions.md` covers it. **This is the blocker.** |
| 4 · Day-mode contrast ruling covers one of seven modes | **Still stands. No ruling.** | Re-measured all seven modes on the deployed build. Every ratio reproduces the previous table to the hundredth. Recorded against the existing ruling, not re-argued. |
| 5 · Long label overflows its container | **Still stands, non-blocking** | Reproduced: a 40-character label renders a 257px chip inside a 120px parent, no wrap, no ellipsis. |

---

## The seven gates

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Is it actually done? | **Pass** | Registry read at review time: `Development` = `Completed`, `Synchronization %` = `100%`. All 8 Staging Testing rows fetched individually rather than via the rollup — every one reads `Passed`, none reads `Failed` or `Fixed (To re-test)`. Implementation, styles and stories exist; the stories name node `21:79`. `npm run lint` (`tsc --noEmit`) exit 0. `npm test` — 2 files, 25 tests, all passed. |
| 2 | Are the tokens clean? | **Pass** | No raw hex, no raw px outside the `--sunim-Chip-unbound-*` quarantine, no `--primitives-*` reached directly. All five quarantined values confirmed **still unbound on the live node** — see Note A. |
| 3 | Is the public surface decided? | **Pass, with Finding 2 against it** | `Chip`, `ChipProps`, `ChipTone`, `ChipSize` exported from `src/index.ts`; `IconSlot`, `IconSlotProps`, `IconSlotSize` exported too, so the composed dependency is itself on the surface. Nothing is exported that is not meant to be. The *width* of `ChipProps` is a live question, but it is the same width all four components carry — Finding 2. |
| 4 | Are the names final? | **Blocked** | Folder, exported symbol, CSS prefix `.sunim-Chip`, intent `component` and the registry row all read `Chip`. All 5 props carry doc comments. Prop names verified against the node, not the file: Figma's variant properties are `Tone` and `Size`; `21:43`'s children are named `Icon` and `Label`. **Finding 1** — `ChipTone` carries the value `Figma`. |
| 5 | Are the states complete? | **Pass** | All 4 `ChipTone` and both `ChipSize` values have a story; all 8 matrix stories deep-link to their own node (`21:43` … `21:78`), and those eight ids match the eight symbols the live node reports, one for one. The set defines **no State property**, so there is no hover, focus, pressed, disabled or loading to test, and none has been invented. Confirmed on the deployed build: 8 chips, zero focusable elements inside any of them, no `role`, no `tabindex`. |
| 6 | Is the intent clear and documented? | **Pass** | `Chip.intent.json` exists, every field filled, no placeholders. All 17 `required_tokens` resolve in the build and are referenced by `Chip.css`. The intent is now reachable by a consumer — it renders on the deployed docs page — and, read clause by clause against the component, it is **true**. This gate was the previous block; it is clear. |
| 7 | Do you understand what this version means? | **Pass** | `VERSIONING.md` read in full. `since` = `0.1.0` is at the version being cut, not ahead of it. `status` = `settling` — correctly does not claim `stable` while the version starts with a zero. Sentence below. |

---

## The five perspectives

### 1 · The consumer who has never seen the code

**Runnable for the first time, and it passes.** I opened
`https://sunim-ds-starter.vercel.app/?path=/docs/components-chip--docs` and answered the
three questions without opening a source file:

- **What is this for?** "A small label that carries status or a credential. Sm is the
  status tag; Md reads as a credential." Each tone is given a meaning, not just a colour.
- **When should I not use it?** Answered better than most components manage: anything
  clickable (with the reason, and with Button, `<button>` and `<input type="checkbox">`
  named as the alternatives), a section label above a heading (use Eyebrow), and a
  sentence.
- **What do I pass it?** The generated prop table lists all five props with types,
  defaults, required markers and the full doc comment for each.

The page also carries the eight per-story node deep-links, the intent block, and the
`since` / `status` line. Nothing sent me to the source. Gate 6's consumer half is clear.

### 2 · The engineer who inherits this in six months

`Chip` / `.sunim-Chip` / `ChipProps` / `ChipTone` / `ChipSize` are consistent and obvious.
`showIcon` and `icon` follow the convention Button and IconSlot already set, so the three
components agree rather than each inventing a way to hand an icon in. `Sm` / `Md` keep
Figma's casing, applied consistently as a house rule.

The exception is `tone="Figma"` — Finding 1. I would not defend it.

Two smaller things I would not block on:

- The intent lists tokens as `radius.radius.pill` and `spacing.space.2`, doubling the
  category against CLAUDE.md's `category.property.role` convention. The intent is
  *truthful* — the build really does emit `--radius-radius-pill` — so the convention is
  broken by the token export's collection naming, repo-wide, not by Chip.
- Chip is not rendered by any test — Finding 4.

### 3 · The keyboard and the screen reader

Probed the deployed `AllTones` story directly. Eight chips, every one a bare `<span>`:
no `role`, no `tabindex`, no `aria-label`, and **zero** focusable elements inside any of
them. The mark renders as
`<span class="sunim-IconSlot sunim-IconSlot--14" aria-hidden="true">`, so assistive
technology gets `Early bird` and nothing else. Colour is never the only carrier — every
tone ships a word.

**On the IconSlot change in `3d7c9e6`:** it does not change anything for Chip, and I
checked rather than assumed. IconSlot now derives `const name = label ?? ariaLabelProp`
and only sets `aria-hidden` when `name` is absent. Chip calls
`<IconSlot size="14" icon={icon} />` with no `label`, no `aria-label`, no `role` and no
`aria-hidden`, so `name` is `undefined` and the mark still renders `aria-hidden="true"`
with no `role` — confirmed both on the deployed build and by rendering `dist/`. Chip
also exposes no way to reach the inner slot, so a consumer cannot name Chip's mark. That
is the right outcome here rather than a gap: `label` is a required prop, so the text
always carries the meaning and the mark is always decorative.

Where this perspective disagreed with the documentation last time, the documentation has
been corrected. It now agrees.

### 4 · The designer

Read against node `21:79` live. The set is `Tone (Default, Gold, Agentic, Figma) × Size
(Sm, Md)` = 8 symbols, and every one is reachable through the props — no variant exists
in the set that a consumer cannot get to, which is what this perspective actually asks.
The eight symbol ids the node reports match the eight story deep-links one for one.
`showIcon` and `icon` add two affordances beyond the matrix, both of which the design
description asks for, and both have stories.

Two things the design does not offer and the component therefore cannot: no State
property, and no behaviour for a label longer than the one the variants are drawn with —
Finding 5.

### 5 · The release

`VERSIONING.md` read in full. The sentence is below, under **The version sentence**.

---

## Findings

### Finding 1 — `tone="Figma"` puts the design tool's name in the public API · **blocker** · gate 4

*Carried forward from the previous review as finding 3. Still open, still unruled. Not
re-argued at length — confirmed and recorded.*

**What I saw.** `export type ChipTone = 'Default' | 'Gold' | 'Agentic' | 'Figma';` — and
on the live node, symbol `21:73` is genuinely named `Tone=Figma`. The component is right;
the name arrived correctly through the pipeline.

**Why it is still a finding.** `Default`, `Gold` and `Agentic` all name what the chip
*means*. `Figma` names neither a meaning nor an appearance. A consumer reading
`<Chip tone="Figma">Reviewed</Chip>` in an unfamiliar codebase cannot recover the intent,
and the design tool has no business being a value in a shipped package's type union. The
gate's test is "would I defend this in six months." I would not.

**Why it is a human's call and not mine.** Two repo rules collide. CLAUDE.md: *"Prop names
match the Figma property names exactly."* Applied to values as it has been throughout,
that rule produces `Figma`. The release gate asks whether the name survives public
exposure, and it does not. An engineer following the house rule correctly cannot resolve
that, and neither can I.

**The repo has already imagined removing it.** `VERSIONING.md`'s worked example of a
breaking change is, verbatim, "`ChipTone` loses `Figma`". Renaming now is a
`0.1.0 → 0.2.0` minor. Renaming after something outside this repo depends on it is a
major and somebody else's migration.

**Who owns it.** 🎨 Human, as a ruling: keep it and record why, or rename the variant in
Figma and let the pipeline carry it through. A one-line ruling either way clears this gate.

**Not ruled in `decisions.md`.**

---

### Finding 2 — `ChipProps` still permits building a keyboard trap; the docs now say so · **non-blocking, needs a ruling** · gate 3

**This is what is left of the previous review's finding 2, and it is a different finding.**
That one said the intent was *false*. It is now true. What remains is not a documentation
defect but a public-surface question, and the two deserve to be scored differently.

**What I verified myself, against `dist/` rather than source** — this is the packaged
surface a consumer actually gets:

```
INTERACTIVE  : <span role="button" tabindex="0" class="sunim-Chip sunim-Chip--Default sunim-Chip--Sm">
```

and `tsc --noEmit` exits 0 on

```tsx
<Chip label="Filter: unread" role="button" tabIndex={0}
      onClick={() => {}} onKeyDown={() => {}} onKeyUp={() => {}} aria-pressed={true} />
```

type-checked against the **published** `dist/index.d.ts`, not the repo's. `grep` finds no
`:focus` or `:focus-visible` rule anywhere under `src/components/Chip/` — Button has three,
Chip has none. So the result is a control that looks like a chip, responds to a mouse, and
shows a keyboard user nothing.

**Why I am not blocking on it, having blocked on its predecessor.** Four reasons, and I
want them on the record because a reasonable reviewer could go the other way:

1. **Gate 6 asks whether the intent is true, and it now is.** The failure condition the
   skill names for this gate is "the intent describes a component that does not exist yet."
   The intent now describes the component that exists, precisely, including the trap. The
   skill flags `dont_use_when` as the field that usually "describes the misuse somebody
   imagined rather than the one the component invites" — this one opens with *"Anything
   clickable — and note that nothing stops you"* and then explains the mechanism. That is
   the fix that field was asking for.
2. **It is not the defect `3d7c9e6` fixed.** That commit's principle, written into
   `accessible-props.test.tsx`, is "the attributes we advertise on the public type are the
   attributes that come out." Button was *discarding* `disabled`; IconSlot was *discarding*
   `aria-label`. Chip discards nothing — I verified `aria-label`, `id`, `title`,
   `data-testid` and `aria-describedby` all survive the spread. Chip satisfies that
   principle literally. The width of the surface is a separate question from whether the
   surface is honoured.
3. **It is the house pattern, not a Chip decision.** All four components extend their
   element's `HTMLAttributes` and spread. Narrowing Chip alone would make it inconsistent
   with its three siblings on the strength of one reviewer's preference.
4. **0.x is exactly the slot for this.** `status` reads `settling` and `VERSIONING.md` is
   explicit that 0.1.0 promises nothing survives to 0.2.0.

**What makes it a real question anyway.** The repo demonstrably *can* narrow when it has a
reason: `EyebrowProps` is `Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'title'>`.
So omitting is in the repo's vocabulary, and Chip omitting only `'children'` is either a
considered choice or a default that was never examined. Nothing on the board or in
`decisions.md` tells me which.

**My recommendation, which is a recommendation and not a gate.** If a human is going to
spend a minor bump renaming `Figma` (Finding 1), narrowing `ChipProps` in the same bump
costs nothing extra — both are `0.1.0 → 0.2.0` surface changes, and spending one minor on
both is cheaper than spending two. If the ruling on Finding 1 is "keep `Figma`", then this
should be weighed on its own and the true warning is, in my judgement, adequate for 0.1.0.

**Who owns it.** 🎨 Human, as a ruling on the house pattern — ideally for all four
components at once rather than for Chip alone. 📝 Doc Generator's rewrite has already done
everything documentation can do here.

**Not ruled in `decisions.md`.**

---

### Finding 3 — The day-mode contrast ruling covers one of the seven modes Chip renders in · **non-blocking, needs a ruling** · gate 2

*Carried forward from the previous review as finding 4. Confirmed unchanged.*

**Recorded against the existing ruling first.** `decisions.md` → *"Accepted: Chip and
Eyebrow fail WCAG AA contrast in day mode"*, ruled 2026-08-19. I re-measured all seven
modes on the deployed build, computing from resolved `getComputedStyle` values. Day mode
reproduces the ruling **exactly** — Default 4.08, Gold 3.35, Agentic 3.30, Figma 17.75.
No ratio has moved anywhere. Not re-argued, not filed as a defect.

| Mode | Default | Gold | Agentic | Figma |
|---|---|---|---|---|
| day *(ruled)* | 4.08 ✗ | 3.35 ✗ | 3.30 ✗ | 17.75 ✓ |
| open | **4.11 ✗** | 3.35 ✗ | 3.30 ✗ | 17.75 ✓ |
| morning | 4.72 ✓ | 3.35 ✗ | 3.30 ✗ | 17.75 ✓ |
| sunrise | **4.13 ✗** | 3.35 ✗ | 3.30 ✗ | 17.75 ✓ |
| sunset | 4.58 ✓ | 3.35 ✗ | 3.30 ✗ | 17.75 ✓ |
| overcast | 5.20 ✓ | 3.35 ✗ | 3.30 ✗ | 17.75 ✓ |
| night | 8.66 ✓ | 8.26 ✓ | 6.51 ✓ | 14.08 ✓ |

Gold and Agentic bind mode-invariant token pairs, so their failures in the other five
light modes are the same colour pair the owner already accepted — the same finding, wider.
Default is different: `open` resolves `rgb(26,120,189)` on `rgb(226,242,253)` at 4.11 and
`sunrise` resolves `rgb(170,100,32)` on `rgb(253,241,223)` at 4.13. Those are **distinct
token pairs at distinct ratios**, and the ruling's table lists one Chip Default row at 4.08.

The ruling's own carve-out is explicit: *"If you find a new case that fails, or a ratio
that has moved, that is not covered here — report it."* Reporting it, for the second time,
unchanged.

**Why non-blocking.** The cause is a design decision the owner has already ruled
intentional, and Chip renders exactly the pair its node binds. This does not need Chip to
change. It needs the ruling widened, so nobody later reads "accepted in day mode" as
"accepted everywhere".

**Who owns it.** 🎨 Human — extend or re-scope the ruling in `decisions.md`.

---

### Finding 4 — Chip is not rendered by any test · **non-blocking, new** · gate 1

**What I saw.** `3d7c9e6` added `src/components/accessible-props.test.tsx` and took the
suite from 7 tests to 25. Its own comment states the gap it closes is *"not these two lines
specifically, but the whole class: the attributes we advertise on the public type are the
attributes that come out."* The file imports `Button` and `IconSlot`. It does not import
`Chip`, and it does not import `Eyebrow`. Those are the two components in the package that
nothing renders in CI.

**Why it matters.** Chip is currently correct — I verified by rendering `dist/` that
`aria-label`, `id`, `title`, `data-testid` and `aria-describedby` all survive the spread,
and that `className` is combined rather than clobbered. But that correctness rests on my
reading and one ad-hoc render, not on anything that would fail a build. The defect class
`3d7c9e6` exists to catch is precisely the one that produces no type error and no visual
difference, which is to say precisely the one a human reviewer misses.

**Why non-blocking.** It is a gap in coverage, not a defect in the component, and the
behaviour it would protect is verified correct today. It does not change what 0.1.0
promises about Chip.

**Who owns it.** 🔨 Engineer — extend the existing `passthrough` loop in
`accessible-props.test.tsx` to cover `Chip` and `Eyebrow`. Not mine to write: I am the
independent read, and I stop being one the moment I edit.

---

### Finding 5 — A long label grows the pill without limit and overflows its container · **non-blocking** · design gap

*Carried forward from the previous review as finding 5. Reproduced.*

**What I saw.** On the deployed `AllTones` story, a 40-character label rendered a chip
**257px** wide. Placed inside a 120px parent it did not wrap, did not truncate and did not
ellipse — it stayed 257px and overflowed.

**Where.** `src/components/Chip/Chip.css`. `.sunim-Chip` is `display: inline-flex` with
`white-space: nowrap`, so it hugs its content and grows without bound. Two declarations
that look like they handle this do not:

- `overflow: hidden` on `.sunim-Chip` never fires, because the pill is always exactly
  content-sized — nothing can overflow it.
- `word-break: break-word` on `.sunim-Chip__label` is dead code: it cannot take effect
  under the inherited `nowrap`. Confirmed on the deployed build — computed
  `white-space: nowrap`, `word-break: break-word`, `scrollWidth === clientWidth` (215/215).

Measured `text-overflow: clip`, so there would be no ellipsis even if clipping occurred.

**Why it matters.** `dont_use_when` now says *"the pill does not wrap the way a paragraph
does — keep the chip to a word or two."* That is true and clearer than the previous
wording, but it still understates the failure mode: the chip does not merely fail to wrap,
it escapes the card, table cell or list row the `placement` field tells you to put it in.

**Why non-blocking.** The design does not specify it — Figma's eight variants are
fixed-width with one fixed label, so there is no node behaviour to have matched. Chip
faithfully implements a design that is silent here.

**Who owns it.** 🎨 Human first (does Chip cap its width, and does it truncate or wrap?),
then 🔨 Engineer. If the answer is "it does not, callers control it", then `overflow: hidden`
and `word-break` should stop implying otherwise.

---

## Notes that are not findings

**A · The five unbound values are genuinely still open in Figma — verified, not assumed.**
The gate warns that a gap closed in Figma and never re-exported looks identical to one
still open. `get_variable_defs` on node `21:79` returns `"10px":"10"`, `"3px":"3"` and
`"7px":"7"` as **raw literals with no variable name**, and returns no border-width variable
of any kind. That matches `Chip.css`'s quarantine block exactly. The engineer's reasoning
for refusing to map these onto the same-numbered `--spacing-step-*` tokens holds: the same
call returns `var(--space-4)` for Md's *horizontal* padding, so that one axis **is** bound
and the other four are not — the asymmetry is the tell that these are an oversight rather
than a chosen scale.

**B · The `accent-ink` drift is the second ruling, and there is still no third.** Figma
live reads `var(--accent-ink)` = `#166fb2`; the build reads `#1a78bd`. That is
`decisions.md` → *"Accepted: the token export lags Figma on `accent-ink`"*, confirmed and
moved past. The ruling's carve-out — *"One known-stale value is a decision; a second one is
a broken pipeline"* — sent me to check the rest: the other **11** colours on the node match
the build hex-for-hex (`accent-soft` `#e3f1fa`, `line-quiet` `#e2ecf6`, `gold-ink`
`#b57a16`, `gold-soft` `#fff4e0`, `gold-line` `#f2dfbb`, `agentic` `#9b6fd0`,
`agentic-soft` `#f3eef9`, `agentic-line` `#e7dcf4`, `text-heading` `#101828`,
`surface-card` `#ffffff`, `line` `#e7ebf2`). No second drift.

**C · Every staging test row is `state: idle`.** All 8 rows cover tone × size and nothing
else, and I fetched all 8 individually rather than trusting the rollup. That is correct
rather than thin — the set has no State property — but it is worth saying plainly that no
interaction state of Chip has ever been tested, because there is none to test.

**D · The registry's `Commit` for Chip is stale.** It points at `4433336`
(`Merge Chip into staging`), which predates both the `autodocs` tag that made the docs page
exist and the intent rewrite that made the intent true. The row's evidence link therefore
points at a commit where two of this review's inputs were not yet present. Not a Chip
defect and not my column to write; flagged for 🔨 Engineer or 📋 PM.

**E · `Astro Link` is empty on Chip's row.** The `Development` formula requires
`Astro Link` **and** `Release Review` **and** `Release Verdict = Cleared` before a row can
read `Released`, so Chip cannot reach `Released` until 🚀 DevOps writes that link after the
reference site is actually deployed. Noted so nobody reads its absence as a review failure.
Not my column.

---

## The version sentence

**Gate 7, in my own words:**

> 0.1.0 promises that a component called `Chip` exists, is imported from this package's
> root rather than a deep path, takes `tone`, `size`, `label`, `showIcon` and `icon`, and
> renders the eight tone × size variants of Figma node `21:79` using semantic tokens for
> every visual value it has one for — and, new to this review, that a consumer can read all
> of that on a published page instead of in the source. It promises nothing about whether
> those five prop names, or the four values of `ChipTone`, are the names it will still have
> at 0.2.0 — the intent says `settling`, the zero says the minor is the breaking-change
> slot, and Findings 1 and 2 are both live candidates to spend it on. It does not promise
> WCAG AA: six of the eight variants fail it in day mode, that is measured, ruled and
> accepted, and this version ships it knowingly. It does not promise that Chip stays
> non-interactive — only that it will not help you if you make it interactive, which is now
> what the documentation says rather than the opposite. And it does not promise a token
> value is final; two are already recorded as accepted gaps.

---

## Not checked

- **Whether the `onClick` handler fires in a live browser.** I verified that `role` and
  `tabIndex` attach in the built output, that an interactive `Chip` type-checks clean
  against the published `.d.ts`, and that nothing is discarded by the spread. I did not
  mount a React tree and dispatch a click. `onClick` is in `rest` and React binds what it
  is given, and 📝 Doc Generator reports verifying the fire on the deployed build, but that
  last step is corroboration I am citing rather than evidence I produced.
- **The `Show Icon` Figma property name.** `Chip.tsx`'s header comment states the component
  properties are `Label`, `Show Icon` and `Icon`. I confirmed the variant properties `Tone`
  and `Size` from the live symbol names. The MCP's `get_metadata` does not expose
  `componentPropertyDefinitions`, so the boolean's exact name is still taken from the
  engineer's comment, unverified. `showIcon` is the obvious camelCase of it either way.
- **The rendered appearance of the six non-`day` modes.** Finding 3's ratios were computed
  from resolved `getComputedStyle` values, which is exact for contrast. I did not look at
  the six modes to judge whether they *read* well, only whether they measure.
- **The Sm/Md geometry against the node.** QA measured it and every row passed. I did not
  re-measure; that is QA's question, not this gate's.
- **The Astro reference site.** `Astro Link` is empty — see Note E. Gate 6 is satisfied by
  the deployed Storybook docs page, so the reference site is not a condition of this review,
  and I did not look for one.
- **Whether the wide `HTMLAttributes` surface is right for Button, Eyebrow or IconSlot.**
  Finding 2 is a repo-wide pattern and I say so, but one component at a time — I checked the
  other three only far enough to establish that the pattern is shared and that `Eyebrow`
  omits `title`.
- **The packaged consumer experience end to end.** I rendered `Chip` from `dist/` and
  type-checked against `dist/index.d.ts`, which is more than the previous review did. I did
  not run `npm pack` and install the tarball into an empty folder — that is
  release-prepare's steps 6 and 7, and this review says nothing about it.
- **A stable browser session.** Three other reviews share this machine; a concurrent session
  navigated my first tab away mid-measurement. I moved to a dedicated tab and re-ran every
  browser measurement there from a clean load. The repository tree itself was clean and
  unchanged at `7ec481f` throughout.
- **Anything about Button, Eyebrow or IconSlot as components.** One component at a time.
  IconSlot appears here only where Chip composes it.

---

## What would clear this

One thing, and it is not mine to do:

1. **A one-line human ruling on `tone="Figma"`** — keep it and record why, or rename the
   variant in Figma and let the pipeline carry it through.

Findings 2, 3 and 4 want attention too, and Finding 2 is worth deciding *at the same time*
as Finding 1 because both spend the same minor bump — but none of the three should hold
this release on its own.

*No file under `src/` was edited. No version was bumped. Nothing was published, tagged or
deployed. This file was written but not committed, and no Airtable column was written.*
