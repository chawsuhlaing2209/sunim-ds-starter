import type { InputHTMLAttributes } from 'react';
import './InputControl.css';

/*
 * Input Control — Figma node 31:41
 * https://www.figma.com/design/mFnN1Sr8MAmOdmx0ABXPsb/2.-Sunim-Component?node-id=31-41
 *
 * The input box on its own, as the node's own description states it: "The input
 * box on its own. 1.5px border, 11px radius, 11 by 13 padding... Error is gold,
 * not red: this system has no alarm colour. Wrap it in Field for a label, hint
 * and message."
 *
 * The prop name matches the Figma property exactly. `State` is the only variant
 * property in the set, and its five values are Default, Filled, Focus, Error
 * and Disabled — the same capitalised strings the node uses, following the
 * convention Button and Chip already set.
 *
 * There is no Size property, so there is no size prop. Nothing has been
 * invented to fill the axis the set does not define.
 *
 * The element is a real `<input>` rather than a styled `<div>`. Every remaining
 * prop is a plain input attribute — `placeholder`, `value`, `defaultValue`,
 * `onChange`, `type`, `name`, `id` — passed straight through, so the thing
 * behaves like the form control it draws.
 */

export type InputControlState =
  | 'Default'
  | 'Filled'
  | 'Focus'
  | 'Error'
  | 'Disabled';

/*
 * `size` is omitted from the inherited attributes, and the omission is the API
 * decision.
 *
 * HTML's `size` on an input is a width in characters. In this library `size` is
 * the design axis — Button has Md and Lg, Chip has Sm and Md, Icon Slot has 14,
 * 16 and 22 — so `<InputControl size={40} />` would type-check and mean
 * something entirely unlike what the same word means three components over.
 * This set defines no Size property, so rather than let one word carry two
 * meanings, the attribute is off the type. Width comes from the container, as
 * the CSS explains; a consumer who genuinely wants the character-count
 * attribute can still set it through a ref, and should say why.
 */
export interface InputControlProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * The interaction state, exactly as the Figma set names it.
   *
   * Two of the five are the natural rendering of a real input rather than a
   * class: `Default` is the empty box showing its placeholder, and `Filled` is
   * the same box with a value in it. The node draws them as separate variants
   * because Figma has no other way to show text present versus absent; here the
   * difference is the value, and the placeholder colour follows from
   * `::placeholder`. Setting `state="Filled"` on an empty input therefore looks
   * like `Default`, which is the truth rather than a defect.
   *
   * The other three do something. `Focus` pins the focus appearance on, which
   * is what the stories use to show a state that cannot be screenshotted
   * otherwise — a real pointer or keyboard still drives `:focus-visible`
   * independently. `Error` draws the gold stroke and sets `aria-invalid`.
   * `Disabled` sets the `disabled` attribute, so it is unfocusable and
   * unreachable by keyboard, not merely faded.
   *
   * What `Error` does **not** do is say what is wrong. `aria-invalid` announces
   * that a field is invalid and nothing more; the message that explains it
   * belongs beside the input, wired with `aria-describedby`, and that is Field's
   * job rather than this component's.
   */
  state?: InputControlState;
}

export function InputControl({
  state = 'Default',
  className,
  /*
   * Pulled out of `...rest` for the reason Button documents at the same spot:
   * both are on the public type, both are the ordinary React idiom, and a bare
   * `{...rest}` spread followed by the component setting the same attribute
   * discards the caller's value silently, with no type error and no visible
   * difference.
   *
   * Each has two sources of truth, and they are OR-ed rather than overridden.
   * `state` is the Figma variant axis; the attribute is the consumer's runtime
   * condition. `disabled={isSubmitting}` and `state="Disabled"` both mean the
   * field is unavailable, and neither gets to cancel the other. Likewise a
   * caller who has already worked out `aria-invalid` from their own validation
   * keeps it when the variant is not `Error`.
   */
  disabled: disabledProp,
  'aria-invalid': ariaInvalidProp,
  ...rest
}: InputControlProps) {
  const isError = state === 'Error';
  const isDisabled = state === 'Disabled';

  const classes = [
    'sunim-InputControl',
    state === 'Focus' ? 'is-focus' : '',
    isError ? 'is-error' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <input
      {...rest}
      className={classes}
      disabled={disabledProp || isDisabled}
      aria-invalid={ariaInvalidProp ?? (isError || undefined)}
    />
  );
}
