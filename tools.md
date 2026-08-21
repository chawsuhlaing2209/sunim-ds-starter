# tools.md — what this project is built with

Stack facts and commands only. Rules about how we work live in `CLAUDE.md`.

## Stack

- Framework: React 19 with Vite. React is a **peer** dependency of the published
package and is never bundled — a consumer with two copies of React gets "invalid
hook call" from a component that is visibly fine
- Library build: Vite library mode from `src/index.ts` + `tsc` for declarations,
into `dist/`. One stylesheet, `dist/styles.css`, tokens first
- Language: TypeScript, strict
- Package manager: npm
- Styling: CSS custom properties, generated from tokens
- Tokens: Style Dictionary v5, reading the Figma "Design Tokens" plugin export
- Component workshop: Storybook 10 (react-vite) — where components render
- Reference site: Astro 7 + Starlight, in `docs/`, its own npm package — where
components are explained. Generated; never hand-written
- Tests: Vitest
- Accessibility: Storybook a11y addon
- Typefaces: Schibsted Grotesk, Instrument Sans, Caveat — self-hosted via `@fontsource`,
loaded in `.storybook/preview.ts`. Not a CDN; the deployed CSP forbids one

## Commands

| Job | Command |
|---|---|
| Install | `npm install` |
| Build tokens | `npm run build:tokens` |
| Build the library | `npm run build` → `dist/` (tokens, then Vite, then types, then CSS, then the skill) |
| Build the knowledge skill | `npm run build:skill` → `skill/` (generated from the intent contract; gitignored, packed) |
| Run Storybook | `npm run storybook` |
| Build Storybook | `npm run build-storybook` |
| Test | `npm test` |
| Type check | `npm run lint` |
| Security gate | `npm run security-check` (add `--url <url>` after deploying, `--dir <path>` for another build) |
| Release gate | `npm run release-review -- <Component>` (or `-- --all --version 0.1.0`) |
| Prepare a release | `npm run release` (add `--branch` to push `release/<version>`) |
| Publish a release | `npm login`, then `npm run release:publish -- <version>`. A human runs it; no agent does |
| …the second factor npm requires | `--otp <code>`, or a granular token with Bypass 2FA scoped `@theproductiveschedule`. Required since 2025 even with account 2FA off |
| …why not CI | `.github/workflows/release-publish.yml` is correct and cannot run: Actions is locked account-wide over a balance this account cannot clear. So no `--provenance` — `scripts/publish.mjs` says what replaces it |
| Install the site | `npm run docs:install` (once — `docs/` has its own `node_modules`) |
| Generate the site | `npm run docs:generate` (add `--storybook <url>` to embed a different one) |
| Run the site | `npm run docs:dev` (port 4321) |
| Build the site | `npm run docs:build` → `docs/dist` |

## Registry and design sources

The registry is Airtable. It is where the crew hands work over, and it is the only place a
component's real status lives. The contract — tables, field owners, the status formula —
is `.claude/skills/registry/SKILL.md`. Read that before writing to it.

| Thing | Where |
|---|---|
| Registry base and table IDs | `.claude/registry.local.json` — gitignored, not in this repo |
| Template for that file | `.claude/registry.example.json` |
| Pipeline board (FigJam) | `EALlC5L6UxZtwquiUfB90v` |
| Component library (Figma) | recorded at the top of each component's story file |

This repo is public, so the Airtable identifiers stay out of it. On a fresh clone,
copy the example to `.claude/registry.local.json` and fill it in before running the
crew — nothing that talks to the registry works until you do.

**That file is also how you stop the crew.** Move it aside and every agent halts at
its first step, mid-run, with no code change and no deploy — each one is required to
stop and name what is missing rather than carry on from the folder. It is the fastest
way to take the whole fleet offline, and putting it back is the whole of turning them
on again. `governance/fleet.md` has the rest of the stops.

## Paths

- Token source: `tokens/tokens.json` (exported from Figma, committed)
- Token config: `style-dictionary.config.js`
- Generated output: `build/tokens/` (never edit by hand, gitignored)
- Components: `src/components/<Name>/`
- Component intent: `src/components/<Name>/<Name>.intent.json`, typed by `src/intent.ts`
- The public surface: `src/index.ts` — nothing outside it is released
- What a version promises: `VERSIONING.md`
- The one reader everything downstream shares: `scripts/lib/contract.mjs`
- Library build config: `vite.config.ts`, `tsconfig.build.json`, `scripts/bundle-css.mjs`,
  `scripts/generate-skill.mjs`
- The release run: `scripts/release.mjs` — nine gates, stops at the first failure
- The publish: `scripts/publish.mjs`, run by a person. The CI workflow
  `.github/workflows/release-publish.yml` is kept and cannot currently run
- Reference site: `docs/` — source in `docs/src/content/docs/`, generated pages
  under `components/` and two files in `start/`, all gitignored
- Site config: `docs/reference.config.json` — the Storybook URL every page links to and embeds
- What the registry said: `docs/registry-status.json` — written by 📝 Doc Generator,
  read by the generator, which publishes nothing that is not `Completed` there
- Agents: `.claude/agents/` — `engineer`, `qa`, `devops`, `doc-generator`, `release`, `pm`
- Skills: `.claude/skills/` — `build`, `test`, `registry`, `intent`, `reference-site`,
  `security-check`, `release-review`, `release-prepare`
- QA reports and the PM sweep: `reports/`
- Release reviews: `reports/release-review/`

## Dependency rules

- Match the package manager in this file. This project uses npm, not yarn or pnpm.
- Use the existing package scripts before inventing commands.
- Do not add a dependency without explaining why in your report.
- Do not add a UI or component library. This repo is the component library.
- `docs/` has its own `package.json` and its own `node_modules`, and that is not
an accident to tidy up. Astro brings ~370 packages and its own Vite major; one
tree would put all of them one install away from the thing being documented and
pin two Vite majors against each other. Install site dependencies there, never
at the root.
- If this file disagrees with `package.json`, inspect the repo and say so.
