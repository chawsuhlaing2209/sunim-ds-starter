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
 * Every page here deep-links into Storybook rather than re-rendering anything.
 * It does not embed it: the deployed CSP sets `frame-ancestors 'self'`, so a
 * cross-origin iframe would be blocked — and widening a real protection to save
 * a click is not a trade worth making.
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
      customCss: ['./src/styles/reference.css'],
      lastUpdated: true,
    }),
  ],
});
