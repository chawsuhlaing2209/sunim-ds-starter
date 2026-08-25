# Decisions

An append-only log of what was decided about the agent fleet, and why.

**Entries are never edited and never deleted. Only appended.** The value of this log
is that it shows what was believed at the time — a corrected entry destroys exactly
the thing it exists to record. If a decision turns out to be wrong, or changes, write
a new entry saying so and leave the old one where it is.

An entry reading **proposed at** is not confirmed. It becomes confirmed when a later
entry says so — not by editing the line above.

> Not to be confused with [`decisions.md` at the repo root](../decisions.md), which
> logs rulings on QA findings. Different file, different purpose.

---

2026-08-21 · engineer agent proposed at Senior.
It opens a PR into staging and merges it, then deploys the staging Storybook, so it
does more than propose. It stops at staging and never signs off its own work — QA
does. Revisit if it is ever given `main`.

2026-08-21 · qa agent proposed at Observer.
It tests, reports, and repairs nothing. Held at Observer despite two deviations: it
pushes `reports/` to staging, and its test rows move `Development` on their own.
Revisit if a wrong `Passed` ever reaches production.

2026-08-21 · devops agent proposed at Autonomous, human-initiated for jobs 2 and 3.
Job 1 starts itself from a status and runs to production behind real gates — security
check, lint, tests, and opening the deployed page. Publishing the site and the package
need a human to ask, because those are decisions rather than statuses. Revisit after
the first production deploy nobody watched.

2026-08-21 · pm agent proposed at Observer.
It reads every table and writes only `reports/`. It has no registry write access at
all, deliberately: an auditor that can edit what it audits will eventually tidy a
discrepancy away instead of reporting it. Revisit if it is ever given a write.

2026-08-21 · doc-generator agent proposed at Junior.
It writes one file per component and generates the site, but ships nothing — DevOps
deploys. It has the strongest automated verifier in the fleet, which argues for
higher; what holds it here is that its branch and PR mechanism is stated nowhere.
Revisit once that is written down.

2026-08-21 · release agent proposed at Advisor.
It prepares releases and cannot publish, because the publish credential lives in repo
secrets rather than on any machine it runs on. Revisit after three releases.

2026-08-21 · 🔍 QA may add a select choice the design defines.
Ruled in conversation after QA hit a `State` column with no `filled` choice while
testing Input Control against a node that defines exactly that state. It refused to
add one, correctly, and recorded the case as `idle` with the real name parked in
`Variants` — a row that counted toward the rollups while describing the wrong state.
The contract's blanket refusal was written to stop an agent widening a column to get
past a rejected write; it also stopped an agent recording a state the design plainly
has. Those are different acts and the rule now separates them: a value the design
defines and the column lacks, QA adds and reports; a value the design does not define
is still a gap to report. Revisit if a choice ever appears that no node defines.
