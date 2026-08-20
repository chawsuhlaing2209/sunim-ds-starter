# decisions.md — rulings a human has made

Findings an agent would otherwise report as new, every single time.

An agent that finds something on this list **records it as already ruled and moves
on**. It does not re-argue it, and it does not treat it as a defect to fix. An agent
that disagrees says so once, in its report, and still proceeds.

This file exists because two rulings were made in conversation and written nowhere.
The next audit rediscovered both, correctly, because nothing in the repo said
otherwise. A decision that lives only in a chat log is a decision the system does
not have.

**Check this file before recording a finding as new.** If what you found is not
here, it is not ruled — report it.

---

## Accepted: colour contrast is out of scope for this release, repo-wide

**Ruled** 2026-08-20 · **Scope** every component, every mode · **Status** accepted, not scheduled
**Supersedes** the day-mode ruling below, which it widens rather than replaces.

The owner has ruled colour contrast out of scope for 0.1.0. Not one component,
not one mode: **all of them.**

This was widened deliberately, because the narrow version kept generating the
same finding from new angles. Three release reviews in one day turned up cases
the day-mode ruling did not name — Button's Ghost label at 4.35:1 on
`--color-surface-page`, Chip's Default failing in `open` (4.11) and `sunrise`
(4.13) at token pairs the table below does not list, and Chip's Gold and Agentic
failing in six of the seven modes. Each was correctly reported as new, because
each genuinely was. The ruling was too narrow, not the reviews.

**What this means for you.** Do not fail a case for contrast, in any mode, on any
component. Do not report one as a finding. Record it against this ruling and move
on. Measuring is still worth doing when a number would tell you something else —
a ratio that moved may mean a token drifted — but the ratio itself is not a
defect here.

**What is not ruled.** Every other accessibility question. Focus visibility,
target size, keyboard reachability, accessible names, what is announced and what
is hidden — all still live, all still reportable. This ruling names colour
contrast and nothing else. Two accessibility defects were fixed the same day it
was made.

The components' intents state the limit rather than hiding it, and should keep
doing so. A consumer reading a page is entitled to know before they put it on a
phone.

Revisit if the palette changes.

## Superseded: Chip and Eyebrow fail WCAG AA contrast in day mode

**Ruled** 2026-08-19 · **Scope** Chip, Eyebrow · **Status** superseded by the ruling above

Six of Chip's eight variants and all four Eyebrow tones fall below 4.5:1 against
their surface in `day` mode. Measured, twice, independently:

| Component | Case | Ratio |
|---|---|---|
| Chip | Default | 4.08 |
| Chip | Gold | 3.35 |
| Chip | Agentic | 3.30 |
| Eyebrow | Agentic | 3.48 |
| Eyebrow | Sky | 2.55 |
| Eyebrow | Ink | 4.35 |
| Eyebrow | Gold | 2.16 |

Both components render exactly the token pair their Figma node binds, so there is
no version of either that both passes AA and matches the design. Closing the gap
means changing the palette, which is design's call, and the owner has ruled it
intentional for now.

**What this means for you.** Do not fail a case for this. Record it against this
ruling and carry on. If you find a *new* case that fails, or a ratio that has moved,
that is not covered here — report it.

Recorded in PR #4. Revisit if the palette changes.

## Accepted: the token export lags Figma on `accent-ink`

**Ruled** 2026-08-19 · **Scope** repo-wide · **Status** accepted, not scheduled

`--color-accent-ink` resolves to `#1a78bd` in `build/tokens/css/tokens.css`, from
the committed `tokens/tokens.json`. Figma's live variable reads `#166fb2`. Eleven
of twelve other colours on the same node match hex-for-hex, which is what makes
this a stale export rather than a mismapping.

Re-exporting would lift Eyebrow's Ink tone from 4.35 to 4.92 and clear AA on that
one tone. The owner has ruled the accessibility outcome intentional, so the
re-export is not scheduled either.

**What this means for you.** Expect code and Figma to disagree on this one value.
Bind the semantic token and move on. Do not hand-edit `build/tokens/` — it is
generated, and that rule does not bend for this.

**What is not ruled:** any *other* token drifting. One known-stale value is a
decision; a second one is a broken pipeline. Report it.

## Accepted: Eyebrow's default tone is Sky, not the node's first variant

**Ruled** 2026-08-20 · **Scope** Eyebrow · **Status** accepted, permanent

`Eyebrow.tsx` defaults `tone` to `Sky`. The Figma set's first variant is
`Agentic`, so the code and the node disagree on purpose.

The prop doc had said "Sky is the default" while the code said `Agentic`, and the
two had disagreed long enough to be published — after the docs deployed, the same
table row carried both answers. The owner ruled the prose right: an eyebrow that
appears with no tone set should be the ordinary one, not the AI-moment one, which
the design file itself asks to stay rare on any one screen.

**What this means for you.** The default not matching the node's first variant is
not a finding. A test asserts `Sky`, so changing it back is a deliberate act with
a failing test attached rather than a one-word edit nobody notices.

**What is not ruled:** any *other* default diverging from its node. This names one.

## Accepted: Chip's fourth tone is `Quiet`, which the node calls `Figma`

**Ruled** 2026-08-20 · **Scope** Chip · **Status** accepted, permanent

`ChipTone` is `Default | Gold | Agentic | Quiet`. The Figma symbol is genuinely
named `Tone=Figma`, so the export was right and the engineer transcribed it
correctly.

CLAUDE.md requires prop names and values to match the Figma property names
exactly, and two release reviews raised this against that rule. It is a real
collision: the rule exists so a design change and a code change stay the same
conversation. But `Default`, `Gold` and `Agentic` name meanings, and `Figma`
named the tool — it told a consumer neither what the tone means nor what it looks
like. `Quiet` is the word the node's own description uses.

Ruled before anything was published, so it cost no migration. `VERSIONING.md`
still carries "`ChipTone` loses `Figma`" as its worked example of a breaking
change; that example is now historical rather than hypothetical.

**What this means for you.** This one value diverging from the node is not a
finding. **What is not ruled:** any other prop name or value diverging. The rule
still stands everywhere else, and a second divergence is a drifting pipeline
rather than a decision.

## Accepted: IconSlot has no `label` prop

**Ruled** 2026-08-20 · **Scope** Icon Slot · **Status** accepted, permanent

`IconSlotProps` exposes no `label`. Name the slot with `aria-label`, which is
inherited from `HTMLAttributes`; leave it off and the slot is decorative and
hidden.

There used to be a `label` meaning the icon's accessible name — the opposite of
`label` on Button, Chip and Eyebrow, where it is visible required text, and
`Button.tsx` carried both meanings four lines apart. It was invented here to
collide: the node exposes only `Size`.

Two things made dropping it the cheaper option than renaming it. `aria-label` was
already on the type and, once it was actually honoured, already did the job — so
removing `label` made the surface smaller rather than moving the problem. And the
prop's own published documentation had begun recommending `aria-label` instead,
which is not a state a public API should ship in.

**What this means for you.** The absence is the decision. A test asserts that
passing `label` names nothing, so the failure is visible rather than silent.
