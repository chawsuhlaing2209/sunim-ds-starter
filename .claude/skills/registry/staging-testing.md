# Staging Testing — one row per case

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
