# VERSIONING.md — what a version number promises

This file exists so that "ship 0.1.0" means the same thing to everyone who reads
it. 📦 Release's gate 7 is a comprehension check against this page, and it is the
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

This is the whole procedure. It was written down after somebody asked how to cut
`0.1.1` and found step 3 below described in a sentence with no command in it.

```bash
git checkout main && git pull --ff-only
```

**1 · Every component on the surface has cleared all seven gates.**
`.claude/skills/release-review/SKILL.md` is the list.

```bash
npm run release-review -- --all      # must read CLEAR
```

`CLEAR` means the mechanical half passed. The items marked `REVIEW` are the half
a gate cannot check, and they are what the review report is for.

**2 · Prepare the release, before the number moves.**

```bash
npm run release                      # the nine checks. Git untouched
npm run release -- --branch          # …and push release/<version>
```

`scripts/release.mjs` builds, packs, installs the tarball into a scratch project
and renders from it, then reads the packed file list rather than trusting the
exit code. It **stops at the first failure and does nothing after it**, and it
never writes `version` into `package.json`. What comes out is a report at
`reports/release/<version>.md` carrying a proposed number and the specific change
that forces it.

Read the report. The proposal is in words; the number is yours.

**3 · A human bumps the version and tags it.**

```bash
npm version patch                    # 0.1.0 → 0.1.1: edits package.json, commits, tags
npm version minor                    # 0.1.0 → 0.2.0, for anything breaking below 1.0.0
```

**No agent bumps the version**, for the same reason no agent marks a design done:
the number is a promise to people outside this repo, and promises are made by
whoever will be held to them. `npm version` also creates the git tag, which is
the thing a release note points at afterwards.

Move the changelog's `## Unreleased` heading to `## <version> — <date>` in the
same commit. The site's home page reads the first release heading in that file to
say what the current release is, so a version that is cut and a changelog that
still says `Unreleased` disagree in public.

**4 · Publish, which is the irreversible half.**

```bash
npm run release:publish
git push --follow-tags
```

`scripts/publish.mjs` is run by a person and holds no credential — it reads
*whether* you are logged in, never what with. **An npm version cannot be
unpublished after 72 hours.** Everything in steps 1 to 3 is a branch, a draft or
a local commit; this is the step that is not.

There is no `--provenance` on this package, and that is settled rather than
deferred: provenance needs a CI runner's OIDC token, and the only accepted
providers are GitHub Actions and GitLab CI, neither of which is available here.
The publish script records the commit, the tag and the registry checksum instead.
A release note may say a publish was **recorded**. It may not say it was
**attested**.

**5 · Redeploy the reference site.**

```bash
npm run docs:build && npm run docs:deploy -- --prod
```

The home page reads `package.json` for the version and `CHANGELOG.md` for that
version's entry, so a redeploy is what makes the site say what was just
published. Until it runs, the site is announcing the previous release — which is
correct for the build that is live, and wrong for the package.

`docs:deploy` deploys the built output rather than the repository, and refuses if
`docs/dist/index.html` turns out to be a Storybook build. Both of those are there
because deploying from the repository root put Storybook on the reference domain
once.

**6 · Tell people what upgrading costs them.**
[Upgrading](/get-started/upgrading/) is the page a consumer reads. If this
version needs a step that is not `npm install`, that page is where it goes, and
this is the moment it is true.

---

Steps 2, 4 and 5 are all guarded now, because each of them has been missed once:

| Missed | What it produced | What catches it |
|---|---|---|
| The changelog heading | A published tarball whose changelog did not mention the version inside it | `publish.mjs` step 4 refuses |
| The same, at build time | A site announcing the previous release | `generate-docs.mjs` fails the build |
| The redeploy | A correct site nobody can see | Step 5 above, and nothing mechanical — this one is still a habit |
