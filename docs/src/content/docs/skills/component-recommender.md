---
title: Component recommender
description: A knowledge skill that reads the intent contract and answers "which component should this UI use?" — described here before it exists.
sidebar:
  order: 1
  badge:
    text: Not built
    variant: caution
---

:::caution[Nothing here ships yet]
This page describes something that has not been built. There is no package to
install, no skill to invoke, and no date. It is here because the contract it would
read **already exists**, and saying so is more useful than an empty section.

Nothing else on this site describes an unbuilt thing. If you find something that
does, that is a defect — [report it](/help/bug-report/).
:::

## The question it would answer

Props tell you *how* to call a component. Nothing in them tells you *when* you
should, or when to reach for a different one — which is the question somebody
building a screen actually has.

This site answers it for a reader. A skill would answer it for an agent, or for
somebody describing a UI in a sentence rather than browsing a component list.

> *"A dismissible label showing which plan a user is on."*
>
> → `Chip`, `tone="Quiet"`, `size="Sm"` — and **not** `Eyebrow`, which names the
> layer above a section head and carries no heading semantics.

## Why the contract for it already exists

Every component carries `src/components/<Name>/<Name>.intent.json`, and it is not
prose. It is a checked structure, read by one module — `scripts/lib/contract.mjs`
— which both the release gate and this site's generator use. Four of its fields
are exactly what a recommender needs:

| Field | What it holds |
|---|---|
| `use_when` | The case this component is the answer to |
| `dont_use_when` | Cases it is not — and **the alternative for every one of them** |
| `where` | Where in a layout it belongs |
| `a11y` | What it guarantees, and at least one thing it does not |

`dont_use_when` naming an alternative is enforced rather than encouraged. Telling
somebody they are wrong without telling them what to reach for sends them back to
building their own — which is the failure a design system exists to prevent.

So the recommendation surface is already written, already validated, and already
the same text three other surfaces render. A skill would be a fourth reader of one
file, not a fifth copy of the same prose.

## What it would still have to get right

- **Answering "none of these"** when that is true. Four components do not cover a
  product, and a recommender that always returns a component is worse than no
  recommender: it sends people to the nearest wrong thing. A gap is a gap to
  raise, not a component to invent.
- **Carrying the limits with the recommendation.** A component's page says what it
  does not promise; a one-line answer that drops that part is how somebody puts a
  failing contrast pair on a phone.
- **Staying current with the registry.** A component that has not shipped must not
  be recommended, for the same reason it does not get a page.

---

Want it? [Say so](/help/feature-request/). A request with the screen you were
building attached is worth more than a vote.
