import type { HTMLAttributes, ReactNode } from 'react';
import { IconSlot } from '../IconSlot/IconSlot';
import './Chip.css';

/*
 * Chip — Figma node 21:79
 * https://www.figma.com/design/mFnN1Sr8MAmOdmx0ABXPsb/2.-Sunim-Component?node-id=21-79
 *
 * A status tag or a credential. Sm is the status tag; Md reads as a credential
 * — larger type and a thicker stroke.
 *
 * Prop names and values mirror the Figma properties exactly — with one ruled
 * exception. Tone and Size are the two variant properties; Label, Show Icon and
 * Icon are the component properties.
 *
 * The exception is `Quiet`, which the node calls `Figma`. A public type union
 * naming the design tool tells a consumer neither what the tone means nor what
 * it looks like, and `Quiet` is the word the node's own description uses. Ruled
 * before anything was published, so it cost no migration; recorded in
 * `decisions.md` so the next review records it rather than re-raising it. There is no State property in the set, and none is invented here
 * — a Chip carries information, it does not respond to a pointer.
 *
 * The mark is an Icon Slot instance on the node (the inner vector reports as
 * `I21:40;9:16` — Icon Slot's own geometry), so this imports the built
 * component rather than redrawing it. Size 14 on both Sm and Md: the node's
 * icon frame is 14x14 on all eight variants.
 */

export type ChipTone = 'Default' | 'Gold' | 'Agentic' | 'Quiet';
export type ChipSize = 'Sm' | 'Md';

export interface ChipProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * What the chip is saying.
   *
   * `Default` is the everyday status tag. `Gold` marks something earned or
   * paid. `Agentic` marks an AI moment and is reserved for those — the design
   * file asks for it to stay rare on any one screen. `Quiet` keeps the pill
   * quiet and lets the mark carry the colour — the node calls this tone
   * `Figma`, which named the tool rather than the meaning.
   */
  tone?: ChipTone;
  /**
   * `Sm` is the status tag. `Md` reads as a credential: larger type, more
   * padding, a thicker stroke.
   */
  size?: ChipSize;
  /** The text of the chip. */
  label: string;
  /** Show the mark. Turn it off for a text-only pill. */
  showIcon?: boolean;
  /**
   * Replace the Icon Slot placeholder with a real icon from Sunim Icon.
   *
   * Passed straight through to Icon Slot, which stretches it to the 14px slot.
   * It should be a square `<svg>` drawing itself with `currentColor` so it
   * picks up the tone's colour like the placeholder does.
   */
  icon?: ReactNode;
}

export function Chip({
  tone = 'Default',
  size = 'Sm',
  label,
  showIcon = true,
  icon,
  className,
  ...rest
}: ChipProps) {
  const classes = [
    'sunim-Chip',
    `sunim-Chip--${tone}`,
    `sunim-Chip--${size}`,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span {...rest} className={classes}>
      {showIcon && <IconSlot size="14" icon={icon} />}
      <span className="sunim-Chip__label">{label}</span>
    </span>
  );
}
