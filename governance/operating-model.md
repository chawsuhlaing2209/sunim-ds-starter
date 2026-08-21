# Operating model

How work moves through this repo, who holds what, and where the gaps are. Five
minutes, no prior knowledge assumed.

## People

**Orchestrator — Chaw Su Hlaing.** Owns `governance/fleet.md`, decides an agent's
level, and holds every kill switch. Sole author of this repo (116 of 116 commits).

**Reviewers — Chaw Su Hlaing.** Reviews every PR into `main`, and is the required
reviewer on the `npm-publish` environment, so no version reaches npm without her
approval.

**Backup — ⚠️ nobody yet.** If she is away, nothing merges, nothing publishes, and
no agent can be stopped by anyone else. There is no second name anywhere in this
repo to put here.

> ⚠️ The orchestrator and the only reviewer are the same person. Every "a human
> reviews it" in this system is that one person reviewing work she also
> commissioned. It is a deliberate pause, not a second opinion.

## Process

| Work type | Where it starts | Who reviews it | What happens when it fails |
|---|---|---|---|
| Building a component | Airtable row reads `To-do` | 🔍 QA — never the engineer who built it | QA writes `Failed` rows, the row reads `To be fixed`, back to the engineer |
| Testing a component | Row reads `Ready for Testing` **and** has a staging link | Chaw Su — "no verdict is final until a human reads it" | No staging link, no test. QA reports it is blocked and waits |
| Documenting a component | Row reads `Completed` | `npm run release-review` gate 6, then Chaw Su | Intent cannot be written truthfully → write the gap and stop. Never soften it |
| Deploying to production | Row reads `To be deployed` at 100% | The gates: security check, lint, tests, and opening the deployed page | `BLOCKED` stops the ship. A merge conflict goes back to the engineer, never resolved on the way past |
| Releasing a version | A human asks. Never a schedule | Chaw Su confirms the version, then approves `npm-publish` | Nothing is published. The release branch is deleted rather than merged |
| **A bug found in production** | ? | ? | ? |
| **A request from another team** | ? | ? | ? |
| **An agent behaving badly** | ? | ? | ? |

The last three rows are the point of this table. This repo has no defined path for
any of them. The question marks stay until somebody defines one.

## Governance

- **[The fleet table](fleet.md)** — every agent, what it can write, what checks it,
  how to stop it. Every level in it is still marked PROPOSED.
- **[The decision log](decisions.md)** — what was decided about each agent and why.
  Append-only; entries are never edited.
- **[Rulings](../decisions.md)** — findings a human has already decided on, at the
  repo root. Check it before reporting something as new.

### Review cadence

**First review: 21 September 2026.** Monthly after that.

Three questions, every time:

1. **Are the levels still honest?** Does each agent's level match what its file
   actually lets it do today?
2. **Has anything earned a promotion, or lost one?** Name the evidence — a clean
   run, or a failure.
3. **Has the kill switch been tested?** Not "does it exist" — has somebody moved
   `.claude/registry.local.json` and watched an agent stop?

Question 3 has never been answered yes.
