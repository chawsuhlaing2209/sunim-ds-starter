---
title: React Router
description: Where the stylesheet and the theme attribute go in a React Router framework-mode app, and how to pick a mode on the server so it never flashes.
sidebar:
  order: 3
---

React Router in **framework mode** owns the document — `app/root.tsx` renders
`<html>` itself, and server rendering is on by default. That changes two things
and nothing else: where the stylesheet is declared, and where `data-theme` goes.

:::note[What is measured here and what is not]
The package's server-rendering behaviour is **measured**: all four components
render to static markup with no DOM present, no component touches `window`,
`document`, `localStorage` or `matchMedia`, and `useId` is the only hook in the
package. Those are the claims that could bite you, and they are checked against
the published build.

The React Router wiring below follows that framework's own documented API. It has
not been built and run in this repository, so treat it as the shape rather than a
tested recipe — and if any of it is wrong for the version you are on,
[that is worth reporting](/help/bug-report/).
:::

## The stylesheet

Framework mode builds with Vite, so either form works. Prefer `links()` — it puts
a real `<link>` in the document head, which lets the browser fetch the stylesheet
in parallel with the route modules rather than after them.

```tsx
// app/root.tsx
import type { Route } from './+types/root';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import sunim from '@theproductiveschedule/sunim-design-system/styles.css?url';

export const links: Route.LinksFunction = () => [
  { rel: 'stylesheet', href: sunim },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="day">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
```

The `?url` suffix is what makes the difference: it hands you the built asset's URL
instead of injecting the CSS as a side effect. A plain
`import '@theproductiveschedule/sunim-design-system/styles.css'` also works and is
one line shorter — it just loads later.

Either way the `.woff2` files come along. They are inside the package and the
stylesheet points at them relatively, so Vite hashes them into your build with the
URLs rewritten. There is no font host to allow in a CSP.

**Declare it once, in `root.tsx`.** A route-level `links()` gives you the token
layer on some routes and not others, and a component that renders on a route
without it resolves every `var(--token)` to nothing — unstyled boxes, no error.

## Picking a mode on the server

`data-theme` above is hardcoded, which is right until the mode is a user's choice.
Then it has to be decided **before the first byte**, or the page renders in one
mode and swaps to another after hydration.

The root loader is where that happens:

```tsx
// app/root.tsx
const MODES = ['day', 'open', 'morning', 'sunrise', 'sunset', 'overcast', 'night'] as const;
type Mode = (typeof MODES)[number];

export async function loader({ request }: Route.LoaderArgs) {
  const cookie = request.headers.get('Cookie') ?? '';
  const found = /(?:^|;\s*)sunim-mode=([a-z]+)/.exec(cookie)?.[1];
  const mode: Mode = MODES.includes(found as Mode) ? (found as Mode) : 'day';
  return { mode };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>('root');
  return (
    <html lang="en" data-theme={data?.mode ?? 'day'}>
      {/* … */}
    </html>
  );
}
```

Two details that are easy to get wrong:

- **Validate against the list.** `MODES.includes(...)` is not defensive
  housekeeping — the value comes off a request header and lands in a DOM
  attribute. An unrecognised mode also silently falls back to the root token
  declarations, which is a bug that looks like a design problem.
- **`Layout` renders on the error path too**, when the loader may not have run.
  Hence `useRouteLoaderData` and the `?? 'day'` rather than reading the loader
  data directly — an error boundary that throws a second time because the theme
  was undefined replaces a useful error message with a blank page.

## SPA mode and data mode

`ssr: false` in `react-router.config.ts`, or React Router used as a plain library
without the framework, gives you an ordinary client-rendered app. Nothing on this
page applies: import the stylesheet in your entry module and set `data-theme`
wherever you render the root. [React](/developing/react/) covers it.

## What the components will not do for you

None of them navigate. `Button` renders a native `<button>` and has no `as` prop,
no `href`, and no router awareness — so **a Sunim `Button` is not a `<Link>`**, and
wrapping a `<Link>` around one gives you a button inside an anchor, which is
invalid HTML and behaves differently in every browser.

If you need something that looks like a Button and navigates like a link, that is
a gap in this system rather than something to assemble at the call site.
[Raise it](/help/feature-request/) — a component everybody rebuilds locally is the
clearest signal a design system is missing one.
