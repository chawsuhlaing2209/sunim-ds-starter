import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { Button } from './Button/Button';
import { IconSlot } from './IconSlot/IconSlot';

/*
 * The props a consumer reaches for, and the component honouring them.
 *
 * Two release reviews found the same defect in two components: a prop that is on
 * the public type, type-checks at the call site, and is silently discarded
 * because `{...rest}` spread before the component set the same attribute itself.
 * Neither produced a type error. Neither produced a visual difference. One of
 * them kept a form submitting; the other hid a labelled icon from screen
 * readers.
 *
 * Both would have been caught by one render assertion, and neither was, because
 * until this file the only test in the repository was `token-binding.test.ts`
 * and nothing rendered a component at all. That is the gap this closes — not
 * these two lines specifically, but the whole class: **the attributes we
 * advertise on the public type are the attributes that come out.**
 *
 * `renderToStaticMarkup` rather than a DOM testing library on purpose. The
 * question here is what HTML the component produces, which is exactly what it
 * answers, and it needs no jsdom and no new dependency.
 */

/** The opening tag, which is where every attribute in question lives. */
const open = (markup: string) => markup.slice(0, markup.indexOf('>') + 1);

describe('Button · disabled and aria-busy are the consumer\'s to set', () => {
  it('honours disabled from the caller', () => {
    // `disabled={isSubmitting}` is the commonest React button idiom there is.
    // Before the fix this rendered a fully live button.
    expect(open(renderToStaticMarkup(<Button label="Submit" disabled />)))
      .toContain('disabled=""');
  });

  it('still disables from State=Disabled', () => {
    expect(open(renderToStaticMarkup(<Button label="Submit" state="Disabled" />)))
      .toContain('disabled=""');
  });

  it('disables while loading, and says so', () => {
    const tag = open(renderToStaticMarkup(<Button label="Submit" state="Loading" />));
    expect(tag).toContain('disabled=""');
    expect(tag).toContain('aria-busy="true"');
  });

  it('neither one cancels the other', () => {
    // A caller passing disabled={false} must not re-enable a Loading button.
    expect(open(renderToStaticMarkup(<Button label="Submit" state="Loading" disabled={false} />)))
      .toContain('disabled=""');
  });

  it('honours aria-busy from the caller', () => {
    expect(open(renderToStaticMarkup(<Button label="Submit" aria-busy />)))
      .toContain('aria-busy="true"');
  });

  it('is live by default', () => {
    const tag = open(renderToStaticMarkup(<Button label="Submit" />));
    expect(tag).not.toContain('disabled');
    expect(tag).not.toContain('aria-busy');
  });
});

describe('IconSlot · a named icon is never hidden', () => {
  it('honours aria-label from the caller', () => {
    // Before the fix this rendered aria-hidden="true" with no accessible name:
    // an icon the consumer had explicitly named, invisible to assistive tech.
    const tag = open(renderToStaticMarkup(<IconSlot size="16" aria-label="Next" />));
    expect(tag).toContain('aria-label="Next"');
    expect(tag).toContain('role="img"');
    expect(tag).not.toContain('aria-hidden');
  });

  it('names the slot from the label prop too', () => {
    const tag = open(renderToStaticMarkup(<IconSlot size="16" label="Next" />));
    expect(tag).toContain('aria-label="Next"');
    expect(tag).toContain('role="img"');
    expect(tag).not.toContain('aria-hidden');
  });

  it('hides itself when nothing names it', () => {
    // The decorative case, which is how Button and Chip use it — the label
    // beside it already carries the meaning.
    const tag = open(renderToStaticMarkup(<IconSlot size="16" />));
    expect(tag).toContain('aria-hidden="true"');
    expect(tag).not.toContain('role=');
  });

  it('lets a caller override aria-hidden deliberately', () => {
    expect(open(renderToStaticMarkup(<IconSlot size="16" aria-hidden={false} />)))
      .toContain('aria-hidden="false"');
  });
});

describe('the public type and the rendered attributes agree', () => {
  /*
   * The general form of both defects. Every attribute below is reachable through
   * `HTMLAttributes`, which both components extend, so each one type-checks — and
   * each one has to survive the spread rather than being quietly dropped.
   */
  const passthrough = [
    ['id', 'apply'],
    ['title', 'Apply now'],
    ['data-testid', 'cta'],
    ['aria-describedby', 'hint'],
  ] as const;

  for (const [attr, value] of passthrough) {
    it(`Button passes ${attr} through`, () => {
      const tag = open(renderToStaticMarkup(<Button label="Apply" {...{ [attr]: value }} />));
      expect(tag).toContain(`${attr}="${value}"`);
    });

    it(`IconSlot passes ${attr} through`, () => {
      const tag = open(renderToStaticMarkup(<IconSlot size="16" {...{ [attr]: value }} />));
      expect(tag).toContain(`${attr}="${value}"`);
    });
  }
});
