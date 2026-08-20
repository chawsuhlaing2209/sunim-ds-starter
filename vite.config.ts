import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/*
 * The library build. Storybook has its own Vite and does not read this file.
 *
 * One entry — `src/index.ts`, the declared public surface — so the bundle
 * contains exactly what that file exports and nothing a consumer reached by
 * deep import. If something is missing from the tarball, the fix is to export
 * it there, deliberately, rather than to widen anything here.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      /*
       * React is never bundled. This is the single most expensive thing a
       * component library gets wrong: a consumer who ends up with two copies of
       * React does not get an error, they get "invalid hook call" thrown from a
       * component that is visibly fine, and nobody's first suspicion is the
       * design system.
       *
       * `peerDependencies` in package.json states the contract. This enforces
       * it — the two have to agree, and step 4 of the release run checks that
       * they do by looking in the built output rather than trusting either.
       */
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
      ],
      output: {
        /* One stylesheet, named. `scripts/bundle-css.mjs` puts the tokens in
         * front of it and the result is what consumers import. */
        assetFileNames: 'components.css',
      },
    },
    /*
     * No CSS code splitting. A component library that emits one stylesheet per
     * chunk makes the consumer's import list grow every time we add a
     * component, and the first one they forget is a component that renders
     * unstyled without erroring.
     */
    cssCodeSplit: false,
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true,
  },
});
