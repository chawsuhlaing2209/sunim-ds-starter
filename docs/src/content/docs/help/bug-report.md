---
title: Report a bug
description: Where to file, what makes a report actionable here, and the three things that are already ruled and are not bugs.
sidebar:
  order: 3
---

**[Open an issue →](https://github.com/chawsuhlaing2209/sunim-ds-starter/issues/new)**

Before you write it, two minutes on this page will save you the round trip.

## Check it is not already ruled

Some findings have been decided by a human and written down. An agent or a person
who hits one **records it as already ruled and moves on** — it is not a defect to
fix and not an argument to have again. The three that come up most:

| Finding | Status |
|---|---|
| A tone-on-surface pair fails WCAG AA contrast | **Ruled out of scope for `0.1.0`, repo-wide.** Measured, recorded, revisited if the palette changes |
| `ChipTone` ships `Quiet` where Figma says `Figma` | **Ruled, permanent.** A type union naming the design tool told a consumer nothing |
| `Eyebrow` defaults to `Sky`, not the node's first variant `Agentic` | **Ruled, permanent.** The default should be the ordinary tone, not the AI-moment one |

The full list, with reasoning, is `decisions.md` in the repository.

**What is *not* ruled is worth being just as precise about.** Every other
accessibility question is live — focus visibility, target size, keyboard
reachability, accessible names, what is announced and what is hidden. A *second*
prop diverging from its Figma node is a broken pipeline rather than a decision. A
*second* stale token value is the same. Each ruling names exactly one thing, and
nothing else.

If what you found is not in that file, it is not ruled. Report it.

## What makes a report actionable

The whole system runs on evidence rather than description, so a report that
carries evidence gets fixed and one that carries an impression gets a reply asking
for evidence.

Copy this:

```markdown
**Component and version**
Chip 0.1.0

**Mode**
`night` (set with data-theme on <html>)

**What I did**
<Chip label="Overdue" tone="Gold" size="Sm" />

**What I expected**
The label to stay inside the pill.

**What happened**
A 40-character label grows the pill past its container and clips.

**Where I saw it**
https://sunim-ds-starter.vercel.app/?path=/story/components-chip--default-sm
Chrome 141, macOS 15.

**Measured, if it is a measurement**
Contrast 3.30:1 against --color-surface-card, WebAIM contrast checker.
```

The four that matter most, in order:

1. **The mode.** Seven exist and a component renders all seven faithfully. A
   report without the mode is a report nobody can reproduce.
2. **A Storybook link.** Every variant and state has a story — deep-link the exact
   one. It removes every question about how you called it.
3. **A number, if the claim is a number.** "Low contrast" is an impression. "3.30:1
   against `--color-surface-card`" is a finding.
4. **What you expected.** Half of what arrives as a bug is a component doing
   exactly what it says on its own page. Saying what you expected makes that
   visible in one line instead of three replies.

## Where the fix will actually land

Worth knowing so the reply is not a surprise.

- **A component rendering the wrong thing** is a code fix. It goes to the engineer,
  gets tested by somebody who did not write it, and ships.
- **A token with a wrong value** is a Figma fix. Nobody edits `build/tokens/` — a
  value that is wrong is wrong in Figma, and fixing it downstream lasts until the
  next export.
- **A component matching its design, where the design is the problem**, is a design
  decision. It goes to a human, and no agent makes it.
- **A page describing something the component does not do** is a documentation bug
  and one of the more useful ones — but the fix is usually to the component, not
  the page. Editing a component so its documentation becomes true is the wrong
  direction; the gap *is* the finding.

## Security

Do not open a public issue. Email the maintainer through the
[GitHub profile](https://github.com/chawsuhlaing2209) instead.

This repository is public and so is its history — please do not paste tokens,
keys, base IDs or record IDs into an issue, a title, or a screenshot. Nothing in
this system needs one to reproduce a component bug.
