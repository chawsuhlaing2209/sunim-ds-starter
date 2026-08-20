# Release review — Button

**Reviewed at** `7ec481f` on `main` · **Date** 2026-08-20 · **Re-review** (supersedes the review at `bbffbc5`)
**Figma node** `19:231` · **Registry row** `Button` (`Development` = Completed, `Synchronization %` = 100%)
**Mechanical half** `npm run release-review -- Button --version 0.1.0` → CLEAR (20 passed · 2 warned · 0 failed · 7 awaiting judgement)
**Working tree** clean — `git status --porcelain` empty. Everything below was tested against the deployed production build at https://sunim-ds-starter.vercel.app.

---

## Verdict

**Blocked** — on two things, neither of which is the defect that blocked it last time.

Three of the previous review's four blockers are genuinely closed, verified rather
than taken on report. What remains is one false sentence and one unruled number:

1. The `state` prop's doc comment still tells a consumer that `Loading`
   "announces itself with `aria-busy`". It does not, and the intent block on the
   **same published page** now says so in as many words. One page, two opposite
   accessibility claims, and the false one sits in the prop table.
2. Ghost's label measures **4.35:1** on `--color-surface-page` — below AA, on a
   surface the intent's own `placement` field names. `decisions.md` rules on Chip
   and Eyebrow only and explicitly asks for new failing cases to be reported.

Neither needs a redesign. The first is a one-line edit to a comment whose correct
wording already exists twenty lines away in the intent. The second needs a human
to rule, not an engineer to fix.

**I part company with the previous review on the substance of its Finding 2.**
The focus behaviour it blocked on is real and I reproduced it exactly — but I do
not think it blocks a release on its own any more. See Finding 2 for why.

---

## Gate table

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Is it actually done? | **Pass** | Registry read live: `Development` = Completed, `Synchronization %` = 100%, `Design` = Done. All 30 `Staging Testing` rows roll up to `Passed` only — 0 failed, no `Fixed (To re-test)`. Implementation, styles, stories present; stories name node `19-231`. `npm run lint` (tsc --noEmit) exit 0. `npm test` **25 passed across 2 files** — up from 7 across 1, and for the first time a test renders a component. |
| 2 | Are the tokens clean? | **Pass** | No raw hex; the only `px` outside the quarantine is the word "2px" inside a prose comment (line 149). Four quarantined `--sunim-Button-unbound-*` values, correctly declared. The prior review's open question about the four paddings is **resolved in the component's favour** — see Finding 6. |
| 3 | Is the public surface decided? | **Pass** | `Button` + `ButtonProps`/`ButtonVariant`/`ButtonSize`/`ButtonState` exported from `src/index.ts`; composed `IconSlot` and its types exported too, so no reachable-but-unimportable type. The prior blocker here — `disabled` and `aria-busy` accepted and discarded — is closed and verified on the deployed build (Finding 1). |
| 4 | Are the names final? | **Pass, with a note** | Folder, symbol, CSS prefix `.sunim-Button`, intent `component`, registry row all read `Button`. Variant property names verified **against the node**: `get_metadata` on 19:231 returns `Variant=Primary\|Secondary\|Ghost`, `Size=Md\|Lg`, `State=Default\|Hover\|Focus\|Disabled\|Loading` across all 30 symbols — one-for-one with the props, casing included. Notes: Finding 5 (carried, non-blocking) and Finding 7 (new, non-blocking). |
| 5 | Are the states complete? | **Pass** | All 30 matrix variants have a story, each deep-linked to its node; all 30 node IDs cross-checked against `get_metadata` and match exactly (19:62 … 19:230). Disabled is genuinely inert. Loading is wired — it disables, spins, and sets `aria-busy`. Its focus consequence I now judge a documented limitation rather than an unwired state; reasoning in Finding 2. |
| 6 | Is the intent clear and documented? | **Blocked** | The docs page now exists and renders (Finding 3 closed), `required_tokens` is exact in both directions (Finding 4 closed), and the `a11y` field is true clause by clause — I re-tested every claim in it. But the page it renders on contradicts itself: Finding 2. |
| 7 | Do you understand what this version means? | **Pass** | `VERSIONING.md` read. `since` = `0.1.0` = the version being cut; `status` = `settling`, correctly not `stable` under a leading zero. `package.json` still reads `0.0.1` — the human bump, untouched. Sentence below. |

---

## The five perspectives

### 1 · The consumer who has never seen the code

**Runnable for the first time, and it passes.** The deployed `index.json` now
carries 74 entries, 4 of type `docs`:

```
total: 74   byType: { docs: 4, story: 70 }
docsEntries: components-button--docs, components-chip--docs,
             components-eyebrow--docs, components-iconslot--docs
```

`components-button--docs` resolves and renders 7,616 characters. Reading only
that page, with no source and no Figma:

- **What is this for?** "The action. Primary is the one thing this view wants you
  to do, and there is one per view." Answered.
- **When should I not use it?** Three concrete misuses, and all three are ones the
  component actually invites rather than ones somebody imagined: navigation (no
  `href`, invisible to middle-click and crawlers), an icon on its own (use
  IconSlot), a second Primary. This is the field the skill warns is usually
  aspirational. It is not.
- **What do I pass it?** Full prop table with types, defaults, and a required
  marker on `label`.

I did not need the source for any of the three. Gate 6's documentation half is
satisfied, and the previous review's Finding 3 is closed.

**But the page disagrees with itself.** The Intent block says Loading is *not*
announced; the `state` row of the prop table, roughly one screen below, says it
*is*. A consumer reading only this page cannot tell which is true, and the prop
table is where you look when deciding what to pass. That is Finding 2.

One cosmetic thing this perspective surfaces that no source-level check would:
the prop table has a seventh row, `type`, with an empty Description column
(Finding 7).

### 2 · The engineer who inherits this in six months

The names still hold up, and the fix commit reads well. `disabled` and
`aria-busy` are now destructured out of `rest` with a comment explaining *why*
they are OR-ed rather than overridden — the file teaches the trap rather than
just avoiding it.

What I would raise in review:

- The stale `state` doc comment (Finding 2). The correct sentence already exists
  in `Button.intent.json`; this one was not updated with it.
- `state` still carries five values that are two different kinds of thing
  (Finding 5, carried forward, still non-blocking).
- An asymmetry worth knowing about, not worth a finding: `disabled` is OR-ed
  (either source wins for "off"), while `aria-busy` is caller-wins
  (`ariaBusyProp ?? (isLoading || undefined)`). So
  `<Button state="Loading" aria-busy={false} />` renders a disabled, spinning
  button that declares itself not busy. Verified on the deployed build. Both
  precedence rules are documented accurately, and honouring an explicit caller
  override is defensible — I record it so the next person meets it in a report
  rather than in production.

The test file is the real change here. `src/components/accessible-props.test.tsx`
does not just cover the two bugs; its comment names the class — "the attributes
we advertise on the public type are the attributes that come out" — and the last
`describe` block generalises it over `id`, `title`, `data-testid` and
`aria-describedby` for both components. That is the difference between a
regression test and a fix that will hold.

### 3 · The keyboard and the screen reader

Every claim in the intent's `a11y` field re-tested against the deployed build
rather than read and ticked.

**`disabled` and `aria-busy` — the previous blocker, now closed.** Storybook drops
URL args not declared in `argTypes`, so `?args=disabled:!true` cannot demonstrate
this on any build. I drove the deployed preview's own arg channel instead
(`__STORYBOOK_ADDONS_CHANNEL__.emit('updateStoryArgs', …)`), which bypasses URL
parsing and reaches the real render path:

| Case | `disabled` | `aria-busy` | Click fires |
|---|---|---|---|
| `disabled` from caller, `state="Default"` | `true` | — | **0** |
| `state="Disabled"` + `disabled={false}` | `true` | — | — |
| `state="Loading"` + `disabled={false}` | `true` | `"true"` | — |
| `state="Loading"` + caller `aria-busy="false"` | `true` | `"false"` | — |
| `state="Default"` + caller `aria-busy="true"` | `false` | `"true"` | — |
| `state="Loading"`, no caller value | `true` | `"true"` | — |

Every clause of the intent's sentence holds: OR-ed not overridden, neither cancels
the other, caller's `aria-busy` honoured as given, `Loading` supplies one only
when the caller has not.

**Focus ring, all three variants.** Programmatic `.focus()` does not match
`:focus-visible` — the trap the previous review correctly flagged — so I clicked
the canvas and pressed a real `Tab` key for each variant:

```
Ghost      focusVisible: true   box-shadow: rgba(43,164,236,0.4) 0 0 0 3px
Primary    focusVisible: true   box-shadow: rgba(43,164,236,0.4) 0 0 0 3px
Secondary  focusVisible: true   box-shadow: rgb(231,235,242) 0 0 0 1px inset,
                                            rgba(43,164,236,0.4) 0 0 0 3px
```

Matches `focus/ring` on the node (`#2BA4EC66`, spread 3). The claim is true, and
Secondary keeps its inset border underneath rather than losing it to the ring.

**Target size.** Measured, all six combinations: Md 36.2px, Lg 46.6px, identically
across all three variants. The intent's arithmetic — Md clears 2.5.8 AA (24×24)
and misses 2.5.5 AAA (44×44), Lg clears both — is correct.

**Spinner.** `aria-hidden="true"`, 14×14, `animation-play-state: running`, and
`Button.css:114` stops it under `prefers-reduced-motion: reduce`. Accessible name
comes from the label alone.

**Loading and focus.** Reproduced exactly, on the same element React reuses:

```
before:  { active: "BUTTON.sunim-Button", focused: true  }
after:   { active: "BODY.sb-main-padded", focused: false }
refocus: { canRefocus: false }
liveRegions: []      ← zero [aria-live], [role=status], [role=alert] in the document
```

The behaviour is unchanged from the previous review. What changed is that the
component now says so. See Finding 2.

**Contrast — measured for the first time by anyone.** See Finding 8.

### 4 · The designer

Against node `19:231`, read live.

All 30 variants in the set are reachable through the props, and every story's
deep-link node ID matches the symbol IDs `get_metadata` returns, in order. No
variant exists in the design that the API cannot express.

The node's own description asks for Loading to be built into real screens rather
than shipped as decoration. That is what made the previous review treat Finding 2
as a real defect rather than a theoretical one, and the reasoning was sound at the
time. It now cuts the other way: the design wants Loading used, the component
delivers a Loading that disables and spins, and the intent tells an implementer
exactly what to add alongside it. The affordance the design meant to offer is
being offered, with its edge documented.

On `--accent-ink`: `get_variable_defs` returns `#1a78bd` for node 19:231, and
`build/tokens/css/tokens.css` resolves `--color-accent-ink` →
`--primitives-sky-600` → `#1a78bd`. On this read they agree. The `#166fb2` that
appears on the node is the `shadow/button` effect colour (`#166FB2B2`), a
different value. I am recording the observation and not re-arguing the ruling in
`decisions.md`, which stands as written.

### 5 · The release

`VERSIONING.md` read. Sentence below.

---

## Findings

### Finding 1 — `disabled` and `aria-busy` silently discarded · **CLOSED** · was a blocker · gate 3, gate 4

Fixed in `3d7c9e6`, verified three independent ways rather than taken on report.

**Source.** `Button.tsx` destructures `disabled: disabledProp` and
`'aria-busy': ariaBusyProp` out of `rest`, then:

```tsx
disabled={disabledProp || isDisabled || isLoading}
aria-busy={ariaBusyProp ?? (isLoading || undefined)}
```

**Deployed build.** The six-case table in perspective 3, driven through the
preview's arg channel because URL args cannot express an undeclared prop. The
case that previously failed — `disabled` from the caller — now renders
`disabled=""`, fires its handler **0** times, is unfocusable, `opacity: 0.5`,
`cursor: not-allowed`.

**Tests.** `src/components/accessible-props.test.tsx` covers all six cases plus
the generalised passthrough class. 25/25 pass.

### Finding 2 — the docs page contradicts itself about `Loading` and `aria-busy` · **Blocker** · gate 6 (and gate 4) · owner 🔨 Engineer

**What I saw.** Two sentences on one published page making opposite accessibility
claims about the same mechanism.

The Intent block, from `Button.intent.json`, rewritten and accurate:

> What it does not guarantee is that a Loading button is announced: Loading marks
> it natively disabled, so focus leaves it for `<body>` with nothing said, and
> `aria-busy` is not a live region — if the wait matters to a screen-reader user,
> announce it from somewhere that is.

The `state` row of the prop table, from the doc comment in `Button.tsx`,
unchanged and false:

> `Disabled` and `Loading` are behavioural: both mark the button
> non-interactive, and `Loading` also announces itself with `aria-busy`.

**Where.** `src/components/Button/Button.tsx`, the `state?: ButtonState` doc
comment. Both blocks render on
`https://sunim-ds-starter.vercel.app/?path=/docs/components-button--docs`.

**Evidence that the false half is false.** Perspective 3: focus moves to `<body>`,
cannot be recovered, and the document contains zero live regions. `aria-busy` is
not a live region, so an `aria-busy="true"` on an element that has just left the
tab order announces to nobody.

**Why this blocks, when the behaviour underneath it does not.**

I judge the focus behaviour **not a blocker on its own**, dissenting from the
previous review. Disabling a button while its action is in flight is the standard
way to prevent double-submit; the focus loss is its known cost; and the remedy —
announce from a live region the app owns — cannot live inside a component,
because the message is application-specific. A design system is allowed to ship a
documented limitation with a stated mitigation, which is now exactly what the
intent does. The previous review blocked on this when the documentation asserted
the opposite of the behaviour. That asymmetry is gone from the intent.

It is not gone from the prop table. And a contradiction is worse than either
sentence alone: a reader who notices both cannot tell which to trust, and a reader
who notices only the prop table — the likelier one, since that is where you look
to decide what to pass — concludes no further accessibility work is needed and
ships a form whose loading state is silent to a screen reader.

The cost of clearing this is one sentence, already written, twenty lines away. The
cost of not clearing it is a published false accessibility guarantee. I am not
making the edit: a change made after the review is a change nobody reviewed.

**If a human rules that a stale doc comment is not worth blocking a `0.x`, this
finding is the only thing standing between Button and Cleared** — everything else
in this report is either closed or non-blocking, apart from Finding 8, which needs
a ruling rather than a fix.

### Finding 3 — no docs page in any deployed build · **CLOSED** · was a blocker · gate 6

The deployed `index.json` now reports 74 entries, 4 of type `docs`, including
`components-button--docs`. The page resolves and renders. The previous review
recorded that the delivery mechanism had never once run and declined to clear a
promise on that basis; it has now run, and I read its output as perspective 1.

### Finding 4 — `required_tokens` under-declares by four · **CLOSED** · gate 6

`required_tokens` now lists 16. `Button.css` references exactly 16 non-quarantine
tokens. I checked the reverse direction the mechanical gate does not — every
referenced token is declared, as well as every declared token being referenced —
and the two sets are identical, including the four paddings
(`spacing.step.10/14/18/26`) that were missing.

### Finding 5 — `state` conflates story-only appearance with real behaviour · non-blocking · gate 4 · owner 🔨 Engineer · **carried forward**

`ButtonState` offers five values that are two kinds of thing: `Hover` and `Focus`
pin an appearance on and are story devices; `Disabled` and `Loading` change what
the button does. The prop table renders all five as peers.

I reach the same conclusion as the previous review — non-blocking, because the
doc comment does explain the split, and because gate 4's test is "would I defend
this in six months" rather than "is this wrong". Now that the docs page renders, I
can add one observation it could not: the five values appear in the published
control dropdown as a flat list, with the explanation in prose above it. A
consumer poking the control meets them as peers before they meet the paragraph.

Still a human's call rather than mine, and still cheaper now than after 0.1.0.

### Finding 6 — are the four paddings bound in Figma, or transcribed? · **RESOLVED — bound** · gate 2

The previous review raised this as a question it could not close: `Button.css`
binds the paddings to `--spacing-step-18/10/26/14`, tokens whose names encode
their own pixel value, while `get_variable_defs` returns them as bare literals
(`"18px": "18"`) rather than in `var(--…)` form. If they were unbound on the node,
four design gaps would be bound to number-matching tokens — the exact thing the
quarantine header says it refuses to do.

I can now answer it, from three pieces of evidence:

1. `spacing.step.{10,14,18,26}` exist in `tokens/tokens.json` as **real Figma
   variables**, each with a `variableId` and collection `Spacing`, scoped
   `["WIDTH_HEIGHT", "GAP"]` — the scope Figma requires for a variable to be
   offerable as an auto-layout padding.
2. `get_variable_defs` returns *variable definitions used by the node*. The four
   values genuinely unbound on this node — opacity `0.5`, opacity `0.85`, border
   `1px`, spinner `14px` — do **not** appear in its output at all. Unbound
   literals are absent from that response; these four are present.
3. The icon frame is the control case. It used to be a fifth quarantined value and
   moved to IconSlot; no `16px` appears in this node's variable defs, consistent
   with it being unbound and owned elsewhere.

So the paddings are bound, the CSS binding is a binding rather than a
number-matching guess, the quarantine policy is intact, and the count of open
design gaps is four, not eight.

This is inference from the shape of the MCP response rather than a direct
"is this bound: yes/no" answer, and I flag that honestly — but it is inference
with a control case, which is more than the previous review had.

### Finding 7 — `type` appears on the published prop table with no description · non-blocking · gate 4 · owner 🔨 Engineer

**What I saw.** The rendered prop table has seven rows. The seventh is `type`,
Description empty, Default `'button'`, Control "Set object".

**Where.** `Button.tsx` destructures `type = 'button'` in the signature but does
not declare it in `ButtonProps` — it arrives via
`ButtonHTMLAttributes<HTMLButtonElement>`. Assigning it a default is enough for
react-docgen to surface it as a documented prop.

**Why it matters, mildly.** The mechanical gate reports "all 6 props carry a doc
comment" because it counts the six declared in the interface. The public artefact
has seven, and one is blank. CLAUDE.md is explicit that a component's props are
its documented API. This is the only row on the page where a reader gets a name
and no sentence.

Not a blocker — `type` on a `<button>` is self-explanatory and the default is the
right one. Recorded because it is invisible to every check except reading the
deployed page.

### Finding 8 — Ghost misses AA on `--color-surface-page`, and is not ruled · **Blocking until ruled** · gate 2 / gate 6 · owner 🎨 Human

**What I saw.** Measured on the deployed build, all three variants, Md:

| Variant | Foreground | Background | Ratio | AA (4.5:1) |
|---|---|---|---|---|
| Primary | `#ffffff` | `#1a78bd` | **4.70** | pass |
| Secondary | `#1a78bd` | `#ffffff` | **4.70** | pass |
| Ghost | `#1a78bd` | `#f4f6fb` | **4.35** | **fail** |

Ghost has no background of its own (`rgba(0,0,0,0)`), so it takes whatever it sits
on. `#f4f6fb` is not Storybook chrome — it is `--primitives-paper-100`, which is
`--color-surface-page`, the design system's own page surface. On
`--color-surface-card` (`#ffffff`) Ghost measures 4.70 and passes.

The large-text exemption does not apply: the label computes to 13.5px/700 at Md
and 15.5px/700 at Lg, both below the 18.66px bold threshold, so 4.5:1 is the
governing number for every size.

**Why it needs a ruling rather than a fix.** `decisions.md` accepts sub-AA
contrast for Chip and Eyebrow in this release, on the reasoning that both render
exactly the token pair their node binds and closing the gap means changing the
palette. Button/Ghost is the same situation and would likely attract the same
ruling. But that file rules on Chip and Eyebrow only, and says in terms: "If you
find a *new* case that fails, or a ratio that has moved, that is not covered here
— report it." This is a new case, and nobody has stated a Button contrast result
either way — the previous review listed it explicitly as not checked.

The specific reason it should not be cleared silently: the intent's `placement`
field names "the call to action closing a page section" — the page surface, which
is the surface where it fails — and its `a11y` field enumerates focus and target
size while saying nothing about contrast. Publishing that combination reads as a
contrast claim by omission.

One decision closes it: accept it against the existing palette ruling and extend
`decisions.md` to name Button/Ghost, or treat it as new. Either way the answer
belongs in that file before Button's name is public.

---

## The version sentence

*Gate 7, in my own words:*

Cutting Button into **0.1.0** promises that a component called `Button` exists
under that name, is imported from the package root rather than a deep path, takes
`variant`, `size`, `state`, `label`, `showTrailing` and `icon` under exactly those
names, renders the 30 combinations Figma node `19:231` defines, and — newly, and
this is the part 0.1.0 can now actually carry — behaves like a `<button>` when you
treat it like one: `disabled={isSubmitting}` disables, `aria-busy` from a caller
survives, and a test in the repository fails if either stops being true. It
promises those names are the ones we intend to keep, and that a human read them.

It deliberately promises **nothing about stability**: `status` is `settling`, and
under a leading zero the next minor may break any of it without ceremony. It does
not promise the token values are final. It does not promise that a Loading button
is announced to a screen reader — the intent now states that limitation and tells
you what to add instead, and that is the honest shape of the promise rather than a
gap in it. And until Finding 8 is ruled, it must not be read as promising that
every variant meets AA contrast on every surface the placement guidance names.

The difference from the last review is worth stating plainly: this version can now
make a behavioural promise it previously could not, because something in CI
renders the component and checks it. What it still cannot do is make two
contradictory promises on the same page and let the reader pick.

---

## Not checked

- **Screen reader output.** Focus order, `disabled`, `aria-busy`, `aria-hidden`
  and the accessible name were all verified programmatically on the deployed
  build. I did not run VoiceOver or NVDA. Finding 2's claim that `aria-busy`
  announces nothing rests on the element being unreachable and `aria-busy` not
  being a live region — specification-level reasoning plus an observed empty set
  of live regions, not an observed silence.
- **The three non-variant Figma properties.** `get_metadata` returns variant
  properties only, so `Variant`, `Size` and `State` are confirmed against the node
  and `Label`, `Show Trailing` and `Icon` are not. They are named in the stories
  file and the docs page and were confirmed against the node by the previous
  review; I did not independently re-confirm them.
- **Whether the paddings are bound, by direct answer.** Finding 6 resolves the
  question by inference with a control case, not by an API that says yes or no.
  A one-line confirmation from design would make it certain.
- **Contrast in modes other than `day`.** Finding 8 measures the deployed default
  only. `build/tokens/css/tokens.css` carries more than one mode; I measured one.
- **`prefers-reduced-motion` as rendered.** I read the rule at `Button.css:114`
  and confirmed the spinner animates by default. I did not emulate reduced motion
  in the browser to watch it stop.
- **Anything about the other three components.** This is a review of Button. Chip,
  Eyebrow and IconSlot are under concurrent review by other agents and nothing
  here is a judgement about them, including the token and docs infrastructure they
  share.
- **Registry write.** Not performed, by instruction. `Release Review` and
  `Release Verdict` are to be transcribed by the orchestrator with this report
  pinned to the commit it lands in.
- **Commit and push.** Not performed, by instruction — three reviews are running
  on this tree concurrently. This file is written and left uncommitted, which
  departs from the skill's normal "commit it and push it before you hand over".
