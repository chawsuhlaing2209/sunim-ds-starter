# src/ — normal level, except two paths

Most of `src/` runs at the agent's usual level. 🔨 Engineer is Senior in
`src/components/` and that is correct. Two paths inside it are not.

## `src/index.ts` — Advisor

This file is the public surface. A component is public when it is exported here and
not before, so adding a line is a release decision that a version number then has to
keep. `VERSIONING.md` says what that promise covers.

- **May do:** read it; report a `Completed` component that is missing from it
- **Must escalate:** adding or removing any export. A human decides what becomes public
- **Kill switch:** committed, so revertable; and 📦 Release checks the export list
  before a release, which catches an unauthorised addition late but reliably

## `src/components/<Name>/<Name>.intent.json` — 📝 Doc Generator only

Not a lower level, an ownership boundary. The agent that built a component may not
write its intent, or the intent restates what the component was meant to do instead of
describing what it does.

- **Must escalate:** 🔨 Engineer editing an intent file, at any level
- **Kill switch:** `npm run release-review` gate 6 reads it, and the site generator
  refuses to publish a page whose intent would fail that gate
