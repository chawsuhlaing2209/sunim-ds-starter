# tools.md — what this project is built with

Stack facts and commands only. Rules about how we work live in `CLAUDE.md`.

## Stack

- Framework: React 19 with Vite
- Language: TypeScript, strict
- Package manager: npm
- Styling: CSS custom properties, generated from tokens
- Tokens: Style Dictionary v5, reading the Figma "Design Tokens" plugin export
- Component workshop: Storybook 10 (react-vite)
- Tests: Vitest
- Accessibility: Storybook a11y addon

## Commands

| Job | Command |
|---|---|
| Install | `npm install` |
| Build tokens | `npm run build:tokens` |
| Run Storybook | `npm run storybook` |
| Build Storybook | `npm run build-storybook` |
| Test | `npm test` |
| Type check | `npm run lint` |

## Registry and design sources

The registry is Airtable. It is where the crew hands work over, and it is the only place a
component's real status lives. The contract — tables, field owners, the status formula —
is `.claude/skills/registry/SKILL.md`. Read that before writing to it.

| Thing | Value |
|---|---|
| Registry base | `Sunim DS` — `appXXXXXXXXXXXXXX` |
| Same base, pre-rename name | `Sunim Design System` — `appXXXXXXXXXXXXXX` |
| Components table | `tblXXXXXXXXXXXXXX` |
| Staging Testing table | `tblXXXXXXXXXXXXXX` |
| Pipeline board (FigJam) | `EALlC5L6UxZtwquiUfB90v` |
| Component library (Figma) | `mFnN1Sr8MAmOdmx0ABXPsb` |

## Paths

- Token source: `tokens/tokens.json` (exported from Figma, committed)
- Token config: `style-dictionary.config.js`
- Generated output: `build/tokens/` (never edit by hand, gitignored)
- Components: `src/components/<Name>/`
- Agents: `.claude/agents/` — `engineer`, `qa`, `devops`, `pm`
- Skills: `.claude/skills/` — `build`, `test`, `registry`
- QA reports and the PM sweep: `reports/`

## Dependency rules

- Match the package manager in this file. This project uses npm, not yarn or pnpm.
- Use the existing package scripts before inventing commands.
- Do not add a dependency without explaining why in your report.
- Do not add a UI or component library. This repo is the component library.
- If this file disagrees with `package.json`, inspect the repo and say so.
