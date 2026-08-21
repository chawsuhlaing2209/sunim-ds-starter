---
title: Theming
description: What a Sunim mode changes, what it deliberately does not, and how to scope one to part of a page.
sidebar:
  order: 1
---

The system has seven modes, they come out of Figma, and switching between them is
one attribute. What takes a page to explain is what a mode **does not** change,
because that is where the surprises are.

## Switching

```html
<html data-theme="night">
```

`data-theme` on any ancestor. Everything inside it follows.

| Mode | |
|---|---|
| `day` | The default. Applies when no `data-theme` is set at all |
| `open` · `morning` · `sunrise` · `sunset` · `overcast` · `night` | The other six the Figma variables define |

There is no `auto`, and nothing reads `prefers-color-scheme`. Mapping the
operating system's dark preference onto `night` is your application's decision
rather than the system's, and it is one line:

```js
document.documentElement.dataset.theme =
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
```

Do that on the server if you can. Deciding it after hydration means the first
paint is in the wrong mode, and the swap is visible.

## A mode changes colour, and nothing else

This is the part worth reading twice.

| Redeclared per mode | Declared once, identical in all seven |
|---|---|
| `color.*` — every surface, text, line and accent | `spacing.*`, `radius.*`, `font.*`, `type.*`, `effect.*` |

So a component keeps its size, its type and its shape across all seven modes, and
only its palette moves. Two consequences that catch people:

- **The focus ring is the same blue at night as at noon.** `effect.focus-ring`
  resolves to a fixed `0 0 0 3px` in an accent tint, declared once. It was designed
  against a light surface. On the darker modes it is still visible, but it is not
  a value anyone chose *for* those modes.
- **`effect.shadow-button` likewise.** A drop shadow tuned for a pale surface does
  less on a dark one.

Neither is a bug in a component — both bind the token they were given. They are
open questions for the palette, and the right place to raise one is
[a feature request](/help/feature-request/) against the tokens, not an override
at the call site.

## Scoping a mode to part of a page

Modes nest. The nearest `data-theme` ancestor wins, so a single panel can sit in
a different mode from the page around it:

```html
<body data-theme="day">
  <main>…</main>
  <aside data-theme="night">
    <!-- everything in here resolves the night palette -->
  </aside>
</body>
```

This is how this site renders its own light-and-dark examples side by side, and
it needs no provider and no JavaScript — the tokens are cascading custom
properties, and the cascade already does it.

**The attribute has to be on an ancestor of the component**, not a sibling and not
a wrapper you forgot to render. A component that looks correct in one mode and
wrong in another is nearly always this.

## Changing a value

In order of how long the change lasts:

1. **Change it in Figma, re-export, rebuild.** The only change that survives.
   `tokens/tokens.json` → `npm run build:tokens` → `build/tokens/`.
2. **Redeclare a semantic token in your own CSS**, scoped to your own container.
   Legitimate for an application-specific surface; you are choosing a value the
   design system did not.
3. **Override a component's own custom property**, where the component documents
   one — `--sunim-IconSlot-color` is the worked example. This is the only override
   a component actually invites.

And one that is not on the list: editing anything in `build/tokens/`. It is
generated. A value that is wrong is wrong in Figma, and fixing it there lasts
exactly until the next export.

### `unbound` is not an extension point

Custom properties with `unbound` in the name — `--sunim-Button-unbound-icon-size`,
`--sunim-Chip-unbound-padding-y-sm` and the rest — mark values **Figma never bound
to a token**. They are named so they are findable, not so they are set.

Overriding one means choosing a number nobody designed, in a place the design
system has already admitted it has a gap. Each component's page lists its own, and
the honest response to finding one you need is to close it in Figma.

## Contrast, stated rather than discovered

Several tone-on-surface pairs fall below WCAG AA in several modes. That is
measured, ruled by the owner as out of scope for `0.1.0`, and recorded — not
overlooked. Every component page states its own case.

Which means: **check the pair you are actually shipping, in the mode you are
actually shipping it in.** The system will render a combination that does not meet
AA without complaining, because it was told to.

Every other accessibility question — focus visibility, target size, keyboard
reachability, accessible names — is still live and still worth reporting.
