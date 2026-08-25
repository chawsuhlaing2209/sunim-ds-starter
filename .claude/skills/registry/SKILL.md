---
name: registry
description: Read and write the Airtable registry that carries every component's design, code, test and deploy evidence. Use whenever an agent needs a component's Figma node, or needs to record what it just produced.
---

# The registry

## When to use this
Use this whenever you need to know the state of a component, or you have just
produced something a later agent will need — a Figma node, a staging URL, a test
result, a production URL. The registry is how the crew hands work over. Nothing
is handed over in conversation.

One rule sits above the rest: **the registry records evidence, never intention.**
A link goes in after the thing it points at exists and opens. A status is derived
from links and test rows, never typed to make a row look finished.

## Where it is

**The base and table IDs are not in this repo.** They live in
`.claude/registry.local.json`, which is gitignored — this repo is public, and a
public file naming the base to aim a leaked token at is a gift nobody needs to
give. Read that file first; every ID you need is in it, keyed by the names below.

If it is missing, copy `.claude/registry.example.json` to
`.claude/registry.local.json` and fill it in — `list_bases` gives the base ID,
`list_tables_for_base` gives the table IDs. Do not hardcode an ID you found into
any tracked file, and do not print one into a report.

| Thing | Where |
|---|---|
| Base | `baseId` in the local config |
| Connection | the Airtable MCP tools |

The base also answers to a second ID, recorded as `baseIdAlias` — the same base
under its pre-rename name. Writing to `baseId` writes to both.

## Tables

Each key below is a key in `tables` in the local config.

| Table | Config key | What it holds |
|---|---|---|
| Components | `components` | One row per component. The spine of the system |
| Staging Testing | `stagingTesting` | One row per test case. QA's output |
| Base Tokens | `baseTokens` | Primitives and their values |
| Semantic Tokens | `semanticTokens` | Semantic tokens, linked to the components using them |
| Component Tokens | `componentTokens` | Component-scoped tokens |
| GitHub Commits | `githubCommits` | Commit history per component |
| Sunim Feedback | `feedback` | Inbound feedback |

## Components — who writes which column

Every column has exactly one owner. Writing into a column you do not own is how
this system starts lying.

**🎨 Design is a human.** No agent designs, exports tokens, or touches the design columns.
An agent that finds one of them wrong reports it and stops.

| Column | Owner | What it means |
|---|---|---|
| `Components` | 🎨 Human | The component name. PascalCase, matching `src/components/` |
| `Category` | 🎨 Human | The atomic-design level: `ATOMS`, `MOLECULES`, `ORGANISMS`, `TEMPLATES`, `UI` |
| `Figma` | 🎨 Human | Node URL of the finished component set |
| `Design` | 🎨 Human | `To-do` · `In progress` · `In testing` · `Done` · `To be fixed` |
| `Commit` | 🔨 Engineer | Commit or PR URL for the merge into the staging branch |
| `Staging Storybook` | 🔨 Engineer | Deployed staging Storybook URL, opening on this component |
| `[Staging] Test Records` | 🔍 QA | Links to the Staging Testing rows |
| `Production Storybook` | 🚀 DevOps | Deployed production Storybook URL |
| `Astro Link` | 🚀 DevOps | The component's page on the deployed reference site |
| `Semantic Tokens` | 🎨 Human | The semantic tokens this component consumes |
| `Composes` | 🔨 Engineer | The components this one imports. Written when you compose another component |
| `Composed Into` | **nobody** | The reverse of `Composes`, derived. Who depends on this component |
| `Release Review` | 📦 Release | URL of the committed review report, at the commit it reviewed |
| `Release Verdict` | 📦 Release | `Cleared` · `Blocked`. Empty means not reviewed |
| `Development` | **nobody** | Formula. Derived from the columns above |
| `Synchronization %` | **nobody** | Formula. Passed staging tests ÷ total staging tests |
| `Last Modified` | **nobody** | Automatic |

## The rest, by who needs it

Four parts of this contract are read by some agents and not others. They are
separate files so that an agent loads the ones it works against and no more.

| File | Read it if you | Agents |
|---|---|---|
| `composition.md` | write `Composes`, or need to know who must be re-tested when a component changes | 🔨 Engineer · 📋 PM · 📦 Release |
| `staging-testing.md` | create test rows, or write `Testing Results` | 🔍 QA · 🔨 Engineer · 📋 PM |
| `release-columns.md` | write `Release Review` or `Release Verdict` | 📦 Release |
| `outside-airtable.md` | write `docs/registry-status.json` | 📝 Doc Generator |

They are paths under `.claude/skills/registry/`. Read the one you need in full;
do not work from the summary in this table.

## Development — the derived status

`Development` is a formula. It cannot be set, and an agent that wants to change it
changes the evidence underneath it. It reads, in this order, and the first match wins:

| # | Condition | Status |
|---|---|---|
| 1 | Test summary has both `Failed` and `re-test` | `Fixing` |
| 2 | Test summary has `Failed` | `To be fixed` |
| 3 | Test summary has `re-test` | `Fixed` |
| 4 | `Astro Link` **and** `Release Review` set **and** `Release Verdict` = `Cleared` | `Released` |
| 5 | `Production Storybook` has a link | `Completed` |
| 6 | Any staging test rows exist | `To be deployed` |
| 7 | `Staging Storybook` has a link | `Ready for Testing` |
| 8 | `Figma` has a link **and** `Design` = `Done` | `To-do` |
| 9 | none of the above | blank |

Three consequences worth knowing before you are surprised by them:

- A single `Failed` row outranks a production link **and a release**. A component
  that has shipped and then failed a re-test reads `To be fixed`, not `Completed`
  and not `Released`. That is correct — and when it is `Released`, it is urgent,
  because the broken thing is published.
- `Released` needs all three cells, not just the link. The `Astro Link` says it is
  documented; `Release Review` and `Release Verdict` say somebody checked the
  name, the surface and the promise before it went public. Any one alone is not a
  release.
- `Staging Storybook` is QA's starting gun, and the only one. A row without that link has
  nothing deployed behind it, so QA does not test it — 🔨 Engineer deploys and writes the link
  once its local checks are 100% green, and QA waits until then.
- `Figma` alone does not produce `To-do`. The design columns must also carry `Design` =
  `Done`. A node link with the design still in progress leaves the row blank, and the
  engineer has nothing to pick up.

## Writing

- Look the record up before you write it. Never create a second row for a component
  that already has one.
- Single-select values go in as the plain choice name, not the choice object.
- Read the choices from the base before writing one. They have been renamed once
  already — this contract said they carried trailing spaces long after they stopped,
  and an agent copying that instruction would have written an invalid choice.
- If a value you need is not in the list of choices, ask which kind of gap it is.
  **A value the design genuinely defines, that the column simply lacks** — 🔍 QA may
  add the choice, matching the casing of the choices already there, and say in its
  report that it did. **A value that does not belong** — the design does not define
  it, or the one you want is wrong — is still a gap to report, and adding a choice to
  make a failing write succeed is still forbidden. The difference is whether the
  design says the value exists.

## Never
- Never write a link to something you have not opened and seen render.
- Never write into a formula, rollup, count, or lookup column.
- Never write into a column another agent owns.
- Never invent a record ID, a base ID, or a field name. The IDs are in
  `.claude/registry.local.json`; the field names are in this file and in the
  four files it points at.
- Never write a base, table, or record ID into a tracked file, a report, or a commit
  message. Name the component, not the row.
- Never mark a row `Passed` unless you are QA and you watched it pass.
- Never add a select choice to make a write succeed. QA may add one the design
  defines and the column lacks; nobody invents one to get past a rejection.
- Never write `Cleared` without the report link beside it, and never link a
  review to a branch instead of a commit.
- Never write `Astro Link` before the page has been opened and seen to render,
  and never write it as the agent that proposed the release.
- Never delete a test row to clear a failure. A failure is cleared by fixing the
  component and re-testing the row.
