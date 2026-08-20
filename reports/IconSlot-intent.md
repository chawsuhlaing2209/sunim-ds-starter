# IconSlot — intent

**Written** 2026-08-20 · from `3e8ddee` on `main` · 📝 Doc Generator

**Source.** The deployed `components-iconslot--size-16`, plus the deployed Button
and Chip stories read for what they actually render in their trailing and leading
slots. `IconSlot.tsx` was opened for prop names and the token binding only.
`decisions.md` checked first; neither finding below is ruled.

Nothing in `src/` was touched except `IconSlot.intent.json`.

---

## What changed

### `dont_use_when` — it described a component that does not exist

`IconSlot.md` F3, both halves.

**The placeholder claim.** The old sentence said "every production use should pass
the real icon from Sunim Icon through the `icon` prop". Both production consumers
do the opposite on their default path, and I confirmed it in the deployed DOM
rather than inferring it from the source:

- the Button story renders `<span class="sunim-IconSlot sunim-IconSlot--16">` with
  the placeholder arrow inside it;
- the Chip story renders `sunim-IconSlot--14` the same way.

The field now says the arrow is the default Button and Chip ship **today**, and
asks for a real icon everywhere else.

**The impossible case.** The fourth-size misuse is gone. `IconSlotSize` is a closed
union, so the compiler already forbids it and the sentence checked nothing. In its
place is the misuse the component genuinely invites and which was absent:
`IconSlot` requires no props at all and draws a complete, plausible arrow, so
shipping the placeholder is the path of least resistance and nothing stops it.

A third case was added for the same reason — the square slot letterboxes anything
that is not square, which is what a consumer discovers after using it to size an
icon a parent already sizes.

### `a11y` — rewritten to what ships after `3d7c9e6`

All three cases verified live on `components-iconslot--size-16`:

| Case | DOM |
|---|---|
| no name | `aria-hidden="true"`, no role |
| `aria-label="Next"` alone | `role="img"`, `aria-label="Next"`, no `aria-hidden` |
| `label` and `aria-label` together | `label` wins — `aria-label="Forward"` |

Never focusable in any case. Before `3d7c9e6` the second row was the silent
regression `IconSlot.md` F2 describes: the caller's `aria-label` was overwritten
with `undefined` and the element stayed hidden. It is fixed and live.

`role` and `aria-hidden` remain overridable, and the field says so.

The field now names a second thing the component does not guarantee, alongside the
inherited-colour contrast caveat: with no `icon` and no name it renders an arrow
that says nothing to anybody, and neither the component nor the types will tell
you.

`required_tokens` is unchanged at one — `color.text.body` is the only semantic
token `IconSlot.css` references; the three sizes are declared unbound values in
its own quarantine block.

---

## Gaps raised

### 1 · Whether placeholder-by-default is the design — 🎨 Human

`IconSlot.md` F3 asks for a human's reading and I have not substituted mine. The
sentence I wrote is true under either reading: the arrow *is* what Button and Chip
ship today. What is open is whether that is intended — Button's arrow being
Button's real design — or a gap, in which case both consumers should be passing
real icons from a Sunim Icon file that is not in this repo. If it is the second, it
is 🔨 Engineer's, and this intent wants another pass afterwards.

The component's own header comment still calls the arrow "scaffolding", which is
the reading the intent used to take and the one the deployed build contradicts.
That comment is 🔨 Engineer's file; left as found.

### 2 · Three dead Storybook links on the generated IconSlot page — 🔨 Engineer

Found by checking every deep link the site generates against both the local and
the production Storybook index. The Design tab's variant matrix links
`components-iconslot--size14`, `--size16` and `--size22`; the real ids are
`--size-14`, `--size-16`, `--size-22`. Opening one gives *"Couldn't find story
matching 'components-iconslot--size14'."*

The cause is `parseStoryIds` in `scripts/lib/contract.mjs`:

```js
id: `${kind}--${m[1].replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`,
```

That inserts a hyphen only at a lower→upper boundary. Storybook's own derivation
also splits at a letter→digit boundary, so `Size14` becomes `size-14` there and
`size14` here. IconSlot is the only component whose exports have that shape today,
which is why it is three links and not thirty.

`scripts/` is outside my write list, so I have not touched it. These are links, not
embeds — the three matrix *embeds* on that page use different, valid ids and
render.

---

## Not verified

The raw `aria-label` idiom outside Storybook. All three name cases were driven on
the deployed build, which sets real props on the real component, but no story
exercises `aria-label` on its own — the absence `IconSlot.md` F2 already noted.
No screen reader was run.
