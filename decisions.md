# decisions.md — rulings a human has made

Findings an agent would otherwise report as new, every single time.

An agent that finds something on this list **records it as already ruled and moves
on**. It does not re-argue it, and it does not treat it as a defect to fix. An agent
that disagrees says so once, in its report, and still proceeds.

This file exists because two rulings were made in conversation and written nowhere.
The next audit rediscovered both, correctly, because nothing in the repo said
otherwise. A decision that lives only in a chat log is a decision the system does
not have.

**Check this file before recording a finding as new.** If what you found is not
here, it is not ruled — report it.

---

## Accepted: Chip and Eyebrow fail WCAG AA contrast in day mode

**Ruled** 2026-08-19 · **Scope** Chip, Eyebrow · **Status** accepted for this release

Six of Chip's eight variants and all four Eyebrow tones fall below 4.5:1 against
their surface in `day` mode. Measured, twice, independently:

| Component | Case | Ratio |
|---|---|---|
| Chip | Default | 4.08 |
| Chip | Gold | 3.35 |
| Chip | Agentic | 3.30 |
| Eyebrow | Agentic | 3.48 |
| Eyebrow | Sky | 2.55 |
| Eyebrow | Ink | 4.35 |
| Eyebrow | Gold | 2.16 |

Both components render exactly the token pair their Figma node binds, so there is
no version of either that both passes AA and matches the design. Closing the gap
means changing the palette, which is design's call, and the owner has ruled it
intentional for now.

**What this means for you.** Do not fail a case for this. Record it against this
ruling and carry on. If you find a *new* case that fails, or a ratio that has moved,
that is not covered here — report it.

Recorded in PR #4. Revisit if the palette changes.

## Accepted: the token export lags Figma on `accent-ink`

**Ruled** 2026-08-19 · **Scope** repo-wide · **Status** accepted, not scheduled

`--color-accent-ink` resolves to `#1a78bd` in `build/tokens/css/tokens.css`, from
the committed `tokens/tokens.json`. Figma's live variable reads `#166fb2`. Eleven
of twelve other colours on the same node match hex-for-hex, which is what makes
this a stale export rather than a mismapping.

Re-exporting would lift Eyebrow's Ink tone from 4.35 to 4.92 and clear AA on that
one tone. The owner has ruled the accessibility outcome intentional, so the
re-export is not scheduled either.

**What this means for you.** Expect code and Figma to disagree on this one value.
Bind the semantic token and move on. Do not hand-edit `build/tokens/` — it is
generated, and that rule does not bend for this.

**What is not ruled:** any *other* token drifting. One known-stale value is a
decision; a second one is a broken pipeline. Report it.
