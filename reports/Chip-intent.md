# Chip — intent

**Written** 2026-08-20 · from `3e8ddee` on `main` · 📝 Doc Generator

**Source.** The deployed `components-chip--default-sm` on the production
Storybook, driven through the preview channel. `Chip.tsx` and `Chip.css` were
opened for prop names, token bindings and the absence of a focus rule.
`decisions.md` checked first — the day-mode contrast ruling is recorded there and
is carried forward unchanged; the interactivity question below is **not** ruled.

Nothing in `src/` was touched except `Chip.intent.json`.

---

## What changed

### `dont_use_when` and `a11y` — "by construction" was false

`Chip.md` Finding 2. Both fields claimed Chip is non-interactive *by construction*.
It is not. Verified on the deployed build, not inferred: pushing `role="button"`,
`tabIndex={0}` and an `onClick` onto the story put all three attributes on the
span and **the handler fired**.

```
tag SPAN · role "button" · tabindex "0" · focusable true · click handler hits 1
```

And nothing draws a focus state for the control that has just been made. Searching
every loaded stylesheet for a rule mentioning `.sunim-Chip` together with `focus`
or `outline` returns **zero rules** — `Chip.css` has no focus appearance for any
tone.

Both fields now say what is true: non-interactive **by default**, interactive by
prop spread, and when a caller does spread interactivity in, the component supplies
no focus ring, no Enter/Space handling and no pressed state to go with it.
`dont_use_when` names Button for an action and a real `<button>` or
`<input type="checkbox">` for a filter the user can toggle.

The `a11y` field's promise is now scoped honestly: it guarantees only that it will
not help you if you make it interactive, not that it stays non-interactive.

`required_tokens` (17) and the day-mode contrast sentence are unchanged — the
declared set already matched what the CSS references, and the six-of-eight
sub-4.5:1 finding is ruled in `decisions.md`.

---

## Gap raised

### `ChipProps` permits the interactivity the intent warns against — 🎨 Human rules, then 🔨 Engineer

```ts
export interface ChipProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
```

with `{...rest}` spread onto the span. `HTMLAttributes<HTMLSpanElement>` carries
`onClick`, `onKeyDown`, `tabIndex` and `role`, so the misuse the intent warns
against is reachable with no type error and no lint warning.

There are two ways out and I have taken neither, because only one of them is mine.
I rewrote the prose so it is true today. The other — narrowing `ChipProps` so the
old claim becomes structurally true — is a change to a public type, which
`VERSIONING.md` makes a release decision rather than a cleanup. Not ruled in
`decisions.md`.

Until it is ruled, the intent describes the door as unlocked, because it is.

---

## Not verified

Whether a browser's own `:focus-visible` ring appears on a span a consumer has
given a `tabindex`. What is established is the part that belongs in the intent:
the component authors no focus appearance of its own, so whatever a keyboard user
gets is a browser default that nobody designed and no tone accounts for.
