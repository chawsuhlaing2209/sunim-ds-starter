# Button — intent

**Written** 2026-08-20 · from `3e8ddee` on `main` · 📝 Doc Generator

**Source.** The production Storybook at `https://sunim-ds-starter.vercel.app`
(74 entries, 4 of type `docs` — the docs pages `Button.md` F3 could not find are
live now). Every claim below was driven through the deployed build's preview
channel and read back out of the DOM, not read off `Button.tsx`. The props were
opened for names and token bindings only. `decisions.md` checked first; nothing
here is ruled.

Nothing in `src/` was touched except `Button.intent.json`.

---

## What changed

### `required_tokens` — 12 → 16

`Button.md` Finding 4. The field named 12 tokens; `Button.css` renders from 16.
Added `spacing.step.10`, `spacing.step.14`, `spacing.step.18`, `spacing.step.26`
— the padding on all 30 variants (`10/18` on Md, `14/26` on Lg). All four resolve
in `build/tokens/css/tokens.css` and all four are referenced by the component. No
token was invented.

`npm run release-review -- Button` no longer raises `tokens-undeclared`; the run
is CLEAR at 20 passed · 2 warned · 0 failed, and the two remaining warnings are
the unbound-value quarantine and the un-bumped version, neither of them mine.

### `a11y` — rewritten to what ships after `3d7c9e6`

Verified live on `components-button--primary-md-default` by pushing args through
the preview channel:

| Pushed | DOM |
|---|---|
| `disabled: true` | `button.disabled === true` |
| `aria-busy: "true"` on `state="Default"` | `aria-busy="true"` |

Both were silently discarded before `3d7c9e6`; both now land. The field states the
mechanism the fix introduced — the Figma `state` axis and the native attribute are
OR-ed rather than overridden, so no value of `state` cancels a caller's `disabled`,
and `state="Loading"` supplies `aria-busy` only when the caller has set none.

Target sizes re-measured rather than restated, on the deployed build: Md is
**36.2px** tall, Lg is **46.6px** (Primary/Lg/Loading, 229px wide). Md clears WCAG
2.5.8 at AA (24×24) and misses 2.5.5 at AAA (44×44); Lg clears both. The previous
"36px / 47px" was close but was not a measurement.

The field now also carries what the component does **not** guarantee, which it did
not before — see the gap below.

---

## Gap raised

### `State=Loading` announces nothing — 🔨 Engineer

`Button.md` Finding 2, still open. Loading marks the button natively disabled, so
it leaves the tab order and a keyboard user's focus lands on `<body>`; `aria-busy`
is not a live region, so nothing is announced. The intent now says this plainly as
a limit instead of implying the case is handled. I did not soften it and I did not
touch the component.

Related and explicitly **not fixed here**: `Button.tsx`'s doc comment on `state`
says `Loading` "also announces itself with `aria-busy`". That is a prop doc comment
in 🔨 Engineer's file, and it becomes the reference site's props table verbatim —
so the Code tab currently carries the misleading sentence while the Usage tab
states the limit correctly. Left exactly as found.

---

## Not verified

No NVDA, JAWS or VoiceOver was run. The claim that a Loading button announces
nothing rests on the element being unreachable and `aria-busy` not being a live
region — both deterministic, neither heard.
