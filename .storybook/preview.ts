import type { Preview } from '@storybook/react-vite';
/*
 * The design system's typefaces.
 *
 * build/tokens/css/tokens.css names these families but cannot deliver them —
 * without these imports every label falls back to the browser default serif.
 * Only the weights the tokens actually use are pulled in; check
 * `grep -- --font- build/tokens/css/tokens.css` before adding another.
 */
import '@fontsource/schibsted-grotesk/500.css'; // quote
import '@fontsource/schibsted-grotesk/600.css'; // heading/h3, heading/card
import '@fontsource/schibsted-grotesk/700.css'; // headings, action/md, action/lg
import '@fontsource/schibsted-grotesk/800.css'; // display, amount, data
import '@fontsource/instrument-sans/400.css'; // body
import '@fontsource/instrument-sans/500.css'; // ui/xs
import '@fontsource/instrument-sans/600.css'; // eyebrow, ui/label
import '@fontsource/instrument-sans/700.css'; // badge, ui/tag
import '@fontsource/caveat/400.css'; // hand/note

import '../build/tokens/css/tokens.css';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i } },
  },
  globalTypes: {
    theme: {
      description: 'Which Figma mode to render in',
      defaultValue: 'day',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        // Every mode the token export defines. Check against the source before
        // trimming this list — a mode missing here is a mode nobody ever looks at:
        //   grep -oE '^\[data-theme="[a-z]+"\]' build/tokens/css/tokens.css
        items: ['day', 'open', 'morning', 'sunrise', 'sunset', 'overcast', 'night'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      document.documentElement.setAttribute('data-theme', context.globals.theme);
      document.body.style.background = 'var(--color-surface-page)';
      document.body.style.color = 'var(--color-text-body)';
      return Story();
    },
  ],
};

export default preview;
