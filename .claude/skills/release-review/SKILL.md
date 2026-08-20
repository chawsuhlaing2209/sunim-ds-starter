---
name: release-review
description: The seven gates a component clears before its name goes into a public version, and the five perspectives you find the answers from. Use before cutting a release, never to fix what you find.
---

# The release review

## When to use this
Use this when a component is `Completed` and somebody is about to put its name in
a version number. Not before — a component still moving through QA is being
checked against its design, which is a different question from whether its name,
its surface and its promises are ready to be public.

Use it on one component at a time. A batch review is four reviews written down
together, not one review of four things.

## What this gate is actually for

Everything upstream asks **does it match the design.** This asks a question no
other agent asks: **can we live with this in public.**

Those come apart more often than they sound like they should. A component can
match its node exactly, pass every test, and still carry a prop name nobody will
defend in six months, an export nobody decided to make public, or an intent that
exists only in the head of whoever built it. Shipping is cheap and renaming is
not, which is the whole reason this gate sits where it does.

## Two halves, and why they are marked differently

`node scripts/release-review.mjs <Component>` decides what can be decided by
reading files, and prints everything else as **REVIEW** — evidence gathered, not
judged. Run it first, always.

A `CLEAR` from that script means the mechanical half passed. It does **not** mean
the component is releasable, and the script says so on its last line. The REVIEW
items are yours, and they are the ones that matter: nothing mechanical has ever
caught a bad name.

```
npm run release-review -- <Component>
npm run release-review -- --all --version 0.1.0
```

## The five perspectives

The gates are what must be true. The perspectives are how you find out. Work
through the component once from each, and you will hit all seven gates from
angles that disagree with each other — which is the point, because a single
reading agrees with itself.

### 1 · The consumer who has never seen the code
Open the component's **docs page only**. No source, no Figma. Then answer: what
is this for, when should I not use it, and what do I pass it? If you reach for
the source to answer any of those, the docs have failed, and that is a gate 6
finding rather than a note.

### 2 · The engineer who inherits this in six months
Read the names — the component, the props, the variant values, the CSS classes.
For each, ask whether you would defend it in a code review, and whether changing
it later costs a rename or a migration. Gate 4 is where those go.

### 3 · The keyboard and the screen reader
Do not read the a11y field and tick it. Tab into the component in the deployed
Storybook, tab out, tab back. Trigger every state. Then compare what happened to
what the intent claims. This is the perspective that most often disagrees with
the documentation, and when it does, the documentation is what is wrong.

### 4 · The designer
Against the Figma node: does the component offer what the design meant to offer?
Not "does it match" — QA already answered that. This is about affordance. A
variant that exists in the set and cannot be reached through the props is a
finding here even though every rendered pixel agreed.

### 5 · The release
Read `VERSIONING.md`, then say in one sentence what this version promises about
this component and what it deliberately does not. Gate 7 is exactly this
sentence, and it is the one thing in the review that cannot be automated,
because the thing being checked is whether a person understood it.

## The seven gates

### 1 · Is it actually done?
Registry says `Completed`, `Synchronization %` reads `100%`, and no row in
`Staging Testing` reads `Failed` or `Fixed (To re-test)`. Implementation, styles
and stories all exist, and the stories name the Figma node. `npm run lint` and
`npm test` pass — the script does not run them for you, so run them.

**Fails when** a claimed fix was never re-tested, or the row moved after the
report was written. Read the registry now, not this morning's audit.

### 2 · Are the tokens clean?
No raw hex, no raw px outside the `--sunim-<Name>-unbound-*` quarantine, no
`--primitives-*` reached directly. Every unbound value is a design gap that is
still open — check that with 🎨 Human rather than assuming, because a gap that
was closed in Figma and never re-exported looks identical to one that is still
real.

**Fails when** a raw value was moved into a comment instead of onto a token.

### 3 · Is the public surface decided?
The component and its `Props` type are exported from `src/index.ts`. Anything not
exported there is not in the release, whatever else is in the repository.

Then the harder half, which is a judgement: is everything exported *meant* to be?
An export is a promise, and `src/index.ts` is where promises are made
deliberately rather than by a consumer finding a deep import that happens to
work.

**Fails when** a component composes a sibling that is not itself exported — the
consumer can then reach a type they cannot import.

### 4 · Are the names final?
Folder, exported symbol, CSS prefix, intent `component`, and the registry row all
say the same word. Every prop carries a doc comment, because CLAUDE.md is
explicit that a component's props are its documented API.

Then compare the prop names against the **Figma property names**, from the node —
not from the component file, which agrees with itself by construction.

**Fails when** a name is fine and forgettable. "Would I defend this in six
months" is the test, not "is this wrong".

### 5 · Are the states complete?
Every value of every variant union has a story. Then click through every state in
the **deployed** Storybook: disabled, loading and focus are the three that render
correctly and behave wrongly.

The mechanical check here is deliberately weak — it looks for the value's string
in the stories file, which a passing mention would satisfy. Treat it as a
reminder, not a result.

**Fails when** a state is drawn but not wired: a `Loading` that never resolves, a
`Disabled` that still fires its handler.

### 6 · Is the intent clear and documented?
`<Name>.intent.json` exists, every field is filled, no placeholders, and every
`required_tokens` entry both exists in the build and is actually referenced by
the component. `.claude/skills/intent/SKILL.md` holds the format.

Then read it against the component and ask whether it is *true*, which is a
different question from whether it is filled in. `dont_use_when` is the field
that is usually aspirational — it describes the misuse somebody imagined rather
than the one the component invites.

**Fails when** the intent describes a component that does not exist yet.

### 7 · Do you understand what this version means?
`VERSIONING.md` exists and you have read it. `since` is at or behind the version
being cut. Nothing claims `stable` while the version starts with a zero, because
0.x makes no compatibility promise and saying otherwise overstates what the
number can carry.

Then write the sentence: what this version promises about this component, and
what it does not. In your own words, in the report.

**Fails when** the sentence comes out as "it's ready". That is a feeling, not a
promise.

## What you write

One file per component: `reports/release-review/<Name>.md`. Commit it, and push
it, before you hand over — a review that exists on one machine is not evidence,
and an uncommitted file in the shared tree is what turns the next agent's deploy
gate red.

| Section | What goes in it |
|---|---|
| Verdict | `Cleared` or `Blocked`, and the one-line reason |
| Gate table | All seven, with pass / blocked and the evidence for each |
| Perspectives | One block per perspective, including the ones that found nothing |
| Findings | One block per blocker: what you saw, where, and who owns it |
| The version sentence | Gate 7, in your own words |
| Not checked | Everything you could not verify, and why |

The last section is not padding. A review that lists only what it checked reads
as though it checked everything.

## Never
- Never fix what you find, including the one-line ones. You are the last
  independent read before a public promise, and you stop being one the moment
  you edit.
- Never review a component you built or documented in this session.
- Never pass a gate on the strength of the script's `CLEAR`. It says what it
  checked, and the REVIEW lines say what it did not.
- Never re-argue something in `decisions.md`. Record it against the ruling and
  move on. A finding that is *not* there has not been ruled on, whatever anyone
  remembers.
- Never bump a version, tag a release, or edit `package.json`. The number is a
  promise to people outside this repo, and a human makes it.
- Never write `Cleared` for a component whose registry row does not read
  `Completed`. There is nothing to release yet.
