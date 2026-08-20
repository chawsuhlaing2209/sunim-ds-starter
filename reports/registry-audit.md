# Registry audit — 2026-08-19 (second sweep)

Previous sweep: 2026-08-19, 14:04. This sweep: 2026-08-19, 16:20.

Swept every row of `Components` (4) and every row of `Staging Testing` (30), plus
`GitHub Commits` (1), `Semantic Tokens` (0), `Base Tokens` (0), `Component Tokens` (0)
and `Sunim Feedback` (0) for cross-reference. Reconciled against `src/components/`,
`src/tokens/`, both deployed Storybooks, the Figma component library, and git.

Every URL in the registry was opened, not counted. Method is recorded under **Dead links**.

---

## Since last sweep

**Button shipped, and it shipped honestly.** This is the headline, and it is worth stating
in full because the last sweep's most expensive finding was that Button's source had been
lost and only a compiled bundle survived. That is closed. The row now carries a commit, a
staging link, 30 test rows, and a production link, and each one is backed by something that
opens.

**Five findings from the last sweep are closed.** Not deferred — actually resolved:

| Closed | Evidence now |
|---|---|
| Button's source lost, only `storybook-static/assets/` survived | `src/components/Button/` holds `Button.tsx`, `Button.css`, `Button.stories.tsx` |
| Not a git repository, no history to recover from | `main` and `staging` both exist, and are **in sync** — `staging` is 0 commits ahead |
| `node_modules/` absent, tokens unbuilt, `@fontsource` missing — Storybook could not boot | Both hosts serve a working 41-story Storybook; `build/tokens/css/tokens.css` carries 1084 declarations |
| `CLAUDE.md` said Google Fonts CDN, `preview.ts` used `@fontsource` | Reconciled in `af10481` — "Typography rule matches the CSP that ships" |
| Button's row displayed `To-do` while its design gate was unmet | `Design` is now `Done`, the gate is genuinely met, and the row has moved past it entirely |

**Three component rows are new** — Eyebrow, Chip and Icon Slot, all created 09:37–09:38.
The registry went from 1 row to 4. All three arrived with the same defect; see Contradiction 2.

**A token gallery was added** — 7 stories under `Foundations/Tokens`, deployed to both
hosts. It is not built from a Figma node and deliberately has no registry row. **This is
not a missing component and is not counted as a finding anywhere below.** It is recorded
here only so the next sweep does not rediscover it as an orphan.

**Newly stuck — one row, and it is the one to read first.** Chip reads `Ready for Testing`,
which is QA's starting gun, on a `Staging Storybook` link that opens **Button**. See
Contradiction 1.

**Still open from the last sweep**, none of it moved:

- `Staging Passed Tests` rollup — was unmeasurable at 0 test rows, is now measurable and
  is confirmed wrong (Contradiction 3)
- `Synchronization %` numerator — still unverified (Contradiction 4)
- `Development` formula description names a column it does not read (Contradiction 5)
- The empty `GitHub Commits` row — still empty, still linked to nothing
- `reports/README.md` — still says nothing but QA writes here

---

## By status

`Development` values across all 4 rows:

| Status | Count | Rows |
|---|---|---|
| `Completed` | 1 | Button |
| `Ready for Testing` | 1 | Chip *(see Contradiction 1 — this status is not trustworthy)* |
| `To-do` | 2 | Eyebrow, Icon Slot |
| `To be deployed` | 0 | — |
| `To be fixed` | 0 | — |
| `Fixing` | 0 | — |
| `Fixed` | 0 | — |
| blank | 0 | — |

### Button — `Completed`, and it holds up

Last modified 2026-08-19 14:11.

| Column | Value | Checked |
|---|---|---|
| `Category` | `ATOMS` | Valid choice |
| `Figma` | node `19:231` | **Opens.** Frame "Button", 30 symbols |
| `Design` | `Done` | — |
| `Commit` | `f52b461` | **Opens (200).** Verified locally: this is the commit that added `Button.tsx` |
| `Staging Storybook` | Button, Primary Md Default | **Opens and renders Button** |
| `Production Storybook` | Button, Primary Md Default | **Opens and renders Button.** No login |
| `[Staging] Test Records` | 30 rows | All 30 `Passed`, all linked back to Button |
| `Synchronization %` | `100%` | Correct today — but see Contradiction 4 |
| `Semantic Tokens` | *empty* | Contradiction 7 |
| `Astro Link` | *empty* | Not required by the contract |
| `[Production] Test Records` | `Button, button hover` | Contradiction 8 |

The 30 test rows are unusually good evidence. Each one names the Figma node it was measured
against (`19:62` through `19:230`), and **all 30 node IDs match the 30 symbols actually in the
component set** — variant for variant, size for size, state for state. Nothing was tested
against a node that does not exist, and no symbol went untested.

### Chip — `Ready for Testing`, and it does not hold up

Last modified 2026-08-19 14:08. `Design` = `Done`, `Figma` set (node-less — Contradiction 2),
`Staging Storybook` set to **Button's story URL**. No Chip source, no Chip story, no test rows.

### Eyebrow, Icon Slot — `To-do`

Both `Design` = `Done` with a node-less `Figma` URL. Both genuinely satisfy the formula's
`To-do` condition. Neither has source, a commit, or a staging link. Correct status,
unactionable evidence.

---

## Waiting on

### 🎨 Human — 5

**1 · Eyebrow, Chip, Icon Slot — the `Figma` cell is a file link, not a node link.**
All three carry the same URL: the component library file with **no `node-id` parameter**.
The file opens; there is no node behind the link. The contract defines this column as
"Node URL of the finished component set", and 🔨 Engineer builds from one node.

Why this is yours and why it is not cosmetic: the `Development` formula tests only whether
`Figma` is *non-empty*. It does not test whether the URL points at anything. So a bare file
link satisfies the design gate exactly as well as a real node link, and two of these rows are
now sitting in `To-do` — the state that means "engineer, pick this up" — with nothing for the
engineer to pick up. Paste the node URL for each of the three, or set `Design` back so the
rows stop advertising readiness they do not have.

**2 · `Staging Passed Tests` is broken, and it is now provable.**
The rollup reads **0** while 30 linked rows read `Passed`. Its own field description says
*"Counts only test rows marked Passed. Feeds Synchronization %."* Both halves are false:
it counts 0 of 30, and `Synchronization %` does not reference it. Last sweep this was
unmeasurable at zero test rows. It is measurable now and it is wrong. Any correct
aggregation over 30 `Passed` rows returns 30. Fix the rollup or delete the field — a
number that reads 0 next to 30 passing tests will eventually be believed by someone.

**3 · `Synchronization %` — the numerator is still unverified. Read this before trusting 100%.**
The formula divides `Staging Passed Count` by `Total Staging Tests`. Both are count fields
over the same link column, and the API exposes **no filter on either**. Today
`Staging Passed Count` = 30 and `Total Staging Tests` = 30, with 30 passed and 0 failed —
so the two possibilities are indistinguishable, and `100%` is the right answer either way.

**Stating this plainly: this is not resolved, and Button's `100%` is not evidence that it is.**
If the numerator is unfiltered, the first `Failed` or `Fixed (To re-test)` row the crew files
will still show `100%`. It can only be settled by opening `Staging Passed Count` in the
Airtable UI and reading whether a condition is set. That is a ten-second check no agent can
perform, and until someone performs it, 🚀 DevOps's `To be deployed` + `100%` trigger rests
on an unverified number.

**4 · The `Development` formula's description names a column the formula does not read.**
The description says it reads *"Figma, Commit, Staging Storybook, staging test results,
Production Storybook."* The formula's referenced columns are `Staging Testing Results Summary`,
`Production Storybook`, `Staging Storybook`, `Figma` and `Design`. **`Commit` is not among
them**, and `Design` — which the formula genuinely depends on — is not in the description.
The formula's *logic* is correct and matches the contract condition for condition; only the
description lies. Worth fixing because it is the first thing anyone reads when deciding
whether a commit URL matters. It does not.

**5 · The token tables are empty while 1084 tokens ship.**
`Base Tokens`, `Semantic Tokens` and `Component Tokens` hold **0 rows each**, and Button's
`Semantic Tokens` cell is empty on a `Completed` row. Meanwhile `build/tokens/css/tokens.css`
carries 1084 custom-property declarations and a 7-story gallery documents them in both
deployed Storybooks. Those tables carry `Parity Status`, so an empty table reports no parity
problems rather than reporting that nothing has been checked. Either populate them or say
they are out of use — an empty table that looks authoritative is worse than no table.

*Also, minor:* `reports/README.md` still reads "Nothing else writes to this folder", while
`tools.md` line 55 assigns "QA reports and the PM sweep" to `reports/`. This file is the PM
sweep. Raised last time, unchanged.

### 🔨 Engineer — 3

**1 · Chip's `Staging Storybook` link points at Button. Fix this one first.**
The cell holds the Button story URL, character for character identical to Button's own cell.
`Staging Storybook` is your column, so this is yours.

The consequence is specific and bad: that link is the *only* thing putting Chip into
`Ready for Testing`, and `Ready for Testing` is the single signal 🔍 QA acts on. The link
opens and renders cleanly, so nothing looks broken — QA would open it, see a working
component, and file test rows describing Button under Chip's name. That would then derive a
status for Chip from evidence about Button.

There is no Chip story to point it at. Both hosts serve an identical 41-story index — 34
Button stories and 7 token stories, and **no Chip, Eyebrow or Icon Slot story on either**.
So this is not a wrong URL to be swapped for the right one; the build does not exist yet.
Clear the cell until Chip is built and deployed.

**2 · Eyebrow and Icon Slot read `To-do` but cannot be built yet.**
Both are yours by status. Neither is actionable: their `Figma` cells have no node behind them
(🎨 Human item 1). Do not start from the file link and guess at a node. Wait for the node URLs.

**3 · The empty `GitHub Commits` row is still there.** Created 2026-08-18. It carries a
`Commit Type` of `Refactor` and nothing else — no hash, message, author, date, URL, and no
link to any component. Raised last sweep, unchanged. Delete it or fill it.

*Not a finding, recorded so it is not mistaken for one:* Button's `Commit` points at the
initial commit rather than a merge commit. It is the commit that genuinely introduced
`Button.tsx`, it opens, and the contract accepts "commit or PR URL". Nothing to do.

### 🔍 QA — 2

**1 · Do not test Chip, even though it reads `Ready for Testing`.**
Its staging link opens Button. Testing it would produce 30 rows of Button evidence attached
to Chip, and — because `Development` is derived from those rows — would give Chip a status
earned by another component. Wait for 🔨 Engineer to clear or correct the cell. This is the
one case where the row's status is not your instruction.

**2 · `Attachment` is empty on all 30 Button test rows.**
The screenshots exist — 35 PNGs in `reports/Button/`, one per case plus the Figma component
set, the playground, and the two composition stories. They are simply not in the registry,
because Airtable needs a publicly reachable URL and there was no host at the time.

There is a host now. Both Vercel deployments are public and serve without a login. This is
recorded as a known, explained gap rather than a defect — the evidence is not lost, it is
one directory away — but it is the difference between a reviewer opening the registry and
seeing the case, versus needing this repo checked out. Worth closing when convenient; not
worth blocking anything on.

### 🚀 DevOps — 0

**Nothing is waiting on you, and Button was shipped correctly.** `main` and `staging` are in
sync — `staging` is 0 commits ahead — so nothing passed by QA is sitting unshipped. No row
reads `To be deployed`. Production serves the same 41-story index as staging, and opens
without a login.

One thing to carry forward: your trigger is `To be deployed` at `100%`, and 🎨 Human item 3
means `100%` is not yet a verified signal. It happened to be true for Button because all 30
rows genuinely passed. Do not treat the next `100%` as self-evident until that check is done.

---

## Contradictions

**1 · Chip — `Ready for Testing` earned by Button's staging link.**
The cell holds Button's story URL exactly. No Chip story exists on either host. The status is
real, derived, and meaningless. → 🔨 Engineer

**2 · Eyebrow, Chip, Icon Slot — `Design` = `Done` with a `Figma` cell that has no node.**
Not the empty-`Figma` case the contract anticipates; a subtler one. The cell is a valid,
openable file URL with no `node-id`, so it passes a non-empty test while pointing at no
component set. Two of the three rows have already advanced to `To-do` on the strength of it.
→ 🎨 Human

**3 · `Staging Passed Tests` reads 0 against 30 `Passed` rows.**
Description claims it counts passed rows and feeds `Synchronization %`. It counts none of
them and feeds nothing. Dormant last sweep, live now. → 🎨 Human

**4 · `Synchronization %` — `100%` is correct today, unverified in general.**
No filter is exposed on the numerator. With 30 passed and 0 failed the two readings agree, so
this sweep cannot settle it and does not claim to. → 🎨 Human

**5 · The `Development` description names `Commit`; the formula never references it.**
→ 🎨 Human

**6 · Three registry rows with no component in `src/components/`** — Eyebrow, Chip, Icon Slot.
The reverse check is clean: `src/components/` holds only Button, which has a row.
`src/tokens/` is the token gallery and is excluded by design, not by oversight.

*Checked and dismissed:* `src/` also contains the strings "chip" and "Icon Slot", which look
like the missing components and are not. They are the CSS class `tk__chip` in the token
gallery and a comment in `Button.css` describing Button's internal icon slot. No Chip,
Eyebrow, or Icon Slot implementation exists anywhere in the tree.

**7 · Button is `Completed` with `Semantic Tokens` empty.**
The component demonstrably consumes semantic tokens — the 30 test rows name them individually
(`--color-accent-ink`, `--effect-focus-ring`, `--font-action-lg`, and others). The registry
records none of them, and the `Semantic Tokens` table is empty. → 🎨 Human

**8 · `[Production] Test Records` holds the free text `Button, button hover`.**
A single-line text column, not in the contract's column list, holding what looks like a note
rather than a record. It is not read by any formula, so nothing downstream is wrong today.
Clear it or define it. → 🎨 Human

### Checks that came back clean

- **Staging test rows with an empty `Composed In` — none.** All 30 link to Button. The
  contract's "counts toward nothing" failure does not occur.
- **A component with test rows but no `Staging Storybook` link — none.** Button has both.
- **`Synchronization %` at `100%` with a `Fixed (To re-test)` row — none.** All 30 rows read
  `Passed`; no row reads `Failed` or `Fixed (To re-test)`. Button's `100%` is honest.
- **`Design` = `Done` with a wholly empty `Figma` cell — none.** The three node-less rows are
  a different, softer version of that failure, reported as Contradiction 2.
- **Duplicate rows — none.** Four rows, four distinct component names.
- **`Category` — all four valid.** All read `ATOMS`. Worth noting for anyone working from the
  older contract text: the choices in this base do **not** carry trailing spaces. The
  `SKILL.md` warning about "trailing spaces, copy them exactly" does not match the base as it
  stands, and following it literally would produce an invalid choice.
- **Test-row coverage against Figma — complete.** 30 rows, 30 symbols, node IDs matching
  one-to-one.
- **The previous sweep's blank-renders-as-`To-do` ambiguity is not observable this sweep.**
  All four rows genuinely satisfy a real formula branch, so nothing currently lands on the
  blank branch. The underlying ambiguity — a `""` result and a real `To-do` both surfacing as
  the same choice — is untested rather than fixed, and will reappear the first time a row is
  created without `Design` = `Done`.

---

## Dead links

**None. Eight URL slots across four rows, six distinct URLs, all open.**

| Row | Column | Target | Result |
|---|---|---|---|
| Button | `Figma` | node `19:231` | **Opens.** Frame "Button", 30 symbols, read over the Figma connection |
| Button | `Commit` | `f52b461` | **Opens (200).** Confirmed locally as the commit adding `Button.tsx` |
| Button | `Staging Storybook` | Primary Md Default | **Opens and renders Button.** No login |
| Button | `Production Storybook` | Primary Md Default | **Opens and renders Button.** No login |
| Chip | `Staging Storybook` | Primary Md Default | **Opens — and renders Button.** Not dead. Wrong. Contradiction 1 |
| Eyebrow · Chip · Icon Slot | `Figma` | component library file, no `node-id` | **File opens. No node behind the link.** Contradiction 2 |

**How these were checked, since a status code proves very little here.** A Storybook is a
single-page app: every path under it returns `200`, including stories that do not exist. So
`200` was treated as necessary and not sufficient. Each host's `index.json` was read for the
real story list — both return an identical 41 entries, 34 Button stories and 7 token stories —
and the two Button URLs were then opened in a browser and confirmed to render the component,
with no login wall on either host. The Figma links were resolved over the Figma connection
rather than fetched, which is what makes it possible to say the shared file URL opens a real
file while pointing at no node.

**The most expensive class of finding is genuinely absent.** Button is the only `Completed`
row, and its production link opens and renders. Nothing in this registry is reporting success
for something nobody can open.

---

## Card

```
📋 PM · registry sweep · 2026-08-19 (2nd)
Components 4 · Completed 1 · Ready for Testing 1 · To-do 2 · Staging Testing 30 rows (30 Passed)
Since last sweep: Button shipped end to end; 5 prior findings closed; 3 new rows added
Contradictions 8 (Chip: Ready for Testing on Button's staging link · Eyebrow/Chip/Icon Slot:
  Figma URL with no node · Staging Passed Tests reads 0 against 30 Passed · Synchronization %
  numerator still unverified · Development description names Commit, formula never reads it ·
  3 rows with no component · Button Completed with no Semantic Tokens · stray text in
  [Production] Test Records)
Dead links 0 (6 distinct URLs opened and rendered; Chip's staging link is wrong, not dead)
Waiting on: 🎨 Human 5 · 🔨 Engineer 3 · 🔍 QA 2 · 🚀 DevOps 0
Most urgent: Chip reads Ready for Testing on Button's staging link — QA must not test it
Report → reports/registry-audit.md
```
