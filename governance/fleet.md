# Fleet

Every agent in `.claude/agents/`, described from what its own file says. Nothing here
is inferred from behaviour, from the plugin agents, or from how the crew is used —
where a file is silent, the cell reads **not stated** and the gap is listed at the
bottom for a human to fill.

**Every level in this table is PROPOSED.** No level here has been ratified, and no
agent file states a level of its own.

| Agent | Type | Level | Scope | Verifier | Kill switch |
|---|---|---|---|---|---|
| 🔨 `engineer` | goal-based | **Senior — PROPOSED** | `src/components/` except `<Name>.intent.json`; its develop branch; a PR into the staging branch, which it also merges; registry cells `Commit`, `Staging Storybook`, `Composes`, and `Fixed (To re-test)` on test rows it fixed. Report path not stated | 🔍 QA, plus machine gates it must run itself: `npm run lint`, Storybook rendering every story, `npm run security-check`, and `security-check --url <staging>` | **not stated** → proposed **P1 · P2 · P3**. De-facto stop: it may not start from a row whose `Development` is blank |
| 🔍 `qa` | model-based | **Observer — PROPOSED** | `reports/` only, committed and pushed to `staging`; rows in the registry's `Staging Testing` table, which it creates and owns. Nothing on the `Components` row | none automated — 🎨 Human, the repo owner, reads it ("no verdict of yours is final until a human reads it"). 📋 PM's sweep catches structural faults in its rows, e.g. an empty `Composed In` | **not stated** → proposed **P1 · P3**. De-facto stop: no `Staging Storybook` link, no test |
| 🚀 `devops` | model-based | **Autonomous — PROPOSED** (human-initiated for jobs 2 and 3) | Git: the staging branch and `main`; the production Storybook host; the reference-site host; registry cells `Production Storybook` and `Astro Link`; `reports/` for the deploy note. Named hosts not stated | its own gates: `npm run lint` and `npm test` on `main`, `npm run security-check` on the build, `security-check --url <production> --expect public`, opening the deployed page, and the `Development → Completed` formula. For job 3, installing the published version from the registry into an empty folder. 📋 PM re-opens its links on every sweep | **not stated** → proposed **P1 · P2 · P3 · P4**. De-facto stops: a row not reading `To be deployed`; jobs 2 and 3 require a human to ask |
| 📋 `pm` | model-based | **Observer — PROPOSED** | `reports/` only — `reports/registry-audit.md`. Registry is read-only, every table. Whether it commits `reports/` is not stated | none automated — 🎨 Human, the repo owner, reads it. "The report is the deliverable" | **not stated** → proposed **P0**. It holds no registry write access, so a stale sweep changes nothing |
| 📝 `doc-generator` | goal-based | **Junior — PROPOSED** | `src/components/<Name>/<Name>.intent.json` and nothing else in `src/`; `docs/` except generated content; `docs/registry-status.json`; `reports/` for its note. Branch, and whether it opens a PR, not stated | real and automated: `scripts/lib/contract.mjs` via `npm run release-review -- <Name>` gate 6, the generator's own refusal to publish a page for an intent that would fail that gate, the `Completed` check against `docs/registry-status.json`, `security-check --dir docs/dist`, and `npm run lint` | **not stated** → proposed **P1 · P2**. De-facto stop: the generator publishes nothing without a same-day registry reading |
| 📦 `release` | goal-based | **Advisor — PROPOSED** | `release/<version>` branch only, branched from `staging`: `CHANGELOG.md`, `reports/release/<version>.md`, `reports/release-review/<Component>.md`. Registry cells `Release Review` and `Release Verdict`, in review mode only. Never `src/`, never `package.json`'s `version`, never `main` or `staging` | 🎨 Human, the repo owner — "the only thing left is a human deciding to publish it". Partially re-verified by 🚀 DevOps before publishing, which re-checks the branch is unchanged, that every component reads `Cleared`, and re-reads the `npm pack` file list | **not stated** → proposed **P0 · P1**. Structural stops: it holds no publish credential, and it halts before starting if the board is unreachable |

---

## Why each type and level

### 🔨 `engineer` — goal-based, Senior (PROPOSED)

Does it need to remember? No — every piece of state it carries lives in the registry,
not in the agent. Does it need a plan? Yes, and the file is built around one:
"Follow `.claude/skills/build/SKILL.md`, in order. Four stages there, a fifth below,
and **each one has a check. You never leave a stage red**" — an ordered sequence with
a goal test at every step and a loop back on failure. Does it choose between options
that are all acceptable? No, and it is explicitly forbidden from doing so: "An unbound
property is reported, not guessed." Plan without choice puts it at goal-based.

Senior rather than Junior because it does not stop at a proposal: "Open a PR from your
develop branch into the staging branch and merge it, deploy the staging Storybook, then
**open the deployed URL**". A Junior opens the PR and waits; this one merges its own and
deploys. Not Autonomous because both stop at staging — "Never write into `Design`, `Production Storybook`…" — and its work is not
signed off by itself: "Never run the QA pass or sign off your own work."

### 🔍 `qa` — model-based, Observer (PROPOSED)

Remember? No. Plan? No — the sequence is enumerated from the design and executed
whole; there is no ordering to work out and no loop toward a goal. Choose between
acceptables? No; `Passed` and `Failed` are the only outputs. That would leave simple
reflex, except that it cannot judge from the artifact in front of it. It needs an
external model of what correct looks like, and the file says exactly that: "Never
build the expected matrix from the story file. It comes from the Figma node. A
component checked against its own code agrees with itself by construction and proves
nothing." A model of the world it is not looking at, used to interpret what it is
looking at — model-based.

Observer because the role line is "Test what the engineer built. Report what you find.
Repair nothing," and it writes nothing on the `Components` row. **Two ways it exceeds
strict Observer, and you should decide whether that is acceptable:** it commits and
pushes `reports/` directly to `staging`, and the test rows it writes move
`Development` on their own — its report is also the thing that advances the ladder.

### 🚀 `devops` — model-based, Autonomous (PROPOSED)

Remember? No — pointedly not: "all three are true, in the registry, right now. Not in
a report from this morning." Plan? No; the steps are fixed and a deviation is a stop,
not a re-plan — "A conflict is not yours to resolve by picking a side: stop, and hand
it back." Choose between acceptables? No. What makes it model-based rather than simple
reflex is that it cannot see from the artifact whether the thing in front of it was
verified. It must consult a record of events it did not witness: "`Fixed (To re-test)`
matters as much as `Failed`. It means an engineer claims a repair that QA has not
re-tested yet."

Autonomous for job 1, because it initiates from a status with no human in the loop and
runs to production behind genuine verifiers — the registry gate, the security gate,
lint and tests on `main`, the live-URL gate, and opening the page. Jobs 2 and 3 are
the same reach but human-initiated by design: "Never deploy the reference site or
publish a release without a human asking. Those two are decisions, not statuses." This
is the highest-reach agent in the fleet and the one worth ratifying first.

### 📋 `pm` — model-based, Observer (PROPOSED)

Remember? Yes — this is the one that answers the first question affirmatively, and it
is the deciding answer: "lead with what changed since the previous sweep — a standing
list of the same six stuck rows teaches people to stop reading it." It needs prior
state to produce its deliverable. Plan? No, the sweep is five fixed steps. Choose
between acceptables? No. Memory without a plan is model-based.

Observer is not a proposal so much as a reading: "The registry, through the Airtable
connection — **read only, every table**. Write access to `reports/` only," with the
reason given in the file — "An auditor that can edit the thing it audits will
eventually tidy a discrepancy away instead of reporting it."

### 📝 `doc-generator` — goal-based, Junior (PROPOSED)

Remember? No. Plan? Yes, and the order is load-bearing rather than incidental: "The
order matters, and it is the opposite of the order that feels efficient" — open the
deployed component, then the Figma description, then the props, then write. It also
has a goal test that can fail without failing the agent: "If the component does not do
what its intent would have to claim… **write down the gap and stop.**" Choose between
acceptables? No — the alternative to a true field is no field, not a better-worded
one: "Never soften a field to make it true."

Junior because it writes into the repo and commits, but ships nothing — "Build
nothing, fix nothing, ship nothing" — and the deploy of what it generates belongs to
DevOps. It has the strongest automated verifier of any agent here, which is an
argument for proposing it higher; what holds it at Junior is that its branch and PR
mechanism is not stated anywhere in the file.

### 📦 `release` — goal-based, Advisor (PROPOSED)

Remember? No. Plan? Yes — ten ordered steps toward a defined end state, where each
step exists to catch something no earlier step can: "This is the only step that tests
what a consumer experiences. Everything before it tests the repository." Choose
between acceptables? No; the version is derived, not picked — "Not 'seems like a
minor' — *this* change, by name," with `VERSIONING.md` as the source.

Advisor is the file's own description of itself: "You prepare; a human decides;
🚀 DevOps performs." Everything it produces is reversible — a branch, a draft, a
proposal — and it holds no credential to make any of it stick: "No npm token, no
Vercel token, no `git tag`, no `npm publish`."

---

## How levels change

Each block is a test somebody can apply without asking the orchestrator. Numbers are
based on what that agent actually does, not copied between agents.

**Before any of this: no CI runs on a pull request in this repo.** The only workflow
is `release-publish.yml`, and it is `workflow_dispatch` only. Every criterion below
that asks for "a verifier on every PR" is therefore unmet today, including for the
agent already sitting at Senior.

### 🔨 engineer — Senior

**PROMOTION · Senior → Autonomous.** At Senior for a quarter. Six or more components
have gone `To-do` → `Completed` with no QA failure that `lint`, Storybook or
`security-check` should have caught. QA has caught at least one real defect and the
fix loop closed it without a human relaying anything. The kill switch has been tested
— somebody moved `.claude/registry.local.json` and watched it stop. A bad merge into
staging is revertable in under an hour.

**DEMOTION — immediate, no discussion.** It deployed to staging on a red gate, or with
a known defect. It wrote a status word that is QA's. It marked a row `Fixed (To
re-test)` it did not fix. Or thirty days of PRs where the same class of correction
keeps coming back.

### 🔍 QA — Observer

**⚠️ QA cannot pass Junior until a verifier exists.** Its only check today is a human
reading the report. A verifier would have to answer: does the number of rows in
`Staging Testing` match the variant × size × state count in the Figma node, is every
row's `Composed In` filled, and does any row carry `Passed` written in the same run
that the engineer wrote `Fixed (To re-test)`? That is checkable and nothing checks it.

**PROMOTION · Observer → Advisor.** Ran on four or more components across two weeks,
and the orchestrator can name two blind spots and how she handles them — beyond the
two already written into the file (fonts not loaded, `get_variable_defs` answering in
the wrong mode). Found in practice, not imagined.

**DEMOTION — immediate, no discussion.** A `Passed` reached production on something
broken. It tested a component it had built. It wrote one row for a whole component.
Or the reports cost more than an hour to read across thirty days.

### 🚀 DevOps — Autonomous

**No promotion. It is already at the top of the ladder**, and the two human-initiated
jobs stay human-initiated. To *hold* Autonomous: the live security gate keeps running
against production, PM's sweep keeps re-opening every link it wrote, and the
`npm-publish` reviewer requirement stays on.

**DEMOTION — immediate, no discussion.** It shipped past a `Fixed (To re-test)` row.
It fixed anything on the way to production. It wrote a link to a page it had not
opened. It published without a human confirming the version. Any one of these drops it
to Senior — production deploys go behind a human ask until it re-earns the gate.

### 📋 PM — Observer

**⚠️ PM cannot pass Junior until a verifier exists.** Nothing checks its sweep. A
verifier would have to answer: did it read every row rather than a filtered view, did
every URL it called good actually return 200, and is every finding addressed to an
owner who can act on it?

**PROMOTION · Observer → Advisor.** Four sweeps across four weeks where every finding
was actionable without asking a follow-up question, no dead link was missed, and the
orchestrator can name two blind spots and how she handles them.

**DEMOTION — immediate, no discussion.** It wrote to the registry. It reported a link
as good without opening it. It reported counts with no rows behind them. Or two
consecutive sweeps repeated the same stuck list with nothing new.

### 📝 Doc Generator — Junior

**PROMOTION · Junior → Senior.** Intents merged unchanged for eight consecutive weeks.
Every rejection in that period is now a rule in `CLAUDE.md`. And `npm run
release-review` gate 6 runs on every PR in CI — which today it does not, so this
criterion is currently unreachable by construction.

**DEMOTION — immediate, no discussion.** It published a page for a component not
reading `Completed`. It softened a field to make it true. It edited a component, its
stories or its CSS. It hand-edited a generated page or `docs/registry-status.json`. Or
a published page described something that had never shipped.

### 📦 Release — Advisor

**PROMOTION · Advisor → Junior.** Three releases prepared where the proposed version
was the one eventually published and the forcing change named was the right one. The
`npm pack` file list was read and reported every time. And a check exists that would
catch a bad release branch before a human confirms it — today the only one is DevOps
re-verifying at publish time, which is late but real.

**DEMOTION — immediate, no discussion.** It edited `package.json`'s version. It wrote
outside its release branch. It accepted a publish credential. It carried on with a
partial run when the board was unreachable. Or it included a component whose
`Release Verdict` was not `Cleared` without saying so on the card.

---

Demotion is a reset, not a failure. Fix the verifier, narrow the scope, re-promote when the criteria are met.

## Proposed kill switches

**None of this is in an agent file.** Every mechanism below is PROPOSED, on the same
footing as the levels above.

### "Kill switch" is three questions, not one

| Question | What answers it |
|---|---|
| Stop it starting again | Remove the agent, or the thing it is invoked by |
| Stop it mid-run | Make its next consequential call fail |
| Undo what it did | Only possible where the reach is reversible — and for one job here, it is not |

The second question is the awkward one. You cannot reliably interrupt a model that is
already in a loop by editing a file it read past ten minutes ago. What you *can* do is
make the step that matters fail closed. So the design principle for this fleet is:
**put the switch on the chokepoint, not on the agent.** That is also how this repo
already works — `contract.mjs` is "one reader" for a reason, and `--force` deliberately
cannot answer the registry question.

### The chokepoints that already exist

Nothing here needs building. It needs writing down.

| Chokepoint | Pulling it stops | Reach |
|---|---|---|
| `.claude/registry.local.json` — gitignored, holds the base and table IDs | every registry read and write | **all six agents** |
| The Airtable MCP connection | the same, one layer up | all six |
| The Figma MCP connection | 🔨 Engineer stages 1–2, 🔍 QA entirely, 📝 Doc Generator job 1 | three |
| `scripts/security-check.mjs` | 🔨 Engineer's staging deploy, 🚀 DevOps's production ship, 📝 Doc Generator's site | three |
| `scripts/lib/contract.mjs` | 📝 Doc Generator's publish, 📦 Release's gate 6 | two |
| `.github/workflows/release-publish.yml` — `workflow_dispatch` only, `environment: npm-publish`, `secrets.NPM_TOKEN` | the npm publish, which is the only irreversible act in the fleet | one |

**The finding worth acting on first:** moving one gitignored file — `.claude/registry.local.json`
— stops every agent in this fleet dead, mid-run, with no code change and no deploy. It
is the fleet-wide kill switch, it works today, and it is documented in `tools.md` as a
setup step rather than as a control.

### P0 · Delete the agent file

`rm .claude/agents/<name>.md`, or rename it. Stops the next invocation. Does not stop a
running one. Reversible with `git checkout`.

Cheapest thing that works, and enough for an Observer whose output nothing reads
automatically. Its weakness is that it fails *silently* — the caller gets "no such
agent" and no record of why, which a month later reads as a mistake rather than a
decision. If P0 is the answer for an agent, the deletion belongs in a commit message
that says who stopped it and what would un-stop it.

### P1 · A halt list the agent reads at step 0

Add `governance/HALT.md`, and one line to each agent's `## Steps`:

> **Step 0 · Read `governance/HALT.md`.** If your name or `*` is listed there, stop
> and print the halt card. Do not read further.

`HALT.md` is one row per halted agent: name, who halted it, the date, the reason, and
what would lift it. The card reuses the format every agent file already has:

```
🔨 Engineer · halted
Halted by <who>, <date> — <reason>
Lifts when: <condition>
Nothing was built. No branch was created.
```

Costs six one-line edits. Legible, greppable, carries the reason, and survives a
context reset in a way a chat instruction does not. Its weakness is honest: it is a
convention, it binds only at the start of a run, and an agent that has already reached
stage 4 will never see it.

### P2 · A halt the chokepoint enforces

`scripts/lib/halt.mjs`, read by `security-check.mjs`, `generate-docs.mjs`,
`release-review.mjs` and `release.mjs`. Same `HALT.md` file, but now a halted agent's
*deploy* fails even though the agent ignored the notice — because every consequential
step in this fleet already runs through one of those four scripts.

This is P1 with teeth, and it is the tier that actually answers question two. It is
also the tier that fits the repo's culture most exactly: nothing here is enforced by
trusting an agent to have read something.

Two things it must get right. It fails **closed** — an unreadable or malformed
`HALT.md` blocks rather than passes, or it is not a gate. And it is not overridable by
a flag; `--force` already exists next door and already refuses to answer a question of
this kind.

### P3 · Pull the credential

Instant, no code, works mid-run, and 📦 Release already proves the pattern is safe:
with the board unreachable it halts before starting and says precisely what is missing
and what would fix it. Every other agent should fail the same way rather than guessing
a component list from the folder.

Per agent, the specific thing to pull is in the chokepoint table above. For most of
this fleet it is one file.

### P4 · Pre-authorisation, for the reach that cannot be undone

Not a kill switch — the control you need where no kill switch can help. See below.

### Per agent

| Agent | Proposed | Stops it mid-run? | Blast radius if it runs anyway |
|---|---|---|---|
| 📋 `pm` | **P0** | no | a stale `reports/registry-audit.md`. Nothing reads it automatically, and it holds no registry write access. Do not over-build this one |
| 📦 `release` | **P0 · P1** | P1 only at start | a branch and a draft. Everything it produces is reversible by design and it holds no credential. Add: delete `release/<version>` — which is already the documented disposal path, and still has no named owner |
| 🔍 `qa` | **P1 · P3** (revoke Airtable write) | P3 yes | larger than Observer suggests: its rows move `Development` to `To be deployed`, and 🚀 DevOps acts on that status without a human. A wrong `Passed` propagates to production through an agent that is trusting it |
| 📝 `doc-generator` | **P1 · P2** | P2 yes | a published page describing something unshipped. It already has a refusal mechanism — the generator "refuses to publish a page for a component that would fail that gate" — so extending that same refusal to a halt is close to free |
| 🔨 `engineer` | **P1 · P2 · P3** | P2 and P3 yes | a staging deploy and a `Ready for Testing` row, which burns a QA pass. Its consequential step is already gated by `security-check.mjs`, so P2 lands exactly where it needs to |
| 🚀 `devops` | **P1 · P2 · P3 · P4** | P2, P3 yes | production, and npm. The only agent in the fleet where one tier is not enough |

### The one thing no kill switch covers

🚀 DevOps job 3. "An npm version cannot be unpublished after 72 hours" — the agent file
says so itself, and it is the reason that job is human-initiated. But human-initiated
is not the same as human-*reviewed*: today one person can trigger the workflow, and
after that no switch in this document helps.

**P4, proposed:** put required reviewers on the `environment: npm-publish` that the
workflow already declares. It is a GitHub feature, the environment exists, and it
turns the irreversible act into a two-person one without touching an agent file.
Keep `dry_run` as the default first pass, which the workflow already supports.

The same argument applies more weakly to the merge into `main`. Branch protection on
`main` would make 🚀 DevOps's merge reviewable; whether that protection exists today is
**not stated** anywhere in the repo, and I did not check the remote.

### What I would do first

1. Write down that `.claude/registry.local.json` is the fleet-wide stop. One line in
   `tools.md`. Costs nothing, and it is already true.
2. P4 on `environment: npm-publish`. It is the only irreversible reach here.
3. P1 across all six. Six one-line edits.
4. P2 on `security-check.mjs` and `generate-docs.mjs` — the two gates that already
   stand in front of something public.

## Gaps — for a human to fill

**Every agent, kill switch.** No file in `.claude/agents/` states how to stop the
agent it describes. Proposals are in the section above; none of them is in an agent
file yet, so until one is, the real answer to "how do I stop it" stays: delete the
file, or move `.claude/registry.local.json`. Neither is written down anywhere an
operator would look.

**Every agent, type and level.** No file states either. All six classifications above
are readings, and every level is PROPOSED.

**`Completed` has two claimants and no stated order.** 📝 Doc Generator gates on it
("Only `Completed` components get a page") and 📦 Release gates on the same value
("Value that qualifies | `Completed`"). The order is implied — Release's gate 6 reads
the intent Doc Generator writes, and Doc Generator lists "when 📦 Release blocks on
gate 6" as one of its triggers — but nothing states it. A `Completed` row picked up by
Release first burns a pass discovering it needed Doc Generator.

**📦 Release's Scope does not cover what `release-prepare` step 10 makes it do.** The
skill is now ten steps, and step 10 runs `scripts/generate-docs.mjs --version`, which
writes `docs/src/content/docs/` and `docs/src/styles` — and at `scripts/generate-docs.mjs:951`
deletes every existing component page before regenerating. `release.md`'s Access grants
`CHANGELOG.md` and two report paths on a release branch; `docs/` is not among them, and
this table gives `docs/` to 📝 Doc Generator. The skill draws the boundary at build
versus deploy ("You build it. You never deploy it"), which is the right boundary for
deployment and not the one at issue here.

**`release.md` still describes nine steps.** The skill it delegates to has ten. An
agent file out of sync with its own skill is exactly what this table exists to catch.

**`engineer` — report path not stated.** "A short report" is required with no location
given, while QA, PM, DevOps, Doc Generator and Release all name `reports/`.

**`pm` — where "since last sweep" comes from is not stated.** It must "lead with what
changed since the previous sweep" while also writing `reports/registry-audit.md`,
"overwriting the last one." The file does not say whether the prior state is read
before the overwrite, recovered from git, or held some other way.

**`pm` — commit rights not stated.** It has "write access to `reports/`" but, unlike
QA, is not told whether to commit or push it.

**`doc-generator` — branch and PR not stated.** It is told to commit its note "with the
intent file" but never which branch, or whether that lands via a PR. Its proposed level
cannot be firmed up without this.

**`qa` — no verifier of the verdict.** "No verdict of yours is final until a human
reads it" is the entire check. Whether a human actually reads every `reports/<Component>.md`
is a process fact this repo does not record anywhere.

**`release` — who deletes an unconfirmed release branch.** "If the version is not
confirmed, the branch is deleted rather than merged" names no owner, and Release itself
is forbidden from writing outside that branch.

**`devops` — hosting is unnamed.** Access refers to "the hosting the production
Storybook is served from" and "the hosting the reference site is served from" without
naming either, so Scope above cannot be more specific than the file is.

**No agent is hierarchical, and this is deliberate.** None of the six invokes another;
DevOps is explicitly forbidden from it — "📝 Doc Generator generates; you deploy. Do not
run the generator yourself." Handoff is through the registry, per `CLAUDE.md`. Worth
recording so that a future reading of this table does not treat the absence as an
oversight.
