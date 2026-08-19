# Registry audit — 2026-08-19

Base `Sunim DS`. Swept every row of `Components` (1) and every row of
`Staging Testing` (0), plus `GitHub Commits` (1) and `Semantic Tokens` (0) for cross-reference.
Reconciled against `src/components/`.

---

## Since last sweep

**This is the first sweep.** `reports/` held only `.gitkeep` and `README.md` — there is no prior
`registry-audit.md` to diff against. Nothing below is "still stuck"; it is all newly recorded, and
the next sweep can measure movement against it.

One baseline fact worth fixing in place, because it makes this report short and the next one
comparable: **the registry has exactly one component row.** The system is at the very start, not
mid-flight. Read every count below in that light.

---

## By status

`Development` values across all 1 row:

| Status | Count | Rows |
|---|---|---|
| `To-do` *(as displayed — see Contradiction 1)* | 1 | Button |
| `Ready for Testing` | 0 | — |
| `To be fixed` | 0 | — |
| `Fixing` | 0 | — |
| `Fixed` | 0 | — |
| `To be deployed` | 0 | — |
| `Completed` | 0 | — |
| blank | 0 | — |

**Button** — last modified 2026-08-19 05:02 UTC

| Column | Value |
|---|---|
| `Category` | `INPUTS  ` — correct, trailing spaces intact |
| `Figma` | set, opens, node `19:231` |
| `Design` | `To-do` |
| `Commit` | empty |
| `Staging Storybook` | empty |
| `Production Storybook` | empty |
| `Astro Link` | empty |
| `Semantic Tokens` | empty |
| `[Staging] Test Records` | empty |
| `Synchronization %` | `0%` (0 of 0) |

Nothing is `Completed`, so there is no shipped row whose production link could have rotted. The
most expensive class of finding is simply not available yet.

---

## Waiting on

### 🎨 Human — 3

**1 · Button · `Design` — the design gate is closed on a node that looks finished.**
The Figma node opens and holds a complete matrix: 30 symbols, Primary/Secondary/Ghost ×
Md/Lg × Default/Hover/Focus/Disabled/Loading. `Design` still reads `To-do`. Those two facts
disagree, and only you can say which one is right. The consequence either way:
`Development` reaches `To-do` — the state 🔨 Engineer picks up — only when `Figma` is set **and**
`Design` = `Done`. While `Design` reads `To-do` that gate is not met, so on the contract's terms the
row is not yet the engineer's. Set `Design` = `Done` to release it, or name what is outstanding so
the row is honestly blocked. I am not making that call.

**2 · `Synchronization %` — the formula does not measure what its own field description says.**
Detail in Contradiction 2. It is a base-schema fix. Formula columns are owned by nobody, which
means no agent may touch them — it needs you, in the Airtable UI.

**3 · `reports/README.md` is stale.** It reads that QA writes here, one file per run, and that
"Nothing else writes to this folder." `tools.md` assigns "QA reports and the PM sweep" to
`reports/`, and this file is the PM sweep. The README should acknowledge the second writer.
Cosmetic, but it is the kind of drift that makes an agent hesitate.

### 🔨 Engineer — 3

**1 · Button has a built Storybook and no source. This is the urgent one.**
`src/` is empty — zero files. But `storybook-static/` contains a complete build of
`Components/Button`: 34 entries, every one compiled from `./src/components/Button/Button.stories.tsx`,
with `assets/Button-BC2xBQ9F.css` and `assets/Button.stories-DvAxOoYf.js` beside them. The 30
matrix stories match the Figma node variant-for-variant. A Button was really built here.

The source is gone and there is no way back to it:

- this is not a git repository, so there is no history to restore from
- `.gitignore` lists `build/` and `storybook-static/`, so those artifacts will not be tracked even
  once git is initialised
- directory timestamps: `storybook-static/` last written 21:39, `src/components/` 21:45

**The compiled bundle in `storybook-static/assets/` is currently the only surviving copy of that
implementation.** Recover what you can from it before anything overwrites or cleans that folder.

**2 · The Storybook cannot start from this tree.** Three separate breaks, all yours:
- `node_modules/` is absent — `npm install` has not been run
- `.storybook/preview.ts` imports `../build/tokens/css/tokens.css`; `build/tokens/` contains only
  `README.md`. Needs `npm run build:tokens`
- `.storybook/preview.ts` imports nine `@fontsource/*` stylesheets. No `@fontsource` package
  appears in `package.json`, so `npm install` will not supply them and the import will fail

Also flagging a disagreement rather than resolving it, per `tools.md`: `CLAUDE.md` says to load
fonts "from Google Font CDN", while `preview.ts` loads them from `@fontsource` npm packages.
Which source of truth applies is 🎨 Human's call; implementing it is yours.

**3 · `GitHub Commits` has one entirely empty row** — created 2026-08-18.
No hash, message, author, date, commit URL, or link to a component. It counts toward nothing and
points at nothing. Delete it or fill it.

### 🔍 QA — 0

Nothing is testable. No row reads `Ready for Testing`, `Fixed`, or `Fixing`, and no
`Staging Storybook` link exists to test against. `Staging Testing` is empty — 0 rows — so there
are no orphaned test rows, no `Composed In` gaps, and no untested built components. Please read
Contradiction 2 before you file your first test row, because the first row you file will move
`Synchronization %` to `100%` whatever result you record on it.

### 🚀 DevOps — 0

Nothing is deployable. No row reads `To be deployed`, and no component has passed a staging test,
because none has been tested. Contradiction 2 matters to you most of all: your trigger is
`To be deployed` at `100%`, and `100%` is currently not a trustworthy signal.

---

## Contradictions

**1 · Button — the row displays `To-do` while the `To-do` gate is not met.**
`Design` = `To-do`, not `Done`. The formula's condition 7 is
`AND({Figma}, {Design} = "Done")`, so it is false, and the formula's final branch returns `""`.
The row should read blank. It does not — the API returns choice id `selFORMULADEFAULT`, name
`To-do`, and filtering confirms it: `isEmpty` on `Development` matches 0 rows, `isNotEmpty`
matches 1. The empty-string result is surfacing as the formula field's default choice, which
happens to be the first name in its option list — `To-do`.

Why this is worth your attention rather than a shrug: 🔨 Engineer's documented trigger is a
registry row that **reads** `To-do`. Anyone, agent or human, looking at this grid sees `To-do` on a
row whose design gate has not been passed. The blank state exists precisely to keep unfinished
design away from the engineer, and here it is not visible. Confirm in the Airtable UI — it takes
ten seconds — and if the cell shows `To-do` there too, the formula's fallback needs an explicit
blank choice. → 🎨 Human

**2 · `Synchronization %` cannot report anything but 0% or 100%.**
The formula is:

```
IF({Total Staging Tests} = 0, "0%",
   ROUND(({Staging Passed Count} / {Total Staging Tests}) * 100, 2) & "%")
```

`Total Staging Tests` (`fldyYyEn5KfFGEuUu`) and `Staging Passed Count` (`fld88iBKmSezw6rzk`) are
both `count` fields over the same link field `[Staging] Test Records`, and the API reports
identical config for the two with no filter on either. Two identical counts divided by each other
give `100%` for any component with at least one test row — whether that row reads `Passed`,
`Failed`, or `Fixed (To re-test)`.

Airtight regardless of that: the rollup `Staging Passed Tests` (`fldlUuOcmKdDULk5q`), whose own
description reads *"Counts only test rows marked Passed. Feeds Synchronization %"*, **is not
referenced by the formula at all.** The formula's `referencedFieldIds` are `fldyYyEn5KfFGEuUu` and
`fld88iBKmSezw6rzk` only. A field is documented as feeding this number and does not feed it.

This is dormant today only because there are zero test rows. It fires on the first one QA files.
This is exactly the failure the audit brief names — *"`Synchronization %` at `100%` with rows
reading `Fixed (To re-test)`"* — except built into the schema, so it will hit every component
rather than one. Please confirm in the UI whether `Staging Passed Count` carries a filter the API
does not expose; if it does not, point the formula at the rollup. → 🎨 Human

Worth saying clearly: the `Development` formula itself is sound. It matches the contract
condition for condition, including the one that makes a single `Failed` row outrank a production
link. The defect is confined to `Synchronization %`.

**3 · Button is a registry row with no component in `src/components/`.**
`src/components/` is empty, so the row describes something that does not exist in code — while a
full built Storybook for it does exist. Detail and recovery note in the 🔨 Engineer block above.
The reverse check is clean: there are no components in `src/components/` missing a registry row,
because there are none at all.

### Checks that came back clean

- `Design` = `Done` with an empty `Figma` cell — none. Button is the inverse case.
- Staging test rows with an empty `Composed In` — none. `Staging Testing` has 0 rows.
- Components with test rows but no `Staging Storybook` link — none. No test rows exist.
- The contract states the base answers to a second ID under its pre-rename name.
  Verified: it returns the same single record, Button. One registry,
  not two.

---

## Dead links

**None. One URL exists in the registry and it opens.**

| Row | Column | URL | Result |
|---|---|---|---|
| Button | `Figma` | node `19:231` in file `mFnN1Sr8MAmOdmx0ABXPsb` | **Opens.** Frame "Button", 30 symbols |

Opened through the Figma connection, not merely fetched. The file key matches the component
library named in `tools.md`, so the link points at the sanctioned file rather than a stray copy.

**On the empty link columns — expected, not a backlog.** This project is not yet a git repository
and has no staging or production host. Absent `Commit`, `Staging Storybook`, and
`Production Storybook` values are the correct state of the world, and none of them is counted as a
finding anywhere in this report. There is nothing here for 🚀 DevOps to chase.

---

## Card

```
📋 PM · registry sweep · 2026-08-19
Components 1 · displaying To-do 1 · all other statuses 0 · Staging Testing 0 rows
Contradictions 3 (Button: displays To-do, design gate not met · Synchronization %:
  two identical counts, documented rollup unreferenced · Button: row with no component)
Dead links 0 (1 URL checked, opens)
Waiting on: 🎨 Human 3 · 🔨 Engineer 3 · 🔍 QA 0 · 🚀 DevOps 0
Most urgent: Button's source is gone; only the compiled copy in storybook-static/assets/ survives
Report → reports/registry-audit.md
```
