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

| Thing | Value |
|---|---|
| Base | `Sunim DS` — `appXXXXXXXXXXXXXX` |
| Connection | the Airtable MCP tools |

`Sunim Design System` (`appXXXXXXXXXXXXXX`) resolves to the same tables and the
same records. It is the same base under its pre-rename name. Write to
`appXXXXXXXXXXXXXX` and you are writing to both.

## Tables

| Table | ID | What it holds |
|---|---|---|
| Components | `tblXXXXXXXXXXXXXX` | One row per component. The spine of the system |
| Staging Testing | `tblXXXXXXXXXXXXXX` | One row per test case. QA's output |
| Base Tokens | `tblXXXXXXXXXXXXXX` | Primitives and their values |
| Semantic Tokens | `tblXXXXXXXXXXXXXX` | Semantic tokens, linked to the components using them |
| Component Tokens | `tblXXXXXXXXXXXXXX` | Component-scoped tokens |
| GitHub Commits | `tblXXXXXXXXXXXXXX` | Commit history per component |
| Sunim Feedback | `tblXXXXXXXXXXXXXX` | Inbound feedback |

## Components — who writes which column

Every column has exactly one owner. Writing into a column you do not own is how
this system starts lying.

**🎨 Design is a human.** No agent designs, exports tokens, or touches the design columns.
An agent that finds one of them wrong reports it and stops.

| Column | Owner | What it means |
|---|---|---|
| `Components` | 🎨 Human | The component name. PascalCase, matching `src/components/` |
| `Category` | 🎨 Human | One of the five. **The choice names carry trailing spaces** — copy them exactly |
| `Figma` | 🎨 Human | Node URL of the finished component set |
| `Design` | 🎨 Human | `To-do` · `In progress` · `In testing` · `Done` · `To be fixed` |
| `Commit` | 🔨 Engineer | Commit or PR URL for the merge into the staging branch |
| `Staging Storybook` | 🔨 Engineer | Deployed staging Storybook URL, opening on this component |
| `[Staging] Test Records` | 🔍 QA | Links to the Staging Testing rows |
| `Production Storybook` | 🚀 DevOps | Deployed production Storybook URL |
| `Semantic Tokens` | 🎨 Human | The semantic tokens this component consumes |
| `Development` | **nobody** | Formula. Derived from the columns above |
| `Synchronization %` | **nobody** | Formula. Passed staging tests ÷ total staging tests |
| `Last Modified` | **nobody** | Automatic |

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
- Single-select values go in as the plain choice name, not the choice object. The
  `Category` names really do end in two spaces.
- If a value you need is not in the list of choices, that is a gap. Report it. Do
  not add a choice to make your write succeed.

## Never
- Never write a link to something you have not opened and seen render.
- Never write into a formula, rollup, count, or lookup column.
- Never write into a column another agent owns.
- Never invent a record ID, a base ID, or a field name. They are all in this file.
- Never mark a row `Passed` unless you are QA and you watched it pass.
- Never delete a test row to clear a failure. A failure is cleared by fixing the
  component and re-testing the row.
