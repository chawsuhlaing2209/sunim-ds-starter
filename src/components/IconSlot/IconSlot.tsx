import type { HTMLAttributes, ReactNode } from 'react';
import './IconSlot.css';

/*
 * Icon Slot — Figma node 9:24
 * https://www.figma.com/design/mFnN1Sr8MAmOdmx0ABXPsb/2.-Sunim-Component?node-id=9-24
 *
 * A placeholder, not an icon. Its whole job is to be swapped, so the `icon`
 * prop is the primary affordance and the arrow it ships with is scaffolding.
 * The real icons live in the separate Sunim Icon file.
 *
 * The prop name matches the Figma property exactly: `Size` is the only variant
 * property in the set, and its values are the literal strings 14, 16 and 22.
 * `icon` follows the convention Button already set — a ReactNode that replaces
 * the default arrow — so the two components agree rather than inventing a
 * second way to hand an icon in.
 *
 * Everything else it accepts is a plain HTML attribute. Name the slot with
 * `aria-label` when the icon is the only thing carrying the meaning; leave it
 * off and the slot is decorative and hidden, which is how Button and Chip use
 * it.
 */

export type IconSlotSize = '14' | '16' | '22';

export interface IconSlotProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * The slot's edge length. 14 for UI text, 16 for buttons and chips, 22 for
   * icon tiles — the three the Figma set defines, and nothing else.
   */
  size?: IconSlotSize;
  /**
   * The real icon, from Sunim Icon. This is what the component is for: the
   * arrow is a placeholder and every production use should replace it.
   *
   * Whatever is passed is stretched to fill the slot, so it should be a square
   * `<svg>` drawing itself with `currentColor`.
   */
  icon?: ReactNode;
}

/*
 * There is no `label` prop, and its absence is the API decision.
 *
 * There used to be one, meaning the icon's accessible name — the exact opposite
 * of `label` on Button, Chip and Eyebrow, where it is visible required text.
 * One word meaning two things, four lines apart inside Button, which composes
 * this. It was invented here to collide: the node exposes only `Size`.
 *
 * Name the slot with the standard attribute instead:
 *
 *   <IconSlot aria-label="Next" />   announced, role="img"
 *   <IconSlot />                     decorative, aria-hidden
 *
 * `aria-label` is inherited from `HTMLAttributes`, so nothing had to be added to
 * replace it — dropping `label` made the surface smaller rather than moving the
 * problem. Ruled before publication, so it cost no migration. See decisions.md.
 */

/*
 * The placeholder arrow, per size.
 *
 * Inlined rather than rendered from the exported asset for the reason the Figma
 * description gives: "The stroke is bound to text/body, so override the colour
 * on the instance when it sits on a dark or accent surface." An <img> cannot
 * inherit `currentColor`, so an exported asset would bake #22344E in and make
 * the documented override impossible. Button inlines its arrow for the same
 * reason — and that arrow is this component at Size=16, byte for byte.
 *
 * The geometry is transcribed, not drawn. Each `d` is copied verbatim from the
 * SVG Figma exports for that variant, and each `translate` is the vector's node
 * offset inside its frame, derived from the frame size and the path's own
 * bounding box: (size - bbox) / 2 - 1.6, where 1.6 is the half stroke the
 * export's viewBox carries as padding.
 *
 * Note the stroke width is a constant 3.2 at all three sizes while the arrow
 * geometry scales with the frame — so the strokes get optically heavier as the
 * slot gets smaller. That is what the node does, so it is what this does; it is
 * three transcribed vectors rather than one scaled vector for exactly that
 * reason.
 */
const GLYPH: Record<IconSlotSize, { offset: string; d: string }> = {
  '14': {
    offset: '2.48334 3.35834',
    d: 'M1.6 3.64167H7.43333M5.39167 5.68333L7.43333 3.64167L5.39167 1.6',
  },
  '16': {
    offset: '3.06667 4.06667',
    d: 'M1.6 3.93333H8.26667M5.93333 6.26667L8.26667 3.93333L5.93333 1.6',
  },
  '22': {
    offset: '4.81667 6.19167',
    d: 'M1.6 4.80833H10.7667M7.55833 8.01667L10.7667 4.80833L7.55833 1.6',
  },
};

function PlaceholderArrow({ size }: { size: IconSlotSize }) {
  const { offset, d } = GLYPH[size];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden="true">
      <g transform={`translate(${offset})`}>
        <path
          d={d}
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function IconSlot({
  size = '14',
  icon,
  className,
  /*
   * Pulled out of `...rest` deliberately.
   *
   * All three are on the public type, and all three used to be discarded: the
   * spread ran first, then the component's own assignment overwrote the
   * consumer's value with `undefined` and `aria-hidden` stayed `true`. So an
   * icon somebody had explicitly named was hidden from assistive technology —
   * no type error, no visual difference, and nothing in the DOM to suggest
   * anything was wrong.
   *
   * `aria-label` is now the only way to name the slot. `role` and `aria-hidden`
   * stay overridable, because a consumer who sets them has a reason this
   * component cannot see.
   */
  'aria-label': ariaLabelProp,
  'aria-hidden': ariaHiddenProp,
  role: roleProp,
  ...rest
}: IconSlotProps) {
  const name = ariaLabelProp;

  const classes = ['sunim-IconSlot', `sunim-IconSlot--${size}`, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <span
      {...rest}
      className={classes}
      role={roleProp ?? (name ? 'img' : undefined)}
      aria-label={name}
      aria-hidden={ariaHiddenProp ?? (name ? undefined : true)}
    >
      <span className="sunim-IconSlot__glyph">
        {icon ?? <PlaceholderArrow size={size} />}
      </span>
    </span>
  );
}
