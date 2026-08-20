/*
 * Figma node — QA tests against this, not against this file:
 * https://www.figma.com/design/mFnN1Sr8MAmOdmx0ABXPsb/2.-Sunim-Component?node-id=21-79
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip } from './Chip';
import { asIntent, intentDoc } from '../../docs/intent';
import intentJson from './Chip.intent.json';

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
  title: 'Components/Chip',
  component: Chip,
  /*
   * Without this there is no docs page at all — and every word of the
   * description below, and the intent appended after this meta, renders
   * nowhere. The prose was already here and already invisible.
   */
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['Default', 'Gold', 'Agentic', 'Quiet'],
    },
    size: { control: 'inline-radio', options: ['Sm', 'Md'] },
    label: { control: 'text' },
    showIcon: { control: 'boolean' },
    icon: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component: `A small label that carries status or a credential. Sm is the status tag;
Md reads as a credential — larger type, more padding, a thicker stroke.

Figma node — QA tests against this, not against this file:
${FIGMA_FILE}?node-id=21-79

**The matrix.** The Figma component set is Tone (Default, Gold, Agentic, Figma)
× Size (Sm, Md) = 8 variants, and there is one story per variant, each
deep-linked to its node.

**There is no State.** The set has two variant properties and no third, so Chip
has no hover, focus, pressed, disabled or loading appearance — it is a label,
not a control. None has been invented here, and QA should expect none.

**Tone.** Default is sky, the everyday status tag. Gold marks something earned
or paid. Agentic marks an AI moment and is reserved for those — the design file
asks for it to stay rare on any one screen. Quiet keeps the pill quiet and lets
the mark carry the colour.

**The mark is an Icon Slot instance**, not a glyph — imported from
\`src/components/IconSlot/\`, at Size 14 on both Chip sizes. It takes the tone's
colour through Icon Slot's own documented \`--sunim-IconSlot-color\` override
rather than by reaching into its markup.

The stories after the matrix — AllTones, TextOnly, WithCustomIcon and
Playground — are **not** matrix rows and have no node to test against.`,
      },
    },
  },
} satisfies Meta<typeof Chip>;

/*
 * The intent block is appended here rather than written into the description
 * above. The prose is the engineer's, `Chip.intent.json` is 📝 Doc
 * Generator's, and a gate reads the second one — keeping them separate keeps
 * one owner per thing while both land on the same docs page.
 */
meta.parameters.docs.description.component +=
  '\n\n' + intentDoc(asIntent(intentJson));

export default meta;
type Story = StoryObj<typeof meta>;

/* The matrix -------------------------------------------------------------- */

/** Default · Sm — the everyday status tag. */
export const DefaultSm: Story = {
  args: { tone: 'Default', size: 'Sm', label: 'Early bird' },
  parameters: node('21:43'),
};

/** Default · Md — the same tone read as a credential. */
export const DefaultMd: Story = {
  args: { tone: 'Default', size: 'Md', label: 'Early bird' },
  parameters: node('21:48'),
};

/** Gold · Sm — something earned or paid. */
export const GoldSm: Story = {
  args: { tone: 'Gold', size: 'Sm', label: 'Early bird' },
  parameters: node('21:53'),
};

/** Gold · Md. */
export const GoldMd: Story = {
  args: { tone: 'Gold', size: 'Md', label: 'Early bird' },
  parameters: node('21:58'),
};

/** Agentic · Sm — an AI moment. Used sparingly. */
export const AgenticSm: Story = {
  args: { tone: 'Agentic', size: 'Sm', label: 'Early bird' },
  parameters: node('21:63'),
};

/** Agentic · Md. */
export const AgenticMd: Story = {
  args: { tone: 'Agentic', size: 'Md', label: 'Early bird' },
  parameters: node('21:68'),
};

/** Quiet · Sm — the pill stays quiet, the mark carries the colour.
 *  The node names this variant Figma; renamed by ruling, see decisions.md. */
export const QuietSm: Story = {
  args: { tone: 'Quiet', size: 'Sm', label: 'Early bird' },
  parameters: node('21:73'),
};

/** Quiet · Md. */
export const QuietMd: Story = {
  args: { tone: 'Quiet', size: 'Md', label: 'Early bird' },
  parameters: node('21:78'),
};

/* Beyond the matrix — no node to test against ------------------------------ */

/**
 * All eight together, laid out as the component set is on the canvas — Sm in
 * the left column, Md in the right, one tone per row.
 */
export const AllTones: Story = {
  args: { label: 'Early bird' },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'max-content max-content',
        alignItems: 'center',
        justifyItems: 'start',
        gap: 'var(--spacing-space-4) var(--spacing-space-7)',
      }}
    >
      <Chip tone="Default" size="Sm" label="Early bird" />
      <Chip tone="Default" size="Md" label="Early bird" />
      <Chip tone="Gold" size="Sm" label="Early bird" />
      <Chip tone="Gold" size="Md" label="Early bird" />
      <Chip tone="Agentic" size="Sm" label="Early bird" />
      <Chip tone="Agentic" size="Md" label="Early bird" />
      <Chip tone="Quiet" size="Sm" label="Early bird" />
      <Chip tone="Quiet" size="Md" label="Early bird" />
    </div>
  ),
};

/**
 * `showIcon={false}` — the text-only pill the library description asks for.
 * The mark goes, the padding and the pill do not.
 */
export const TextOnly: Story = {
  args: { tone: 'Gold', size: 'Md', label: 'Early bird', showIcon: false },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-space-4)' }}>
      <Chip {...args} size="Sm" />
      <Chip {...args} size="Md" />
    </div>
  ),
};

/**
 * The Icon Slot placeholder swapped for a real icon. It is handed to Icon Slot
 * through Chip's `icon` prop and picks up the tone's colour from
 * `currentColor`, exactly as the placeholder arrow does.
 */
export const WithCustomIcon: Story = {
  args: {
    tone: 'Agentic',
    size: 'Md',
    label: 'Reviewed by Sunim',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M3.5 8.5l3 3 6-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
};

/** Every prop wired to a control, for poking at the component. */
export const Playground: Story = {
  args: { tone: 'Default', size: 'Md', label: 'Early bird', showIcon: true },
};
