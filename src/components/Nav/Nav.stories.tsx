/*
 * Figma node — QA tests against this, not against this file:
 * https://www.figma.com/design/mFnN1Sr8MAmOdmx0ABXPsb/2.-Sunim-Component?node-id=49-31
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Nav } from './Nav';

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

/**
 * The node's own frames are a fixed 760 (Default) and 620 (Condensed) wide. The
 * component fills its container instead — see the note in `Nav.css` — so each
 * story is pinned to the width of the variant it is built from, and what QA
 * measures is the width the node states.
 */
const WIDTH = { Default: 760, Condensed: 620 } as const;

/** The four entries the node draws, with Courses as the current section. */
const LINKS = [
  { label: 'Courses', href: '#courses', isCurrent: true },
  { label: 'Services', href: '#services' },
  { label: 'Field Notes', href: '#field-notes' },
  { label: 'About', href: '#about' },
];

const meta = {
  title: 'Components/Nav',
  component: Nav,
  /*
   * Without this there is no docs page at all, and every word of the
   * description below renders nowhere.
   */
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'inline-radio',
      options: ['Default', 'Condensed'],
    },
  },
  args: {
    wordmark: 'tps',
    links: LINKS,
    cta: { label: 'Apply' },
  },
  parameters: {
    docs: {
      description: {
        component: `The site bar. The node's own description says what it is: "A floating pill, not
a full-width bar. Condensed is what it becomes after the page scrolls. The
current section is the only link in accent ink."

**The CTA is a real Button.** Node 49:11 is an instance of Button at
Variant=Primary, Size=Md, so this component imports Button rather than drawing a
second pill that happens to match. \`Variant\` and \`Size\` are pinned; the label,
\`onClick\` and \`state\` are yours.

**The pill fills its container.** The node is drawn at a fixed 760 and 620, but
how wide the bar floats is the page's decision, not the bar's — so each story
below is pinned to the width of the node it is tested against.

**\`state\` does not watch the page.** Nothing here listens to a scroll
position; the page swaps \`Default\` for \`Condensed\` and the bar draws it.`,
      },
    },
  },
} satisfies Meta<typeof Nav>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The resting bar. Links sit `space-6` apart, and Courses is the one entry in
 * accent ink because it carries `isCurrent`.
 */
export const Default: Story = {
  args: { state: 'Default' },
  decorators: [(Story) => <div style={{ width: WIDTH.Default }}>{Story()}</div>],
  parameters: node('49:17'),
};

/**
 * What the bar becomes after the page scrolls. Same content, same padding,
 * links packed to `space-4`.
 */
export const Condensed: Story = {
  args: { state: 'Condensed' },
  decorators: [
    (Story) => <div style={{ width: WIDTH.Condensed }}>{Story()}</div>,
  ],
  parameters: node('49:30'),
};

/**
 * Both variants at the widths the node draws them, stacked as the component set
 * shows them — the one story to compare against node 49:31 as a whole.
 */
export const ComponentSet: Story = {
  args: { state: 'Default' },
  render: (args) => (
    <div style={{ display: 'grid', gap: 32, justifyItems: 'start' }}>
      <div style={{ width: WIDTH.Default }}>
        <Nav {...args} state="Default" aria-label="Primary" />
      </div>
      <div style={{ width: WIDTH.Condensed }}>
        <Nav {...args} state="Condensed" aria-label="Primary condensed" />
      </div>
    </div>
  ),
  parameters: node('49:31'),
};

/**
 * The CTA's states are Button's, reached through `cta`. Loading marks the
 * button non-interactive and sets `aria-busy`; the arrow becomes the spinner.
 * Nothing about the bar changes, which is the point of composing rather than
 * copying.
 */
export const CtaLoading: Story = {
  args: { state: 'Default', cta: { label: 'Apply', state: 'Loading' } },
  decorators: [(Story) => <div style={{ width: WIDTH.Default }}>{Story()}</div>],
  parameters: node('49:17'),
};

/** The same pass-through with the CTA unavailable. */
export const CtaDisabled: Story = {
  args: { state: 'Default', cta: { label: 'Apply', state: 'Disabled' } },
  decorators: [(Story) => <div style={{ width: WIDTH.Default }}>{Story()}</div>],
  parameters: node('49:17'),
};

/**
 * No entry carries `isCurrent` — a page that is not one of the four sections.
 * Every link stays `text-muted`, which is the node's own rule read the other
 * way round: accent ink means *here*, so nowhere means no accent ink.
 */
export const NoCurrentSection: Story = {
  args: {
    state: 'Default',
    links: LINKS.map(({ isCurrent: _isCurrent, ...link }) => link),
  },
  decorators: [(Story) => <div style={{ width: WIDTH.Default }}>{Story()}</div>],
  parameters: node('49:17'),
};
