# Registry audit — 2026-08-20 (third sweep)

Previous sweep: 2026-08-19, 16:20. This sweep: 2026-08-20.

Swept every row of `Components` (4) and every row of `Staging Testing` (45), plus
`GitHub Commits` (1), `Base Tokens` (0), `Semantic Tokens` (0), `Component Tokens` (0) and
`Sunim Feedback` (0). Reconciled against `src/components/`, both deployed Storybooks, the
Figma component library read over the Figma connection, and git.

All 16 URL slots were opened, not counted. Method under **Dead links**.

---

## Since last sweep

**Every open finding about a component is closed. What remains is about the registry itself.**
That is the shape of this sweep, and it is new: the last two swept a system where components
were missing evidence. This one sweeps a system where four components are shipped and verified,
and the defects that survive are in the columns, formulas and schema that describe them.

**Nine findings from the last sweep are closed.**

| Closed | Evidence now |
|---|---|
| Chip read `Ready for Testing` on **Button's** staging link | Chip's `Staging Storybook` opens `components-chip--default-sm` and renders a Chip |
| Eyebrow, Chip, Icon Slot carried a `Figma` URL with **no `node-id`** | All three now carry real node links, and all three resolve — see the table below |
| Three registry rows with no component in `src/components/` | `src/components/` holds Button, Chip, Eyebrow, IconSlot — four dirs, four rows |
| No Chip, Eyebrow or Icon Slot story on either host | Both hosts serve **69** stories: Button 34, Chip 12, Eyebrow 8, IconSlot 8, Tokens 7 |
| Eyebrow and Icon Slot stuck in `To-do`, unbuildable | Both built, tested, shipped |
| Button's `Commit` pointed at the initial commit | Now points at `2572273`, the Icon Slot refactor merge — the commit that describes the build actually deployed |
| The deploy gate counted `reports/` as a dirty tree | `scripts/security-check.mjs` gate 5 now filters `reports/` paths. Re-run against the current tree: **gate 5 passes** |
| `reports/README.md` said nothing but QA writes here | Still says it. **Not closed** — see 🎨 Human 6 |
| Test-row coverage vs Figma, for the three new components | 3 nodes opened, symbol counts match row counts exactly (below) |

**Three components shipped in one pass, and each was tested against a node that exists.**
This is the check worth stating, because it is the one the registry cannot make for itself:

| Component | Figma node | Symbols in the node | Test rows | Match |
|---|---|---|---|---|
| Icon Slot | `9:24` | 3 (Size=14/16/22) | 3 | ✅ |
| Chip | `21:79` | 8 (Tone × Size) | 8 | ✅ |
| Eyebrow | `22:43` | 4 (Tone=Agentic/Sky/Ink/Gold) | 4 | ✅ |
| Button | `19:231` | 30 (Variant × Size × State) | 30 | ✅ |

45 rows, 45 symbols, one to one. No row was tested against a node that does not exist, and no
symbol went untested.

**Button was refactored after it shipped, and the registry never noticed.** Its private arrow
was deleted and replaced with Icon Slot; its row read `Completed` from before the refactor to
after it, unchanged. The 30 rows were re-swept and all 30 pass — but that re-sweep happened
because a human asked for it, not because anything in the registry asked for it. This is the
structural finding of this sweep and it has its own section at the end.

**`main` and `staging` are not quite level.** Reported to this sweep as level; they are not.
`origin/staging` is **one commit ahead** of `origin/main`, and the difference is
`scripts/security-check.mjs` and `.claude/agents/qa.md` — the deploy-gate fix itself. Neither
file enters the Storybook bundle, so the two deployed sites are byte-identical (both
`index.json` files compare equal). Nothing shipped is at risk. But the gate fix is not on
`main` yet, and it will only arrive there on the next promotion. See 🚀 DevOps.

**Still open from the last sweep**, unmoved:

- `Staging Passed Tests` rollup — was 0 against 30, is now **0 against 45** (Contradiction 3)
- `Synchronization %` numerator — still not verifiable, and now provably still not (Contradiction 4)
- The `Development` description names a column the formula does not read (Contradiction 5)
- `Semantic Tokens` empty on every row while 1084 tokens ship (Contradiction 6)
- The stray text in `[Production] Test Records` (Contradiction 7)
- The empty `GitHub Commits` row (🔨 Engineer 1)
- `reports/README.md` (🎨 Human 6)

**Newly stuck: nothing.** No component is waiting on an agent. Every finding below is against
the registry's own structure.

---

## By status

`Development` across all 4 rows:

| Status | Count | Rows |
|---|---|---|
| `Completed` | **4** | Button, Chip, Eyebrow, Icon Slot |
| `To be deployed` | 0 | — |
| `Ready for Testing` | 0 | — |
| `To-do` | 0 | — |
| `To be fixed` · `Fixing` · `Fixed` · blank | 0 | — |

`Synchronization %` reads `100%` on all four. Read Contradiction 4 before treating that as a
measurement.

### All four rows, column by column

| | Button | Chip | Eyebrow | Icon Slot |
|---|---|---|---|---|
| `Category` | `ATOMS` | `ATOMS` | `ATOMS` | `ATOMS` |
| `Design` | `Done` | `Done` | `Done` | `Done` |
| `Figma` | `19:231` ✅ opens | `21:79` ✅ opens | `22:43` ✅ opens | `9:24` ✅ opens |
| `Commit` | `2572273` ✅ 200 | `4433336` ✅ 200 | `9db9d62` ✅ 200 | `b26ed39` ✅ 200 |
| `Staging Storybook` | ✅ renders | ✅ renders | ✅ renders | ✅ renders |
| `Production Storybook` | ✅ renders | ✅ renders | ✅ renders | ✅ renders |
| Test rows | 30, all `Passed` | 8, all `Passed` | 4, all `Passed` | 3, all `Passed` |
| `Semantic Tokens` | *empty* | *empty* | *empty* | *empty* |
| Composes | **Icon Slot** | **Icon Slot** | — | — |
| Recorded as composing | **nothing** | **nothing** | — | — |

Each `Commit` was also checked locally against the files it touched. All four are the commit
that genuinely introduced or changed that component's source. None is a placeholder.

---

## Waiting on

### 🎨 Human — 7

**1 · Button and Chip are filed as `ATOMS` and are no longer atoms.**
You asked this sweep to confirm all four rows carry a sensible `Category` now that the choices
are atomic-design levels. Three of four do. Two do not, and they are the same two:

- `Button.tsx` line 2: `import { IconSlot } from '../IconSlot/IconSlot';`
- `Chip.tsx` line 2: `import { IconSlot } from '../IconSlot/IconSlot';`

A component assembled from another component is the textbook definition of a **molecule**.
Icon Slot and Eyebrow import nothing and are genuinely `ATOMS`. Button and Chip are not, and
Button became one the moment its private arrow was deleted — the `Category` was correct when it
was written and quietly stopped being correct during the refactor.

This is not pedantry about vocabulary. `Category` is the only column that could carry the
shape of the system, and with every row reading `ATOMS` it carries nothing. Set Button and
Chip to `MOLECULES`, or say the column is not being used that way.

**2 · The registry cannot express that Chip composes Icon Slot, and that is now a real gap.**
You asked whether the registry records the relationship anywhere, and whether it could tell you
to re-test Chip if Icon Slot changed. Both answers are no, and I checked the schema rather than
inferring it:

- `Components` has **no self-referencing link column**. There is no `Composed Of`, no `Used By`.
- `Composed In`, on `Staging Testing`, is not that column despite its name. It links a *test
  case* to *its own component* — it means "belongs to", not "composes". Every one of the 45
  rows uses it correctly and none of them expresses a composition.
- `Development` derives from a component's **own** test rows only.

So if Icon Slot changed and broke, Icon Slot's rows would go red and Button and Chip would keep
reading `Completed` at `100%`, with no signal anywhere that two shipped components had just had
their internals replaced. That is not hypothetical — it is exactly what happened this week, in
the other direction, and only a human noticing kept the registry honest.

The fix is one linked-record column on `Components` pointing back at `Components`. It is yours
because it is a schema decision, not a value. What it buys is the ability to answer "what else
do I have to re-test?" from the registry instead of from `grep`.

**3 · `Staging Passed Tests` reads 0 against 45 `Passed` rows.**
Re-read this sweep as asked. It was 0 against 30; it is now **0 against 45** — on all four
rows. Its description still says *"Counts only test rows marked Passed. Feeds Synchronization %."*
Both halves remain false: it counts none of them, and `Synchronization %` references
`Staging Passed Count` and `Total Staging Tests`, not this field.

The cause is visible in the schema: the rollup aggregates `Testing Results`, a **single-select**,
into a **number**. A numeric aggregation over text returns 0 regardless of how many rows there
are, which is why adding 15 more passing rows moved it not at all. Adding test rows will never
fix it. Fix the rollup or delete the field — a `0` sitting beside `45 Passed` and `100%` is the
kind of number someone eventually quotes.

**4 · `Synchronization %` — the numerator is still unknowable, and the `100%` readings are not evidence that it works.**
Stating this the way you asked, plainly, because it is the third sweep to carry it.

`Staging Passed Count` and `Total Staging Tests` are both `count` fields over the same link
column. I read both configurations directly. They serialize **identically** — a validity flag and
the id of the link column they count across, and nothing else. Airtable's metadata API does not
expose a count field's filter condition at all, so identical configs are not evidence that no
filter exists; they are evidence that the API cannot tell me either way.

And the data cannot settle it. All 45 rows read `Passed`; **zero** read `Failed` or
`Fixed (To re-test)`. With no non-passing row anywhere in the table, a filtered count and an
unfiltered count return the same number by construction. Four rows reading `100%` are four
instances of the same untested case, not four confirmations.

**So: unknown, exactly as unknown as last sweep, and it will stay unknown until either someone
opens `Staging Passed Count` in the Airtable UI and reads whether a condition is set, or the
crew files its first non-passing row.** Ten seconds in a browser closes it. Until then, 🚀 DevOps's
`To be deployed` + `100%` trigger rests on a number nobody has verified counts what it claims to.

**5 · The `Development` formula's description names a column the formula does not read.**
Re-read this sweep. Unchanged. The description says the formula reads *"Figma, Commit, Staging
Storybook, staging test results, Production Storybook."* The formula's actual referenced fields
are `Staging Testing Results Summary`, `Production Storybook`, `Staging Storybook`, `Figma` and
`Design`. **`Commit` is not among them.** `Design` — which the formula genuinely depends on, and
which is the whole reason a `Figma` link alone does not produce `To-do` — is not in the
description.

The formula's logic is correct and matches the contract branch for branch. Only the description
lies, and it lies about the one thing an engineer reads it to find out: whether writing a commit
URL moves anything. It does not.

**6 · `Semantic Tokens` is empty on all four rows, and the token tables are empty while 1084 tokens ship.**
`Base Tokens`, `Semantic Tokens` and `Component Tokens` hold **0 rows each**. Meanwhile
`build/tokens/css/tokens.css` carries 1084 custom-property declarations, a 7-story gallery
documents them on both hosts, and the QA reports name the specific semantic tokens each
component consumes — `--color-accent-ink`, `--color-accent-soft`, `--color-line-default`,
`--effect-focus-ring`, and others. The registry records none of it.

Those tables carry a `Parity Status` column, so an empty table reports *no parity problems*
rather than reporting *nothing has been checked*. That distinction matters more now than it did
last sweep, because there is now a known token drift to record (see **Ruled by the owner**,
item 2) and nowhere in the registry to record it.

*Also:* `reports/README.md` still reads "Nothing else writes to this folder. The engineer never
does", while `tools.md` line 55 assigns "QA reports and the PM sweep" to `reports/`. This file
is the PM sweep, and the deploy gate was just changed to accommodate exactly this folder having
more than one writer. Third time raised.

**7 · The component name `Icon Slot` does not match its directory, `IconSlot`.**
The contract defines this column as "The component name. PascalCase, matching
`src/components/`". `Icon Slot` is neither. The directory is `IconSlot`, the story id is
`components-iconslot--size-14`, the import is `from '../IconSlot/IconSlot'`. Only the registry
spells it with a space. Nothing is broken today because every lookup this sweep was done by
eye, but it is the single row in the table that a name-based join would miss.

### 🔨 Engineer — 2

**1 · The empty `GitHub Commits` row is still there.** Created 2026-08-18, unchanged through
three sweeps. It carries a `Commit Type` of `Refactor` and **nothing else** — no hash, message,
author, date, URL, and no link to any component. Delete it or fill it.

Worth noting what it would have been good for this week: the one refactor in the project's
history just happened, on Button, and this row — literally typed `Refactor` — records none of
it.

**2 · The `GitHub Commits` link column is empty on all four `Components` rows.** Separate from
the orphan row above. Each component has a real `Commit` URL in its own cell, all four open, so
nothing downstream is wrong. But the table exists, has a working link column, and is used by
nobody. Either wire the four commits into it or say the table is out of use — the same argument
as 🎨 Human 6, for the same reason.

*Not a finding, recorded so it is not mistaken for one:* Button's `Commit` was updated to the
refactor merge rather than left at the original build. That is the right call and it is why this
sweep can say Button's commit describes the build that is actually deployed.

### 🔍 QA — 2

**1 · `Attachment` is empty on all 45 test rows — and at 45 rows the trade is no longer obviously right.**
You asked whether this is still a reasonable trade now that there are 45 rows rather than 30.
Here is the state: the screenshots exist and are complete — 35 PNGs in `reports/Button/`, 9 in
`reports/Chip/`, 7 in `reports/Eyebrow/`, 7 in `reports/IconSlot/`. None is in the registry,
because Airtable needs a publicly reachable URL and these files have no host.

The trade was reasonable at 30 rows for one shipped component. It is weaker at 45 across four,
and the reason is not the count — it is that the registry is now the only artifact that spans
all four components, and it is the one place the evidence is missing. Anyone reviewing the
system has to clone the repo to see a single screenshot.

**It is still not worth blocking anything on, and it is still not a defect** — the evidence is
one directory away and QA did its job. But it is worth saying that the gap grows with every
component and closes only once. Both Vercel deployments are public and serve without a login,
which is a host that did not exist when this was first raised.

**2 · `Context` is populated on Chip's 8 rows and empty on the other 37.**
Chip's rows carry the story id — `components-chip--gold-md` and so on. Button's 30, Eyebrow's 4
and Icon Slot's 3 carry nothing. That field is the only thing in a test row that says *which
deployed story this case was measured in*, and on 37 of 45 rows the answer is absent. It is not
in the contract's column list, which is probably why it is inconsistent. Chip's rows are the
better pattern; either adopt it everywhere or drop it.

### 🚀 DevOps — 1

**Nothing is waiting to ship, and all four production links open and render.** No row reads
`To be deployed`. Both hosts serve an identical 69-story index — the `index.json` files compare
**byte-for-byte equal** — so production is serving the same build staging is.

**1 · The deploy-gate fix is on `staging` and not on `main`.**
`origin/staging` is one commit ahead of `origin/main` (`72e001e`, *Stop the deploy gate failing
on other agents' reports*), and the tree difference is `scripts/security-check.mjs` and
`.claude/agents/qa.md`. Neither reaches the bundle, so nothing deployed is affected — but the
fix that stopped `reports/` red-gating deploys is not on the production branch yet. It will ride
along on the next promotion; just know it is not there now, and do not conclude from PR #4's
gate override that the problem is still live. Re-run against the current tree, gate 5 **passes**.

*Also, local only:* the `main` branch in this working copy sits 16 commits behind `origin/main`
— it is still at the PR #2 merge. Nothing on the remote is wrong. If any deploy step reads local
`main`, fetch first.

Carry forward: your trigger is `To be deployed` at `100%`, and 🎨 Human 4 means `100%` is still
not a verified signal. It has been true four times because 45 of 45 rows genuinely passed. Do
not treat the next one as self-evident.

---

## Contradictions

**1 · All four rows read `ATOMS`; Button and Chip compose Icon Slot.**
Under the atomic-design levels the choices were renamed to, a component built from another
component is a molecule. Button's `Category` was correct until the refactor deleted its private
arrow, and nothing re-examined it. → 🎨 Human

**2 · The first composition in the system is recorded nowhere in the registry.**
Chip composes Icon Slot; Button now does too. `Components` has no self-link column, and
`Composed In` on `Staging Testing` means "belongs to", not "composes". Nothing could route a
re-test from Icon Slot to its two consumers. → 🎨 Human

**3 · `Staging Passed Tests` reads 0 against 45 `Passed` rows.**
A numeric rollup over a single-select field. It read 0 at 30 rows and reads 0 at 45; it will
read 0 at any number. → 🎨 Human

**4 · `Synchronization %` reads `100%` on four rows and the numerator is unverified.**
No filter is exposed on `Staging Passed Count` by the API, and with 45 passed and 0 failed the
filtered and unfiltered readings are indistinguishable. **This sweep cannot settle it and does
not claim to.** → 🎨 Human

**5 · The `Development` description names `Commit`; the formula never references it, and omits `Design`, which it does.** → 🎨 Human

**6 · Four `Completed` rows with `Semantic Tokens` empty, and three empty token tables against 1084 shipping tokens.** → 🎨 Human

**7 · `[Production] Test Records` still holds the free text `Button, button hover`.**
A single-line text column, not in the contract's column list, holding a note rather than a
record. No formula reads it, so nothing downstream is wrong today. Clear it or define it. → 🎨 Human

**8 · The row named `Icon Slot` does not match the directory `IconSlot`.** → 🎨 Human

**9 · A test row cannot say when it was measured, and Button's 30 rows still carry their pre-refactor stamp.**
`Staging Testing` has **no modified-time field**. All 30 Button rows were created 2026-08-19
08:40, against the build in which Button drew its own arrow. They were re-measured on 2026-08-20
against the Icon Slot build and all 30 pass — but nothing *in the registry* records that. The
only evidence that the re-sweep happened lives in `reports/Button.md` and PR #4.

This is the mechanical half of the structural finding below: the registry has no way to say
"this evidence is newer than that build". → 🎨 Human

### Checks that came back clean

- **Test rows with an empty `Composed In` — none.** All 45 link to their component. The
  contract's "counts toward nothing, so `Synchronization %` is quietly wrong" failure does not
  occur anywhere in the table.
- **A component with test rows but no `Staging Storybook` link — none.** All four have both.
- **`Synchronization %` at `100%` with a `Fixed (To re-test)` row — none.** All 45 rows read
  `Passed`. Zero read `Failed`, zero read `Fixed (To re-test)`. No claimed fix is being counted
  as a pass.
- **`Design` = `Done` with an empty or node-less `Figma` cell — none.** Last sweep's softer
  version of this (a file URL with no `node-id`) is fully closed; all four resolve to a real
  component set.
- **A component in `src/components/` with no row, or a row with no component — none.** Four
  directories, four rows, all four with source, stories and CSS.
- **Duplicate rows — none.** Four rows, four distinct names.
- **`Category` — all four are valid choices.** Valid, but see Contradiction 1: valid is not the
  same as correct.
- **Stories without test rows — checked, and correctly so.** Chip serves 12 stories against 8
  test rows, Eyebrow 8 against 4, Icon Slot 8 against 3, Button 34 against 30. Every surplus is
  a composite or playground story (`All Tones`, `Playground`, `With Custom Icon`, `Retinted`,
  `Glyphs`, `Text Only`), not a Figma symbol. The contract asks for one row per variant × size ×
  state, and that is exactly what exists. This is correct, not a gap.
- **The token gallery has no registry row, deliberately.** 7 stories under `Foundations/Tokens`,
  not built from a Figma node. Recorded so the next sweep does not rediscover it as an orphan.
- **The blank-renders-as-`To-do` ambiguity is still unobservable.** The `Development` formula's
  result type maps its default choice to `To-do`, so a `""` result and a real `To-do` surface
  identically. All four rows currently land on the `Completed` branch, so nothing lands on the
  blank branch. Untested rather than fixed; it reappears the first time a row is created without
  `Design` = `Done`.

---

## Dead links

**None. 16 URL slots across four rows, 16 distinct URLs, all open.**

| Row | Column | Target | Result |
|---|---|---|---|
| Button | `Figma` | node `19:231` | **Opens.** Frame "Button", 30 symbols |
| Chip | `Figma` | node `21:79` | **Opens.** Frame "Chip", 8 symbols |
| Eyebrow | `Figma` | node `22:43` | **Opens.** Frame "Eyebrow", 4 symbols |
| Icon Slot | `Figma` | node `9:24` | **Opens.** Frame "Icon Slot", 3 symbols |
| Button | `Commit` | `2572273` | **200.** Verified locally: the Icon Slot refactor merge, touches `Button.tsx`/`.css` |
| Chip | `Commit` | `4433336` | **200.** Adds `Chip.tsx`, `Chip.css`, `Chip.stories.tsx` |
| Eyebrow | `Commit` | `9db9d62` | **200.** Adds `Eyebrow.tsx`, `Eyebrow.css`, `Eyebrow.stories.tsx` |
| Icon Slot | `Commit` | `b26ed39` | **200.** Adds `IconSlot.tsx`, `IconSlot.css`, `IconSlot.stories.tsx` |
| Button | `Staging Storybook` | `--primary-md-default` | **Renders Button**, arrow present |
| Chip | `Staging Storybook` | `--default-sm` | **Renders Chip**, Icon Slot glyph present |
| Eyebrow | `Staging Storybook` | `--agentic` | **Renders Eyebrow** |
| Icon Slot | `Staging Storybook` | `--size-14` | **Renders Icon Slot** |
| Button | `Production Storybook` | `--primary-md-default` | **Renders Button**, arrow present |
| Chip | `Production Storybook` | `--default-sm` | **Renders Chip**, Icon Slot glyph present |
| Eyebrow | `Production Storybook` | `--agentic` | **Renders Eyebrow** |
| Icon Slot | `Production Storybook` | `--size-14` | **Renders Icon Slot** |

**How these were checked, since a status code proves very little here.** A Storybook is a
single-page app: every path under it returns `200`, including stories that do not exist. So
`200` was treated as necessary and not sufficient. Each host's `index.json` was read for the
real story list — both return an identical 69 entries and the two files compare byte-for-byte
equal — every registry story id was confirmed present in that list, and then all eight Storybook
URLs were opened in a browser and each confirmed to render its own component, with no login wall
on either host. The Figma links were resolved over the Figma connection rather than fetched,
which is what makes the symbol-count column above possible. The commit URLs were fetched for
status **and** checked against the local history for which files they touch, so "opens" also
means "is the commit it claims to be".

**The most expensive class of finding is absent.** All four rows are `Completed`, and all four
production links open and render the right component. Nothing in this registry is reporting
success for something nobody can open.

---

## Recorded, ruled by the owner — not open defects

Both of these are settled. They are here so the next sweep does not re-open them, and the note
attached to each is an observation about where the ruling lives, not a re-argument of it.

**1 · Six of Chip's eight variants and all four Eyebrow tones fail WCAG AA contrast in day mode.**
Ruled intentional for this release. Recorded in PR #4.

The observation worth keeping: **nothing in the repo or the design file says so.** I grepped
`CLAUDE.md`, `tools.md`, and every component's `.tsx` and `.css` for any marker of an accepted
exception and found none. The ruling exists in one merged pull request body. The two QA reports
that measured it (`reports/Chip.md` findings 1, `reports/Eyebrow.md` finding 2) describe it as
an open design finding, because they were written before the ruling.

So the next QA run will measure these colours, find them below AA, and file the finding again —
correctly, by its own contract. That is a predictable rediscovery, and the cheapest place to
stop it is a line in the repo or the token record that says the exception was granted and for
which release. 🎨 Human owns that call, since it is a design decision and it belongs in a design
column or a design file.

**2 · The token export lags Figma on one accent value.** Ruled intentional. Same treatment.

Specifically: `--primitives-season-open-accent-ink` is `#1a78bd` in the committed export
(`build/tokens/css/tokens.css` line 121), and the live Figma variable reads `#166fb2`. Both QA
runs caught it independently (`reports/Chip.md` finding 3, `reports/Eyebrow.md` finding 3).

Same observation, and slightly sharper: this ruling is recorded in **neither** the repo nor
PR #4 — PR #4's body covers the contrast decision and does not mention the token drift at all.
As of this sweep the only place it is written down is the instruction to this sweep, and this
report. It will be rediscovered by the next agent that compares tokens to Figma, which is every
QA run. `CLAUDE.md` already says a token that differs between Figma and the export is a design
gap to report rather than fill in, so the agents are behaving exactly as instructed; what is
missing is the record that this particular gap was accepted.

---

## The status ladder has no state for "shipped, then changed"

You asked for my own assessment on this. It is a real gap, it should be closed, and this week
produced the exact evidence for what would close it.

**What happened.** Button shipped. Then its internals were replaced — the private arrow deleted,
Icon Slot imported in its place. Throughout that change its row read `Completed` and its
`Synchronization %` read `100%`, on the strength of 30 test rows measured against a build that
no longer existed. The row was never wrong about anything it claimed; it simply had no way to
claim the one thing that mattered, which is that its evidence was older than its code.

**Why the ladder cannot catch it.** `Development` is ordered, first match wins, and
`Production Storybook` is checked at branch 4 — above `To be deployed` and `Ready for Testing`.
Once a production link exists, the only thing that can outrank it is a `Failed` or `re-test`
row, and those come from QA. So a shipped component can only leave `Completed` if someone tests
it — but nothing tells anyone to test it, because it reads `Completed`. The loop closes on
itself. QA saw this too and wrote it into `reports/Button.md`: the re-sweep "was authorised
explicitly" to close a gap the ladder does not model.

**Two independent agents finding the same hole in one week is the argument for fixing it.**

**What evidence would drive it.** Not a new status typed by hand — that breaks the rule that
`Development` is derived. The gap is that the formula compares *nothing to nothing*: it has no
timestamp on either side. Two fields would give it one:

1. **A modified-time on `Staging Testing`.** The table has none — a test row cannot say when it
   was measured. Airtable supplies this automatically; it costs nobody any discipline. This is
   Contradiction 9, and it is the load-bearing half.
2. **A deploy-time or commit-time the formula can read.** `Commit` is a URL, and the formula
   does not reference it. A last-modified on `Commit`, or a date on the `GitHub Commits` row
   that already exists and is already linked-capable, gives the other side of the comparison.

With both, a seventh branch sits above `Completed`: *newest test row older than the newest
commit* → **`Re-test`**, or `Stale`. Derived, not typed. It would have caught Button
automatically the moment the refactor merged, and it would have cleared itself automatically
when the 30 rows were re-swept.

**The composition gap (🎨 Human 2) is the same gap one level up**, and it is worth fixing at the
same time or not at all. A timestamp rule catches a component whose *own* code changed. It does
not catch Chip, whose own code did not change at all when Icon Slot did. Only a composition
edge propagates staleness from a dependency to its consumers. Today Icon Slot has two consumers
and both are shipped, so the blast radius of an Icon Slot change is two `Completed` rows that
would not move. That is small enough to hold in your head, which is precisely why now is the
cheap moment to fix it.

**One thing this episode got right, and it is worth not losing.** Button's production URL
addresses a story by id on a stable domain — it never encoded which build it served, so the
string was as true before the deploy as after. The registry was not lying about the link; the
deploy is what made the link truthful again. This is an argument for the current URL scheme, not
against it: a link that had encoded the build would have gone *dead* rather than *stale*, and a
dead link is the one failure this registry has never had.

---

## Card

```
📋 PM · registry sweep · 2026-08-20 (3rd)
Components 4 · Completed 4 · Staging Testing 45 rows (45 Passed, 0 Failed, 0 re-test)
Since last sweep: Icon Slot, Chip, Eyebrow shipped; Button refactored onto Icon Slot and
  re-swept 30/30; 8 prior findings closed; no component is stuck
Contradictions 9 (Button+Chip filed ATOMS but compose Icon Slot · no composition edge exists
  in the schema · Staging Passed Tests reads 0 against 45 · Synchronization % numerator still
  unknowable · Development description names Commit, formula never reads it · 4 Completed rows
  with no Semantic Tokens · stray text in [Production] Test Records · row "Icon Slot" vs dir
  "IconSlot" · test rows carry no measured-at time)
Dead links 0 (16 distinct URLs opened; 4 Figma nodes resolved, symbol counts match row counts
  45/45; 8 Storybook URLs rendered; 4 commits verified against local history)
Waiting on: 🎨 Human 7 · 🔨 Engineer 2 · 🔍 QA 2 · 🚀 DevOps 1
Ruled by the owner, recorded not re-litigated: Chip/Eyebrow AA contrast · stale accent-ink
  export. Neither ruling is written anywhere an agent will read — both will be rediscovered.
Structural: the ladder has no state for shipped-then-changed. Closable with a modified-time on
  test rows plus a composition column. Assessed in full above.
Report → reports/registry-audit.md
```
