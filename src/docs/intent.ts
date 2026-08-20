import type { ComponentIntent } from '../intent';

/*
 * Renders a component's intent as the markdown block that sits under its
 * description on its Storybook docs page.
 *
 * One renderer, imported by every component, for the reason every other shared
 * thing in this repo is shared: four hand-written intent tables drift, and the
 * fourth one is always the one nobody updates. It also means a change to what an
 * intent *shows* is one edit rather than one per component.
 *
 * The intent JSON is the source. This function never adds a field, softens a
 * sentence, or fills a gap — if something reads badly here, it reads badly in
 * the file, which is where 📝 Doc Generator fixes it.
 */
export function intentDoc(intent: ComponentIntent): string {
  const tokens = intent.required_tokens.map((t) => `\`${t}\``).join(', ');

  return `### Intent

|  |  |
|---|---|
| **Use when** | ${intent.use_when} |
| **Don't use when** | ${intent.dont_use_when} |
| **Placement** | ${intent.placement} |
| **Required tokens** | ${tokens} |
| **Accessibility** | ${intent.a11y} |

\`${intent.component}\` entered the public surface in **${intent.since}** and is
**${intent.status}**. \`VERSIONING.md\` says what that promises — and, for a 0.x
version, what it deliberately does not.`;
}

const STATUSES = ['experimental', 'settling', 'stable'] as const;

/**
 * Narrows a JSON-imported intent to `ComponentIntent`.
 *
 * TypeScript widens `status` to `string` when it reads a `.json` file, so a
 * plain import does not satisfy the union. This is the one place that narrows
 * it, and it checks rather than asserts: a typo in `status` throws while
 * Storybook is starting instead of rendering an intent block with a blank
 * stability claim, which is the failure that would go unnoticed.
 *
 * It deliberately checks only what the type system cannot. The rest — required
 * keys, empty strings, tokens that do not resolve — belongs to the release gate
 * in `scripts/release-review.mjs`, and duplicating it here would give two
 * answers to maintain.
 */
export function asIntent(raw: unknown): ComponentIntent {
  const intent = raw as ComponentIntent;
  if (!STATUSES.includes(intent.status)) {
    throw new Error(
      `${intent.component ?? 'intent'}: status is "${intent.status}", expected one of ${STATUSES.join(', ')}`,
    );
  }
  return intent;
}
