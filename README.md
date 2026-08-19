# Sunim Design System — course starter

The repo you clone on day 2. It already has tokens, a token pipeline, one
example component, Storybook, and two agents with two skills.

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
| `.claude/agents/` | One file per worker: `engineer`, `qa` |
| `.claude/skills/` | One folder per procedure: `build`, `test` |
| `CLAUDE.md` | How we work here |
| `tools.md` | What this project is built with |

---

## Commands

| Job | Command |
|---|---|
| Install | `npm install` |
| Build tokens | `npm run build:tokens` |
| Run Storybook | `npm run storybook` |
| Test | `npm test` |
| Type check | `npm run lint` |

---

## The two agents

| Agent | Does | Never |
|---|---|---|
| `engineer` | Builds one component from one Figma node | Verifies its own work |
| `qa` | Tests a built component and reports | Repairs anything |

Each follows a skill in `.claude/skills/`. Read both skill files before you run
either agent. They are short on purpose.

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
| The agent is not listed | New agent or skill files load at startup | Restart your editor |
| Dark mode does nothing | The theme attribute is not set | Use the Theme control in the Storybook toolbar |
