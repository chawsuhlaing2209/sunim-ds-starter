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
| `Semantic Tokens` | 🎨 Human | The semantic tokens this component consumes |
| `Composes` | 🔨 Engineer | The components this one imports. Written when you compose another component |
| `Composed Into` | **nobody** | The reverse of `Composes`, derived. Who depends on this component |
| `Development` | **nobody** | Formula. Derived from the columns above |
| `Synchronization %` | **nobody** | Formula. Passed staging tests ÷ total staging tests |
| `Last Modified` | **nobody** | Automatic |

## Composition — what depends on what

`Composes` records that one component imports another. The engineer writes it in the
same pass that writes the import, and `Composed Into` is its automatic reverse.

Read it in reverse and it answers the one question no other column can: **if this
component changes, who has to be re-tested.** Without it, a repair to a low-level
component leaves every consumer reading `Completed` at 100%, tested against a
version that no longer exists underneath them, with nothing anywhere to say so.

Two things it is not. It is **not a category** — the design file's taxonomy is
positional, and an atom may compose a lower atom and remain an atom. And it is not
yet wired into `Development`: nothing derives from it, so a stale consumer is
something the sweep must notice, not something a formula will catch.

## Development — the derived status

`Development` is a formula. It cannot be set, and an agent that wants to change it
changes the evidence underneath it. It reads, in this order, and the first match wins:

| # | Condition | Status |
|---|---|---|
| 1 | Test summary has both `Failed` and `re-test` | `Fixing` |
| 2 | Test summary has `Failed` | `To be fixed` |
| 3 | Test summary has `re-test` | `Fixed` |
| 4 | `Production Storybook` has a link | `Completed` |
| 5 | Any staging test rows exist | `To be deployed` |
| 6 | `Staging Storybook` has a link | `Ready for Testing` |
| 7 | `Figma` has a link **and** `Design` = `Done` | `To-do` |
| 8 | none of the above | blank |

Two consequences worth knowing before you are surprised by them:

- A single `Failed` row outranks a production link. A component that has shipped and
  then failed a re-test reads `To be fixed`, not `Completed`. That is correct.
- `Staging Storybook` is QA's starting gun, and the only one. A row without that link has
  nothing deployed behind it, so QA does not test it — 🔨 Engineer deploys and writes the link
  once its local checks are 100% green, and QA waits until then.
- `Figma` alone does not produce `To-do`. The design columns must also carry `Design` =
  `Done`. A node link with the design still in progress leaves the row blank, and the
  engineer has nothing to pick up.

## Staging Testing — one row per case

QA creates these rows. One row per variant × size × state, never one row per component.

| Column | Owner | Notes |
|---|---|---|
| `Component/Sub Component` | 🔍 QA | The case name, e.g. `Button · secondary · hover` |
| `Composed In` | 🔍 QA | Link to the Components row. Without it the rollups stay empty |
| `Variants` | 🔍 QA | The variant under test |
| `Size` | 🔍 QA | `xs` `sm` `md` `lg` `xl` `comfort` `compact` `null` |
| `State` | 🔍 QA | `idle` `hovered` `focus` `selected` `disabled` `loading` `error` `draft` `pending` `upcoming` `completed` `rejected` `cancelled` `isCurrent` |
| `Expected Results` | 🔍 QA | What the Figma node says should happen. Name the token or the prop |
| `Attachment` | 🔍 QA | The screenshot of the case |
| `Suggestion for Improvement` | 🔍 QA | Optional, and never a repair |
| `Testing Results` | 🔍 QA, then 🔨 Engineer | See below |

`Testing Results` is the one column two agents touch, and the handoff is strict:

- 🔍 QA writes `Passed` or `Failed`. Only QA writes those two.
- 🔨 Engineer writes `Fixed (To re-test)`, and only on a row it actually fixed.
  That is a claim for a re-test, not a pass. An engineer never writes `Passed`.
- QA then re-tests those rows and moves them to `Passed` or back to `Failed`.

## Writing

- Look the record up before you write it. Never create a second row for a component
  that already has one.
- Single-select values go in as the plain choice name, not the choice object.
- Read the choices from the base before writing one. They have been renamed once
  already — this contract said they carried trailing spaces long after they stopped,
  and an agent copying that instruction would have written an invalid choice.
- If a value you need is not in the list of choices, that is a gap. Report it. Do
  not add a choice to make your write succeed.

## Never
- Never write a link to something you have not opened and seen render.
- Never write into a formula, rollup, count, or lookup column.
- Never write into a column another agent owns.
- Never invent a record ID, a base ID, or a field name. The IDs are in
  `.claude/registry.local.json`; the field names are in this file.
- Never write a base, table, or record ID into a tracked file, a report, or a commit
  message. Name the component, not the row.
- Never mark a row `Passed` unless you are QA and you watched it pass.
- Never delete a test row to clear a failure. A failure is cleared by fixing the
  component and re-testing the row.
