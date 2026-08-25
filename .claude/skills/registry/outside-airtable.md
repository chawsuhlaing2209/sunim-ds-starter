# The registry outside Airtable

One thing reads the registry and cannot reach it: the reference-site generator.
It is a build script, and giving a build a token so it could ask Airtable
directly would put a credential in every CI run to answer a question that changes
twice a week.

So 📝 Doc Generator reads the registry and writes what it saw into
`docs/registry-status.json`, and the generator refuses to publish a page for any
component that is not `Completed` there. Three rules make that safe:

- **Names and statuses only.** No base, table, or record IDs — that file is
  tracked, and this repository is public.
- **It is evidence, so it carries when it was read.** The generator compares
  `readAt` against the last commit to each component's own directory: a component
  that changed after the reading is blocked until somebody reads again, because
  the recorded status predates the change.
- **Nobody edits it by hand.** It is a record of what the registry said. Editing
  it is writing down something that did not happen, which is the one thing this
  whole contract exists to prevent.

Note that the registry row for Icon Slot is named `Icon Slot` while the folder
and the export are `IconSlot`. The generator matches on the name with spacing
ignored and says so when it has to — two systems disagreeing about a name is a
finding for 📦 Release's gate 4, not a detail to absorb quietly.
