/*
 * Figma node — QA tests against this, not against this file:
 * https://www.figma.com/design/mFnN1Sr8MAmOdmx0ABXPsb/2.-Sunim-Component?node-id=31-41
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputControl } from './InputControl';

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
 * The node's own frame is a fixed 320 wide. The component fills its container
 * instead — see the note in `InputControl.css` — so every story is pinned to
 * that width here, and what QA measures is the width the node states.
 */
const NODE_WIDTH = 320;

const PLACEHOLDER = 'you@example.com';

const meta = {
  title: 'Components/InputControl',
  component: InputControl,
  /*
   * Without this there is no docs page at all, and every word of the
   * description below renders nowhere.
   */
  tags: ['autodocs'],
  decorators: [
    (Story) => <div style={{ width: NODE_WIDTH }}>{Story()}</div>,
  ],
  argTypes: {
    state: {
      control: 'inline-radio',
      options: ['Default', 'Filled', 'Focus', 'Error', 'Disabled'],
    },
    placeholder: { control: 'text' },
    defaultValue: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    'aria-label': 'Email address',
    placeholder: PLACEHOLDER,
  },
  parameters: {
    docs: {
      description: {
        component: `The input box on its own — no label, no hint, no message. The node's own
description says what it is for: "The input box on its own. 1.5px border, 11px
radius, 11 by 13 padding... Error is gold, not red: this system has no alarm
colour. Wrap it in Field for a label, hint and message."

Figma node — QA tests against this, not against this file:
${FIGMA_FILE}?node-id=31-41

**The matrix.** The Figma component set is State (Default, Filled, Focus, Error,
Disabled) = 5 variants on one axis, and there is one story per variant, each
deep-linked to its node.

**There is no Variant and no Size.** The set has one variant property and no
second, so this component has no tone, no density and no small/large. None has
been invented, and QA should expect none.

**Two of the five states are content, not styling.** Default is the empty box
showing its placeholder and Filled is the same box with a value in it — the node
draws them as separate variants because Figma has no other way to show text
present versus absent. Here the difference is the value, and the placeholder
colour follows from \`::placeholder\`. The other three do something: Focus pins
the focus appearance on, Error draws the gold stroke and sets \`aria-invalid\`,
and Disabled sets the \`disabled\` attribute so the field is genuinely
unreachable rather than merely faded.

**It is a real \`<input>\`.** Every prop other than \`state\` is a plain input
attribute — \`placeholder\`, \`value\`, \`defaultValue\`, \`onChange\`,
\`type\`, \`name\`, \`id\` — passed straight through, so you can type in these
stories.

**Every story passes \`aria-label\`.** The component draws no label, and an
input without an accessible name is a defect wherever it lands. In production
that name comes from Field's \`<label>\`; in these stories it is set directly so
each one stands on its own.

**Width.** The node is a fixed 320 wide; the component fills its container so
Field can size it, and each story is pinned to 320 to match the node.

The stories after the matrix — AllStates and Playground — are **not** matrix
rows and have no node to test against.`,
      },
    },
  },
} satisfies Meta<typeof InputControl>;

export default meta;
type Story = StoryObj<typeof meta>;

/* The matrix -------------------------------------------------------------- */

/** Default — empty, showing its placeholder in text/faint. */
export const Default: Story = {
  args: { state: 'Default' },
  parameters: node('31:28'),
};

/** Filled — the same box with a value in it, drawn in text/body. */
export const Filled: Story = {
  args: { state: 'Filled', defaultValue: PLACEHOLDER },
  parameters: node('31:31'),
};

/**
 * Focus — accent stroke and the focus/ring effect. Pinned on so it can be seen
 * standing still; clicking into any other story draws the same thing from
 * `:focus-visible`.
 */
export const Focus: Story = {
  args: { state: 'Focus', defaultValue: PLACEHOLDER },
  parameters: node('31:34'),
};

/** Error — gold/deep stroke, not red. Also sets `aria-invalid="true"`. */
export const Error: Story = {
  args: { state: 'Error', defaultValue: PLACEHOLDER },
  parameters: node('31:37'),
};

/**
 * Disabled — surface/sunk fill at the node's 0.5 opacity, and the real
 * `disabled` attribute, so it takes no focus and no typing.
 */
export const Disabled: Story = {
  args: { state: 'Disabled' },
  parameters: node('31:40'),
};

/* Beyond the matrix — no node to test against ------------------------------ */

/**
 * All five together, in the order the component set lays them out on the
 * canvas.
 */
export const AllStates: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 'var(--spacing-space-4)',
      }}
    >
      <InputControl
        aria-label="Email address · Default"
        state="Default"
        placeholder={PLACEHOLDER}
      />
      <InputControl
        aria-label="Email address · Filled"
        state="Filled"
        defaultValue={PLACEHOLDER}
      />
      <InputControl
        aria-label="Email address · Focus"
        state="Focus"
        defaultValue={PLACEHOLDER}
      />
      <InputControl
        aria-label="Email address · Error"
        state="Error"
        defaultValue={PLACEHOLDER}
      />
      <InputControl
        aria-label="Email address · Disabled"
        state="Disabled"
        placeholder={PLACEHOLDER}
      />
    </div>
  ),
};

/** Every prop on a control, for trying combinations the matrix does not name. */
export const Playground: Story = {
  args: { state: 'Default' },
};
