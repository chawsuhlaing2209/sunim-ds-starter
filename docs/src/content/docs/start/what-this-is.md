---
title: What this site is
description: How the reference site relates to Storybook, and why none of the component pages are written by hand.
sidebar:
  order: 1
---

## Two surfaces, one source

There are two places to look at a Sunim component, and they answer different
questions.

| | Storybook | This site |
|---|---|---|
| Answers | *What does it look like in every state?* | *Should I be using this at all?* |
| Contains | Every variant, size and state, live | Intent, props, tokens, limits |
| Written by | 🔨 Engineer, alongside the component | Nobody — it is generated |

Every component page here deep-links into the matching stories. It does not embed
them: the deployed Storybook sets `frame-ancestors 'self'`, so a cross-origin
frame is blocked — and widening a real protection to save a click is not a trade
worth making.

## Why nothing here is hand-written

A component page is generated from four things that already exist in the
repository:

- **the intent file**, `src/components/<Name>/<Name>.intent.json` — what it is
  for, what it is not for, where it belongs, what it guarantees
- **the props interface**, with the doc comment above each prop
- **the tokens** the component declares it cannot render without, resolved to
  their values in the token build
- **the stories**, for the variant matrix and the deep links

Documentation written separately from those drifts from them, and the drift is
invisible: a page describing a prop that was renamed last month still reads
perfectly. Generating it means the page is wrong only when the component is
wrong.

## The loop this closes

The intent file is not written for this site. It is written once, and then two
different things read it:

- **🧭 Reviewer's gate 6** fails a release if it is missing, thin, placeholdered,
  or naming a token the component does not actually use.
- **This site** turns the same file into the *When to use* section.

They share one reader — `scripts/lib/contract.mjs` — so they cannot disagree. And
the generator refuses to publish a page for a component whose intent would fail
the gate, which is the part that matters: **the site cannot document something
the release gate would have rejected.**

Without that, the two halves drift apart quietly, and the failure is a published
page confidently describing a component that was never allowed to ship.

## What a page will not tell you

That the component is finished. Every page carries a stability line, and below
`1.0.0` none of them promise anything survives the next minor — see
[Versioning](/start/versioning/). Pages also carry, deliberately:

- accessibility limits, stated as measurements rather than adjectives
- values Figma never bound, which are open design gaps rather than decisions
- which tokens are load-bearing, so you know what breaks if the palette moves
