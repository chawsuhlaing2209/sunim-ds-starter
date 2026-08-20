/*
 * A component's intent — what it is for, and what it is not for.
 *
 * Props document *how* to call a component. None of them say when you should,
 * or when you should reach for something else, and that is the question a
 * consumer actually has in front of them. An undocumented intent is how a
 * Button ends up used as a link on three pages before anyone notices.
 *
 * 📝 Doc Generator owns these files. 🧭 Reviewer's gate 6 reads them, so every
 * field here is written to be checkable: no placeholders, no "TBD", and tokens
 * named exactly as they are in the build.
 */

export interface ComponentIntent {
  /**
   * The component's name — identical to the folder, the exported symbol, and
   * the registry row. Three names for one thing is how a rename half-lands.
   */
  component: string;

  /**
   * The version whose public surface first included this component, as it will
   * read in `package.json`. `VERSIONING.md` says what that promises.
   */
  since: string;

  /**
   * How much of this is likely to survive the next minor.
   *
   * `experimental` — expect it to change; do not build on the details.
   * `settling`     — the shape looks right, the names may still move.
   * `stable`       — changing it is a breaking change, and gets treated as one.
   *
   * Nothing can be `stable` before 1.0.0 in the semver sense — 0.x makes no
   * compatibility promise at all. This field is the team's *intent* to keep it,
   * which is a weaker and more honest thing.
   */
  status: 'experimental' | 'settling' | 'stable';

  /** The job this component exists to do. One sentence, concrete. */
  use_when: string;

  /**
   * The cases that look like this component's job and are not, each with the
   * thing to reach for instead. A `dont_use_when` with no alternative in it
   * tells a consumer they are wrong without telling them what to do.
   */
  dont_use_when: string;

  /** Where it appears in a layout — the containers it belongs inside. */
  placement: string;

  /**
   * The semantic tokens this component cannot render without, in dot notation
   * (`color.accent.ink`), matching the token names in `CLAUDE.md`.
   *
   * Literal names only. A placeholder like `color.bg.{intent}` reads well and
   * checks nothing — the reviewer resolves each entry to its CSS custom
   * property and confirms the component actually references it, and a brace
   * cannot be resolved. List every variant's token instead of templating them.
   */
  required_tokens: string[];

  /**
   * What this component guarantees to assistive technology and to a keyboard,
   * stated as commitments a test could fail: target size, focus visibility,
   * what is announced, what is hidden.
   */
  a11y: string;
}
