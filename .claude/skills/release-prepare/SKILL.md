---
name: release-prepare
description: The nine checks that turn a set of Completed components into a package a human can decide to publish — board, exports, clean tree, peer deps, build, pack, smoke install, changelog, version. Use to prepare a release, never to perform one.
---

# Preparing a release

## When to use this
Use this when a human asks for a release to be prepared. Not on a schedule, not
after a merge, not because several components happen to be `Completed` — a
release that nobody asked for is a release nobody is waiting to approve.

## What this is checking

Every step before this one has asked *is this component right*. This asks
something the whole pipeline has never tested: **is this repository a package.**

Those come apart badly. A design system can have four correct components, a green
build, a deployed Storybook and a reference site, and still produce a tarball
that installs and exports nothing. Nothing upstream would notice, because nothing
upstream ever installs it.

## Run it, then read it

```
npm run release              # the nine gates, git untouched
npm run release -- --branch  # …and push release/<version>
```

The script **stops at the first failure and does nothing after it**. That is
deliberate: a pipeline that carries on past a red step so you can see the rest of
the output is a pipeline that will eventually publish past one.

Running it is not the job, though. Each step below says what it is protecting
against, and step 6 in particular cannot be automated away — the script checks
for the failures it knows about, and you read the list for the ones it does not.

## The nine steps

### 1 · Read the board
`Components` table, `Development` column. Everything reading `Completed` is a
candidate. Write down the ones that are not, with the status they do read.

Check `Release Verdict` too. A `Completed` component that has not been through the
seven gates is a candidate nobody has reviewed, and it goes on the card as one.

**If the board is unreachable, stop.** Do not fall back to listing
`src/components/`. That folder says what exists; only the board says what shipped,
and a release assembled from the folder is a release of whatever was on disk.

### 2 · Confirm each is on the entry point
Every candidate, and its `Props` type, exported from `src/index.ts`.

A `Completed` component that nobody exported is not in the release. That is a
finding for 🔨 Engineer — adding an export is a release decision, and taking it
here would mean the release contains something nobody decided to make public.

### 3 · The working tree is clean
`git status --porcelain` empty.

An uncommitted file means the thing being packed is not the thing anybody
reviewed, and the tarball is unreproducible from that moment on.

### 4 · React is a peer dependency, and is not bundled
`react` and `react-dom` in `peerDependencies`. Never in `dependencies`.

This is the one on this list that costs somebody a day. A consumer who installs a
package that depends on React gets a second copy of React in their tree. It does
not error. It produces *invalid hook call* from a component that is visibly fine,
and nobody's first suspicion is the design system.

Then check the built output for React itself — a bundle that inlined it does the
same damage from the other side, and `peerDependencies` looks correct while it
happens.

### 5 · Build, tokens first
```
npm run build:tokens && npm run build
```

Tokens first, always. Every component resolves `var(--token)` at runtime, so a
library built against a missing token build ships CSS referencing custom
properties nobody defines. It fails as an unstyled component rather than as an
error, which is the slowest kind of failure to trace.

### 6 · `npm pack --dry-run` — and read the file list
Not the exit code. **The list.**

This is where releases go wrong quietly, and the exit code is green for every one
of these:

| What you find | What it means |
|---|---|
| No `dist/` | The package installs and exports nothing |
| `storybook-static/`, `docs/`, `node_modules/` | No `files` field; the tarball is tens of megabytes |
| `.env`, `*.local.json` | A credential is about to be published, permanently |
| `src/` but no build | Consumers compile your TypeScript, with your tsconfig, not theirs |
| Far fewer files than expected | `files` is too narrow; something the exports map needs is missing |

Report the count and the size on the card. A number that surprises you is the
finding.

### 7 · Pack, install into an empty folder, render a component
```
npm pack
mkdir /tmp/smoke && cd /tmp/smoke && npm init -y
npm install <path>/sunim-design-system-<version>.tgz react react-dom
```

Then import a component and render it — a script, a tiny Vite app, whatever is
quickest. It has to actually render.

**Every step before this tests the repository. This is the only one that tests
what a consumer gets.** A package can build, pack and install cleanly and still
fail on the first import because `exports` names a path the build does not
produce, or because the CSS never made it in. An empty folder is what makes it a
real test: your repo's `node_modules` would have papered over both.

### 8 · Draft the changelog
`CHANGELOG.md`, grouped **Added · Changed · Fixed · Deprecated · Removed**. Omit
empty groups rather than writing "none".

Write for somebody who already has the previous version installed and wants to
know what upgrading costs them. That is the only reader a changelog has.

- Not "Refactored Button internals" — that is a commit message.
- Yes "Button's trailing arrow is now an Icon Slot instance. No API change."

**Deprecated and Removed are the two that matter and the two that get skipped.**
An addition is discovered on its own; a removal is discovered by a broken build.

### 9 · Propose a version, and name the change that forces it
One number, and the *specific* change that requires it — by name, not by
category.

| Change | Bump |
|---|---|
| Remove or rename an export, remove a prop, change what a prop means | **minor** `0.1.0 → 0.2.0` |
| Add a component, add an optional prop, add a variant | **patch** `0.1.0 → 0.1.1` |
| Fix a value, a state, or a token binding with no API change | **patch** |

Below `1.0.0` the minor is the breaking-change slot. `VERSIONING.md` is the
source, and **a human writes the number** — you propose it in words.

If nothing forces a bump, say so. A release with no reason is one worth not
doing.

## What ships out of this

A branch — `release/<version>`, pushed, carrying `CHANGELOG.md` and
`reports/release/<version>.md` and nothing else. If the version is not confirmed
it is deleted rather than merged, which is the cheap half of this design: every
artefact here is reversible, and the irreversible half is somebody's decision.

The report carries the candidate list with a reason each way, the pack file list,
what the smoke install rendered, the changelog draft, the proposed version with
its forcing change, and **everything that could not be verified**.

## Publishing, when a human decides

You cannot, and neither can anything on this machine. The publish lives in
`.github/workflows/release-publish.yml` and starts only when a person fills in the
dispatch form — no push trigger, no tag trigger, no schedule, because none of
those is a decision.

That workflow re-runs every gate here against a clean checkout. Not because this
run is distrusted, but because it happened on somebody's machine at some earlier
commit, and the thing about to be published is neither.

Two things it checks that this run cannot:

- **The typed version equals `package.json`'s.** A human writes that number into
  the file; typing it into a form is not the same act. If they disagree, somebody
  is publishing a version they did not write.
- **The published tarball installs and renders.** Not the one built locally — the
  one the registry serves.

`private: true` stays in `package.json` and CI removes it at publish time. The
flag exists to stop a laptop publishing by accident; CI is not an accident.

### When CI cannot run

`npm run release:publish -- <version>` publishes from a machine. It re-runs all
nine gates, refuses without an npm login, refuses a version that does not match
the file, and restores `private: true` in a `finally` so a crash mid-publish
still leaves the catch in place.

**A human runs it. No agent does**, and none holds a credential that would let
one. It is the fallback, not the default: it cannot publish with `--provenance`,
because that needs the OIDC token a CI runner has and a laptop does not. What it
publishes is trusted because a person ran it, and nothing else.

## Never
- Never publish, tag, or deploy anything. Preparing and performing are different
  jobs, and the second one is a human's to start.
- Never edit `package.json`'s `version`.
- Never assemble the candidate list from `src/components/`.
- Never trust `npm pack`'s exit code in place of its file list.
- Never skip the smoke install because the build was green.
- Never fix what a step finds. A change made after the review is a change nobody
  reviewed — hand it back and re-run.
- Never widen `files` or loosen `exports` to make a step pass. Those two fields
  are the package's surface, and a step failing is them telling you the truth.
