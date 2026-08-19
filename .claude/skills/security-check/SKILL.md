---
name: security-check
description: The gate every deploy passes before it reaches staging or main. Run it before pushing a deploy and again against the live URL afterwards. Use whenever an engineer is about to deploy to staging, or DevOps is about to ship to production.
---

# Security check

## What this is, and what it is not
This is the gate a deploy passes before it becomes a URL somebody else can open.

It is **not** protection from "every cyberattack", and anything claiming to be that
is selling you something. This system is a static Storybook, built from a public
repo, served by Vercel. It has no server, no database, no login, and no user input,
so most of the attack surface people worry about does not exist here. What does
exist is narrower and far more likely:

| The realistic risk | What it looks like when it happens |
|---|---|
| A credential ends up in the bundle | A token in `storybook-static/`, public forever, working immediately |
| A private identifier ends up public | Base and table IDs telling an attacker where to point a leaked token |
| A dependency ships a known hole | `npm audit` had the answer and nobody ran it |
| The protection posture flips | A URL that was meant to need a login quietly stops needing one |
| The response carries no headers | Vercel adds none by default. Clickjacking and sniffing come free |

Those five are what this gate covers. It covers them every time, which is the
point — the danger is not a clever attacker, it is a Thursday where somebody
deploys in a hurry.

## When to run it

| Moment | Command | Who |
|---|---|---|
| Before deploying to staging | `npm run security-check` | 🔨 Engineer |
| After the staging deploy is live | `node scripts/security-check.mjs --url <staging url> --expect public` | 🔨 Engineer |
| Before merging staging → main | `npm run security-check` | 🚀 DevOps |
| After production is live | `node scripts/security-check.mjs --url <production url> --expect public` | 🚀 DevOps |

Build first. The gate scans `storybook-static/`, so running it against a stale
build checks a deploy that no longer exists:

```
npm run build:tokens && npm run build-storybook && npm run security-check
```

## The gates

**1 · Credentials in the build output.** Provider-specific patterns — GitHub,
Airtable, Figma, AWS, Google, Slack, private keys — across every text file in
`storybook-static/`. Deliberately not a generic entropy check: those drown in
minified JavaScript, and a gate people learn to ignore protects nobody.

**2 · Registry identifiers.** Exact-string comparison against the real IDs in
`.claude/registry.local.json`, so there are no false positives from a bundle that
happens to contain `app` followed by fourteen characters. Checks the build output
**and** every tracked file, which is what keeps the scrub from quietly undoing
itself.

**3 · Build-time environment leakage.** Anything named `VITE_*` is inlined
straight into client JavaScript by Vite. A secret in a `VITE_` variable is not a
configured secret, it is a published one. Also fails on a `.env` inside the build.

**4 · Dependencies.** `npm audit`. Critical and high fail the gate; moderate and
low warn.

**5 · Repository state.** A dirty working tree fails, because it means the thing
you tested and the thing you are about to deploy are different. Also confirms the
secret-bearing paths are still gitignored.

**6 · The live response** (`--url` only). Checks the URL against what it is *meant*
to be. `--expect public` (the default) fails on a login redirect; `--expect
protected` fails on a page that anyone can read. Both directions matter: a 200
from a Vercel SSO page looks exactly like a 200 from your site, and a production
URL you believe is protected can quietly be serving to the world — both have
already happened in this project. Then checks
`X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`, and a
`Content-Security-Policy` carrying `frame-ancestors`.

## Reading the result
Exit 0 and `CLEAR` means deploy. Exit 1 and `BLOCKED` means do not.

Warnings never block. They are things worth knowing that are not worth stopping
for, and if a warning matters it should become a failure rather than a habit.

## Overriding it
Sometimes a failure is wrong — a pattern misfires, an advisory has no reachable
path in a static site. Overriding is allowed. Overriding **silently** is not.

Say in your report which gate failed, what it said, and why you are shipping past
it. A gate that gets waved through without a sentence attached stops being a gate
within about two weeks.

## What this does not check
Say so plainly rather than implying coverage:

- The Airtable and Figma tokens themselves. They live in the Claude config, never
  in this repo, so nothing here can see them — and they are the credentials that
  actually matter.
- Vercel's project protection settings themselves. The gate sees the response, not
  the setting, so it catches a flip after the fact rather than before. Vercel's
  "Standard Protection" is worth knowing about here: it protects the hashed
  deployment URLs but leaves the assigned production domain public, so a project
  can read as protected in the dashboard and serve to anyone on its main URL.
- The dependency *supply chain* beyond published advisories. `npm audit` knows
  about disclosed vulnerabilities, not a package that turned malicious this
  morning.
- Anything about the Airtable base's own permissions or sharing.

## Never
- Never deploy on a red gate without writing down why.
- Never run it against a stale build. Build, then check, then deploy.
- Never widen a pattern to make a failure disappear. Fix the finding, or narrow
  the pattern with a comment explaining what it was matching by accident.
- Never treat `CLEAR` as proof the system is secure. It means these five specific
  mistakes are not present in this deploy.
