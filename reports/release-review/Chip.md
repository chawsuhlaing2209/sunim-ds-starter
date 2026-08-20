# Release review — Chip

**Verdict: Blocked.** Chip's code, tokens and public surface are release-grade. Its
*documentation* is not reachable by anyone outside this repository — no docs page exists
in any deployed Storybook — and the intent it ships describes a component more constrained
than the one it actually exports. One name, `tone="Figma"`, needs a human ruling before it
goes into a public version.

| | |
|---|---|
| Reviewed at | `2dbde8a` (`Make this repository a package`) |
| Chip's evidence at | `bbffbc5` — `src/components/Chip/`, `src/components/IconSlot/`, `src/index.ts`, `build/tokens/`, `decisions.md`, `VERSIONING.md` are byte-identical between `bbffbc5` and `2dbde8a`; the concurrent commit touched packaging only |
| Version reviewed against | `0.1.0` (`package.json` reads `0.0.1`; the bump is a human act) |
| Registry row | `recgIvFjPq1iIhLCF` · `Development` = `Completed` · `Synchronization %` = `100%` |
| Figma | node `21:79`, read live over the Figma MCP |
| Deployed Storybook | <https://sunim-ds-starter.vercel.app/?path=/story/components-chip--default-sm> |
| Script | `npm run release-review -- Chip --version 0.1.0` → `CLEAR`, 19 passed · 2 warned · 0 failed · 7 awaiting judgement |

`CLEAR` from the script means the mechanical half passed. Three of the seven items it
handed over came back as findings.

---

## The seven gates

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Is it actually done? | **Pass** | Registry `Development` = `Completed`, `Synchronization %` = `100%`, 8 of 8 Staging Testing rows read `Passed`, none reads `Failed` or `Fixed (To re-test)`. Implementation, styles and stories all exist; the stories name node `21:79`. `npm run lint` (`tsc --noEmit`) exit 0. `npm test` — 1 file, 7 tests, all passed. Read from the board at review time, not from an earlier audit. |
| 2 | Are the tokens clean? | **Pass** | No raw hex, no raw px outside the `--sunim-Chip-unbound-*` quarantine, no `--primitives-*` reached directly. All five quarantined values confirmed **still unbound on the live node** — see Note A. |
| 3 | Is the public surface decided? | **Pass** | `Chip`, `ChipProps`, `ChipTone`, `ChipSize` exported from `src/index.ts`. `IconSlot`, `IconSlotProps`, `IconSlotSize` exported too, so the composed dependency is itself on the surface — a consumer typing a wrapper never reaches a type it cannot import. Registry `Composes` = Icon Slot, and Icon Slot's `Composed Into` names Chip. Nothing is exported that is not meant to be. |
| 4 | Are the names final? | **Blocked** | Folder, exported symbol, CSS prefix `.sunim-Chip`, intent `component`, and the registry row all read `Chip`. All 5 props carry doc comments. Prop names verified against the node, not the file: Figma's variant properties are `Tone` and `Size`, and `21:43`'s children are named `Icon` and `Label` → `tone`, `size`, `icon`, `label`. **Finding 3** — `ChipTone` carries the value `Figma`. |
| 5 | Are the states complete? | **Pass** | All 4 `ChipTone` and both `ChipSize` values have a story; all 8 matrix stories are deep-linked to their own node (`21:43` … `21:78`). The set defines **no State property**, so there is no hover, focus, pressed, disabled or loading to test — and none has been invented, which is the correct call. The three states the gate warns about (disabled, loading, focus) do not exist here by design. Confirmed on the deployed build: no focusable element inside any of the 8 chips, no `role`, no `tabindex`. |
| 6 | Is the intent clear and documented? | **Blocked** | `Chip.intent.json` exists, every field filled, no placeholders. All 17 `required_tokens` resolve in `build/tokens/css/tokens.css` and all 17 are referenced by `Chip.css` — counted by hand, not taken from the script. **Findings 1 and 2.** |
| 7 | Do you understand what this version means? | **Pass** | `VERSIONING.md` read. `since` = `0.1.0` is at the version being cut, not ahead of it. `status` = `settling` — correctly does not claim `stable` while the version starts with a zero. Sentence below. |

---

## The five perspectives

### 1 · The consumer who has never seen the code

**This perspective could not be performed.** That is Finding 1.

The docs page named in the brief —
`https://sunim-ds-starter.vercel.app/?path=/docs/components-chip--docs` — returns
*"Couldn't find story matching 'components-chip--docs'"*. It is not a Chip-specific
problem: `index.json` on production contains 69 entries and **zero** of `type: "docs"`.
Staging is the same — 69 entries, zero docs. There is no Astro reference site either;
`Astro Link` is empty on all four component rows.

So the three questions the gate asks — what is this for, when should I not use it, what do
I pass it — I answered from `Chip.tsx`, `Chip.intent.json` and `Chip.stories.tsx`. By the
skill's own words, reaching for the source to answer those means the docs have failed.

### 2 · The engineer who inherits this in six months

The names are, with one exception, ones I would defend. `Chip` / `.sunim-Chip` /
`ChipProps` / `ChipTone` / `ChipSize` are consistent and obvious. `showIcon` and `icon`
follow the convention Button and IconSlot already set, so the three components agree
rather than each inventing a way to hand an icon in. `Sm` / `Md` keep Figma's casing,
which is a defensible house rule applied consistently.

The exception is `tone="Figma"` — Finding 3.

One smaller thing I would not block on: the intent lists tokens as `radius.radius.pill`
and `spacing.space.2`, doubling the category against CLAUDE.md's stated
`category.property.role` convention (`radius.sm`, `spacing.md`). The intent is *truthful* —
the build really does emit `--radius-radius-pill` and `--spacing-space-2` — so the
convention is being broken by the token export's collection naming, repo-wide, not by
Chip. Not a Chip finding; worth someone's attention when the export is next touched.

### 3 · The keyboard and the screen reader

Tabbed the deployed `AllTones` story. Tab order walks straight past all eight chips —
zero focusable elements inside any of them, no `role`, no `tabindex`, no handler. The mark
renders as `<span class="sunim-IconSlot sunim-IconSlot--14" aria-hidden="true">`, so
assistive technology gets `Early bird` and nothing else. Colour is never the only carrier:
every tone ships a word.

For the component as it renders by default, the intent's `a11y` field is accurate,
including its honest note about the contrast ruling.

Where this perspective disagreed with the documentation is the *surface*, not the render —
Finding 2. And per the skill, when they disagree, the documentation is what is wrong.

### 4 · The designer

Read against node `21:79` live. The set is `Tone (Default, Gold, Agentic, Figma) × Size
(Sm, Md)` = 8 symbols, and every one is reachable through the props — no variant exists in
the set that a consumer cannot get to, which is what this perspective is actually asking.
`showIcon` and `icon` add two affordances beyond the matrix, both of which the design
description asks for, and both have stories.

Two things the design does not offer and the component therefore cannot: no State
property, and no behaviour for a label longer than the one the variants are drawn with —
Finding 5.

### 5 · The release

`VERSIONING.md` read in full. The sentence is below, under **The version sentence**.

---

## Findings

### Finding 1 — There is no docs page for Chip in any deployed Storybook · **blocker** · gate 6

**What I saw.** `https://sunim-ds-starter.vercel.app/?path=/docs/components-chip--docs`
renders *"Couldn't find story matching 'components-chip--docs'"*. Production `index.json`:
69 entries, **0** with `type: "docs"`; `components-chip--default-sm` carries
`tags: ["dev","test","manifest"]` and no `autodocs`. Staging `index.json`: identical.

**Where.** `src/components/Chip/Chip.stories.tsx` *does* set `tags: ['autodocs']`, and its
own comment says *"Without this there is no docs page at all — and every word of the
description below, and the intent appended after this meta, renders nowhere."* That is
correct, and it is currently the situation: `git log -S autodocs` puts that line in
`e46893c`, which exists **only on `develop/release-gate`**. The registry's `Commit` for
Chip is `4433336` (`Merge Chip into staging`), which predates it and added
`Chip.stories.tsx` without the tag. So the ~40 lines of component description, the eight
per-story node deep-links, the generated prop table, and the entire `intentDoc(...)` block
are authored and unreachable.

**Why it blocks rather than notes.** VERSIONING.md says 0.1.0 promises that each component
"has a documented prop API and a documented intent". The intent file exists and is good.
What does not exist is anywhere a consumer can *read* it. Clearing Chip would mean clearing
it on the strength of its source, which is the exact failure gate 6 is positioned to catch.

**Who owns it.** Merging `develop/release-gate` (or cherry-picking `e46893c`) is a repo
decision for 🎨 Human; redeploying Storybook afterwards is 🚀 DevOps. This is not a
finding for 🔨 Engineer — the work is done, it is on the wrong branch.

**Not ruled in `decisions.md`.**

---

### Finding 2 — `dont_use_when` describes the default render, not the surface · **blocker** · gate 6

**What I saw.** `Chip.intent.json` says, in `dont_use_when`:

> Anything clickable: a Chip renders a `<span>` with no handler, no focus, and no role, so
> a filter the user can toggle is a Button or a checkbox, not this.

and in `a11y`:

> Non-interactive **by construction**.

**Where.** `src/components/Chip/Chip.tsx`:

```ts
export interface ChipProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
```

with `...rest` spread onto the `<span>`. `HTMLAttributes<HTMLSpanElement>` carries
`onClick`, `onKeyDown`, `tabIndex` and `role`, so this compiles clean — verified, `tsc`
exit 0, on a probe file kept outside the repo tree:

```tsx
<Chip label="Filter: unread" onClick={() => {}} tabIndex={0} role="button" onKeyDown={() => {}} />
```

The handler attaches. `Chip.css` draws no `:focus-visible` ring for any tone, so the result
is a control that looks like a chip, responds to a mouse, and shows a keyboard user
nothing — the precise misuse the intent warns against, reached without a single type error
or lint warning.

**Why it blocks.** "By construction" is the false word. Chip is non-interactive **by
default** and interactive **by prop spread**. The skill names `dont_use_when` as the field
that is usually aspirational, and this is that case: it describes the misuse somebody
imagined rather than the one the component invites. A consumer who reads the intent, trusts
it, and ships `<Chip onClick={...}>` has been told the door was locked.

**Who owns it, and the two ways out.** Either 📝 Doc Generator rewrites `dont_use_when` and
`a11y` to say what is actually true — *the surface permits `onClick`; do not use it,
because no focus or key handling comes with it* — or 🔨 Engineer narrows `ChipProps` so
the claim becomes structurally true. The second is a surface change and therefore a release
decision, not a cleanup. I have not made either; I am the last independent read.

**Not ruled in `decisions.md`.**

---

### Finding 3 — `tone="Figma"` puts the design tool's name in the public API · **blocker** · gate 4

**What I saw.** `export type ChipTone = 'Default' | 'Gold' | 'Agentic' | 'Figma';` — and
on the node, symbol `21:73` is genuinely named `Tone=Figma`. The component is right; the
name arrived correctly.

**Why it is still a finding.** `Default`, `Gold` and `Agentic` all name what the chip
*means* — everyday, earned, an AI moment. `Figma` names neither a meaning nor an
appearance; it is the design file's internal shorthand for *"the pill stays quiet and the
mark carries the colour"*. A consumer reading `<Chip tone="Figma">Reviewed</Chip>` in an
unfamiliar codebase cannot recover the intent, and the design tool has no business being a
value in a shipped package's type union.

The test is "would I defend this in six months." I would not.

**What makes this a human's call rather than mine.** Two repo rules collide. CLAUDE.md:
*"Prop names match the Figma property names exactly."* Applied to values as it has been
throughout, that rule produces `Figma`. The release gate asks whether the name survives
public exposure, and it does not. An engineer following the house rule correctly cannot
resolve that, and neither can I.

**Note the repo has already imagined removing it.** VERSIONING.md's worked example of a
breaking change is, verbatim, "`ChipTone` loses `Figma`". Renaming now is a `0.1.0 → 0.2.0`
minor. Renaming after something outside this repo depends on it is a major and somebody
else's migration.

**Who owns it.** 🎨 Human, as a ruling: keep it and record why, or rename the variant in
Figma and let the pipeline carry it through. A one-line ruling either way clears this gate.

**Not ruled in `decisions.md`.**

---

### Finding 4 — The day-mode contrast ruling covers one of the seven modes Chip renders in · **non-blocking, needs a ruling** · gate 2

**Recorded against the existing ruling first.** `decisions.md` → *"Accepted: Chip and
Eyebrow fail WCAG AA contrast in day mode"*, ruled 2026-08-19. I re-measured on the
deployed build and the day-mode numbers reproduce the ruling **exactly** — Default 4.08,
Gold 3.35, Agentic 3.30, Figma 17.75. No ratio has moved. Not re-argued, not filed as a
defect.

**What is not covered.** The ruling names `day`. `.storybook/preview.ts` ships seven modes
and `build/tokens/css/tokens.css` defines all seven. Measured live on
`components-chip--all-tones`, computed from `getComputedStyle` at each `data-theme`:

| Mode | Default | Gold | Agentic | Figma |
|---|---|---|---|---|
| day *(ruled)* | 4.08 ✗ | 3.35 ✗ | 3.30 ✗ | 17.75 ✓ |
| open | **4.11 ✗** | 3.35 ✗ | 3.30 ✗ | 17.75 ✓ |
| morning | 4.72 ✓ | 3.35 ✗ | 3.30 ✗ | 17.75 ✓ |
| sunrise | **4.13 ✗** | 3.35 ✗ | 3.30 ✗ | 17.75 ✓ |
| sunset | 4.58 ✓ | 3.35 ✗ | 3.30 ✗ | 17.75 ✓ |
| overcast | 5.20 ✓ | 3.35 ✗ | 3.30 ✗ | 17.75 ✓ |
| night | 8.66 ✓ | 8.26 ✓ | 6.51 ✓ | 14.08 ✓ |

Gold and Agentic bind mode-invariant token pairs, so their failures in the other five light
modes are the same colour pair the owner already accepted — the same finding, wider. Default
is different: `open` resolves `#1a78bd` on `#e2f2fd` at 4.11 and `sunrise` resolves
`#aa6420` on `#fdf1df` at 4.13. Those are **distinct token pairs at distinct ratios**, and
the ruling's table lists one Chip Default row at 4.08.

The ruling's own carve-out is explicit: *"If you find a new case that fails, or a ratio that
has moved, that is not covered here — report it."* Reporting it.

**Why non-blocking.** The cause is the design decision the owner has already ruled
intentional, and Chip renders exactly the pair its node binds — there is no version of Chip
that both passes AA and matches the design. This does not need Chip to change. It needs the
ruling widened, so that nobody later reads "accepted in day mode" as "accepted everywhere".

**Who owns it.** 🎨 Human — extend or re-scope the ruling in `decisions.md`.

---

### Finding 5 — A long label grows the pill without limit and overflows its container · **non-blocking** · design gap

**What I saw.** On the deployed `Playground` story with a 43-character label, the chip
measured **352.3px wide**. Placed inside a 120px parent it did not wrap, did not truncate
and did not ellipse — it stayed 352px and overflowed.

**Where.** `src/components/Chip/Chip.css`. `.sunim-Chip` is `display: inline-flex` with
`white-space: nowrap`, so it hugs its content and grows without bound. Two declarations
that look like they handle this do not:

- `overflow: hidden` on `.sunim-Chip` never fires, because the pill is always exactly
  content-sized — nothing can overflow it.
- `word-break: break-word` on `.sunim-Chip__label` is dead code: it cannot take effect under
  the `nowrap` the label inherits (confirmed — computed `white-space: nowrap`,
  `word-break: break-word`, `scrollWidth === clientWidth`).

Measured `text-overflow: clip`, so there would be no ellipsis even if clipping did occur.

**Why it matters.** `dont_use_when` says *"Long text: it does not wrap the way a paragraph
does."* That is true and understated. A consumer reading it expects graceful degradation;
what actually happens is the chip escapes the card, table cell or list row the intent tells
them to put it in.

**Why non-blocking.** The design does not specify it — Figma's eight variants are
fixed-width with one fixed label, so there is no node behaviour to have matched. Chip
faithfully implements a design that is silent here.

**Who owns it.** 🎨 Human first (does Chip cap its width, and does it truncate or wrap?),
then 🔨 Engineer. If the answer is "it does not, callers control it", that belongs in
`dont_use_when` in stronger words, and `overflow: hidden` / `word-break` should stop
implying otherwise.

---

## Notes that are not findings

**A · The five unbound values are genuinely still open in Figma — verified, not assumed.**
The gate warns that a gap closed in Figma and never re-exported looks identical to one
still open. `get_variable_defs` on node `21:79` returns `"10px":"10"`, `"3px":"3"` and
`"7px":"7"` as **raw literals with no variable name**, and returns no border-width variable
of any kind. That matches `Chip.css`'s quarantine block exactly — `padding-x-sm: 10px`,
`padding-y-sm: 3px`, `padding-y-md: 7px`, `border-width-sm: 1px`, `border-width-md: 1.5px`.
The engineer's reasoning for refusing to map these onto the same-numbered
`--spacing-step-*` tokens is, in my read, correct and worth keeping: Md's *horizontal*
padding **is** bound, to `--space-4`, and that asymmetry is the tell that the others are an
oversight rather than a chosen scale.

**B · The `accent-ink` drift is the second ruling, and there is no third.** Figma live
reads `--accent-ink` = `#166fb2`; the build reads `#1a78bd`. That is
`decisions.md` → *"Accepted: the token export lags Figma on `accent-ink`"*, confirmed and
moved past. The ruling's carve-out — *"One known-stale value is a decision; a second one is
a broken pipeline"* — sent me to check the rest: the other **11** colours on the node match
the build hex-for-hex (`accent-soft` `#e3f1fa`, `line-quiet` `#e2ecf6`, `gold-ink`
`#b57a16`, `gold-soft` `#fff4e0`, `gold-line` `#f2dfbb`, `agentic` `#9b6fd0`,
`agentic-soft` `#f3eef9`, `agentic-line` `#e7dcf4`, `text-heading` `#101828`,
`surface-card` `#ffffff`, `line-default` `#e7ebf2`). No second drift. Nothing to report.

**C · Every staging test row is `state: idle`.** All 8 rows cover tone × size and nothing
else. That is correct rather than thin — the set has no State property — but it is worth
saying plainly that no interaction state of Chip has ever been tested, because there is
none to test.

---

## The version sentence

**Gate 7, in my own words:**

> 0.1.0 promises that a component called `Chip` exists, is imported from this package's
> root rather than a deep path, takes `tone`, `size`, `label`, `showIcon` and `icon`, and
> renders the eight tone × size variants of Figma node `21:79` using semantic tokens for
> every visual value it has one for. It promises nothing about whether those five prop
> names, or the four values of `ChipTone`, are the names it will still have at 0.2.0 — the
> intent says `settling`, the zero says the minor is the breaking-change slot, and Finding
> 3 is a live candidate to spend it on. It does not promise WCAG AA: six of the eight
> variants fail it in day mode, that is measured, ruled and accepted, and this version
> ships it knowingly. It does not promise that Chip is safe to make clickable, whatever its
> props currently let you pass. And it does not promise a token value is final — two are
> already recorded as accepted gaps.

---

## Not checked

- **The docs page itself.** The whole of perspective 1. It does not exist to be checked —
  see Finding 1. Everything I know about Chip's documentation, I know from source, which
  is the wrong direction and is why gate 6 is blocked rather than noted.
- **The `Show Icon` Figma property name.** `Chip.tsx`'s header comment states the component
  properties are `Label`, `Show Icon` and `Icon`. I confirmed `Label` and `Icon` directly —
  node `21:43`'s children are named exactly that — and confirmed the variant properties
  `Tone` and `Size` from the symbol names. The MCP's `get_metadata` does not expose
  `componentPropertyDefinitions`, so the boolean's exact name is taken from the engineer's
  comment, unverified. `showIcon` is the obvious camelCase of it either way.
- **The rendered appearance of the six non-`day` modes.** Finding 4's ratios were computed
  from resolved `getComputedStyle` values, which is exact for contrast. I did not look at
  the six modes to judge whether they *read* well, only whether they measure.
- **The Sm/Md geometry against the node.** QA measured it (0.41px systemic, attributed to
  the renderer) and every row passed. I did not re-measure; that is QA's question, not this
  gate's.
- **The packaged consumer experience.** Whether `dist/` actually exports `Chip` and ships
  `Chip.css` is release-prepare's steps 6 and 7, running concurrently in another session.
  This review says nothing about it.
- **A stable working tree.** Three other reviews and a release-prepare run share this tree.
  `HEAD` moved from `bbffbc5` to `2dbde8a` mid-review, and `.gitignore` and `package.json`
  changed under me. I verified Chip's evidence is byte-identical across that move
  (`git diff bbffbc5 2dbde8a -- src/components/Chip/ src/components/IconSlot/ src/index.ts
  build/tokens/ decisions.md VERSIONING.md` is empty), so the findings hold at `2dbde8a` —
  but I did not re-run every check against the newer commit.
- **Anything about Button, Eyebrow or IconSlot.** One component at a time. IconSlot appears
  here only where Chip composes it.

---

## What would clear this

Three things, none of which are mine to do:

1. Get `e46893c`'s `autodocs` tag and intent block onto the deployed Storybook, and confirm
   `components-chip--docs` opens.
2. Make `dont_use_when` and `a11y` true of the surface — by rewriting them, or by narrowing
   `ChipProps`.
3. A one-line human ruling on `tone="Figma"`: keep it, or rename it.

Findings 4 and 5 want rulings too, but neither should hold the release.

*No file under `src/` was edited. No version was bumped. Nothing was published, tagged or
deployed.*
