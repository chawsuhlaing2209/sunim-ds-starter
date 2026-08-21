# The reference site — generation run

**Run** 2026-08-20 · from `3e8ddee` on `main` · 📝 Doc Generator ·
overwritten each run, like the PM's sweep

Generated after repairing three intents. The per-component evidence is in
`Button-intent.md`, `Chip-intent.md` and `IconSlot-intent.md`; this file records
the board reading, the build, and what looking at the site actually showed.

**Not deployed.** That is 🚀 DevOps's and it needs a human to ask. `Astro Link`
stays empty on all four rows until a page has been opened on the deployed site and
seen to render.

---

## The board

Read through the Airtable connection at `2026-08-20T07:28:11Z` and written to
`docs/registry-status.json` — names and statuses only, no base, table or record
IDs, because that file is tracked and this repo is public.

| Row | Development | Sync | Design | Release Verdict | Astro Link |
|---|---|---|---|---|---|
| Button | Completed | 100% | Done | Blocked | — |
| Chip | Completed | 100% | Done | Blocked | — |
| Eyebrow | Completed | 100% | Done | Blocked | — |
| Icon Slot | Completed | 100% | Done | Blocked | — |

Four Completed, so four pages. Nothing was published around the gate and no
`--force` was used.

The previous reading (`07:28` supersedes `06:50`) had gone stale in the ordinary
way: `3d7c9e6` landed in `src/components/Button` and `src/components/IconSlot`
after it, so the recorded status could no longer vouch for what was there.

---

## The build

```
npm run build:tokens && npm run docs:generate && npm run docs:build

  Button   — 6 props · 16 tokens · 34 stories
  Chip     — 5 props · 17 tokens · 12 stories
  Eyebrow  — 5 props ·  9 tokens ·  8 stories
  IconSlot — 3 props ·  1 token  ·  8 stories
  DONE  4 published · 0 not on the surface · 0 not shipped · 0 intent incomplete

node scripts/security-check.mjs --dir docs/dist   →  CLEAR
```

Nothing under `docs/src/content/docs/components/` was hand-edited.

---

## Looking at it

Served from `docs/dist` — the artefact that ships, not the dev server. (The dev
server was serving a stale token page from a previous session's process; the built
output was correct and is what was checked. Worth knowing: a long-lived
`astro dev` can show you yesterday's page while the generator has already written
today's.)

- **Chip** — all five tabs populated. Usage carries the rewritten misuse and a11y
  prose, with the backticked `<button>` and `HTMLAttributes<HTMLSpanElement>`
  surviving the markdown pass rather than being swallowed. Code has a 5-row props
  table with every doc comment present, a 2-row types table, and a 17-row token
  table with every value resolved. Design has the node, the 8-variant matrix and
  all 7 modes. Changelog has 4 rows.
- **Button** — 6 props; **16** tokens including the four new `spacing.step` rows,
  all resolved, none empty.
- **start/tokens** — 34 rows, every one resolved to a value and a primitive, with
  the four `spacing.step` rows attributed to Button.

### Deep links

66 distinct story ids are referenced across the four pages. 63 resolve in both the
local and the production Storybook index. **3 do not** —
`components-iconslot--size14`, `--size16`, `--size22`, against real ids
`--size-14`, `--size-16`, `--size-22`. Cause and owner (🔨 Engineer) in
`IconSlot-intent.md`, gap 2. Links only; the embeds on that page are fine.

Worth noting that the production Storybook now carries 74 entries with 4 of type
`docs`, where it had 71 and none when the release reviews ran. The docs pages
those reviews recorded as never having rendered anywhere are live.

### Frames

**Storybook embeds** — `reference.config.json` has `siteUrl` and `storybookUrl`
both at `https://sunim-ds-starter.vercel.app`, so `frame-ancestors 'self'` is
satisfied by construction and the generator raised no cross-origin warning for the
build. It *does* raise it under `npm run docs:dev`, correctly, because that run
points frames at `http://localhost:6006`.

**Figma embeds — every one shows a sign-in wall.** Checked the way the skill asks,
logged out. Both files behind the Design tabs return a 302 to Figma's embed
interstitial and render *"Want to check out this file? Sign up or Log in"*:

- `2.-Sunim-Component` — Chip, IconSlot, Eyebrow
- `2.-Sunim-.-Web-.-Component-.-V1.0-.-Beta` — Button

The frame degrades to the fallback link the generator puts under every embed, so
it costs a click rather than the content. But nobody outside the team sees a node
on any component page until the file is shared to anyone-with-the-link. That is
the file owner's call — **🎨 Human** — not a build problem, and no build can
detect it.

---

## For 📦 Release

The registry row reads `Icon Slot`; the folder, the export, `src/index.ts` and the
intent all read `IconSlot`. The generator matches on the name with spacing ignored
and says so on every run. Recorded, not resolved — it is a gate-4 question about
two systems disagreeing on a name, and it is not mine to settle.

---

## What could not be verified

- **The frames as a stranger sees them on the deployed site.** The site is not
  deployed. The Storybook embeds were exercised only against a local Storybook on
  a different origin, which is the configuration the generator warns about rather
  than the one that ships. The Figma frames *were* checked logged out, and they
  fail.
- **Screen-reader output** anywhere on the site or in the components behind it.
  No NVDA, JAWS or VoiceOver was run.
