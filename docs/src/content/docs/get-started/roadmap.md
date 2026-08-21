---
title: Roadmap
description: Everything recorded as open against this system, what each one is blocked on, and why none of it carries a date.
sidebar:
  order: 2
---

:::note[This is a record, not a plan]
Every item below is recorded somewhere in the repository already — in
`decisions.md`, in a component's own intent, in `CHANGELOG.md`, or in a release
report. Nothing here is a commitment and nothing carries a date.

That is deliberate. The registry this system runs on records **evidence, never
intention**, and a roadmap of dated promises is the one document that would break
that rule on the front page. What follows is *what is open*, with what each one is
waiting on. When something moves, it moves because a human designed it, not
because a quarter ended.
:::

## Blocked on design

Nothing downstream can start on these. A human designs, exports the tokens, and
marks a design done — no agent does any of it.

| Open | Recorded in | Waiting on |
|---|---|---|
| **An icon set.** `IconSlot` ships a placeholder arrow, which is why it is the one component marked `experimental`. `Button` and `Chip` both render it on their default path | `CHANGELOG.md`, `IconSlot.intent.json` | A designed set in the Figma file |
| **`Eyebrow`'s mark renders narrower than its design** — the bound typeface carries no glyph for it | `CHANGELOG.md` | A fix upstream in the type or the export |
| **Focus and shadow values per mode.** `effect.*` is declared once and identical in all seven, so the focus ring is the same blue at night as at noon | Measured from the token build | Per-mode values in the Figma variables |
| **A link-shaped action.** `Button` renders a native `<button>` with no `as` prop and no `href` | [React Router](/developing/react-router/) | A designed component; wrapping a link around a button is invalid HTML |
| **`Chip` does not wrap or truncate.** A long label grows the pill past its container | `CHANGELOG.md` | A designed truncation behaviour |

## Ruled, and revisited only if something changes

These are not waiting on anyone. They were decided, written down, and each one
names the condition that would reopen it.

| Ruled | Reopens if |
|---|---|
| **Colour contrast is out of scope for `0.1.0`, repo-wide.** Several tone-on-surface pairs fall below WCAG AA in several modes — measured, not overlooked | The palette changes |
| **`--color-accent-ink` lags Figma.** Code resolves `#1a78bd`; the live variable reads `#166fb2`. One known-stale value is a decision | A *second* token drifts — that is a broken pipeline, not a decision |
| **`ChipTone` ships `Quiet` where the node says `Figma`** | Nothing. Permanent, and it cost no migration because it was ruled before publication |
| **`Eyebrow` defaults to `Sky`, not the node's first variant** | Nothing. Permanent, with a test asserting it |
| **`IconSlot` has no `label` prop** — `aria-label` names it | Nothing. Permanent, with a test asserting the absence |

`decisions.md` in the repository carries all of these with the full reasoning. An
agent or a person who hits one records it as already ruled and moves on. **What is
not on that list has not been ruled**, whatever anyone remembers.

## Blocked outside this repository

| Open | Blocked on |
|---|---|
| **npm provenance.** `--provenance` requires a CI runner's OIDC token, and only GitHub Actions and GitLab CI are accepted providers | GitHub Actions is unavailable on this account for billing reasons that cannot be resolved from where the maintainer is. This is **off the table, not deferred** |

The publish script records the commit, the tag and the registry checksum instead.
That is deliberately weaker and the difference is worth stating precisely: a
release note here may say a publish was **recorded**. It may not say it was
**attested**.

## Not started, and honestly described

| | |
|---|---|
| **[Component recommender](/skills/component-recommender/)** | A knowledge skill reading the intent contract to answer "which component should this UI use?". The contract it would read already exists. Nothing is built |

## What would make `1.0.0`

Not a checklist of features. `VERSIONING.md` puts it in one line, and it is a
question about the world rather than the code:

> Reach for it when something outside this repository depends on these components
> and a rename would cost that team a day.

Until then, below `1.0.0` a minor bump is allowed to break anything — the semver
contract rather than a warning, and why the number starts with a zero.

---

Missing something? [Request it](/help/feature-request/). A request with the screen
you were building attached is worth more than a vote.
