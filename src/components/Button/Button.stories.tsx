/*
 * Figma node — QA tests against this, not against this file:
 * https://www.figma.com/design/mFnN1Sr8MAmOdmx0ABXPsb/2.-Sunim-.-Web-.-Component-.-V1.0-.-Beta?node-id=19-231
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { asIntent, intentDoc } from '../../docs/intent';
import intentJson from './Button.intent.json';

const FIGMA_FILE =
  'https://www.figma.com/design/mFnN1Sr8MAmOdmx0ABXPsb/2.-Sunim-.-Web-.-Component-.-V1.0-.-Beta';

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
  title: 'Components/Button',
  component: Button,
  /*
   * Without this there is no docs page at all — and every word of the
   * description below, and the intent appended after this meta, renders
   * nowhere. The prose was already here and already invisible.
   */
  tags: ['autodocs'],
  args: {
    label: 'Apply for this cohort',
    showTrailing: true,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['Primary', 'Secondary', 'Ghost'] },
    size: { control: 'inline-radio', options: ['Md', 'Lg'] },
    state: {
      control: 'inline-radio',
      options: ['Default', 'Hover', 'Focus', 'Disabled', 'Loading'],
    },
    label: { control: 'text' },
    showTrailing: { control: 'boolean' },
    icon: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component: `The action. Primary is the one thing this view wants you to do, and there is
one per view. Secondary sits beside it, Ghost is tertiary.

Figma node — QA tests against this, not against this file:
${FIGMA_FILE}?node-id=19-231

**The matrix.** The Figma component set is Variant (Primary, Secondary, Ghost)
x Size (Md, Lg) x State (Default, Hover, Focus, Disabled, Loading) = 30
variants, and there is one story per variant, each deep-linked to its node.
Hover and Focus are pinned on through the \`state\` prop so they can be seen and
compared; on a real button they also happen by themselves.

The four stories after the matrix — Playground, WithoutTrailing, WithCustomIcon
and LongLabel — are **not** matrix rows and have no node to test against. They
exercise the three non-variant Figma properties (Label, Show Trailing, Icon).`,
      },
    },
  },
} satisfies Meta<typeof Button>;

/*
 * The intent block is appended here rather than written into the description
 * above. The prose is the engineer's, `Button.intent.json` is 📝 Doc
 * Generator's, and a gate reads the second one — keeping them separate keeps
 * one owner per thing while both land on the same docs page.
 */
meta.parameters.docs.description.component +=
  '\n\n' + intentDoc(asIntent(intentJson));

export default meta;
type Story = StoryObj<typeof meta>;

/* Primary ----------------------------------------------------------------- */

export const PrimaryMdDefault: Story = {
  args: { variant: 'Primary', size: 'Md', state: 'Default' },
  parameters: node('19:62'),
};

export const PrimaryMdHover: Story = {
  args: { variant: 'Primary', size: 'Md', state: 'Hover' },
  parameters: node('19:68'),
};

export const PrimaryMdFocus: Story = {
  args: { variant: 'Primary', size: 'Md', state: 'Focus' },
  parameters: node('19:74'),
};

export const PrimaryMdDisabled: Story = {
  args: { variant: 'Primary', size: 'Md', state: 'Disabled' },
  parameters: node('19:80'),
};

export const PrimaryMdLoading: Story = {
  args: { variant: 'Primary', size: 'Md', state: 'Loading' },
  parameters: node('19:85'),
};

export const PrimaryLgDefault: Story = {
  args: { variant: 'Primary', size: 'Lg', state: 'Default' },
  parameters: node('19:91'),
};

export const PrimaryLgHover: Story = {
  args: { variant: 'Primary', size: 'Lg', state: 'Hover' },
  parameters: node('19:97'),
};

export const PrimaryLgFocus: Story = {
  args: { variant: 'Primary', size: 'Lg', state: 'Focus' },
  parameters: node('19:103'),
};

export const PrimaryLgDisabled: Story = {
  args: { variant: 'Primary', size: 'Lg', state: 'Disabled' },
  parameters: node('19:109'),
};

export const PrimaryLgLoading: Story = {
  args: { variant: 'Primary', size: 'Lg', state: 'Loading' },
  parameters: node('19:114'),
};

/* Secondary --------------------------------------------------------------- */

export const SecondaryMdDefault: Story = {
  args: { variant: 'Secondary', size: 'Md', state: 'Default' },
  parameters: node('19:120'),
};

export const SecondaryMdHover: Story = {
  args: { variant: 'Secondary', size: 'Md', state: 'Hover' },
  parameters: node('19:126'),
};

export const SecondaryMdFocus: Story = {
  args: { variant: 'Secondary', size: 'Md', state: 'Focus' },
  parameters: node('19:132'),
};

export const SecondaryMdDisabled: Story = {
  args: { variant: 'Secondary', size: 'Md', state: 'Disabled' },
  parameters: node('19:138'),
};

export const SecondaryMdLoading: Story = {
  args: { variant: 'Secondary', size: 'Md', state: 'Loading' },
  parameters: node('19:143'),
};

export const SecondaryLgDefault: Story = {
  args: { variant: 'Secondary', size: 'Lg', state: 'Default' },
  parameters: node('19:149'),
};

export const SecondaryLgHover: Story = {
  args: { variant: 'Secondary', size: 'Lg', state: 'Hover' },
  parameters: node('19:155'),
};

export const SecondaryLgFocus: Story = {
  args: { variant: 'Secondary', size: 'Lg', state: 'Focus' },
  parameters: node('19:161'),
};

export const SecondaryLgDisabled: Story = {
  args: { variant: 'Secondary', size: 'Lg', state: 'Disabled' },
  parameters: node('19:167'),
};

export const SecondaryLgLoading: Story = {
  args: { variant: 'Secondary', size: 'Lg', state: 'Loading' },
  parameters: node('19:172'),
};

/* Ghost ------------------------------------------------------------------- */

export const GhostMdDefault: Story = {
  args: { variant: 'Ghost', size: 'Md', state: 'Default' },
  parameters: node('19:178'),
};

export const GhostMdHover: Story = {
  args: { variant: 'Ghost', size: 'Md', state: 'Hover' },
  parameters: node('19:184'),
};

export const GhostMdFocus: Story = {
  args: { variant: 'Ghost', size: 'Md', state: 'Focus' },
  parameters: node('19:190'),
};

export const GhostMdDisabled: Story = {
  args: { variant: 'Ghost', size: 'Md', state: 'Disabled' },
  parameters: node('19:196'),
};

export const GhostMdLoading: Story = {
  args: { variant: 'Ghost', size: 'Md', state: 'Loading' },
  parameters: node('19:201'),
};

export const GhostLgDefault: Story = {
  args: { variant: 'Ghost', size: 'Lg', state: 'Default' },
  parameters: node('19:207'),
};

export const GhostLgHover: Story = {
  args: { variant: 'Ghost', size: 'Lg', state: 'Hover' },
  parameters: node('19:213'),
};

export const GhostLgFocus: Story = {
  args: { variant: 'Ghost', size: 'Lg', state: 'Focus' },
  parameters: node('19:219'),
};

export const GhostLgDisabled: Story = {
  args: { variant: 'Ghost', size: 'Lg', state: 'Disabled' },
  parameters: node('19:225'),
};

export const GhostLgLoading: Story = {
  args: { variant: 'Ghost', size: 'Lg', state: 'Loading' },
  parameters: node('19:230'),
};

/* Beyond the matrix — no node to test against ------------------------------ */

/** Every prop wired to a control, for poking at the component. */
export const Playground: Story = {
  args: { variant: 'Primary', size: 'Md', state: 'Default' },
};

/** The Show Trailing property, off. */
export const WithoutTrailing: Story = {
  args: { variant: 'Primary', size: 'Md', state: 'Default', showTrailing: false },
};

/** The Icon property — the default arrow swapped for an icon from Sunim Icon. */
export const WithCustomIcon: Story = {
  args: {
    variant: 'Secondary',
    size: 'Lg',
    state: 'Default',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width={16} height={16}>
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
 * A long label. The node sets the label to no-wrap, so the pill grows with the
 * text rather than wrapping it — check that the container can take the width.
 */
export const LongLabel: Story = {
  args: {
    variant: 'Primary',
    size: 'Lg',
    state: 'Default',
    label: 'Apply for the next Sunim cohort starting in September',
  },
};
