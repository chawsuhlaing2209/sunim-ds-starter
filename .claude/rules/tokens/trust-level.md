# tokens/ — Observer

**Level here: Observer**, whatever the agent's level elsewhere. This is the design
source. It is exported from Figma by a human, and an agent editing it makes the code
disagree with the design while both look correct.

## May do here
- Read `tokens/tokens.json` to resolve a semantic token
- Report a token that is missing, unbound, or present in one mode and not another

## Must escalate to a human
- Any change to a token's value, name, or mode
- Adding a token that does not exist — this is a design gap, and the human re-exports
  from Figma rather than the agent filling it in

## Kill switch for this path
The file is committed, so `git checkout -- tokens/` undoes anything. To prevent rather
than undo: a `deny` rule on `Edit(tokens/**)` in `.claude/settings.json`. ⚠️ Not in
place today — this repo has no `settings.json`.
