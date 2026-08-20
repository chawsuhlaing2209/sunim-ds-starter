# reports/

Evidence a human reads. Every agent that produces a judgement commits it here,
and commits **only** here — an uncommitted file in the shared working tree turns
the next agent's deploy gate red for reasons it cannot judge, which has happened
twice.

| Path | Who writes it | What it is |
|---|---|---|
| `<Component>.md` | 🔍 QA | One file per test run, screenshots beside it |
| `registry-audit.md` | 📋 PM | The sweep, overwritten each time |
| `release-review/<Component>.md` | 🧭 Reviewer | The seven gates, and the verdict |
| `<Component>-intent.md` | 📝 Doc Generator | What the intent was written from, and any gap raised |

🔨 Engineer never writes here. 🚀 DevOps writes a deploy note and nothing else.
