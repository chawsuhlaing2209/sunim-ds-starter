---
title: React
description: Where the stylesheet goes in Vite, Next.js and Webpack, how to switch modes at runtime, and the one override a component actually invites.
sidebar:
  order: 2
---

The components are plain React function components with no runtime, no context
provider and no global state. What follows is only about **where the one
stylesheet goes** in each setup, and the two places React's own boundaries matter.

Read [Installing](/developing/introduction/) first — everything here assumes the
package is installed and you know what is on the public surface.

## Vite

Import the stylesheet once, in the entry module, before your own styles:

```tsx
// src/main.tsx
import '@theproductiveschedule/sunim-design-system/styles.css';
import './index.css';

import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<App />);
```

Vite inlines it in development and emits a hashed `.css` asset in a build, with
the `.woff2` files copied alongside and rewritten to match. Nothing to configure.

## Webpack, Create React App, Parcel

The same import, in the same place — the entry module, ahead of your own CSS.
Anything with a `css-loader`-equivalent and asset handling for `.woff2` works
unchanged, which is every default configuration these ship with.

## Next.js

Two things to know, and one of them will bite.

**The stylesheet goes in the root layout.** Next only allows a global stylesheet
to be imported from `app/layout.tsx`:

```tsx
// app/layout.tsx
import '@theproductiveschedule/sunim-design-system/styles.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="day">
      <body>{children}</body>
    </html>
  );
}
```

:::caution[`Button` needs a client boundary]
**The package ships no `"use client"` directive**, and `Button` calls `useId`.
Hooks do not run in a Server Component, so rendering `Button` directly inside one
fails. `Chip`, `Eyebrow` and `IconSlot` call no hooks and render as server
components today — but that is an implementation detail rather than a promise, and
below `1.0.0` it can change in a minor bump.

Give them a client boundary and stop thinking about it:

```tsx
// components/sunim.ts
'use client';
export { Button, Chip, Eyebrow, IconSlot } from '@theproductiveschedule/sunim-design-system';
```

Then import from `./components/sunim` everywhere. **This is stated from reading the
package, not from a tested Next.js app** — the tested claim is the one below.
:::

## Server rendering

`renderToStaticMarkup` on all four components, with `data-theme` set on an
ancestor, produces correct markup with no DOM present. That is measured against
the published build rather than asserted: no component touches `window`,
`document`, `localStorage` or `matchMedia`, and `useId` is the only hook in the
package.

So there is no hydration mismatch to design around, and no "client only" wrapper
needed for the markup itself. What a server render *cannot* carry is the mode, if
you intend to pick it per-user — see below.

## Switching modes at runtime

`data-theme` is a plain attribute. Set it, and everything inside follows:

```tsx
import { useState } from 'react';

const MODES = ['day', 'open', 'morning', 'sunrise', 'sunset', 'overcast', 'night'] as const;

export function ModeSwitch() {
  const [mode, setMode] = useState<(typeof MODES)[number]>('day');
  return (
    <>
      <select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
        {MODES.map((m) => <option key={m}>{m}</option>)}
      </select>
      <div data-theme={mode}>{/* everything in here follows */}</div>
    </>
  );
}
```

Components bind token *names*, never values, which is what lets seven modes exist
without a component knowing there is more than one. [Theming](/styling/theming/)
covers scoping a mode to part of a page and what a mode does not change.

## Overriding

There is one override every component invites, and one rule that does not bend.

**Invited.** A component that leaves something to its caller exposes it as a
custom property. `IconSlot`'s colour is the documented example — `Button` sets it
to `currentColor` so the trailing arrow follows the variant's text colour:

```css
.my-toolbar .sunim-IconSlot {
  --sunim-IconSlot-color: var(--color-accent-ink);
}
```

Properties whose names contain `unbound` mean something different: they are values
Figma never bound to a token. They are **open design gaps rather than extension
points**, and each component's page lists its own. Overriding one is choosing a
value nobody designed.

**Not invited.** Copying a component's styles instead of importing the component.
The copy stops following the tokens the moment the palette moves, and nothing
tells you — which is the same failure as a hand-written documentation page, in
CSS.

## Composition

`Button` and `Chip` both render `IconSlot` on their default path. Component pages
say what imports what, in both directions, so a change to one tells you who else
is affected before you make it.

The arrow `IconSlot` ships is a placeholder for an icon set that is not in this
package yet, which is why `IconSlot` is the one component marked
`experimental`. Pass your own through `Button`'s `icon` prop when you have one.

---

Server-rendering with a router? [React Router](/developing/react-router/) covers
where the stylesheet and the theme attribute go in a framework-mode app.
