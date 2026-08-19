import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  MODES,
  family,
  modeTokens,
  resolve,
  rootTokens,
  type Mode,
  type Token,
} from './tokens';
import './tokens.css';

/*
 * The token gallery. Read live from build/tokens/css/tokens.css, never from a
 * hand-written list — the file is generated, and a list written here would be
 * wrong the next time anyone rebuilds.
 *
 * Source of truth is Figma. A token that looks wrong is fixed there and
 * re-exported, never edited in build/tokens/.
 */

const meta = {
  title: 'Foundations/Tokens',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `Every token the system defines, read out of the stylesheet at render time.

Switch the **Theme** control in the toolbar to see any story in a different Figma
mode. Only the 61 colour tokens change between modes — spacing, radius, type and
effects are defined once and are the same everywhere.`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared chrome ────────────────────────────────────────────────────────────
// The gallery styles itself with the tokens it documents.

function Section({
  title,
  note,
  count,
  children,
}: {
  title: string;
  note?: ReactNode;
  count?: number;
  children: ReactNode;
}) {
  return (
    <section className="tk">
      <header className="tk__head">
        <h2 className="tk__title">
          {title}
          {count !== undefined && <span className="tk__count">{count}</span>}
        </h2>
        {note && <p className="tk__note">{note}</p>}
      </header>
      {children}
    </section>
  );
}

/** Shows what a token resolves to in whichever mode is currently applied. */
function Resolved({ name }: { name: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState('');
  useEffect(() => {
    if (ref.current) setValue(resolve(ref.current, name));
  });
  return (
    <span ref={ref} className="tk__value">
      {value}
    </span>
  );
}

function useTokens(): Token[] {
  const [tokens, setTokens] = useState<Token[]>([]);
  useEffect(() => setTokens(rootTokens()), []);
  return tokens;
}

// ── stories ──────────────────────────────────────────────────────────────────

/** Semantic colours — what components are allowed to reference. */
export const Colour: Story = {
  render: () => {
    const tokens = useTokens();
    const colours = family(tokens, '--color-');
    return (
      <Section
        title="Colour"
        count={colours.length}
        note={
          <>
            Semantic colours. These are what a component references — never a{' '}
            <code>--primitives-*</code> name, and never a raw hex. Each row shows the
            primitive it points at and what that resolves to in the current mode.
          </>
        }
      >
        <div className="tk__grid">
          {colours.map((t) => (
            <div key={t.name} className="tk__swatchRow">
              <span className="tk__chip" style={{ background: `var(${t.name})` }} />
              <span className="tk__name">{t.name}</span>
              <span className="tk__ref">{t.refersTo ?? '—'}</span>
              <Resolved name={t.name} />
            </div>
          ))}
        </div>
      </Section>
    );
  },
};

/** The same colours in all seven modes, side by side. */
export const EveryMode: Story = {
  render: () => {
    const [names, setNames] = useState<string[]>([]);
    useEffect(() => setNames(modeTokens('day').map((t) => t.name)), []);
    return (
      <Section
        title="Every mode"
        count={names.length}
        note={
          <>
            All seven Figma modes at once, so a token that is wrong in one of them has
            somewhere to show up. The toolbar switches one mode at a time; this compares
            them. Each column carries its own <code>data-theme</code>, which is why the
            swatches differ while the page around them does not.
          </>
        }
      >
        <div className="tk__modes" style={{ gridTemplateColumns: `18rem repeat(${MODES.length}, minmax(0, 1fr))` }}>
          <span className="tk__modeHead" />
          {MODES.map((m) => (
            <span key={m} className="tk__modeHead">
              {m}
            </span>
          ))}
          {names.map((name) => (
            <Row key={name} name={name} />
          ))}
        </div>
      </Section>
    );
  },
};

function Row({ name }: { name: string }) {
  return (
    <>
      <span className="tk__name tk__name--row">{name}</span>
      {MODES.map((mode: Mode) => (
        <span key={mode} data-theme={mode} className="tk__modeCell">
          <span className="tk__chip tk__chip--wide" style={{ background: `var(${name})` }} />
        </span>
      ))}
    </>
  );
}

/** Spacing scale. */
export const Spacing: Story = {
  render: () => {
    const tokens = useTokens();
    const spacing = family(tokens, '--spacing-');
    return (
      <Section
        title="Spacing"
        count={spacing.length}
        note={
          <>
            Mode-independent. The <code>step</code> group is named by pixel value rather
            than by role — worth knowing before reaching for one, since a component
            should be reading a semantic name.
          </>
        }
      >
        {spacing.map((t) => (
          <div key={t.name} className="tk__barRow">
            <span className="tk__name">{t.name}</span>
            <span className="tk__bar" style={{ width: `var(${t.name})` }} />
            <span className="tk__value">{t.value}</span>
          </div>
        ))}
      </Section>
    );
  },
};

/** Corner radii. */
export const Radius: Story = {
  render: () => {
    const tokens = useTokens();
    const radii = family(tokens, '--radius-');
    return (
      <Section title="Radius" count={radii.length} note="Mode-independent.">
        <div className="tk__tiles">
          {radii.map((t) => (
            <div key={t.name} className="tk__tile">
              <span className="tk__radiusBox" style={{ borderRadius: `var(${t.name})` }} />
              <span className="tk__name">{t.name}</span>
              <span className="tk__value">{t.value}</span>
            </div>
          ))}
        </div>
      </Section>
    );
  },
};

/** Type styles, each rendered in the font it names. */
export const Typography: Story = {
  render: () => {
    const tokens = useTokens();
    const fonts = family(tokens, '--font-');
    return (
      <Section
        title="Typography"
        count={fonts.length}
        note={
          <>
            Each <code>--font-*</code> is a complete <code>font</code> shorthand. The
            families are self-hosted; if these render as a serif, the fonts did not load
            and every width on the page is wrong.
          </>
        }
      >
        {fonts.map((t) => (
          <div key={t.name} className="tk__typeRow">
            <span className="tk__name">{t.name}</span>
            <span className="tk__sample" style={{ font: `var(${t.name})` }}>
              Sunim design system
            </span>
            <span className="tk__value">{t.value}</span>
          </div>
        ))}
      </Section>
    );
  },
};

/** Shadows. */
export const Effects: Story = {
  render: () => {
    const tokens = useTokens();
    const effects = family(tokens, '--effect-');
    return (
      <Section title="Effects" count={effects.length}>
        <div className="tk__tiles">
          {effects.map((t) => (
            <div key={t.name} className="tk__tile">
              <span className="tk__effectBox" style={{ boxShadow: `var(${t.name})` }} />
              <span className="tk__name">{t.name}</span>
            </div>
          ))}
        </div>
      </Section>
    );
  },
};

/** The base layer. Documented, not for use. */
export const Primitives: Story = {
  render: () => {
    const tokens = useTokens();
    const prims = family(tokens, '--primitives-');
    return (
      <Section
        title="Primitives"
        count={prims.length}
        note={
          <>
            <strong>The base layer. A component referencing one of these is wrong</strong>{' '}
            — it has skipped the semantic token that should sit in front of it. Shown so
            the ramps can be read, and so a ramp with a value out of place is visible.
          </>
        }
      >
        <div className="tk__grid">
          {prims.map((t) => (
            <div key={t.name} className="tk__swatchRow">
              <span className="tk__chip" style={{ background: `var(${t.name})` }} />
              <span className="tk__name">{t.name}</span>
              <span className="tk__value">{t.value}</span>
            </div>
          ))}
        </div>
      </Section>
    );
  },
};
