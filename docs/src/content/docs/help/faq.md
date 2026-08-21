---
title: FAQ
description: The questions this system actually gets, answered with what is true rather than what would be nice.
sidebar:
  order: 1
---

## Using it

### Can I use it without React?

No. The components are React components and React is a peer dependency at
`>=18.0.0`. What you *can* use without React is the foundation:

```js
import '@theproductiveschedule/sunim-design-system/tokens.css';
```

That ships the typefaces and every token, in all seven modes, with no component
rules. Style your own markup against `var(--color-accent-ink)` and the palette
stays in step.

### Why does `require()` throw?

`ERR_PACKAGE_PATH_NOT_EXPORTED` — the package declares an `import` condition and
no `require` one. It is ESM only. Every current bundler and Node 18+ handle the
`import` form; if you are on a CommonJS build that genuinely cannot, that is a gap
worth [raising](/help/feature-request/) rather than routing around with a deep
import into `dist/`.

### Everything renders as unstyled boxes.

The stylesheet is not loaded, or it is loaded after something that resets it.
Components resolve nothing but `var(--token)` and hold no values of their own, so
a missing token layer produces colourless, un-sized boxes **and no error at all**.

```js
import '@theproductiveschedule/sunim-design-system/styles.css';
```

Once, in the entry module, before your own CSS.

### The type looks like the browser default.

The faces did not load. They ship inside the package as `.woff2` — there is no CDN
link and nothing to install — so this is nearly always a bundler that is not
copying the font assets, or a Content-Security-Policy blocking them.

Confirm it by measuring, never by asking: `document.fonts.check()` returns `true`
for a font that merely resolved to a fallback. [Installing](/developing/introduction/)
has the canvas check, including the `await` that makes it correct.

### Correct in one mode, wrong in another.

`data-theme` is on a node that does not contain the component. It has to be an
*ancestor* — the nearest one wins, and a sibling does nothing. See
[Theming](/styling/theming/).

### Why doesn't `Button` navigate?

It renders a native `<button>`. There is no `as` prop and no `href`, and wrapping a
`<Link>` around one gives you a button inside an anchor — invalid HTML that behaves
differently in every browser.

A component that looks like a Button and navigates like a link is a real gap in
this system. [Raise it](/help/feature-request/): a component everybody rebuilds
locally is the clearest signal a design system is missing one.

## The design side

### Is it accessible?

Partly, and the parts are stated rather than claimed.

**Colour contrast is out of scope for `0.1.0`, repo-wide.** Several tone-on-surface
pairs fall below WCAG AA in several modes. That is measured, ruled by the owner,
and recorded — every component page states its own case rather than hiding it. So
check the pair you are actually shipping, in the mode you are shipping it in.

Everything else in accessibility is live: focus visibility, target size, keyboard
reachability, accessible names, what is announced and what is hidden. Two
accessibility defects were fixed on the same day that ruling was made.

"Accessible" is not a commitment this system makes. Each component's page carries
at least one measured thing it does **not** guarantee — `Md is 36px, which clears
2.5.8 at AA and misses 2.5.5 at AAA` is the shape of it.

### Why is `Chip`'s fourth tone `Quiet` when Figma says `Figma`?

Because a public type union naming the design tool told a consumer neither what
the tone means nor what it looks like. `Default`, `Gold` and `Agentic` name
meanings; `Figma` named a company. `Quiet` is the word the node's own description
uses.

It was ruled before anything was published, so it cost no migration. Two other
values diverge from the design file on purpose —
[Designing](/designing/introduction/) lists all three, with the reasoning. Any
*other* divergence is a defect: one is a decision, two is a broken pipeline.

### Why does the Design tab ask me to sign in?

The Figma file is not shared to *anyone with the link*. An embed renders for
whoever can already open the file, and nothing in the build can tell a valid URL
from an inaccessible one. [Embedding](/help/embedding/) has the detail; the fix is
a sharing setting a human owns.

### Can I just change a colour?

Change it in Figma, re-export `tokens/tokens.json`, run `npm run build:tokens`.
That is the only change that survives.

Never edit `build/tokens/` — it is generated, and an edit there lasts until the
next export. [Theming](/styling/theming/) lists the three legitimate ways to
change a value, in order of how long each one lasts.

## The system

### Why only four components?

Because four have been designed, built, tested by someone who did not build them,
deployed, reviewed against seven gates and cleared. That is the bar, and nothing
gets a page here before it clears it.

If the component you need is not here, that is a gap to
[raise](/help/feature-request/) rather than one to fill in locally. A copy of a
component stops following the tokens the moment the palette moves, and nothing
tells you.

### Is `0.1.0` safe to depend on?

Depends what you mean by safe. `0.1.0` is the version where the surface becomes
**named and public** — not the version where it becomes stable. Below `1.0.0` a
minor bump is allowed to break anything; that is the semver contract rather than a
warning, and it is why the number starts with a zero.

Pin it exactly if a break would cost you a day.
[Versioning](/get-started/versioning/) has the full list of what is and is not
promised.

### Why is there no npm provenance on the package?

Provenance requires a CI runner's OIDC token, and only GitHub Actions and GitLab
CI are accepted providers. Actions is unavailable on this account for billing
reasons that cannot be resolved from where the maintainer is, so `--provenance` is
off the table rather than deferred.

The publish script records the commit, the tag and the registry checksum instead.
That is deliberately weaker and the difference is worth being precise about: a
release note here may say a publish was **recorded**. It may not say it was
**attested**.

### Can I edit a page on this site?

Only some of them. Component pages, the tokens page, the changelog, the versioning
page and the home page are **generated** from `scripts/generate-docs.mjs` — editing
one lasts until the next build, the same rule as `build/tokens/`.

[Contributing](/help/contributing/) says which files are which, and what to change
instead.

---

Not here? [Report a bug](/help/bug-report/) or
[request a feature](/help/feature-request/).
