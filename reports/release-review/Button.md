# Release review — Button

**Reviewed at** `e723a0a` on `main` · **Date** 2026-08-20 · **Re-review** (supersedes the review at `7ec481f`, which superseded `bbffbc5`)
**Figma node** `19:231` · **Registry row** `Button` (`Development` = Completed, `Synchronization %` = 100%)
**Mechanical half** `npm run release-review -- Button --version 0.1.0` → CLEAR (20 passed · 2 warned · 0 failed · 7 awaiting judgement)
**Working tree** clean — `git status --porcelain` empty. Everything below was tested against the deployed production build at https://sunim-ds-starter.vercel.app.

---

## Verdict

**Cleared.**

Both blockers from the review at `7ec481f` are gone, and they are gone by different
routes:

1. **Finding 2 — the docs page contradicted itself.** Fixed, and verified on the
   deployed page rather than in the source that produces it. The Intent block and
   the `state` row of the prop table now make the same claim about `aria-busy`, in
   the same direction, and the claim they make is the one I measured.
2. **Finding 8 — Ghost at 4.35:1.** Ruled. `decisions.md` now carries a repo-wide
   ruling putting colour contrast out of scope for 0.1.0, every component, every
   mode, naming this exact case. Recorded against the ruling, not re-argued.

Finding 7 is closed: `type` is declared on `ButtonProps` with a doc comment, and
the published prop table's seventh row now carries a description. Finding 5 stays
carried and non-blocking on re-judgement — nothing about it has changed, and the
reason it was not a blocker has not changed either.

Nothing new blocks. Two non-blocking notes are recorded below, both of them
things that only reading the deployed page surfaces.

**I do not part company with the previous review anywhere.** Its dissent from the
review before it — that the Loading focus loss is a documented limitation rather
than an unwired state — I reproduced and reach the same conclusion on
independently. See perspective 3.

---

## Gate table

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Is it actually done? | **Pass** | Registry read live at review time: `Development` = Completed, `Synchronization %` = 100%, `Design` = Done, `Last Modified` 2026-08-20T07:55:17Z. All 30 `Staging Testing` rows roll up to `Passed` only — the failed-count rollup reads **0**, no `Fixed (To re-test)`. Implementation, styles and stories present; the stories name node `19-231`. `npm run lint` (`tsc --noEmit`) exit 0. `npm test` **36 passed across 2 files** — up from 25. |
| 2 | Are the tokens clean? | **Pass** | No raw hex. The only `px` outside the quarantine is the string "2px" inside a prose comment at `Button.css:149`. No `--primitives-*` reached directly. Four `--sunim-Button-unbound-*` values, declared in one block with the node location each was transcribed from. Ghost's 4.35:1 recorded against the repo-wide contrast ruling in `decisions.md`, not as a finding. |
| 3 | Is the public surface decided? | **Pass** | `Button` plus `ButtonProps`, `ButtonVariant`, `ButtonSize`, `ButtonState` exported from `src/index.ts`; the composed `IconSlot` and `IconSlotProps`/`IconSlotSize` are exported too, so no consumer can reach a type they cannot import. |
| 4 | Are the names final? | **Pass** | Folder, exported symbol, CSS prefix `.sunim-Button`, intent `component` and the registry row all read `Button`. Variant property names verified **against the node**: `get_metadata` on 19:231 returns `Variant=Primary\|Secondary\|Ghost`, `Size=Md\|Lg`, `State=Default\|Hover\|Focus\|Disabled\|Loading` across all 30 symbols — one-for-one with the props, casing included. All 7 props carry a doc comment (was 6 + one blank row). Finding 5 carried, non-blocking; Notes A and B recorded. |
| 5 | Are the states complete? | **Pass** | 34 stories: the 30 matrix variants plus Playground, WithoutTrailing, WithCustomIcon, LongLabel. Every matrix story deep-links a node ID, and all 30 IDs (`19:62` … `19:230`) match `get_metadata`'s symbol list exactly, in order. Clicked through on the deployed build: Disabled is genuinely inert, Loading disables and spins and sets `aria-busy`, `:focus-visible` fires on a real Tab in all three variants. |
| 6 | Is the intent clear and documented? | **Pass** | `Button.intent.json` complete, no placeholders. `required_tokens` lists 16; `Button.css` references exactly those 16 non-quarantine tokens — checked in **both** directions, the two sets are identical. Every clause of the `a11y` field re-measured on the deployed build and every one held. `dont_use_when` names three misuses the component actually invites. And the page it renders on no longer contradicts itself: Finding 2 closed. |
| 7 | Do you understand what this version means? | **Pass** | `VERSIONING.md` read. `since` = `0.1.0` = the version being cut; `status` = `settling`, correctly not `stable` under a leading zero. `package.json` still reads `0.0.1` — the human bump, untouched. Sentence below. |

---

## The five perspectives

### 1 · The consumer who has never seen the code

The docs page renders 8,422 characters (up from 7,616). Reading only it, with no
source and no Figma:

- **What is this for?** "The action. Primary is the one thing this view wants you
  to do, and there is one per view." Answered.
- **When should I not use it?** Three concrete misuses — navigation (no `href`,
  invisible to middle-click and crawlers), an icon on its own (use IconSlot), a
  second Primary. All three are misuses the component invites rather than ones
  somebody imagined. This is the field the skill warns is usually aspirational,
  and it is not.
- **What do I pass it?** Seven-row prop table, types, defaults, required marker on
  `label`, and — new since the last review — a description on every row.

**The contradiction is gone.** This is the specific thing I was asked to judge on
the deployed page, so here are both blocks as published, side by side:

Intent block, from `Button.intent.json`:

> What it does not guarantee is that a Loading button is announced: Loading marks
> it natively disabled, so focus leaves it for `<body>` with nothing said, and
> `aria-busy` is not a live region — if the wait matters to a screen-reader user,
> announce it from somewhere that is.

`state` row of the prop table, from the doc comment in `Button.tsx`:

> `Disabled` and `Loading` are behavioural: both mark the button non-interactive,
> and `Loading` also sets `aria-busy`.
>
> `aria-busy` does not announce anything on its own. It is not a live region, and
> disabling the button removes it from the tab order — so a keyboard user who was
> focused on it loses focus to `<body>` and cannot get it back. That is the
> ordinary cost of the double-submit guard rather than a defect here, but it is
> not something this component can solve: if the wait needs announcing, put a live
> region beside the button and write to it.

They agree, clause for clause: not a live region, focus goes to `<body>`, put a
live region beside it. The phrase the last review blocked on — "announces itself
with `aria-busy`" — is gone, replaced by "also sets `aria-busy`", which is what
the element actually does. A reader who reads only the prop table now reaches the
same conclusion as one who reads only the intent, and it is the true one.

`type` now reads as a documented prop rather than a blank row (Finding 7).

### 2 · The engineer who inherits this in six months

The names hold up, and the two follow-up commits read as narrow edits rather than
rewrites.

What I would still raise in review:

- `state` carries five values that are two different kinds of thing (Finding 5,
  carried, non-blocking).
- The `disabled`/`aria-busy` precedence asymmetry, recorded by the last review and
  still true: `disabled` is OR-ed, `aria-busy` is caller-wins. I re-verified it on
  the deployed build (see perspective 3, last row of the table). Both rules are
  documented accurately and honouring an explicit caller override is defensible.
  Recorded so the next person meets it in a report rather than in production.
- `type` is now declared on `ButtonProps` purely to carry its note, and the
  comment says so in the file: "Declared here only so it carries this note — it is
  inherited either way." That is the right shape for this, and the note it carries
  — `button` not `submit` — is the one a consumer actually needs.

**The test file is the substantive change.** 25 → 36. The passthrough loop now
runs `id`, `title`, `data-testid` and `aria-describedby` over **all four**
components rather than the two that happened to be broken, with Eyebrow's `title`
skipped explicitly and the reason written down — a documented exception rather
than a hole. And a new `describe` asserts component defaults for the first time:
Button is Primary/Md/`type="button"`, Chip Default/Sm, Eyebrow Sky, IconSlot 14.
The Eyebrow one is what makes the ruling in `decisions.md` enforceable rather than
remembered.

### 3 · The keyboard and the screen reader

Every claim in the intent's `a11y` field re-measured on the deployed build.

**`disabled` and `aria-busy`.** Storybook drops URL args not declared in
`argTypes`, and neither prop is declared, so I drove the preview's own arg channel
(`__STORYBOOK_ADDONS_CHANNEL__.emit('updateStoryArgs', …)`), which reaches the
real render path:

| Case | `disabled` | `aria-busy` | Other |
|---|---|---|---|
| caller `disabled`, `state="Default"` | `true` | — | click handler fires **0** times; `opacity: 0.5`; `cursor: not-allowed` |
| `state="Loading"` + caller `disabled={false}` | `true` | `"true"` | neither cancels the other |
| `state="Loading"` + caller `aria-busy={false}` | `true` | `"false"` | caller wins on `aria-busy` |
| default | `false` | absent | live by default |

**Focus ring, all three variants, real `Tab` key** — programmatic `.focus()` does
not match `:focus-visible`, so each was clicked-away-from and tabbed into:

```
Primary    focusVisible: true   box-shadow: rgba(43,164,236,0.4) 0 0 0 3px
Ghost      focusVisible: true   box-shadow: rgba(43,164,236,0.4) 0 0 0 3px
Secondary  focusVisible: true   box-shadow: rgb(231,235,242) 0 0 0 1px inset,
                                            rgba(43,164,236,0.4) 0 0 0 3px
```

Secondary keeps its inset border underneath rather than losing it to the ring.
Focus visibility is explicitly *not* covered by the contrast ruling, and it passes.

**Target size.** Md 36.203px, Lg 46.602px, measured on Primary, Secondary and
Ghost. The intent's arithmetic — Md clears 2.5.8 AA (24×24) and misses 2.5.5 AAA
(44×44), Lg clears both — is correct. Also not covered by the ruling, and correct.

**Accessible name and spinner.** Accessible name is the label alone
("Apply for this cohort"). The spinner is `aria-hidden="true"`, 14×14,
`animation-play-state: running`, and `Button.css` stops it under
`prefers-reduced-motion: reduce`. The trailing arrow's IconSlot renders
`aria-hidden="true"` with no `role`, which is the decorative case IconSlot
documents.

**Loading and focus.** Reproduced on the element React reuses — tabbed in for real,
then flipped `state` to `Loading` through the arg channel:

```
before:  BUTTON.sunim-Button sunim-Button--Primary sunim-Button--Md
after:   BODY.sb-main-padded sb-show-main
refocus: canRefocus: false
liveRegions: 0     ← zero [aria-live], [role=status], [role=alert] in the document
```

Identical to the last two reviews. The difference is that both places a consumer
might read now describe exactly this, and prescribe the remedy that works. I reach
the same judgement as the last review independently: a design system may ship a
documented limitation whose fix is application-specific, and the mitigation it
names — a live region the app owns — is the correct one and cannot live inside the
component.

**Contrast.** Ghost's label measures `#1a78bd` on `rgb(244,246,251)`
(`--color-surface-page`), unchanged at **4.35:1**, and Ghost has no background of
its own (`rgba(0,0,0,0)`). Recorded against the repo-wide ruling in
`decisions.md` — "Do not fail a case for contrast, in any mode, on any component"
— which names this exact case. Not a finding, not re-argued. Measuring it was
still worth doing: the ruling asks for a moved ratio to be reported, and this one
has not moved.

### 4 · The designer

Against node `19:231`, read live.

`get_metadata` returns 30 symbols. All 30 are reachable through the props, and
every story's deep-link node ID matches the symbol IDs in order (`19:62`, `19:68`,
`19:74`, `19:80`, `19:85`, … `19:225`, `19:230`). No variant exists in the design
that the API cannot express, and no story points at a node that is not in the set.

The affordance the design meant to offer is being offered: the node's description
asks for Loading to be built into real screens, the component delivers a Loading
that disables and spins, and the intent tells an implementer what to add beside
it.

`--accent-ink` still resolves to `#1a78bd` in the build against the node's live
`#166fb2`. Recorded against the standing ruling in `decisions.md`; not
re-argued.

### 5 · The release

`VERSIONING.md` read. Sentence below.

---

## Findings

No blockers.

### Finding 2 — the docs page contradicted itself about `Loading` and `aria-busy` · **CLOSED** · was a blocker · gate 6

**What I checked.** The published page, not the source that generates it.

**What I saw.** The false half is gone. The `state` doc comment in `Button.tsx`
now reads "`Loading` also sets `aria-busy`" — which the element does, verified —
followed by a second paragraph stating that `aria-busy` is not a live region, that
disabling removes the button from the tab order so a keyboard user loses focus to
`<body>` and cannot recover it, and that a consumer who needs the wait announced
should put a live region beside the button. Both paragraphs render in the prop
table's `state` row on the deployed page. They say the same thing the Intent
block, roughly one screen above, says.

**Evidence the surviving claim is true.** Perspective 3: `aria-busy="true"` is on
the element under `state="Loading"`; focus moves to `<body>` and cannot be
recovered; zero live regions in the document. The page describes what I measured.

The behaviour underneath is unchanged from all three reviews. What changed is
that one page now makes one claim about it, and the claim is right.

### Finding 5 — `state` conflates story-only appearance with real behaviour · non-blocking · gate 4 · owner 🔨 Engineer · **carried forward, re-judged**

`ButtonState` offers five values that are two kinds of thing: `Hover` and `Focus`
pin an appearance on and are story devices; `Disabled` and `Loading` change what
the button does. The published control dropdown renders all five as a flat
inline-radio, with the explanation in prose above it — a consumer poking the
control meets them as peers before they meet the paragraph.

**Re-judged: still non-blocking, and for the same reason.** Nothing about it
changed between `7ec481f` and `e723a0a`. The doc comment still explains the split
in its first paragraph, and that paragraph still comes first in the rendered
description. Gate 4's test is "would I defend this in six months", not "is this
wrong" — and there is a real defence, which is that `State` is the Figma variant
axis and CLAUDE.md requires the prop to mirror it. The alternative, splitting into
`state` and a story-only `pin`, diverges from the node.

One thing worth stating plainly for whoever rules: this is cheaper now than after
0.1.0, because after 0.1.0 changing what `state` means is a **minor** bump under
`VERSIONING.md`, and it stays a human's call rather than mine.

### Finding 7 — `type` appeared on the published prop table with no description · **CLOSED** · was non-blocking · gate 4

`ButtonProps` now declares `type?: ButtonHTMLAttributes<HTMLButtonElement>['type']`
with a doc comment explaining that the default is `button` and not `submit`, why
that matters inside a form, and what to pass for the form behaviour. The mechanical
gate now counts 7 props with doc comments rather than 6, and the published table's
seventh row carries a sentence. Verified on the deployed page.

### Finding 8 — Ghost misses AA on `--color-surface-page` · **RULED — out of scope** · gate 2 / gate 6

Re-measured, unchanged: Ghost's label `#1a78bd` on `--color-surface-page`
`#f4f6fb` = **4.35:1**, against a 4.5:1 threshold (the large-text exemption does
not apply — 13.5px/700 at Md, 15.5px/700 at Lg, both below the 18.66px bold
threshold).

`decisions.md` now carries **"Accepted: colour contrast is out of scope for this
release, repo-wide"**, ruled 2026-08-20, scope "every component, every mode",
and it names this case by number as one of the three that prompted the widening.
Recorded against that ruling and not re-argued.

I read the ruling's *what is not ruled* clause and treated it as live: focus
visibility, target size, keyboard reachability and accessible names were each
re-tested this pass rather than assumed, and each passes (perspective 3). The
ruling also asks that the intents keep stating the limit rather than hiding it —
Button's `a11y` field currently states focus, target size, announcement and
reduced motion, and says nothing about contrast either way. That is neither a
claim nor a disclosure. Not a finding under the ruling as written; noted for
whoever next edits the intents, because the ruling explicitly wants a consumer
"entitled to know before they put it on a phone".

### Findings 1, 3, 4, 6 — closed in earlier reviews, spot-checked and still closed

- **1** (`disabled`/`aria-busy` discarded): re-verified on the deployed build, four
  cases, table in perspective 3. Caller `disabled` fires the handler 0 times.
- **3** (no docs page): the page resolves and renders 8,422 characters.
- **4** (`required_tokens` under-declares): 16 declared, 16 referenced, sets
  identical in both directions.
- **6** (paddings bound or transcribed): resolved as bound by the previous review's
  inference-with-a-control-case. I did not re-derive it; see Not checked.

---

## Notes (neither findings nor blockers)

**Note A — "`Loading` also sets `aria-busy`" is unconditionally phrased for a
conditional rule.** The caller can override it: `state="Loading"` with
`aria-busy={false}` renders `aria-busy="false"`, verified on the deployed build.
The precise rule — "`aria-busy` from a caller is honoured as given; `state="Loading"`
supplies `aria-busy="true"` only when the caller has set none" — is stated in the
Intent block on the same page. So the page is not wrong, and it is not in tension
with itself; the prop table is simply the shorter of two accurate statements.
Recording it only so that if anyone edits that sentence again, they know the
longer form is the exact one.

**Note B — the `type` row's control is an object editor.** The published prop
table gives `type` a "Set object" control, because `type` has no `argTypes` entry
and Storybook cannot infer a union from
`ButtonHTMLAttributes<HTMLButtonElement>['type']`. A consumer poking that control
gets a JSON editor for what is really `'submit' | 'reset' | 'button'`. Cosmetic,
docs-only, and it does not affect the rendered component. Finding 7 fixed the
missing description; this is the part of the same row it did not touch.

---

## The version sentence

*Gate 7, in my own words:*

Cutting Button into **0.1.0** promises that a component called `Button` exists
under that name, is imported from the package root rather than a deep path, takes
`variant`, `size`, `state`, `label`, `showTrailing`, `icon` and `type` under
exactly those names, renders the 30 combinations Figma node `19:231` defines, and
behaves like a `<button>` when you treat it like one — `disabled={isSubmitting}`
disables, a caller's `aria-busy` survives, `type` defaults to `button` and not
`submit`, and a test in the repository fails if any of those stops being true. It
promises those names are the ones we intend to keep, that a human read them, and —
the part that is new at this commit — that everything the published page tells you
about this component is something somebody measured on the deployed build rather
than inferred from the source.

It deliberately promises **nothing about stability**: `status` is `settling`, and
under a leading zero the next minor may break any of it without ceremony. It does
not promise the token values are final — four values on this node carry no Figma
binding at all and are held in a named quarantine so that the gap stays visible.
It does not promise that a Loading button is announced to a screen reader; the
page states that limitation and names the remedy, which is the honest shape of the
promise rather than a hole in it. And it explicitly does **not** promise that any
variant meets AA colour contrast on any surface: the owner has ruled contrast out
of scope for this release, repo-wide, and Ghost measures 4.35:1 on the page
surface the intent's own `placement` field names.

What changed since the last review is smaller than what changed the review before
it, and that is the right shape for a component about to go public: one sentence
corrected, one number ruled, eleven more tests, and nothing else moved.

---

## Not checked

- **Screen reader output.** Focus order, `disabled`, `aria-busy`, `aria-hidden`,
  the accessible name and the empty live-region set were all verified
  programmatically on the deployed build. I did not run VoiceOver or NVDA. The
  claim that `aria-busy` announces nothing rests on the element being unreachable
  plus `aria-busy` not being a live region — specification-level reasoning and an
  observed empty set, not an observed silence.
- **The three non-variant Figma properties.** `get_metadata` returns variant
  properties only, so `Variant`, `Size` and `State` are confirmed against the node
  and `Label`, `Show Trailing` and `Icon` are not. They are named in the stories
  file and on the docs page, and were confirmed against the node by an earlier
  review; I did not independently re-confirm them.
- **Whether the four quarantined values are still unbound in Figma.** Gate 2 asks
  for that to be confirmed with 🎨 Human rather than assumed. I read the
  quarantine block and confirmed the four are declared and referenced; I did not
  ask design whether any has since been bound and not re-exported.
- **Whether the paddings are bound, by direct answer.** Finding 6 was resolved by
  inference with a control case, not by an API that says yes or no. I did not
  re-derive it this pass and I am carrying the previous review's conclusion.
- **Contrast in modes other than the deployed default.** Measured `day` only. Out
  of scope under the ruling either way, but the ruling asks for moved ratios to be
  reported, and I can only say this one has not moved in the mode I measured.
- **`prefers-reduced-motion` as rendered.** I confirmed the rule exists in
  `Button.css` and that the spinner's `animation-play-state` is `running` by
  default. I did not emulate reduced motion in the browser to watch it stop.
- **The deployed build's commit identity.** Vercel exposes no build stamp I could
  read. I established that the deployment carries `e723a0a`'s content by matching
  the rendered prop-table prose to this commit's source word for word — the `state`
  second paragraph and the `type` description are both present and both are new at
  this commit. That is a content match, not a SHA.
- **Package-level release checks.** `npm pack`, the file list, and a smoke install
  into an empty folder are `release-prepare`'s nine checks, not this gate's seven.
  Nothing here says Button packs or installs correctly.
- **Anything about the other three components.** This is a review of Button. Chip,
  Eyebrow and IconSlot are under concurrent review and nothing here is a judgement
  about them, including the token, test and docs infrastructure they share.
- **Registry write.** Not performed, by instruction. `Release Review` and
  `Release Verdict` are for the orchestrator to transcribe, with this report
  pinned to the commit it lands in. The row currently reads `Release Verdict` =
  **Blocked** from the previous review, and `Release Review` pinned at `7b7310c`.
- **Commit and push.** Not performed, by instruction — three reviews are running
  on this tree concurrently. This file is overwritten and left uncommitted, which
  departs from the skill's normal "commit it and push it before you hand over".
