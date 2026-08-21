---
title: Installing Sunim in code
description: Install the package, load one stylesheet in the right order, set a mode, and render the first component.
sidebar:
  label: Introduction
  order: 1
---

Four components, one stylesheet, no configuration. This page gets you from an
empty project to a rendered `Button`, and tells you the two things that go wrong
silently if you get them in the wrong order.

## Install

```bash
npm install @theproductiveschedule/sunim-design-system
```

React is a **peer dependency**, never bundled — the package requires `react` and
`react-dom` at `>=18.0.0` and uses whichever copy your app already has. If you do
not have them:

```bash
npm install react react-dom
```

## Load the stylesheet

The package ships one stylesheet that carries everything, in the only order that
works:

```js
import '@theproductiveschedule/sunim-design-system/styles.css';
```

Inside that one file, in this sequence:

1. **the typefaces** — Schibsted Grotesk and Instrument Sans, as `.woff2` inside
   the package
2. **the token layer** — every semantic token, redeclared for all seven modes
3. **the component rules** — which resolve nothing but `var(--token)`

:::danger[The order is not cosmetic]
Components reference token names and hold no values of their own. Load the
component rules before the tokens are defined and every rule resolves to nothing:
you get unstyled, un-sized, colourless boxes and **no error at all**. This is why
it ships as one file rather than two you could import in either order.

If you only need the foundation — you are styling your own components against the
same palette — `…/tokens.css` ships the tokens and the typefaces alone, without
the component rules.
:::

### The fonts are already inside

No CDN, no `@fontsource` install, no Google Fonts link. The `.woff2` files ship in
the package at the eight weights the tokens name, and the stylesheet points at
them with relative URLs. Your bundler hashes them into your own assets and a page
fetches only the weights it renders.

This matters more than it sounds. A Google Fonts link fails a `font-src 'self'`
policy **silently** — every label falls back to the browser default, and every
width you measure afterwards is wrong for a reason that has nothing to do with the
component.

## Set a mode

Every component follows a `data-theme` attribute on any ancestor. Put it on
`<html>` for the whole app:

```html
<html data-theme="day">
```

Seven modes come out of Figma: `day`, `open`, `morning`, `sunrise`, `sunset`,
`overcast`, `night`. Set none and the tokens fall back to their root
declarations. [Theming](/styling/theming/) covers switching at runtime and
theming one subtree.

## Render something

```tsx
import { Button, Chip, Eyebrow } from '@theproductiveschedule/sunim-design-system';
import '@theproductiveschedule/sunim-design-system/styles.css';

export function Example() {
  return (
    <section data-theme="day">
      <Eyebrow label="Billing" tone="Sky" />
      <h2>Invoices</h2>
      <Chip label="Overdue" tone="Gold" size="Sm" />
      <Button label="Send reminder" variant="Primary" size="Md" showTrailing />
    </section>
  );
}
```

Every prop above mirrors a Figma property name exactly, capitalised value and
all. That is a deliberate rule, not a stylistic one —
[Designing](/designing/introduction/) says why.

## What you can import

```ts
import {
  Button, Chip, Eyebrow, IconSlot,
  type ButtonProps, type ButtonVariant, type ButtonSize, type ButtonState,
  type ChipProps, type ChipTone, type ChipSize,
  type EyebrowProps, type EyebrowTone,
  type IconSlotProps, type IconSlotSize,
  type ComponentIntent,
} from '@theproductiveschedule/sunim-design-system';
```

That list is the whole public surface. **A component is public when it is exported
from `src/index.ts`, and not before** — anything you can reach by deep-importing a
path inside the package is scaffolding, and it can move in a patch release without
that counting as a break.

Types ship with the package; there is no `@types/` to install.

### It is ESM only

`package.json` declares an `import` condition and no `require` one, so
`require('@theproductiveschedule/sunim-design-system')` throws
`ERR_PACKAGE_PATH_NOT_EXPORTED`. Every current bundler and Node 18+ handle the
`import` form. If you are on a CommonJS build that cannot, that is a real gap
worth [raising](/help/feature-request/) rather than working around with a deep
import.

## Check it actually worked

Three things, in the order they fail:

| Symptom | Almost always |
|---|---|
| Boxes render, but unstyled and unsized | The stylesheet is not imported, or is imported after your own reset |
| Styled, but the type looks like the browser default | The fonts did not load — see below |
| Correct in one theme, wrong in another | `data-theme` is set on a node that does not contain the component |

**Confirm a font by measuring it, never by asking.** `document.fonts.check()`
returns `true` for a font that merely resolved to a fallback. Measure a string on
a canvas in the declared family and again in a deliberately bogus one — identical
widths mean the real face never arrived:

```js
await document.fonts.load('700 16px "Schibsted Grotesk"');
const ctx = document.createElement('canvas').getContext('2d');
const width = (family) => {
  ctx.font = `700 16px ${family}`;
  return ctx.measureText('Send reminder').width;
};
console.log(width('"Schibsted Grotesk"') !== width('"__nope__"') ? 'loaded' : 'FALLBACK');
```

The `await` is not optional. Measure before the browser has had a reason to fetch
the face and you get a false negative — which has happened here.

## What this version does not promise

`0.1.0` is the version where the surface becomes **named and public**. It is not
the version where it becomes stable. Below `1.0.0` a minor bump is allowed to break
anything — that is the semver contract rather than a warning, and it is why the
number starts with a zero. [Versioning](/get-started/versioning/) has the full
list of what is and is not promised.

---

Next: [React](/developing/react/) for bundler-specific placement, or
[React Router](/developing/react-router/) if you are server-rendering.
