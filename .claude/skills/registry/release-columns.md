# The release columns

Three columns carry a component from shipped to published, and they are the last
three cells in its life.

| Column | Owner | What it says |
|---|---|---|
| `Release Review` | 📦 Release | The report, at the commit it reviewed |
| `Release Verdict` | 📦 Release | `Cleared` or `Blocked`, from the seven gates |
| `Astro Link` | 🚀 DevOps | The page on the deployed reference site |

They answer a question no other column asks: **can this component's name go into a
public version.** Everything upstream checks it against its design; this checks it
against the next two years — the names, the exported surface, the promises.

They sit **after** `Completed`, because only a component that has shipped has
something to review. The seven gates are in
`.claude/skills/release-review/SKILL.md`.

Four things worth knowing:

- **Together, all three produce `Released`.** Separately, none of them changes
  anything. A `Cleared` verdict with no site link still reads `Completed`, which
  is the truth: reviewed, not published.
- **The verdict and its report are written together or not at all.** A verdict
  with no report behind it is an opinion in a cell.
- **The report link is pinned to a commit**, never a branch. A branch URL points
  at whatever the file says today, which is exactly what a review must not do.
- **📦 Release never writes `Astro Link`.** It prepares releases and never
  performs them, so a link written by the agent that proposed the release would be
  a claim rather than a record. 🚀 DevOps writes it, after opening the page.

A review goes stale on its own. `Last Modified` later than the commit the report
links to means the review is describing a component that has since changed, and no
formula catches it — that one is the sweep's to notice.
