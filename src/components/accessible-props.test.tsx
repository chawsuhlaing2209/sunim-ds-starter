import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { Button } from './Button/Button';
import { Chip } from './Chip/Chip';
import { Eyebrow } from './Eyebrow/Eyebrow';
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
 * It covered half the class on its first pass. Two reviews caught that: the file
 * claimed to close the whole thing while importing Button and IconSlot only, so
 * Chip and Eyebrow stayed exactly as unprotected as everything had been before
 * it existed — and Eyebrow's blocking finding is a wrong default that no test
 * would catch. All four are here now, and the passthrough loop runs over all
 * four rather than over the two that happened to be broken.
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

  it('has no second spelling to get wrong', () => {
    // `label` was dropped by ruling: it meant an invisible accessible name here
    // and visible required text on the other three, and Button carries both
    // meanings four lines apart. `aria-label` is inherited, so removing it made
    // the surface smaller rather than moving the problem. See decisions.md.
    // @ts-expect-error `label` is not part of IconSlotProps.
    const tag = open(renderToStaticMarkup(<IconSlot size="16" label="Next" />));
    // It survives the spread as an unknown attribute and names nothing, which
    // is a visible failure rather than a silent one.
    expect(tag).not.toContain('aria-label');
    expect(tag).toContain('aria-hidden="true"');
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
   * The general form of both defects, across every component on the surface.
   * Every attribute below is reachable through `HTMLAttributes`, which all four
   * extend, so each one type-checks — and each one has to survive the spread
   * rather than being quietly dropped.
   *
   * Eyebrow omits `title` from its inherited attributes on purpose, because the
   * Figma property is called Title and the prop has to carry that name; it is
   * skipped rather than expected to pass, which is the difference between a
   * documented exception and a hole.
   */
  const components = {
    Button: (props: Record<string, unknown>) => <Button label="Apply" {...props} />,
    Chip: (props: Record<string, unknown>) => <Chip label="Reviewed" {...props} />,
    Eyebrow: (props: Record<string, unknown>) => <Eyebrow title="Components" {...props} />,
    IconSlot: (props: Record<string, unknown>) => <IconSlot size="16" {...props} />,
  };

  const passthrough = [
    ['id', 'apply'],
    ['title', 'Apply now'],
    ['data-testid', 'cta'],
    ['aria-describedby', 'hint'],
  ] as const;

  for (const [name, render] of Object.entries(components)) {
    for (const [attr, value] of passthrough) {
      if (name === 'Eyebrow' && attr === 'title') continue;
      it(`${name} passes ${attr} through`, () => {
        expect(open(renderToStaticMarkup(render({ [attr]: value }))))
          .toContain(`${attr}="${value}"`);
      });
    }
  }
});

/*
 * The defaults, asserted.
 *
 * Eyebrow's blocking release finding is that its prop doc says one default and
 * its code has another — the documentation and the component disagreed for long
 * enough to be published, and nothing anywhere would have noticed. These do not
 * decide which is right; they make the code's answer explicit, so that changing
 * it is a deliberate act with a failing test attached rather than a one-word
 * edit nobody sees.
 */
describe('the defaults a component ships with', () => {
  it('Button is Primary, Md, and type=button', () => {
    const tag = open(renderToStaticMarkup(<Button label="Apply" />));
    expect(tag).toContain('sunim-Button--Primary');
    expect(tag).toContain('sunim-Button--Md');
    // Not `submit` — a Button dropped into a form would otherwise submit it.
    expect(tag).toContain('type="button"');
  });

  it('Chip is Default and Sm', () => {
    const tag = open(renderToStaticMarkup(<Chip label="Reviewed" />));
    expect(tag).toContain('sunim-Chip--Default');
    expect(tag).toContain('sunim-Chip--Sm');
  });

  it('Eyebrow is Sky', () => {
    // Ruled by the owner, against the Figma node's first variant. An eyebrow
    // with no tone set is the ordinary one, not the AI-moment one. See
    // decisions.md — this test is what makes reverting it deliberate.
    expect(open(renderToStaticMarkup(<Eyebrow title="Components" />)))
      .toContain('sunim-Eyebrow--Sky');
  });

  it('IconSlot is 14', () => {
    expect(open(renderToStaticMarkup(<IconSlot />))).toContain('sunim-IconSlot--14');
  });
});
