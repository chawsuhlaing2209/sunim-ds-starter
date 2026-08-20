/*
 * Figma node — QA tests against this, not against this file:
 * https://www.figma.com/design/mFnN1Sr8MAmOdmx0ABXPsb/2.-Sunim-Component?node-id=22-43
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Eyebrow } from './Eyebrow';
import { asIntent, intentDoc } from '../../docs/intent';
import intentJson from './Eyebrow.intent.json';

const FIGMA_FILE =
  'https://www.figma.com/design/mFnN1Sr8MAmOdmx0ABXPsb/2.-Sunim-Component';

/**
 * Deep-links a story to the single Figma variant it is built from, so QA can
 * open the exact node beside the rendered story instead of hunting the set.
 */
const node = (id: string) => ({
  docs: {
    description: {
      story: `Figma node \`${id}\` — [open in Figma](${FIGMA_FILE}?node-id=${id.replace(':', '-')})`,
    },
  },
});

const meta = {
  title: 'Components/Eyebrow',
  component: Eyebrow,
  /*
   * Without this there is no docs page at all — and every word of the
   * description below, and the intent appended after this meta, renders
   * nowhere. The prose was already here and already invisible.
   */
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['Agentic', 'Sky', 'Ink', 'Gold'],
    },
    mark: { control: 'text' },
    title: { control: 'text' },
    label: { control: 'text' },
    showLabel: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: `The layer label above a section head. It is what makes the site read as a
design file rather than a brochure.

Figma node — QA tests against this, not against this file:
${FIGMA_FILE}?node-id=22-43

**The matrix.** The Figma component set is Tone (Agentic, Sky, Ink, Gold) = 4
variants on a single axis, and there is one story per variant, each deep-linked
to its node. There is no Size property and no State property.

**There is no State.** An Eyebrow is a label, not a control, so it has no
hover, focus, pressed, disabled or loading appearance. None has been invented
here, and QA should expect none.

**Tone.** Agentic marks an AI moment. Sky is the default. Ink is for quiet
sections. Gold is for anything earned or paid.

**The mark is a glyph, not an icon.** It is a text layer on the node, and the
design file's rules page names it as the system's one exception — a
typographic glyph from the export that stays as text. Icon Slot is deliberately
**not** imported here, which is the one place Eyebrow diverges from Chip. Chip
composes Icon Slot because Chip's mark genuinely is an Icon Slot instance.

**The two halves.** Mark and Title are the loud half: \`--font-eyebrow-strong\`
in the tone's colour. Label is the quiet half: \`--font-eyebrow\` — one weight
down — and \`--color-text-faint\` on all four tones, so it reads the way a
layer name sits beside a layer.

**Known width delta — 146px here against 151px on the node.** All 5px sit in
the mark, and it is a design gap rather than a layout bug. Instrument Sans has
no glyph for \`◇\`, \`◻\` or \`☀\`, so Figma and the browser each substitute a
different fallback face and the two disagree on the width. Everything else
measures to the node: the title at 82.24px against 82, the label at 39.39px
against 39, and the gap, weights, sizes and colours exactly. The fix is
upstream — bind the mark to a family that carries the glyphs, or ship them in
the export — so it is reported here rather than patched in the component.

**Contrast.** None of the four tones clears WCAG AA for normal text against the
day-mode page, and neither does the faint label. 12px bold is normal text — the
large-text exemption starts at 18.66px bold — so the bar is 4.5:1. See the
AllTones story note for the measured numbers. The colours are exactly what the
design binds, so this is reported rather than corrected.

The stories after the matrix — AllTones, WithoutLabel, Glyphs and Playground —
are **not** matrix rows and have no node to test against.`,
      },
    },
  },
} satisfies Meta<typeof Eyebrow>;

/*
 * The intent block is appended here rather than written into the description
 * above. The prose is the engineer's, `Eyebrow.intent.json` is 📝 Doc
 * Generator's, and a gate reads the second one — keeping them separate keeps
 * one owner per thing while both land on the same docs page.
 */
meta.parameters.docs.description.component +=
  '\n\n' + intentDoc(asIntent(intentJson));

export default meta;
type Story = StoryObj<typeof meta>;

/* The matrix -------------------------------------------------------------- */

/** Agentic — an AI moment. */
export const Agentic: Story = {
  args: { tone: 'Agentic', mark: '◇', title: 'Components', label: '/ Card' },
  parameters: node('22:27'),
};

/** Sky — the default. */
export const Sky: Story = {
  args: { tone: 'Sky', mark: '◇', title: 'Components', label: '/ Card' },
  parameters: node('22:32'),
};

/** Ink — a quiet section. */
export const Ink: Story = {
  args: { tone: 'Ink', mark: '◇', title: 'Components', label: '/ Card' },
  parameters: node('22:37'),
};

/** Gold — anything earned or paid. */
export const Gold: Story = {
  args: { tone: 'Gold', mark: '◇', title: 'Components', label: '/ Card' },
  parameters: node('22:42'),
};

/* Beyond the matrix — no node to test against ------------------------------ */

/**
 * All four together, stacked as the component set is on the canvas.
 *
 * Worth knowing while looking at this: measured against the day-mode page
 * surface (`--color-surface-page`, #f4f6fb), none of the four tones reaches
 * the 4.5:1 that WCAG AA needs for normal text. 12px bold is normal text — the
 * large-text exemption starts at 18.66px bold.
 *
 *   Agentic  --color-agentic-default  3.48:1  fail
 *   Sky      --color-accent-default   2.55:1  fail
 *   Ink      --color-accent-ink       4.35:1  fail
 *   Gold     --color-gold-deep        2.16:1  fail
 *   Label    --color-text-faint       2.77:1  fail
 *
 * Ink is the near miss, and it is worth knowing why: the committed token
 * export has `--primitives-sky-600` at #1a78bd, while the live Figma variable
 * reads #166fb2. The live value measures 4.92:1 and would pass. The stale
 * export is the whole difference between pass and fail on this one tone.
 *
 * These are the colours the design binds, so the gap is reported, not
 * corrected here.
 */
export const AllTones: Story = {
  args: { title: 'Components', label: '/ Card' },
  render: () => (
    <div
      style={{
        display: 'grid',
        justifyItems: 'start',
        gap: 'var(--spacing-space-4)',
      }}
    >
      <Eyebrow tone="Agentic" title="Components" label="/ Card" />
      <Eyebrow tone="Sky" title="Components" label="/ Card" />
      <Eyebrow tone="Ink" title="Components" label="/ Card" />
      <Eyebrow tone="Gold" title="Components" label="/ Card" />
    </div>
  ),
};

/**
 * `showLabel={false}` — the mark and title alone, for a section head that
 * needs no second half.
 */
export const WithoutLabel: Story = {
  args: { tone: 'Sky', title: 'Components', showLabel: false },
  render: (args) => (
    <div
      style={{
        display: 'grid',
        justifyItems: 'start',
        gap: 'var(--spacing-space-4)',
      }}
    >
      <Eyebrow {...args} tone="Agentic" />
      <Eyebrow {...args} tone="Sky" />
      <Eyebrow {...args} tone="Ink" />
      <Eyebrow {...args} tone="Gold" />
    </div>
  ),
};

/**
 * The three glyphs the design file names — diamond, square and sun.
 *
 * `mark` is a string because the mark is a character. Anything else the
 * typeface can draw works too; an icon component does not, and the design file
 * asks specifically that one is not swapped in.
 */
export const Glyphs: Story = {
  args: { tone: 'Sky', title: 'Components', label: '/ Card' },
  render: (args) => (
    <div
      style={{
        display: 'grid',
        justifyItems: 'start',
        gap: 'var(--spacing-space-4)',
      }}
    >
      <Eyebrow {...args} mark="◇" tone="Agentic" label="/ Diamond" />
      <Eyebrow {...args} mark="◻" tone="Sky" label="/ Square" />
      <Eyebrow {...args} mark="☀" tone="Gold" label="/ Sun" />
    </div>
  ),
};

/** Every prop wired to a control, for poking at the component. */
export const Playground: Story = {
  args: {
    tone: 'Agentic',
    mark: '◇',
    title: 'Components',
    label: '/ Card',
    showLabel: true,
  },
};
