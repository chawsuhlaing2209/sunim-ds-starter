import type { HTMLAttributes, ReactNode } from 'react';
import { Button, type ButtonProps } from '../Button/Button';
import './Nav.css';

/*
 * Nav — Figma node 49:31
 * https://www.figma.com/design/mFnN1Sr8MAmOdmx0ABXPsb/2.-Sunim-Component?node-id=49-31
 *
 * The site bar, as the node's own description states it: "A floating pill, not
 * a full-width bar. Condensed is what it becomes after the page scrolls. The
 * current section is the only link in accent ink."
 *
 * The prop name matches the Figma property exactly. `State` is the only variant
 * property in the set, and its two values are Default and Condensed — the same
 * capitalised strings the node uses, following the convention Button, Chip and
 * Input Control already set.
 *
 * There is no Size and no Variant property, so there is no size or variant
 * prop. Nothing has been invented to fill an axis the set does not define.
 *
 * COMPOSES BUTTON. The CTA is not a pill this component draws — node 49:11 is
 * an *instance* of Button (19:231) at Variant=Primary, Size=Md, Label="Apply",
 * with the trailing arrow shown, and it is 99x37, which is exactly what Button
 * Md renders. So Button is imported and rendered, not copied: the padding
 * (`step-10` / `step-18`), the `shadow/button` effect, the pill radius and the
 * arrow all stay owned by the one component that already owns them, and a
 * repair to Button repairs this bar too. Recorded in the registry's `Composes`.
 */

export type NavState = 'Default' | 'Condensed';

/**
 * One entry in the Links frame.
 *
 * `href` is required. The node draws four Link text nodes inside a frame called
 * Links, and a navigation entry that goes nowhere is not a link — it is text
 * that looks like one, unfocusable by keyboard and unannounced by a screen
 * reader. If a destination genuinely is not known yet, that is a gap to raise
 * rather than an anchor to leave empty.
 */
export interface NavLink {
  /** The visible text of the entry. */
  label: ReactNode;
  /** Where the entry goes. */
  href: string;
  /**
   * Marks this entry as the section the reader is in.
   *
   * The node's description is explicit that the current section is the *only*
   * link in accent ink, so at most one entry should carry this. Nothing here
   * enforces that — this component is given its links, it does not derive them
   * — so passing two produces two accent links, which is the caller's bug
   * rendered honestly rather than one silently swallowed.
   *
   * It sets `aria-current="page"`, which is what carries the same fact to a
   * screen reader. The colour and the attribute are the same thing said twice
   * on purpose: colour alone is not a state anyone can hear.
   */
  isCurrent?: boolean;
}

export interface NavProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /**
   * Which of the two states the bar is in, exactly as the Figma set names it.
   *
   * `Default` is the resting bar. `Condensed` is, in the node's words, "what it
   * becomes after the page scrolls" — the same content packed tighter, with the
   * gap between links dropping from `space-6` to `space-4`.
   *
   * What this prop does **not** do is watch the page. Nothing here listens to a
   * scroll position, because a component that decided its own state would fight
   * every page that wanted to decide it differently. The page swaps the value;
   * the bar draws it.
   */
  state?: NavState;
  /**
   * The brand mark at the left of the bar — "tps" on the node.
   *
   * A `ReactNode` rather than a string so a real logo can be passed, and the
   * `Heading/Subtitle` type and `text-heading` colour sit on the container so
   * text gets them and an SVG is left alone.
   *
   * It is not a link. The node draws a text layer named Wordmark with no
   * destination on it, and a brand mark that routes home is a decision the
   * design has not made yet, so it is not made here. Raised in the report.
   */
  wordmark: ReactNode;
  /** The entries in the Links frame, in the order they should read. */
  links: NavLink[];
  /**
   * The CTA at the right of the bar.
   *
   * `Variant` and `Size` are omitted because the node pins them: the instance
   * is Primary at Md, and a Nav whose CTA could be a Ghost would not be this
   * node any more. Everything else Button accepts is the caller's — the label,
   * `onClick`, `state` for the loading and disabled cases, an `icon` in place
   * of the arrow.
   */
  cta: Omit<ButtonProps, 'variant' | 'size'>;
}

export function Nav({
  state = 'Default',
  wordmark,
  links,
  cta,
  className,
  /*
   * Pulled out of `...rest` and defaulted, for the reason a landmark needs a
   * name: a page usually has more than one `<nav>` — the bar, the footer, a
   * table of contents — and a screen reader's landmark list renders them as
   * three identical entries called "navigation" unless each says which it is.
   *
   * The default is the accessible name, not content: it is never drawn, and a
   * caller with two of these on a page should pass distinct labels rather than
   * accept it twice.
   */
  'aria-label': ariaLabel = 'Primary',
  ...rest
}: NavProps) {
  const classes = ['sunim-Nav', `sunim-Nav--${state}`, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <nav {...rest} className={classes} aria-label={ariaLabel}>
      <span className="sunim-Nav__wordmark">{wordmark}</span>

      {/*
       * A list, not four loose anchors. The Links frame is a set of siblings of
       * equal weight, and a screen reader that announces "list, 4 items" gives
       * a keyboard user the one thing the visual bar gives a sighted one — how
       * much is here before you start moving through it.
       */}
      <ul className="sunim-Nav__links">
        {links.map((link) => (
          <li key={link.href}>
            <a
              className="sunim-Nav__link"
              href={link.href}
              aria-current={link.isCurrent ? 'page' : undefined}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <Button
        {...cta}
        variant="Primary"
        size="Md"
        className={['sunim-Nav__cta', cta.className ?? '']
          .filter(Boolean)
          .join(' ')}
      />
    </nav>
  );
}
