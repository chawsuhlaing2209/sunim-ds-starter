// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import site from './reference.config.json' with { type: 'json' };

/*
 * The Sunim Design System reference site.
 *
 * A separate package on purpose. Astro brings its own Vite, its own build
 * pipeline and roughly 370 packages; the design system ships four components and
 * a token build. Merging the two dependency trees would put every one of those
 * packages one `npm install` away from the thing being documented, and pin two
 * Vite majors against each other. `docs/` installs its own and stays out of the
 * way — nothing here can reach `src/index.ts`, which is the surface being
 * promised.
 *
 * The split it enforces is also the honest one:
 *
 *   Storybook  — where components *render*. Every variant, every state, live.
 *   This site  — where components are *explained*. When to use one, when not to,
 *                what it promises, which tokens it needs.
 *
 * Pages embed and deep-link into Storybook rather than re-rendering anything
 * themselves. Nothing in this package imports a component, so there is no second
 * rendering to keep in step with the first.
 *
 * The embeds are subject to Storybook's `frame-ancestors 'self'`. That directive
 * stays: the fix for a cross-origin deployment is to name this site's origin in
 * it, never `*` and never removing it. `start/embedding` has the detail, and every
 * frame carries a direct link so a blocked one costs a click rather than the
 * content.
 */
export default defineConfig({
  site: site.siteUrl,
  integrations: [
    starlight({
      title: site.title,
      description: site.description,
      social: [{ icon: 'github', label: 'GitHub', href: site.repoUrl }],
      sidebar: [
        { label: 'Start here', items: [{ autogenerate: { directory: 'start' } }] },
        { label: 'Components', items: [{ autogenerate: { directory: 'components' } }] },
      ],
      /*
       * Order matters. The generated token sheet has to define the custom
       * properties before reference.css maps Starlight's variables onto them,
       * and the typefaces have to be declared before either.
       *
       * Self-hosted, never a CDN: the deployed CSP sets `font-src 'self' data:`,
       * so a Google Fonts link fails it — and fails silently, leaving every
       * label in a fallback face and every width wrong for a reason that has
       * nothing to do with the page.
       */
      customCss: [
        '@fontsource/instrument-sans/400.css',
        '@fontsource/instrument-sans/500.css',
        '@fontsource/instrument-sans/600.css',
        '@fontsource/instrument-sans/700.css',
        '@fontsource/schibsted-grotesk/600.css',
        '@fontsource/schibsted-grotesk/700.css',
        '@fontsource/schibsted-grotesk/800.css',
        './src/styles/tokens.generated.css',
        './src/styles/reference.css',
      ],
      lastUpdated: true,
    }),
  ],
});
