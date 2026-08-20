# tools.md — what this project is built with

Stack facts and commands only. Rules about how we work live in `CLAUDE.md`.

## Stack

- Framework: React 19 with Vite
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
| Run Storybook | `npm run storybook` |
| Build Storybook | `npm run build-storybook` |
| Test | `npm test` |
| Type check | `npm run lint` |
| Security gate | `npm run security-check` (add `--url <url>` after deploying, `--dir <path>` for another build) |
| Release gate | `npm run release-review -- <Component>` (or `-- --all --version 0.1.0`) |
| Install the site | `npm run docs:install` (once — `docs/` has its own `node_modules`) |
| Generate the site | `npm run docs:generate` |
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

## Paths

- Token source: `tokens/tokens.json` (exported from Figma, committed)
- Token config: `style-dictionary.config.js`
- Generated output: `build/tokens/` (never edit by hand, gitignored)
- Components: `src/components/<Name>/`
- Component intent: `src/components/<Name>/<Name>.intent.json`, typed by `src/intent.ts`
- The public surface: `src/index.ts` — nothing outside it is released
- What a version promises: `VERSIONING.md`
- The one reader everything downstream shares: `scripts/lib/contract.mjs`
- Reference site: `docs/` — source in `docs/src/content/docs/`, generated pages
  under `components/` and two files in `start/`, all gitignored
- Site config: `docs/reference.config.json` — the Storybook URL every page links to
- Agents: `.claude/agents/` — `engineer`, `qa`, `devops`, `doc-generator`, `reviewer`, `pm`
- Skills: `.claude/skills/` — `build`, `test`, `registry`, `intent`, `reference-site`, `security-check`, `release-review`
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
