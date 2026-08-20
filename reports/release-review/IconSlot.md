# Release review — IconSlot

**Commit reviewed** `27afeb5` · **Registry row** `Icon Slot` (`recvDIEckmxBp6SGT`)
**Figma node** 9:24, file `mFnN1Sr8MAmOdmx0ABXPsb` · **Version under review** 0.1.0
**Reviewed** 2026-08-20 · working tree clean at time of review

---

## Verdict

**Blocked** — four findings, none of them a rendering defect. Two prop names will
not survive six months (`label` means the opposite of what it means in all three
siblings; a `aria-label` the type signature advertises is silently discarded),
the intent's `dont_use_when` is contradicted by the only two production uses in
this release, and the docs page a consumer is pointed at has never been deployed.

Three of the four cost nothing to fix now and a minor version bump after 0.1.0 is
cut. That is the entire argument for blocking: `IconSlot`'s surface has never been
public, so nothing depends on it yet, and this is the last moment renaming is free.

Nothing found here is a defect in what the component draws. QA's three rows are
sound and I reproduced their measurements on the deployed build.

`npm run release-review -- IconSlot --version 0.1.0` reads **CLEAR** — 17 passed,
2 warned, 0 failed. All four findings below sit in the 7 items it marked REVIEW.

---

## The gates

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Is it actually done? | **Pass** | Registry read live: `Development` = Completed, `Synchronization %` = 100% (3/3), all three `Staging Testing` rows Passed, none `Failed` or `Fixed (To re-test)`. Implementation, styles, stories present; stories name node 9:24. `npm run lint` clean, `npm test` 7 passed. |
| 2 | Are the tokens clean? | **Pass** | No raw hex, no raw px outside the quarantine, no `--primitives-*`. Three unbound values quarantined. Confirmed against the live node: `get_variable_defs` on 9:24 returns exactly one binding for the whole set. |
| 3 | Is the public surface decided? | **Pass** | `IconSlot`, `IconSlotProps`, `IconSlotSize` all exported from `src/index.ts`. Composition checked both directions — see below. One tension recorded (F5), not blocking. |
| 4 | Are the names final? | **Blocked** | F1, F2. Folder / symbol / CSS prefix / intent all agree; `size` matches the node's only variant property exactly. `label` does not survive the six-month test. |
| 5 | Are the states complete? | **Pass** | Node has one variant property and no state property. All three sizes have deep-linked stories. Verified live on the deployed build, not just present. |
| 6 | Is the intent clear and documented? | **Blocked** | F3, F4. Fields complete and the a11y claim is true — verified in both modes. `dont_use_when` is not. Docs page does not exist in production. |
| 7 | Do you understand what this version means? | **Pass** | `VERSIONING.md` read. `since: "0.1.0"` is at the version being cut, not ahead of it. `status: "experimental"`, not `stable`, at 0.x. Sentence below. |

### Gate 1 — the detail

Read from the board at review time, not from an earlier audit. Three rows, all
`Passed`, `idle` state, node-by-node measurements recorded in each. The Size=22
row additionally records the swap affordance and the retint as verified.

Two things the green does not cover, recorded because the gate table would
otherwise read as though it did:

- All 7 tests live in `src/tokens/token-binding.test.ts`. **No test exercises
  IconSlot.** `npm test` passing is not evidence about this component.
- `Synchronization %` is 3 of 3 *linked* rows, and those three rows are the three
  Figma variants. The `icon` swap and the `label` mode have no row of their own
  (the swap is noted inside the Size=22 row; `label` is not tested anywhere).
  100% means "every row that exists passed", not "every behaviour is covered".

### Gate 2 — the detail

The three quarantined values are real, still-open design gaps, not a stale export.
`get_variable_defs` on node 9:24 returns:

```
{"var(--text-body)":"#22344e"}
```

One variable on the entire component set. The frame width and height carry no
binding on any of the three variants, exactly as `IconSlot.css` claims. The CSS
also documents why `--spacing-step-14` and `--spacing-step-22` must not be
substituted — they exist at the right numbers and would disguise the gap as a
binding. That is the correct call and it is written down where the next person
will hit it.

Not in `decisions.md`, so unruled — but correctly quarantined and correctly
explained, so there is nothing to rule on beyond whether an icon-size scale is
wanted. See *Not checked*.

### Gate 3 — both directions

- **Outward:** `IconSlot` and `IconSlotProps` are exported, so a consumer can type
  a wrapper. `IconSlotSize` too.
- **Inward:** Button and Chip both compose `IconSlot`, and `IconSlot` is itself
  exported — so the failure mode this gate names (composing a sibling that is not
  exported, leaving a consumer able to reach a type they cannot import) is closed.

### Gate 5 — the detail

`get_metadata` on 9:24 returns three symbols — `Size=14`, `Size=16`, `Size=22` —
and no state property. There is no hover, focus, disabled or loading to wire, so
the three the skill warns about (drawn correctly, behaving wrongly) do not apply
here. Verified on the deployed build rather than inferred:

| Story | Rendered | Result |
|---|---|---|
| `size-14` | 14×14, `aria-hidden="true"`, no role, `rgb(34,52,78)` | correct |
| `labelled` | `role="img"`, `aria-label="Next"`, no `aria-hidden`, not focusable | correct |
| `retinted` | both overrides resolve to real values — `rgb(220,235,247)` and `rgb(43,164,236)`, not the fallback | correct |

Nothing drawn but not wired.

---

## The five perspectives

### 1 · The consumer who has never seen the code

**Could not be run.** There is no docs page to open. See **F4** — this perspective
failing is the finding, not a note about it.

### 2 · The engineer who inherits this in six months

Where the names hold up: `IconSlot` / `.sunim-IconSlot` / `IconSlotProps` all agree.
`size` with values `'14' | '16' | '22'` matches the node's only variant property
and its literal values, which is what CLAUDE.md asks for; the string-union-of-
numerals is mildly awkward to type but it is the design's own vocabulary and the
source comment defends it. `icon` follows the convention Button already set, so
the two agree rather than inventing a second way to hand an icon in.

Where they do not: `label`, and the `aria-label` it shadows. **F1**, **F2**.

On `IconSlot` vs the registry's `Icon Slot` — **not a finding.** Figma names the
node "Icon Slot" and the registry row matches Figma, which is right for a
design-side board; CLAUDE.md mandates PascalCase in code, which makes `IconSlot`
the prescribed spelling of that same name. The other three components are single
words, so this is simply the first time the convention has been visible. The two
say the same word.

### 3 · The keyboard and the screen reader

The perspective the skill says usually disagrees with the documentation. **Here it
agrees**, and I checked rather than ticking the field.

Both modes verified on the deployed build. Decorative: `aria-hidden="true"`, no
role, no accessible name, contributes nothing to the a11y tree. Labelled:
`role="img"` with the label as accessible name, `aria-hidden` absent. Neither is
focusable — the component adds nothing to the tab order, matching the intent's
"never focusable and has no interactive state".

The one thing that does disagree is reachable only through the type signature, not
through the rendered DOM: **F2**.

Contrast is out of scope by construction — the component inherits its colour and
the intent says so explicitly ("contrast is therefore the consumer's to meet").
That is a defensible division, and it is stated rather than assumed.

### 4 · The designer

The node offers one variant property and one bound value. The component offers
that, plus two props the set has no way to express: `icon` and `label`.

That is **not** an overreach. Figma component sets cannot express "an arbitrary
child", and the node is called *Icon Slot* — a slot is a swap. The design meant to
offer the swap and could only name it. The component supplies the affordance the
design intended but could not encode.

The consequence worth naming: two of three public props have no Figma counterpart,
so they fall outside design-parity testing entirely. That is where the untested
surface in gate 1 comes from, and it is structural rather than an oversight.

No variant in the set is unreachable through the props.

### 5 · The release

See the version sentence, and **F5**.

---

## Findings

### F1 · `label` means the opposite of what it means in every sibling — gate 4

**What I saw.** Four components on the public surface, one prop name, two meanings:

| Component | `label` | Visible? |
|---|---|---|
| Button | the text of the action | yes, required |
| Chip | the chip's text | yes, required |
| Eyebrow | the eyebrow's text | yes |
| **IconSlot** | **an accessible name for a screen reader** | **never** |

IconSlot is the odd one out, and it is the one composed into Button and Chip — so
both meanings appear in a single file. `Button.tsx` reads `label` (visible text)
on line 100 and renders `<IconSlot size="16" />` on line 133, where `label` would
have meant something else entirely.

**Why it blocks.** The gate's bar is "would I defend this in six months", not "is
this wrong". I would not defend it. It generates a bug report from whoever passes
`label` to an IconSlot expecting text and gets an invisible attribute.

**Cost of not fixing now.** `VERSIONING.md` makes changing a prop's meaning a minor
bump (0.1.0 → 0.2.0). IconSlot has never been public, so today the rename is free.

**Owner.** 🔨 Engineer, after a human picks the name. `iconLabel`, `alt` and
`a11yLabel` are the obvious candidates; the choice is not mine to make.

---

### F2 · The `aria-label` the type signature advertises is silently discarded — gate 4

**What I saw.** `IconSlotProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'>`,
so `<IconSlot aria-label="Next" />` type-checks. But in `IconSlot.tsx`:

```tsx
<span
  {...rest}
  className={classes}
  role={label ? 'img' : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : true}
>
```

`{...rest}` is spread first, so the explicit attributes win. With `label` unset,
`aria-label={undefined}` removes the consumer's attribute and `aria-hidden={true}`
is applied. The element ends up **hidden from assistive technology with no
accessible name** — the exact opposite of what the consumer asked for, with no
type error, no console warning and no visual difference.

**Why it blocks.** The type signature actively advertises the idiom that fails.
This is a silent accessibility regression in a component whose entire a11y story
is "one prop decides whether it is announced". F1 makes it likelier: a consumer who
knows `label` means visible text elsewhere will reach for `aria-label` here.

**Confidence.** Mechanism read from source; JSX attribute precedence over a
preceding spread and React's omission of `undefined`-valued attributes are both
standard and deterministic. I did **not** execute this case — no story exercises
it, and the absence of that story is part of the finding. Both `label` modes that
*are* storied I verified live and both behave as documented.

**Owner.** 🔨 Engineer.

---

### F3 · `dont_use_when` describes a component that does not exist yet — gate 6

**What I saw.** `IconSlot.intent.json`:

> "As an icon in its own right: the arrow it ships with is a placeholder and every
> production use should pass the real icon from Sunim Icon through the `icon` prop."

Both production uses in this release do the opposite, by default:

- `Button.tsx`: `showTrailing = true`, and the trailing mark is
  `{isLoading ? <Spinner /> : (icon ?? <IconSlot size="16" />)}` — the placeholder
  unless a consumer overrides it. Button's own prop doc calls it "the arrow",
  i.e. treats it as the design, not scaffolding.
- `Chip.tsx`: `showIcon = true`, `icon` optional → `<IconSlot size="14" icon={icon} />`
  falls through to the placeholder.

Confirmed in production, not inferred. The deployed Chip "Early bird"
(`components-chip--default-md`) renders IconSlot's Size=14 placeholder geometry
byte-for-byte:

```
d="M1.6 3.64167H7.43333M5.39167 5.68333L7.43333 3.64167L5.39167 1.6"
```

**Why it blocks.** This is gate 6's named failure mode almost literally — the
intent describes a component that does not exist yet, one whose real icons come
from a Sunim Icon file that is not in this repo. Shipping it means the release
carries a documented rule that its own two consumers break on their default path.

Second half of the same finding: of the three misuses listed, the fourth-size one
is already impossible — `IconSlotSize` is a closed union, so the compiler forbids
it. Meanwhile the misuse the component genuinely *invites* is absent: `<IconSlot />`
takes no required props and renders a complete, plausible arrow, so shipping the
placeholder is the path of least resistance and nothing stops it.

**Note.** The fix is to the *sentence*, not necessarily to the code. It may well be
right that Button's arrow is Button's real design rather than a placeholder — in
which case the intent should say the arrow is the shipped default for the Button
and Chip cases and a placeholder elsewhere. That is a call for the human and 📝 Doc
Generator, not a wording tweak I should make.

**Owner.** 📝 Doc Generator, after 🎨 Human rules on which reading is true.

---

### F4 · The docs page has never been deployed — gate 6, and perspective 1 entirely

**What I saw.** `https://sunim-ds-starter.vercel.app/?path=/docs/components-iconslot--docs`
renders:

> Couldn't find story matching 'components-iconslot--docs'.

The deployed `index.json` contains **no `docs` entry for any component** — all 71
entries are `type: story`. `Astro Link` is empty on the IconSlot row too, so there
is no reference site standing in for it.

The source is fine: `tags: ['autodocs']` is present in `IconSlot.stories.tsx`, and
the meta carries a full hand-written description plus the appended intent block.
It was added in `e46893c`, which is **after** `b26ed39` — the commit the registry
records for IconSlot — and production has not been rebuilt since. That commit's own
message says it: "no component had a docs page ... all four hand-written component
descriptions had been rendering nowhere since they were written."

**Why it blocks.** `VERSIONING.md` says 0.1.0 promises "each one has a documented
prop API and a documented intent". Right now that promise is not true in the only
place a consumer can check it. Perspective 1 could not be run at all — the skill is
explicit that reaching for the source to answer "what is this for" is a gate 6
finding, and here there was nothing else to reach for.

**This is not an engineering defect.** No code change is needed — a redeploy of
production Storybook from a commit at or after `e46893c` fixes it. It is also
repo-wide rather than IconSlot's alone; I record it here because the gate is
per-component and this component's docs are among the missing.

**Owner.** 🚀 DevOps.

---

### F5 · `experimental` is load-bearing for two `settling` components — gate 3 / gate 7

Recorded for the human. **Does not independently block**; the verdict rests on F1–F4.

`VERSIONING.md` says 0.1.0 does not promise "anything at all about a component
whose `status` reads `experimental`". IconSlot is the only `experimental` component
in the release. Button, Chip and Eyebrow all read `settling` — and Button and Chip
are **built out of IconSlot**, both rendering it on their default path.

So the package promises something about Button and Chip while promising nothing
about the component that draws part of them. A consumer cannot rely on Button's
trailing mark if the thing rendering it carries no promise at all. The disclaimer
is written as though an experimental component were an isolated preview; this one
is load-bearing for two-thirds of the released surface *and* public in its own right.

Related, and smaller: `--sunim-IconSlot-color` is a documented consumer-facing
contract — the intent's a11y field and the `Retinted` story both instruct consumers
to set it, and I verified it works on the deployed build — but `VERSIONING.md` says
"anything not exported from `src/index.ts` is not part of the release". A CSS custom
property cannot be exported there. The retint mechanism is therefore promised
through a channel the release contract declares non-public. Worth settling before
1.0.0; not urgent at 0.1.0.

**Owner.** 🎨 Human — `VERSIONING.md` is governance, not code. Either IconSlot
becomes `settling` alongside its consumers (which raises the stakes on F1 and F2,
since a settling surface should not churn), or `VERSIONING.md` gains a line on what
an experimental component composed into a settling one actually promises.

---

## The version sentence

**0.1.0 says: this thing is called `IconSlot`, you import it from the package root,
it draws a square box at 14, 16 or 22 pixels that takes its colour from whatever it
sits inside, and it hides itself from screen readers unless you name it. That is
all it says.**

It does not say the name `label` will still mean that in 0.2.0, or that the arrow
you see is the arrow you will keep — the arrow is scaffolding for a Sunim Icon file
that is not in this repository, and `status: "experimental"` is the package saying
out loud that it will not defend any of this. What makes that disclaimer awkward
rather than clean is that Button and Chip are `settling` and both render this
component by default, so the release promises more about them than about the thing
they are made of.

On whether `experimental` is the honest claim — **right about the component, too
strong as `VERSIONING.md` words it.** Right, because the surface genuinely is not
settled: two prop names should move (F1, F2), and the visible default is a
placeholder for icons that do not exist here yet (F3). Too strong, because "nothing
at all is promised" cannot hold for a component that two promised components render
on their default path. The status is not overstating IconSlot's stability — that is
the failure this gate usually catches, and it is not this one. It is understating
IconSlot's *reach*, which is the more unusual error and the one worth writing down.

---

## Not checked

- **Whether the three unbound sizes are still an open design gap.** I confirmed
  against the live node that only `text/body` is bound, so the gap is real today
  and not a stale export. I did **not** confirm with 🎨 Human that an icon-size
  scale is *wanted* rather than deliberately withheld. Gate 2 asks for that
  confirmation and I could not get it. Not in `decisions.md`, so unruled.
- **F2 executed against a rendered case.** Mechanism read from source and
  deterministic; not run, because no story passes a raw `aria-label`. Both storied
  `label` modes were verified live.
- **Screen-reader output.** Verified the accessibility tree — roles, names,
  `aria-hidden`, tab order — on the deployed build. Did not run NVDA, JAWS or
  VoiceOver, so what is *announced* is inferred from correct markup.
- **Contrast in any mode.** Out of scope by construction: the component inherits
  its colour and the intent assigns contrast to the consumer. Not measured. The
  `decisions.md` ruling covers Chip and Eyebrow, not IconSlot.
- **Modes other than `day`.** All live checks ran in the deployed default. QA's
  rows note the `open`/`day` equivalence for `text/body`; I did not re-verify it,
  and I checked no other mode.
- **Any behaviour of the built package.** This review reads the repository and the
  deployed Storybook. Whether `IconSlot` survives the build, packs, installs and
  renders from a tarball is release-prepare's steps 5–7, not this review.
- **The other three components.** IconSlot only. Findings F4 and F5 visibly reach
  further — the missing docs pages are repo-wide, and F5 is a governance question
  about the whole surface — but I confirmed neither beyond what IconSlot required.
- **`npm test` as evidence about IconSlot.** It is not. No test exercises this
  component; see gate 1.

---

## What must happen before this reads Cleared

| # | Fix | Owner |
|---|---|---|
| F1 | Rename `label`, or rename it in the three siblings — one meaning, one word | 🎨 Human decides, 🔨 Engineer applies |
| F2 | Stop the advertised `aria-label` failing silently | 🔨 Engineer |
| F3 | Make `dont_use_when` true of the component as shipped | 🎨 Human rules, 📝 Doc Generator writes |
| F4 | Redeploy production Storybook from `e46893c` or later | 🚀 DevOps |
| F5 | Optional before 0.1.0 — settle what `experimental` promises when it is composed into `settling` | 🎨 Human |

F1, F2 and F3 are free today and cost a minor bump after 0.1.0 is cut. F4 is a
redeploy, not a code change.

*Reviewed against the seven gates in `.claude/skills/release-review/SKILL.md`.
Nothing in `src/` was modified. No version was bumped. Nothing was published.*
