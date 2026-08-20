import { useId, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { IconSlot } from '../IconSlot/IconSlot';
import './Button.css';

/*
 * Button — Figma node 19:231
 * https://www.figma.com/design/mFnN1Sr8MAmOdmx0ABXPsb/2.-Sunim-.-Web-.-Component-.-V1.0-.-Beta?node-id=19-231
 *
 * Prop names and values mirror the Figma properties exactly: Variant, Size and
 * State are the three variant properties; Label, Show Trailing and Icon are the
 * component properties.
 */

export type ButtonVariant = 'Primary' | 'Secondary' | 'Ghost';
export type ButtonSize = 'Md' | 'Lg';
export type ButtonState = 'Default' | 'Hover' | 'Focus' | 'Disabled' | 'Loading';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Which role this action plays. One Primary per view. */
  variant?: ButtonVariant;
  /** Control height and type size. */
  size?: ButtonSize;
  /**
   * The interaction state.
   *
   * `Default` leaves hover and focus to the browser, so a real pointer or
   * keyboard drives them. `Hover` and `Focus` pin that appearance on, which is
   * what the stories use to show a state that cannot be screenshotted
   * otherwise. `Disabled` and `Loading` are behavioural: both mark the button
   * non-interactive, and `Loading` also announces itself with `aria-busy`.
   */
  state?: ButtonState;
  /** The text of the action. */
  label: string;
  /** Show the trailing slot — the arrow, or the spinner while loading. */
  showTrailing?: boolean;
  /** Replace the default arrow with an icon from Sunim Icon. */
  icon?: ReactNode;
}

/*
 * The trailing arrow is Icon Slot at Size=16 — the same component Chip uses,
 * not a second copy of the same vector. Button drew it privately only because
 * Icon Slot did not exist yet; the private `Arrow()` this replaced was that
 * component's Size=16 glyph byte for byte, down to the translate and the 3.2
 * stroke, so consuming it is a substitution rather than a redraw.
 *
 * Colour still comes from Button. Icon Slot resolves its own colour through
 * `--sunim-IconSlot-color`, which Button.css sets to `currentColor`, so the
 * per-variant `color` rules keep driving the arrow exactly as they did when the
 * vector was inlined here — white on Primary, accent ink on Secondary and
 * Ghost. That override is the one Icon Slot documents, used as documented.
 *
 * The spinner stays inlined. It is not an Icon Slot: it has no Size=14 variant
 * in that set, it is a 14x14 filled-and-masked vector rather than a stroked
 * glyph, and it carries an animation Icon Slot knows nothing about.
 *
 * Its geometry is not hand-drawn — the path was diffed against the asset Figma
 * exports for the node and matches exactly, including stroke width and mask.
 */

function Spinner() {
  const maskId = useId();
  const clipId = useId();
  const d =
    'M12.7773 10.9525C11.8964 12.2401 10.6106 13.1966 9.12405 13.67C7.63748 14.1434 6.03537 14.1066 4.57209 13.5655C3.10882 13.0243 1.86825 12.0099 1.04735 10.6832C0.226458 9.35651 -0.127706 7.7936 0.0410923 6.24263C0.20989 4.69167 0.891975 3.24154 1.97905 2.1225C3.06612 1.00345 4.49588 0.279631 6.0413 0.0659611C7.58672 -0.147709 9.15924 0.161017 10.5092 0.943122C11.8591 1.72523 12.9091 2.93588 13.4923 4.38286L7 7L12.7773 10.9525Z';

  return (
    <svg
      className="sunim-Button__spinner"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <g clipPath={`url(#${clipId})`}>
        <mask id={maskId} fill="white">
          <path d={d} />
        </mask>
        <path
          d={d}
          stroke="currentColor"
          strokeWidth="4"
          mask={`url(#${maskId})`}
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="14" height="14" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function Button({
  variant = 'Primary',
  size = 'Md',
  state = 'Default',
  label,
  showTrailing = true,
  icon,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isLoading = state === 'Loading';
  const isDisabled = state === 'Disabled';

  const classes = [
    'sunim-Button',
    `sunim-Button--${variant}`,
    `sunim-Button--${size}`,
    state === 'Hover' ? 'is-hover' : '',
    state === 'Focus' ? 'is-focus' : '',
    isLoading ? 'is-loading' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...rest}
      type={type}
      className={classes}
      disabled={isDisabled || isLoading}
      aria-busy={isLoading || undefined}
    >
      <span className="sunim-Button__label">{label}</span>
      {showTrailing && (
        <span className="sunim-Button__trailing">
          {isLoading ? <Spinner /> : (icon ?? <IconSlot size="16" />)}
        </span>
      )}
    </button>
  );
}
