import type { HTMLAttributes } from 'react';
import './Eyebrow.css';

/*
 * Eyebrow — Figma node 22:43
 * https://www.figma.com/design/mFnN1Sr8MAmOdmx0ABXPsb/2.-Sunim-Component?node-id=22-43
 *
 * The layer label above a section head. It is what makes the site read as a
 * design file rather than a brochure.
 *
 * `Tone` is the node's one variant property, and its four values mirror it
 * exactly.
 *
 * The other four prop names do NOT come from Figma component properties, and an
 * earlier version of this comment said they did. The node exposes one axis;
 * `Mark`, `Title` and `Label` are text *layer* names inside it, and no `Show
 * Label` property exists anywhere on the set. The names are still right — they
 * are what the design calls those pieces — but the provenance was wrong, and it
 * was being used below to settle a question it cannot settle.
 *
 * The mark is a typographic glyph, not an icon. The node carries it as a text
 * layer (`22:24`, alongside the Title and Label text layers) and the design
 * file's rules page names it as the system's one exception: "The eyebrow mark
 * is the exception. It is a typographic glyph from the export, not an icon,
 * and stays as text." Chip composes Icon Slot because Chip's mark genuinely is
 * an Icon Slot instance; Eyebrow's is not, so Icon Slot is not imported here.
 * The node and the documentation agree on this.
 *
 * There is no State property in the set. An Eyebrow is a label, not a control,
 * so it has no hover, focus, pressed, disabled or loading appearance and none
 * is invented here.
 */

export type EyebrowTone = 'Agentic' | 'Sky' | 'Ink' | 'Gold';

export interface EyebrowProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'title'> {
  /*
   * `title` is omitted from the inherited HTML attributes on purpose, and the
   * reason is worth stating correctly because it was stated wrongly before.
   *
   * It is NOT that Figma defines a `Title` component property — it does not.
   * The real reason stands on its own: the loud half of an eyebrow is its
   * title, that is what the design calls it, and React's native `title` is the
   * browser tooltip. One name cannot be both. Dropping the tooltip costs
   * nothing here; renaming the prop would cost the word the design uses.
   *
   * Un-shadowing it after 0.1.0 is a minor bump. Anyone weighing that should
   * weigh it against this reason, not against the constraint that used to be
   * written here.
   */
  /**
   * What the eyebrow is marking.
   *
   * `Agentic` marks an AI moment. `Sky` is the default. `Ink` is for quiet
   * sections. `Gold` is for anything earned or paid.
   *
   * Note the default is deliberately **not** the node's first variant, which is
   * `Agentic`. The prose and the code disagreed here for long enough to be
   * published, and the owner ruled the prose right: an eyebrow appearing with no
   * tone set should be the ordinary one, not the AI-moment one. Recorded in
   * `decisions.md`; a test asserts it, so changing it back is a deliberate act
   * rather than a one-word edit.
   */
  tone?: EyebrowTone;
  /**
   * The typographic glyph in front of the title.
   *
   * A character, not an icon — the design file asks for the diamond, square or
   * sun glyph from the export (`◇`, `◻`, `☀`) and asks specifically that an
   * icon component is not swapped in. It takes the tone's colour along with
   * the title.
   */
  mark?: string;
  /** The loud half. Short — it is a layer label, not a heading. */
  title?: string;
  /**
   * The quiet half, sitting to the right at one weight down and off the tone.
   * Keep it short, the way a layer name sits next to a layer.
   */
  label?: string;
  /** Show the label. Turn it off for a mark and title alone. */
  showLabel?: boolean;
}

export function Eyebrow({
  tone = 'Sky',
  mark = '◇',
  title = 'Components',
  label = '/ Card',
  showLabel = true,
  className,
  ...rest
}: EyebrowProps) {
  const classes = ['sunim-Eyebrow', `sunim-Eyebrow--${tone}`, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <span {...rest} className={classes}>
      {/*
       * The glyph is decorative — the title beside it carries the meaning — so
       * it is hidden from assistive technology rather than read out as a
       * character name.
       */}
      <span className="sunim-Eyebrow__mark" aria-hidden="true">
        {mark}
      </span>
      <span className="sunim-Eyebrow__title">{title}</span>
      {showLabel && <span className="sunim-Eyebrow__label">{label}</span>}
    </span>
  );
}
