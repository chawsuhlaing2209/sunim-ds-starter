# Release review — Button

**Reviewed at** `bbffbc5` on `develop/release-gate` · **Date** 2026-08-20
**Figma node** `19:231` · **Registry row** `Button` (`Development` = Completed, `Synchronization %` = 100%)
**Mechanical half** `npm run release-review -- Button` → CLEAR (20 passed · 2 warned · 0 failed · 7 awaiting judgement)

---

## Verdict

**Blocked.** Two of the component's public promises are false in the deployed
build: `disabled` is an accepted, typed prop that the component silently
discards, and `State=Loading` drops keyboard focus to `<body>` with nothing
announced. Neither is ruled in `decisions.md`. Both are cheap to fix now and
expensive to fix after the name is public.

The mechanical half returned CLEAR. Every finding below is from the REVIEW lines
and the five perspectives — which is the point of the gate.

---

## Gate table

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Is it actually done? | **Pass** | Registry `Development` = Completed, `Synchronization %` = 100%, `Design` = Done. All 30 `Staging Testing` rows read `Passed` — no `Failed`, no `Fixed (To re-test)`. Implementation, styles, stories all present; stories name node `19:231`. `npm run lint` (tsc --noEmit) exit 0; `npm test` 7/7 passed. |
| 2 | Are the tokens clean? | **Pass, with a question** | No raw hex, no raw px outside the `--sunim-Button-unbound-*` quarantine, no `--primitives-*` reached directly. Four quarantined unbound values, correctly declared. See Finding 6 for a consistency question about padding. |
| 3 | Is the public surface decided? | **Blocked** | `Button` + `ButtonProps`/`ButtonVariant`/`ButtonSize`/`ButtonState` all exported from `src/index.ts`; composed `IconSlot` is exported too. But the surface also silently accepts and discards `disabled` and `aria-busy` — Finding 1. |
| 4 | Are the names final? | **Pass** | Folder, symbol, CSS prefix `.sunim-Button`, intent `component`, and registry row all read `Button`. All 6 props carry doc comments. Prop names verified **against the node**, not the file: Figma reports `variant`, `size`, `state`, `label`, `showTrailing`, `icon` — a one-for-one match including value casing. See Finding 5 for a judgement note. |
| 5 | Are the states complete? | **Blocked** | All 3 × 2 × 5 = 30 variants have a story, each deep-linked to its node, and all 30 node IDs match the set exactly. Disabled is genuinely inert. But Loading is drawn correctly and behaves wrongly — Finding 2. |
| 6 | Is the intent clear and documented? | **Blocked** | `Button.intent.json` exists, every field filled, no placeholders, and all 12 declared tokens exist in the build and are referenced. But the docs page does not exist in any deployed build (Finding 3), and `required_tokens` under-declares by four (Finding 4). |
| 7 | Do you understand what this version means? | **Pass** | `VERSIONING.md` read. `since` = `0.1.0`, `status` = `settling` — not `stable`, correct for a `0.x` line. Sentence below. |

---

## The five perspectives

### 1 · The consumer who has never seen the code

**This perspective could not be performed, and that is itself the finding.**

The docs page I was pointed at returns:

> Couldn't find story matching 'components-button--docs'.

Not a rendering failure — the entry does not exist. Querying the deployed
`index.json` directly:

```
totalEntries: 69
anyDocsEntryAnywhere: []      ← zero docs entries in the entire deployed build
anyAutodocsTag: []
buttonStoryCount: 34
```

So: what is this for, when should I not use it, what do I pass it? A consumer
cannot answer any of the three without opening the source. Per the skill, that is
a gate 6 finding rather than a note. Written up as Finding 3.

Worth saying plainly: the *content* is good. The intent file is one of the better
ones I have read, and the engineer's prose in `Button.stories.tsx` is genuinely
useful. None of it reaches a reader.

### 2 · The engineer who inherits this in six months

The names hold up. `Button`, `variant`, `size`, `state`, `label`, `showTrailing`,
`icon` — all defensible, all matching Figma, none I would want renamed. The CSS
prefix and BEM-ish slot classes (`__label`, `__trailing`, `__spinner`) are
predictable.

Two things I would raise in a code review:

- The `disabled` passthrough trap (Finding 1). The component already knows the
  fix — it writes `Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>`.
  `disabled` needed to be in that same `Omit` and is not.
- `state` carries five values that are not the same kind of thing (Finding 5).

The comments deserve a note in the other direction: the `Spinner` block, the
inside-stroke `box-shadow` rationale, and the quarantine header all explain *why*
rather than *what*. That is the thing that is usually missing at this stage.

### 3 · The keyboard and the screen reader

Tabbed in, tabbed out, tabbed back, and triggered every state in the deployed
Storybook rather than reading the a11y field.

What holds:

- Real keyboard `Tab` produces a real focus ring on Ghost — the variant whose CSS
  carries a "design to confirm" comment. `:focus-visible` matched, computed
  `box-shadow: rgba(43,164,236,0.4) 0 0 0 3px`, matching `--effect-focus-ring`.
  The intent's claim that focus is visible on all three variants is **true**.
  (My first attempt used `.focus()` and returned `none`; that is programmatic
  focus not matching `:focus-visible`, not a defect. Re-tested with a real
  keypress.)
- `State=Disabled` sets native `disabled`, is unfocusable, `opacity: 0.5`,
  `cursor: not-allowed`. A real click does not fire the handler. Correct.
- The spinner is `aria-hidden`, sized 14×14, animation `running`, and the CSS
  stops it under `prefers-reduced-motion`. The label carries the meaning.
- Md renders 36.2px tall, Lg 46.6px — the intent claims 36 and 47 and reasons
  correctly that Md clears WCAG 2.5.8 (24×24) and misses 2.5.5 AAA (44×44) while
  Lg clears both. Measured, accurate.

What does not:

- `State=Loading` drops focus and cannot be refocused. Finding 2. This is the
  perspective disagreeing with the documentation, and per the skill the
  documentation is what is wrong.

### 4 · The designer

Against node `19:231`. Every one of the 30 variants in the set is reachable
through the props, and each story is deep-linked to the node it was built from —
no variant exists in the design that the API cannot express.

The node's own description says:

> Hover, Focus, Disabled and Loading are real states, not decoration: build them
> into the screen rather than shipping Default only.

That is the designer asking for Loading to be used in production, which is what
makes Finding 2 a real defect rather than a theoretical one. The affordance the
design meant to offer is a working loading state; what ships looks right and
strands the keyboard.

Also from the node, recorded and not re-argued: `--accent-ink` reports `#1a78bd`
via `get_variable_defs` while the generated context carries a `#166fb2` fallback.
That is the drift already ruled in `decisions.md` (2026-08-19, accepted, not
scheduled). Not a new finding.

### 5 · The release

`VERSIONING.md` read. Sentence below under "The version sentence".

---

## Findings

### Finding 1 — `disabled` is a public, typed prop that the component silently discards · **Blocker** · gate 3, gate 4 · owner 🔨 Engineer

**What I saw.** `<Button label="Save" disabled />` type-checks cleanly and renders
a fully enabled button.

**Where.** `src/components/Button/Button.tsx`. `ButtonProps` extends
`Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>` — `disabled` is *not*
in that `Omit`, so it is part of the public type. The render then spreads `rest`
first and sets `disabled` after, so the consumer's value is always overwritten:

```tsx
<button
  {...rest}                              // consumer's `disabled` lands here
  type={type}
  className={classes}
  disabled={isDisabled || isLoading}     // …and is overwritten here, always
  aria-busy={isLoading || undefined}     // same for aria-busy
>
```

**Evidence, both halves.** Type level — a standalone file importing the real
component compiles with zero errors for `disabled` and for `aria-busy`. Runtime,
against the **deployed production build** via Storybook args
(`?args=disabled:!true`):

```
passedDisabledTrueViaProps: true
renderedDisabledAttr:       false      ← ignored
clickHandlerFired:          1          ← fires anyway
focusable:                  true
opacity:                    "1"        cursor: "pointer"
```

**Why it blocks.** `disabled={isSubmitting}` is the single most common React
button idiom and every other library honours it. Here it type-checks, reads
correctly in review, and produces a button that keeps submitting. It fails
silently and in the direction of doing the action more times, not fewer.

The fix is the pattern the file already uses one line earlier — add `disabled`
(and `aria-busy`) to the existing `Omit`, so the compiler rejects what the
runtime ignores. I am not making that change: a change made after the review is a
change nobody reviewed.

### Finding 2 — `State=Loading` drops keyboard focus irrecoverably; `aria-busy` announces nothing · **Blocker** · gate 5, gate 6 · owner 🔨 Engineer

**What I saw.** A focused button entering Loading blurs to `<body>` and cannot be
refocused.

**Where.** `Button.tsx` sets `disabled={isDisabled || isLoading}` — Loading marks
the button natively disabled, which removes it from the tab order.

**Evidence.** Reproducing the exact DOM mutation React performs when `state` flips
to `Loading` on the same element (deployed build, Primary Md Default):

```
before:  { focused: true,  active: "BUTTON.sunim-Button …" }
after:   { focused: false, active: "BODY.sb-main-padded" }
refocus: { canRefocus: false }
```

And on the Loading story itself:

```
disabledAttr: true    ariaBusy: "true"    reachableByFocus: false
```

**Why it blocks.** The real sequence is: user tabs to the button, presses Enter,
the app sets `state="Loading"`. At that moment focus is silently thrown to the
top of the document. A screen reader user loses their place with no announcement,
and `aria-busy="true"` is announced to nobody — it sits on an element that is no
longer reachable, and `aria-busy` is not a live region, so it does not announce
on its own.

This makes the prop's own doc comment false:

> `Disabled` and `Loading` are behavioural: both mark the button non-interactive,
> and `Loading` also announces itself with `aria-busy`.

It does not announce itself. That sentence is the one a consumer would rely on to
decide they need no further a11y work, which is what makes it worse than silence.
The intent's `a11y` field repeats the same mechanism and inherits the same
problem.

This is precisely the case gate 5 names — a state that renders correctly and
behaves wrongly — and the design explicitly asks for this state to ship
(perspective 4). Not in `decisions.md`; not previously ruled.

### Finding 3 — Button has no docs page in any deployed build · **Blocker** · gate 6 · owner 🔨 Engineer / 🚀 DevOps

**What I saw.** The docs URL returns "Couldn't find story matching
'components-button--docs'", and the deployed `index.json` contains **zero** docs
entries across all 69 entries and all four components.

**Where.** `tags: ['autodocs']` exists in `src/components/Button/Button.stories.tsx`
only on the unmerged `develop/release-gate` branch. Verified:

```
main contains e46893c:            NO
staging contains e46893c:         NO
origin/main / origin/staging:     NO
```

Production Storybook is served from `main` (`734160d`), which has neither the
autodocs tag nor `src/index.ts` at all.

**Why it blocks.** `VERSIONING.md` states that 0.1.0 promises "each one has a
documented prop API and a documented intent". Today a consumer gets neither: no
prop table, no description, no intent block. The commit that adds the tag says so
itself — "the prose was already here and already invisible."

At the reviewed commit the tag *is* present, so this will likely resolve on the
next deploy. I am still recording it as a blocker rather than a note, for one
reason: the docs page has never rendered anywhere, so `intentDoc(asIntent(intentJson))`
is unproven. It compiles; nobody has seen its output. A promise whose delivery
mechanism has never once run is not a promise I can clear.

### Finding 4 — the intent under-declares its token dependencies by four · gate 6 · owner 📝 Doc Generator

**What I saw.** `required_tokens` lists 12 tokens. The component references 16.

**Where.** `Button.intent.json` vs `Button.css`. Referenced but not declared:

```
spacing-step-10   spacing-step-14   spacing-step-18   spacing-step-26
```

These are not incidental — they set the padding on every one of the 30 variants
(`--spacing-step-10/18` for Md, `--spacing-step-14/26` for Lg).

**Why it matters.** The mechanical gate checks the forward direction only —
declared tokens exist and are referenced — and passes. The reverse direction is
not checked and fails. Anyone theming from `required_tokens`, which is the field's
whole purpose, would ship a Button with no padding and no error.

This is the gate 6 distinction in practice: the field is *filled in* correctly and
is not *true*.

### Finding 5 — `state` conflates story-only appearance with real behaviour · non-blocking · gate 4 · owner 🔨 Engineer

`ButtonState` offers five values that are two different kinds of thing:

- `Hover`, `Focus` — pin an appearance on. Story devices; setting either in
  production means a button permanently painted as hovered.
- `Disabled`, `Loading` — real behaviour, changing what the button does.

A consumer reading the prop table sees five peers. The doc comment does explain
the split clearly, which is why this is not a blocker — but "would I defend this
in six months" is the gate 4 test, not "is this wrong", and I would rather defend
a `state` of `Default | Disabled | Loading` with the two pinned appearances behind
something that reads as a story-only affordance.

Raising it now because it is the kind of change that costs a rename later and
nothing today. Worth a human's call rather than mine.

### Finding 6 — padding is bound to number-matching `step` tokens while four sibling unbound values are quarantined · non-blocking · gate 2 · owner 🎨 Human / 🔨 Engineer

`Button.css` opens with an explicit policy:

> quarantined in this one block, deliberately NOT mapped onto a semantic token
> that happens to share the same number — doing that would disguise a design gap
> as a binding and hide it from the next person.

Four values follow that policy. The paddings do not. On the node,
`get_variable_defs` returns every bound value in `var(--…)` form
(`var(--space-2)`, `var(--radius-pill)`, `var(--accent-ink)`) but returns the four
paddings as bare literals — `"18px": "18"`, `"10px": "10"`, `"26px": "26"`,
`"14px": "14"`. The CSS nonetheless binds them to `--spacing-step-18/10/26/14`,
tokens whose names encode their own pixel value (`--spacing-step-18: 18px`).

I am flagging rather than concluding, because I cannot fully distinguish "Figma
reports an unbound literal" from "Figma reports a variable named `18px`" from
that output alone. `spacing.step.*` is a real exported family in `tokens/tokens.json`,
so reading (a) is possible. But if these paddings are genuinely unbound on the
node, then four gaps are quarantined and four identical ones are bound to
number-matching tokens — the exact thing the header says it refuses to do — and
the count of open design gaps is understated by four.

One question to design closes it: are the Button paddings bound to `step/N` in
Figma, or raw?

---

## The version sentence

*Gate 7, in my own words:*

Cutting Button into **0.1.0** would promise that a component called `Button`
exists under that name, is imported from the package root rather than a deep
path, takes the six props `variant`, `size`, `state`, `label`, `showTrailing` and
`icon` under exactly those names, and renders the 30 combinations that Figma node
`19:231` defines. It promises those *names* are the ones we intend to keep, and
that a human reviewed them rather than a script.

It deliberately promises **nothing about stability** — `status` reads `settling`,
and under a leading zero a minor bump may break any of it without ceremony. It
does not promise the token values are final (`decisions.md` records two accepted
gaps), does not promise the padding scale is bound rather than transcribed, and —
critically, until Findings 1 and 2 are closed — it must not be read as promising
that `disabled` does anything or that `Loading` is safe for a keyboard user.

That last clause is why the verdict is Blocked rather than Cleared with caveats.
A version cannot carry a promise with an asterisk on the two things a consumer is
most likely to reach for first.

---

## Not checked

- **Whether the docs page renders correctly once deployed.** I did not run
  `build-storybook` to find out. The working tree is shared with three concurrent
  reviews and a release-prepare run; writing `storybook-static/` into it risked
  polluting another agent's `npm pack` file list. So Finding 3 establishes that
  the page is *absent*, not that its content is *wrong* — those are different
  claims and I am only making the first.
- **Screen reader output.** I verified focus order, `disabled`, `aria-busy`,
  `aria-hidden` and the accessible name programmatically. I did not run VoiceOver
  or NVDA. Finding 2's claim that `aria-busy` announces nothing rests on the
  element being unreachable and `aria-busy` not being a live region, which is
  specification-level reasoning, not an observed announcement.
- **Colour contrast for Button's own variants.** `decisions.md` rules on Chip and
  Eyebrow only. I measured no ratios for Button's three variants; QA's 30 passed
  rows cover appearance against the node, which is a different question from AA.
  Nobody has stated a Button contrast result either way.
- **The four `spacing.step.*` bindings at source.** Finding 6 is raised as a
  question precisely because I could not resolve it from the MCP output.
- **`npm test` coverage of Button.** The suite passes 7/7, but the only project
  test file is `src/tokens/token-binding.test.ts`. There are no component tests
  at all, so "tests pass" says nothing about Button's behaviour. Findings 1 and 2
  are both cases a single render test would have caught.
- **The uncommitted working tree.** `package.json`, `.gitignore`,
  `scripts/bundle-css.mjs`, `tsconfig.build.json` and `vite.config.ts` are dirty
  or untracked — the concurrent release-prepare run, not mine. `Button.tsx` and
  `Button.css` are byte-identical between `origin/main` and the reviewed commit,
  which is what makes testing against the deployed build valid; but I did not
  review the packaging changes and they are not part of this verdict.
- **Registry write.** Not performed, by instruction. `Release Review` and
  `Release Verdict` are to be transcribed by the orchestrator with this report
  pinned to the commit it lands in.
