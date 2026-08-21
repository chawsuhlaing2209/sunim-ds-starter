---
title: The knowledge skill
description: A skill that ships inside the package, so a coding agent knows which Sunim component answers a piece of interface — and says so when none of them does.
sidebar:
  label: Knowledge skill
  order: 1
---

The package carries a skill. Copy one directory into your project and a coding
agent stops guessing at this design system: it knows which component answers a
given piece of interface, which one does not and what to reach for instead, the
exact capitalisation of every prop value, and the handful of rules that are the
difference between *using* this system and quietly reimplementing it.

## Install it

```bash
npm install @theproductiveschedule/sunim-design-system
```

```bash
cp -R node_modules/@theproductiveschedule/sunim-design-system/skill \
      .claude/skills/sunim-design-system
```

That is the whole installation. Seven markdown files, no build step, no
dependency, nothing that runs.

:::caution[It is a copy, not a link]
There is no installer and no `postinstall`, so **upgrading the package does not
update a copy already sitting in `.claude/skills/`.** Re-run the copy after an
upgrade.

That is a deliberate trade. A `postinstall` that wrote into your `.claude/`
directory without being asked would be doing something to your repository you did
not request, in a directory that tells your agent how to behave. A stale copy is
a smaller problem than a package that edits your agent's instructions on install.
:::

The path is also on the public surface, if you would rather script it than copy
it by hand:

```js
require.resolve('@theproductiveschedule/sunim-design-system/skill/SKILL.md');
```

## What is in it

| | |
|---|---|
| `SKILL.md` | Choosing a component, every prop value at a glance, the rules that do not bend, and what the system does not promise |
| `components/<name>.md` | One page per component: use when, do not use when, the full props table, worked calls, accessibility, tokens |
| `reference/setup.md` | Install, the stylesheet order, fonts, modes, server rendering, the client boundary |
| `reference/tokens.md` | Every token a released component stands on, with its value — for styling the markup *around* the components |

## The part that matters most

**Knowing when the answer is "there is no component for this."**

Four components do not cover a screen. Most of what an agent builds will be
layout, headings, cards, forms and tables — none of which exist here. A skill
that only listed what the system has would leave an agent to improvise the rest,
and improvising against a design system means one of three things, all bad:

- copying a component's CSS, which stops following the tokens the moment the
  palette moves
- pressing a component into a job its own page rules out
- inventing a token name, which resolves to nothing and renders nothing, silently

So the skill names the components it does **not** have — Card, Input, Modal,
Table, Select, Tooltip, Alert, Badge, Avatar, Tabs — because a general rule does
not stop an agent writing `<Card>`. It has written that import in a hundred other
codebases and nothing here had contradicted it yet.

What it says to do instead is build the surrounding UI from the tokens, and
**say out loud that the component was missing.** A component several people have
each rebuilt privately is the clearest evidence a design system is missing one,
and the maintainers cannot see it happening.

## It is generated, and it refuses

Nothing in the skill is written by hand. It comes out of
`scripts/generate-skill.mjs`, from each component's `<Name>.intent.json`, its
props interface, the token build and the surface — through
`scripts/lib/contract.mjs`, the same module 📦 Release's gate 6 reads.

That makes the skill the **fourth reader of one file**, not a fifth copy of the
same prose. The other three are the component's Storybook docs page, the
`Component Intent` gallery, and this site.

And it inherits both refusals. The generator will not describe a component whose
intent would fail gate 6, and will not describe one the registry does not read as
`Completed` — the second ignores `--force`, exactly as the site's does.

The reasoning is this site's, one step sharper:

> A documentation page that describes a component wrongly is read by a person,
> who can notice. A skill that describes one wrongly is read by an agent, which
> will write the import.

There is one more check the generator makes on itself. The list of components it
tells agents do not exist is asserted against the published set, so the day a
`Card` ships, the build fails rather than the skill going on denying it.

## What it will not do

- **It has no opinion about your application.** No layout system, no routing, no
  form library, no state management. This design system has no components for any
  of that, and a skill that improvised there would be inventing a design system
  rather than describing one.
- **It does not make the components accessible.** Colour contrast is out of scope
  for this release, repo-wide, and the skill says so rather than hiding it — each
  component page carries its own measured case. If the screen has an
  accessibility requirement, the skill tells the agent to check the pair it is
  actually shipping, in the mode it is shipping it in.
- **It does not pin your version.** Below `1.0.0` a minor bump is allowed to break
  anything, and a skill copied from one version describes that version. Re-copy
  when you upgrade, and see [Versioning](/get-started/versioning/).
