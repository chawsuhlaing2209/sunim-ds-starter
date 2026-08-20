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
 * It holds no credential and writes none. The Vercel project is identified by
 * name and resolved at run time; the ids never reach a tracked file.
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

/*
 * Which Vercel project this is.
 *
 * Not a `.vercel` directory: the repo root is already linked to the Storybook
 * project and one directory cannot be linked to two. Not hardcoded either — the
 * ids are resolved from the machine at run time, so the only thing this file
 * carries is the project *name*, which is the public domain anyway.
 *
 * Environment wins if it is set, for CI. Otherwise the org comes from the link
 * that already exists and the project id is read back from Vercel by name.
 */
const PROJECT_NAME = 'sunim-ds-reference';

const resolve = () => {
  if (process.env.VERCEL_ORG_ID && process.env.VERCEL_PROJECT_ID) {
    return { org: process.env.VERCEL_ORG_ID, project: process.env.VERCEL_PROJECT_ID };
  }
  let org = process.env.VERCEL_ORG_ID;
  if (!org) {
    if (!existsSync('.vercel/project.json')) {
      stop('no .vercel/project.json to read the team from.',
        'Run `vercel link` once, or set VERCEL_ORG_ID and VERCEL_PROJECT_ID.');
    }
    org = JSON.parse(readFileSync('.vercel/project.json', 'utf8')).orgId;
  }
  let project = process.env.VERCEL_PROJECT_ID;
  if (!project) {
    let out;
    try {
      /* 2>&1 because the Vercel CLI prints this to stderr, where a plain capture misses it. */
      out = execSync(`vercel project inspect ${PROJECT_NAME} 2>&1`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch {
      stop(`Vercel has no project called ${PROJECT_NAME}.`,
        `Create it once with \`vercel project add ${PROJECT_NAME}\`, then re-run.`);
    }
    project = out.match(/\bID\s+(prj_[A-Za-z0-9]+)/)?.[1];
    if (!project) stop(`could not read the project id for ${PROJECT_NAME}.`, 'Set VERCEL_PROJECT_ID and re-run.');
  }
  return { org, project };
};

const { org, project } = resolve();

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
