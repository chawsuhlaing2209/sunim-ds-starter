---
title: Upgrading
description: What moving between versions of this package costs you, how to read a changelog for the parts that break, and the one step that is not npm install.
sidebar:
  order: 5
---

```bash
npm install @theproductiveschedule/sunim-design-system@latest
```

That is the whole upgrade for most versions. This page is about the versions
where it is not, and about how to tell which kind you are looking at **before**
you run it.

## Below `1.0.0`, read the changelog first

Every version of this package so far is a `0.x`. Under semver that means a
**minor bump is allowed to break anything** — it is the contract rather than a
warning, and it is why the number starts with a zero.
[Versioning](/get-started/versioning/) has the full list of what a number
promises.

So the number tells you where to look, not whether you are safe:

| Moving | Read |
|---|---|
| `0.1.0 → 0.1.1` — patch | The **Added** and **Fixed** groups. Nothing on the surface was removed or renamed |
| `0.1.0 → 0.2.0` — minor | **Removed** and **Deprecated** first. Below `1.0.0` this is the breaking slot |

**Deprecated and Removed are the two groups that matter and the two that are
easiest to skip.** An addition announces itself the first time you use it; a
removal announces itself as a broken build in somebody else's afternoon.

[The changelog](/get-started/changelog/) is generated from the file that ships
inside the package, so the copy you are reading here and the copy in your
`node_modules` cannot disagree.

## Pin it if a break would cost you

```json
"@theproductiveschedule/sunim-design-system": "0.1.0"
```

An exact version, not `^0.1.0`. The caret range on a `0.x` allows patch bumps
only, which is safe — but it is worth knowing that npm treats `^0.1.0` and
`^1.1.0` completely differently, and the habit of writing carets everywhere is
how a `0.x` dependency surprises somebody.

Pin exactly if you would rather choose the moment you deal with a change than
have it arrive with an unrelated `npm install`.

## The step that is not `npm install`

**If you installed [the knowledge skill](/skills/knowledge-skill/), re-copy it.**

```bash
cp -R node_modules/@theproductiveschedule/sunim-design-system/skill \
      .claude/skills/sunim-design-system
```

The skill is a **copy, not a link**. Upgrading the package leaves the copy in your
`.claude/skills/` exactly as it was, describing the version you installed it
from — so an agent will keep recommending props that moved and keep denying
components that shipped.

There is no installer and no `postinstall` doing this for you, deliberately: a
package that wrote into your `.claude/` directory without being asked would be
editing your agent's instructions on install. A stale copy is the smaller
problem, and this line is the fix.

## After you upgrade

Three checks, in the order they fail:

1. **`npm run build`** — or whatever type-checks your project. A removed export or
   a narrowed prop type is a compile error, which is the good case: it is the
   version of this that tells you.
2. **Look at one screen in each mode you ship.** Token values move between
   versions without any API changing, so a palette change is invisible to a type
   checker and obvious on a page.
3. **Check the contrast pair you actually ship**, if the screen has an
   accessibility requirement. Colour contrast is out of scope for this release
   repo-wide — measured and ruled, not overlooked — so a token change can move a
   ratio in either direction without anything failing.

## Version by version

### `0.1.0 → 0.1.1`

**Additive. No code change required.**

Adds the knowledge skill inside the package, and `./skill/*` to the public
surface. Nothing was removed, renamed, or narrowed; no component changed.

The one action: **re-copy the skill** if you have it installed, using the command
above. If you do not use it, `npm install` is the entire upgrade.

### `0.1.0`

The first published version. Nothing to upgrade from —
[the changelog](/get-started/changelog/) says what it contains and what it is
honest to expect of it.

---

Something broke that this page did not warn you about? That is a documentation
bug and one of the more useful ones — [report it](/help/bug-report/).
