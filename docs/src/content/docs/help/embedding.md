---
title: Embedding
description: Why the Storybook and Figma frames on a component page can come up blank, and the one header that fixes it.
sidebar:
  order: 6
---

Component pages embed two things they do not own: a Storybook story, and the
Figma node the component was built from. Both can come up blank, for different
reasons, and neither failure produces a build error — so this page exists to make
them recognisable.

## The Storybook frames

The deployed Storybook sends:

```
Content-Security-Policy: … frame-ancestors 'self' …
```

`frame-ancestors 'self'` means **only a page on the same origin may frame it**.
That is the correct default and it is doing its job: it is what stops an
arbitrary site putting our Storybook in an invisible frame and dressing it up as
their own.

It also means the frames work in two situations and not a third:

| Where | Frames render? |
|---|---|
| Local development, `:4321` framing `:6006` | **Yes** — the dev server sends no CSP |
| Both deployed to one origin, site under a path | **Yes** — same origin |
| Site and Storybook on different hosts | **No** — blocked, silently |

### If they are on different hosts

Name the site's origin in the header. Do not remove the directive and do not
replace it with `*`:

```json
"value": "… frame-ancestors 'self' https://<the reference site's origin> …"
```

An allowlist of one origin we control is a different thing from no protection at
all. Widening it further to save a click is not a trade this repo makes — and if
that ever looks tempting, deploying both artefacts to one origin gets the frames
back without touching the header.

A blank frame always carries a direct link beside it, so a reader is never
stranded by this — they lose the convenience, not the content.

### Both headers have to agree

A frame is permitted by two headers on two origins, and either one alone blocks
it. They are set in different files and it is easy to fix one and think the job
is done.

| Origin | File | Directive | Says |
|---|---|---|---|
| Storybook | `vercel.json` | `frame-ancestors` | who may frame **me** |
| This site | `docs/vercel.json` | `frame-src` | who **I** may frame |

As deployed:

```
# vercel.json — Storybook
frame-ancestors 'self' https://sunim-ds-reference.vercel.app

# docs/vercel.json — this site
frame-src 'self' https://sunim-ds-starter.vercel.app https://embed.figma.com https://www.figma.com
```

Named origins on both sides. Neither is `*`, and neither directive is absent —
an absent `frame-src` falls back to `default-src 'self'`, which blocks exactly the
same frames while looking like nothing is configured at all.

**Figma needs both of its hosts, and that is not a mistake.** Pages embed
`embed.figma.com`, which is the only host that appears in the built HTML. It then
issues a 302 to `www.figma.com/embed/interstitial`, and `frame-src` governs
redirects as well as the initial src — so naming only the host in the markup
blocks the frame one hop later, with a console error pointing at a URL that
appears nowhere in the source:

```
Framing 'https://www.figma.com/' violates … "frame-src … https://embed.figma.com"
```

Check it with `curl -sI` on the embed URL rather than by reading the HTML. Both
directions of this were got wrong here once each — `www` without `embed`, then
`embed` without `www` — and each looked correct in the file.

## The Figma frames

A Figma embed renders for whoever can already see the file. If the component
file is not shared to *anyone with the link*, the frame shows a sign-in wall
instead, and a build cannot tell the two apart — the URL is valid either way.

So the check is manual and belongs to whoever ships the site: **open a component
page in a logged-out browser** and look at the Design tab. Every frame carries a
link to the node beside it for exactly this case.

Sharing the file is a decision about the design work, not a technical fix, and it
is 🎨 Human's to make.
