---
title: News
description: Dated entries for things that happened to this system but are not a version — a deployment, a restructure, a decision that changed how it works.
sidebar:
  order: 3
---

Not a release feed — [the changelog](/get-started/changelog/) is that, and it is
generated from the file that ships inside the package. This is for the things that
have no version number: a deployment, a decision, a change to how the system
itself works.

Newest first. Entries are added by hand, so an empty stretch means nothing
happened worth writing down rather than that nobody was looking.

---

## 2026-08-21 — This site was rebuilt around five questions

The reference site had grown a single flat *Start here* section carrying
everything from "what is this" to Content-Security-Policy debugging, and a reader
arriving to install a package had to walk past all of it.

It is now organised around what someone is actually here to do — design, build,
look something up, style it, or get unstuck — and rebuilt against five rules:
**findable, understandable, copyable, installable, current.**

What changed:

- **Designing** and **Developing** now exist, with the install path in code and in
  Figma written out rather than implied. The React and React Router pages are new.
- **Core** holds the reference material: the components and the tokens they stand
  on. Their URLs moved from `/components/…` to `/core/components/…`.
- **Changelog** is now generated from `CHANGELOG.md` — the same file inside the
  published package — so the two cannot disagree.
- **The home page is generated too**, which is how it carries the current version
  and the current component count without anybody remembering to update it.
- **Help** collects the FAQ, the two reporting paths, contributing, and the
  embedding notes that were previously filed under *Start here*.

One correction came out of the rebuild: the tokens page had claimed every token
was redeclared in every mode. It is not true and never was — the export redeclares
**colour** per mode and declares everything else once. Somebody reading the old
sentence would expect the focus ring to darken at night, and it does not. The
count is now measured rather than asserted, and [Theming](/styling/theming/) says
what a mode does and does not change.

---

## 2026-08-20 — `0.1.0` published, and this site went live

The first published version of
`@theproductiveschedule/sunim-design-system` reached npm, and the reference site
was deployed alongside the Storybook it embeds.

Four components entered the public surface at once. What that number promises —
and what it deliberately does not — is in [Versioning](/get-started/versioning/);
what it contains is in [the changelog](/get-started/changelog/).

Two things worth recording that are not in either:

- **The publish is recorded, not attested.** GitHub Actions is unavailable on this
  account, and npm provenance requires a CI runner's OIDC token. The publish
  script records the commit, the tag and the registry checksum instead. The
  difference is real and this system will keep stating it.
- **The site and Storybook are on different origins**, which means the embedded
  frames depend on two Content-Security-Policy headers agreeing —
  `frame-ancestors` on one, `frame-src` on the other. Both are named origins;
  neither is `*`. [Embedding](/help/embedding/) is the page that exists because
  getting this wrong produces a blank frame and no error.
