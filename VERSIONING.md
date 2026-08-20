# VERSIONING.md — what a version number promises

This file exists so that "ship 0.1.0" means the same thing to everyone who reads
it. 🧭 Reviewer's gate 7 is a comprehension check against this page, and it is the
only gate that cannot be automated, because the thing being checked is whether a
human understood what they were about to promise.

## The short version

**0.1.0 is the version where the surface becomes named and public. It is not the
version where it becomes stable.** Those are different claims and conflating them
is the expensive mistake.

## What 0.1.0 promises

- These components exist, under these names, exported from `src/index.ts`.
- Each one has a documented prop API and a documented intent.
- Each one has been built from a Figma node, tested against that node by someone
  who did not build it, deployed, and reviewed against the seven gates.
- Anything not exported from `src/index.ts` is not part of the release, whatever
  else is in the repository.

## What 0.1.0 does not promise

- **That any of it survives to 0.2.0.** Under semver, everything before 1.0.0 is
  explicitly unstable: a `0.x` minor bump is allowed to break anything. That is
  not a loophole, it is the contract, and it is why the version starts with a
  zero.
- That the token values are final. `decisions.md` already records two accepted
  gaps in this release.
- That the component set is complete. Four components is a starting point.
- Anything at all about a component whose `status` reads `experimental`.

## How the number moves before 1.0.0

| Change | Bump | Example |
|---|---|---|
| Remove or rename an export, remove a prop, change a prop's meaning | **minor** `0.1.0 → 0.2.0` | `ChipTone` loses `Figma` |
| Add a component, add an optional prop, add a variant | **patch** `0.1.0 → 0.1.1` | `Card` joins the surface |
| Fix a value, a state, or a token binding with no API change | **patch** | Focus ring returns to `Ghost` |

Below 1.0.0 the minor is the breaking-change slot. Above it, the major is — which
is the only real difference 1.0.0 makes.

## What 1.0.0 would mean

That breaking a name now costs a major bump, and so the names have to be worth
keeping. Do not reach for it because the components feel finished. Reach for it
when something outside this repository depends on them and a rename would cost
that team a day.

## Where the version actually lives

`package.json`. One number for the whole package — components do not version
independently, which is why one component's rename is everybody's minor bump.

Each component's `<Name>.intent.json` carries `since` (the version its surface
first appeared in) and `status` (how much of it is expected to survive). Those
are per-component claims inside a single package version, and the reviewer checks
that `since` is never a version that has not been cut yet.

## Cutting a release

1. Every component on the surface has cleared all seven gates — `.claude/skills/release-review/SKILL.md`.
2. `node scripts/release-review.mjs --all` reads `CLEAR`.
3. A human bumps `package.json` and tags it. **No agent bumps the version**, for
   the same reason no agent marks a design done: the number is a promise to
   people outside this repo, and promises are made by whoever will be held to
   them.
