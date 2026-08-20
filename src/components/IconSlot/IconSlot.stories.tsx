/*
 * Figma node — QA tests against this, not against this file:
 * https://www.figma.com/design/mFnN1Sr8MAmOdmx0ABXPsb/2.-Sunim-Component?node-id=9-24
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconSlot } from './IconSlot';
import { asIntent, intentDoc } from '../../docs/intent';
import intentJson from './IconSlot.intent.json';

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
  title: 'Components/IconSlot',
  component: IconSlot,
  /*
   * Without this there is no docs page at all — and every word of the
   * description below, and the intent appended after this meta, renders
   * nowhere. The prose was already here and already invisible.
   */
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['14', '16', '22'] },
    icon: { control: false },
    label: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component: `A placeholder, not an icon. Its whole job is to be swapped — the arrow it
ships with is scaffolding, and the real icons live in the separate Sunim Icon
file. Every production use should pass \`icon\`.

Figma node — QA tests against this, not against this file:
${FIGMA_FILE}?node-id=9-24

**The matrix.** The Figma component set is Size (14, 16, 22) = 3 variants, and
there is one story per variant, each deep-linked to its node. There is no state
and no second variant property: the slot has no hover, focus, disabled or
loading appearance of its own, and takes its colour from whatever it sits in.

14 is for UI text, 16 for buttons and chips, 22 for icon tiles.

The stories after the matrix — AllSizes, Playground, WithCustomIcon, Retinted
and Labelled — are **not** matrix rows and have no node to test against. They
exercise the two props the Figma set has no variant for: \`icon\` (the swap
this component exists for) and \`label\` (whether the icon is announced or
decorative).`,
      },
    },
  },
} satisfies Meta<typeof IconSlot>;

/*
 * The intent block is appended here rather than written into the description
 * above. The prose is the engineer's, `IconSlot.intent.json` is 📝 Doc
 * Generator's, and a gate reads the second one — keeping them separate keeps
 * one owner per thing while both land on the same docs page.
 */
meta.parameters.docs.description.component +=
  '\n\n' + intentDoc(asIntent(intentJson));

export default meta;
type Story = StoryObj<typeof meta>;

/* The matrix -------------------------------------------------------------- */

/** Size 14 — for UI text. */
export const Size14: Story = {
  args: { size: '14' },
  parameters: node('9:17'),
};

/** Size 16 — for buttons and chips. This is the arrow Button already draws. */
export const Size16: Story = {
  args: { size: '16' },
  parameters: node('9:20'),
};

/** Size 22 — for icon tiles. */
export const Size22: Story = {
  args: { size: '22' },
  parameters: node('9:23'),
};

/* Beyond the matrix — no node to test against ------------------------------ */

/**
 * All three together, laid out as the component set is on the canvas. The
 * arrow geometry scales with the frame but the stroke stays a constant 3.2px,
 * so the smaller slots read optically heavier — that is the node's behaviour,
 * not a rounding error.
 */
export const AllSizes: Story = {
  args: { size: '14' },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-space-6)' }}>
      <IconSlot size="14" />
      <IconSlot size="16" />
      <IconSlot size="22" />
    </div>
  ),
};

/** Every prop wired to a control, for poking at the component. */
export const Playground: Story = {
  args: { size: '22' },
};

/**
 * The point of the component: the placeholder swapped for a real icon. Anything
 * square that draws itself with `currentColor` fits, and it is stretched to the
 * slot rather than left at its intrinsic size.
 */
export const WithCustomIcon: Story = {
  args: {
    size: '22',
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

/**
 * The colour override the Figma description asks for. The stroke binds to
 * text/body, which disappears on a dark or accent surface, so the consumer sets
 * `--sunim-IconSlot-color` — here to the knockout token, on the inverse
 * surface.
 */
export const Retinted: Story = {
  args: { size: '22' },
  render: () => (
    <div
      style={{
        display: 'inline-flex',
        gap: 'var(--spacing-space-4)',
        padding: 'var(--spacing-space-5)',
        borderRadius: 'var(--radius-radius-card)',
        background: 'var(--color-surface-inverse)',
      }}
    >
      <IconSlot
        size="22"
        style={{ ['--sunim-IconSlot-color' as string]: 'var(--color-text-on-inverse)' }}
      />
      <IconSlot
        size="22"
        style={{ ['--sunim-IconSlot-color' as string]: 'var(--color-icon-accent)' }}
      />
    </div>
  ),
};

/**
 * With no `label` the slot is decorative and hidden from assistive technology,
 * which is right when it sits beside text that already says the same thing.
 * With one it becomes an announced image. Check both in the a11y panel.
 */
export const Labelled: Story = {
  args: { size: '22', label: 'Next' },
};
