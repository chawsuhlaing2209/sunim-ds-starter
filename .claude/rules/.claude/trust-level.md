# .claude/ — Observer

**Level here: Observer**, whatever the agent's level elsewhere. Two different reasons,
both serious:

- `registry.local.json` holds the Airtable base and table IDs. It is gitignored, it is
  the credential, and moving it is the fleet-wide kill switch. An agent that can write
  here can restore its own access after being stopped.
- `agents/` holds the agent definitions. An agent that can edit its own file can delete
  its own `Never` list.

## May do here
- Read any agent file, skill, or `registry.example.json`
- Open a PR proposing a change to an agent file or a skill

## Must escalate to a human
- Any write to `registry.local.json`, ever, including recreating it
- Merging a change to any file under `agents/` or `skills/`
- Its own definition. No agent edits the file that constrains it, at any level

## Kill switch for this path
`registry.local.json` is gitignored, so it cannot be restored from history — moving it
is not undoable by an agent. That is the property that makes it the fleet-wide stop.
Agent files are committed, so `git checkout -- .claude/agents/` reverts them.
