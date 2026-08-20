#!/usr/bin/env node
/**
 * Deploys the reference site.
 *
 * It deploys **the build output**, not the repository. The first attempt at this
 * did the opposite — `vercel deploy --local-config docs/vercel.json` from the
 * repo root, expecting the local config's build settings to win. They did not:
 * Vercel read the root `vercel.json` on the build server and published Storybook
 * to the reference site's own domain. It looked like a successful deploy in
 * every line of output.
 *
 * There is no build command here for that reason. `docs/dist/` is produced by
 * `npm run docs:build` on this machine, checked, and then uploaded as static
 * files. What ships is what was verified locally, and Vercel is given nothing to
 * infer.
 *
 * `docs/vercel.json` is copied in beside the output because Vercel reads it from
 * the root of whatever is deployed, and `docs/dist/` is regenerated every build.
 * It carries the headers only — the CSP that lets this site frame Storybook and
 * Figma, and nothing else.
 *
 * The project is named by environment variable rather than by a `.vercel`
 * directory: the repo root is already linked to the Storybook project, and one
 * directory cannot be linked to two. Neither value is a credential, and neither
 * is written to a tracked file.
 *
 * Usage:
 *   npm run docs:deploy            # preview
 *   npm run docs:deploy -- --prod  # production
 */

import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync } from 'node:fs';

const prod = process.argv.includes('--prod');

const stop = (m, fix) => {
  console.error(`\n  \x1b[31m✗\x1b[0m ${m}`);
  if (fix) console.error(`\n  ${fix}\n`);
  process.exit(1);
};

const org = process.env.VERCEL_ORG_ID;
const project = process.env.VERCEL_PROJECT_ID;
if (!org || !project) {
  stop(
    'VERCEL_ORG_ID and VERCEL_PROJECT_ID must both be set.',
    'They identify the reference site\'s Vercel project. Read them from the\n'
    + '  project once and export them; do not commit them.\n\n'
    + '    vercel project inspect sunim-ds-reference',
  );
}

if (!existsSync('docs/dist/index.html')) {
  stop('docs/dist/ is empty — nothing built.', 'Run `npm run docs:build` first.');
}

/*
 * The one check that cannot be skipped. The failure this script exists to
 * prevent shipped a Storybook build to this domain, and the tell was in the
 * markup: a Storybook page titles itself "Storybook".
 */
const index = readFileSync('docs/dist/index.html', 'utf8');
const title = index.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
if (/storybook/i.test(title)) {
  stop(
    `docs/dist/index.html is titled "${title}" — that is a Storybook build, not the site.`,
    'This is the exact mistake that put Storybook on the reference domain once.\n'
    + '  Refusing to upload it. Rebuild with `npm run docs:build`.',
  );
}

copyFileSync('docs/vercel.json', 'docs/dist/vercel.json');

console.log(`\n\x1b[1mDeploying the reference site — ${prod ? 'production' : 'preview'}\x1b[0m`);
console.log(`  "${title}"\n`);

/*
 * Run from inside the output directory, not from the repo root with a path
 * argument.
 *
 * The CLI reads `vercel.json` from its working directory, and that file wins over
 * both `--local-config` and the path being uploaded. From the repo root it finds
 * the Storybook config — which is how Storybook reached this domain, and how the
 * next attempt still tried to run Storybook's install command against a folder of
 * static HTML. Standing in `docs/dist/` there is exactly one `vercel.json`: the
 * headers copied in above.
 */
execSync(`vercel deploy . --yes${prod ? ' --prod' : ''}`, {
  stdio: 'inherit',
  cwd: 'docs/dist',
  env: { ...process.env, VERCEL_ORG_ID: org, VERCEL_PROJECT_ID: project },
});
