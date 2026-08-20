# Sunim Design System — course starter

The repo you clone on day 2. It has tokens and a token pipeline, four components,
Storybook, a generated reference site, a crew of six agents, and a package that
builds, packs and installs.

Your job is to understand what is here, then extend it.

---

## Setup

Run these in order. Each step tells you what you should see.

### 0 · Check your machine

```bash
node -v
git -v
```

Node must be 20 or later. If either command answers with "not found", install it
before going further.

### 1 · Get the repo

```bash
git clone <REPO-URL> sunim-ds
cd sunim-ds
```

### 2 · Install

```bash
npm install
```

Takes a minute or two the first time.

### 3 · Build the tokens

```bash
npm run build:tokens
```

You should see:

```
css
⚠️ build/tokens/css/tokens.css

js
✔︎ build/tokens/js/tokens.js
✔︎ build/tokens/js/tokens.d.ts
```

The warning about token collisions is **expected**. Your Figma modes collapse onto
one set of names on purpose, which is exactly what makes theming work.

Open `build/tokens/css/tokens.css` and read it. `:root` holds the unthemed tokens
plus your default mode, and every mode gets its own block. Nobody typed any of it.

### 4 · Run Storybook

```bash
npm run storybook
```

A browser tab opens at `localhost:6006` with the Button component in it. Click
through its stories. Switch the Theme toolbar to dark and watch every value
change from one attribute.

### 5 · Prove the pipeline

Open `tokens/tokens.json`, change any colour value, then run:

```bash
npm run build:tokens
```

Storybook picks up the change. You edited one value, ran one command, and the
component changed. You never touched the component.

---

## What is in here

| Path | Its job |
|---|---|
| `tokens/tokens.json` | The token source, exported from Figma. Never hand-edited |
| `style-dictionary.config.js` | The build config. Handles modes, shadows, and text styles |
| `build/tokens/` | Generated CSS and JS. Never edit these files |
| `src/components/` | The components. One folder each |
| `.storybook/` | Storybook configuration |
| `src/index.ts` | The public surface. Nothing outside it is released |
| `dist/` | The library build. Generated; never committed |
| `docs/` | The reference site. Its own npm package; the component pages are generated |
| `.claude/agents/` | One file per worker: `engineer`, `qa`, `devops`, `doc-generator`, `release`, `pm` |
| `.claude/skills/` | One folder per procedure: `build`, `test`, `registry`, `intent`, `reference-site`, `security-check`, `release-review`, `release-prepare` |
| `VERSIONING.md` | What a version number promises, and what it does not |
| `decisions.md` | Findings a human has already ruled on |
| `CLAUDE.md` | How we work here |
| `tools.md` | What this project is built with |

---

## Using it in a project

Once a version is published:

```bash
npm install @theproductiveschedule/sunim-design-system react react-dom
```

React is a **peer** dependency — the package never bundles it. Import the
stylesheet once, at the root of your app, and the components anywhere:

```tsx
import '@theproductiveschedule/sunim-design-system/styles.css';
import { Button, Chip } from '@theproductiveschedule/sunim-design-system';

export function Apply() {
  return <Button variant="Primary" size="Lg" label="Apply for this cohort" />;
}
```

One stylesheet carries the typefaces, the token layer and the component CSS, in
that order — a component resolves nothing but `var(--token)`, and a cascade cannot
read forwards. If you only want the tokens, to build your own components against
this system, import `@theproductiveschedule/sunim-design-system/tokens.css` instead; it carries the
typefaces too.

**The fonts ship inside the package.** Schibsted Grotesk and Instrument Sans, as
`.woff2`, at the weights the tokens actually name — no CDN, no `@fontsource`
install, nothing to remember. Your bundler will hash them into your own assets and
fetch only the weights a page renders.

Themes are the seven Figma modes. Set `data-theme` on any element and everything
inside it follows:

```html
<html data-theme="night">
```

`VERSIONING.md` says what the version number promises. Below `1.0.0` a minor bump
is allowed to break anything, which is the semver contract rather than a warning.

---

## Commands

| Job | Command |
|---|---|
| Install | `npm install` |
| Build tokens | `npm run build:tokens` |
| Build the library | `npm run build` |
| Run Storybook | `npm run storybook` |
| Run the reference site | `npm run docs:install` once, then `npm run docs:dev` |
| Test | `npm test` |
| Type check | `npm run lint` |
| Security gate | `npm run security-check` |
| Release gate, one component | `npm run release-review -- <Component>` |
| Prepare a release | `npm run release` |

`tools.md` has the rest.

---

## The crew

Design is human. Everything downstream of it is an agent with one job.

| Agent | Does | Never |
|---|---|---|
| `engineer` | Builds one component from one Figma node | Verifies its own work |
| `qa` | Tests a built component and reports | Repairs anything |
| `devops` | Merges, deploys, publishes what others verified | Changes what was tested |
| `doc-generator` | Writes each component's intent, generates the reference site | Edits a component to make its docs true |
| `release` | Reviews against seven gates; prepares a release | Publishes. It holds no credential |
| `pm` | Sweeps the registry and reports | Fixes anything it finds |

They hand work over through the Airtable registry, never in conversation: one
agent writes evidence, a formula derives a status, and the next agent picks up the
rows carrying its status. `.claude/skills/registry/SKILL.md` is that contract.

Each follows a skill in `.claude/skills/`. Read the skill before you run the
agent. They are short on purpose.

**After adding or editing an agent or skill file, restart your editor.** These
files load at startup. This is the answer to most "my agent is not working"
questions.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `npm run build:tokens` errors on a token | A reference points at a token that does not exist | Check the `{color.base...}` path matches a real token |
| Storybook shows unstyled components | Tokens were never built | Run `npm run build:tokens`, then restart Storybook |
| A token change does nothing | Stale output | Rebuild tokens. The CSS is generated, not live |
| `npm run build` fails on a missing CSS file | Tokens were never built | The build runs `build:tokens` first; run it alone if you are calling Vite directly |
| A consumer sees "invalid hook call" | Two copies of React in their tree | React is a peer dependency here. Check they have not also installed one for us |
| Components install but render unstyled | `styles.css` was not imported | Import it once at the app root, before anything renders |
| A page on the reference site is missing | Its component is not `Completed` on the board, or not on `src/index.ts` | Both are deliberate. `npm run docs:generate` says which |
| The agent is not listed | New agent or skill files load at startup | Restart your editor |
| Dark mode does nothing | The theme attribute is not set | Use the Theme control in the Storybook toolbar |
