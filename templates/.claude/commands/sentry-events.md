---
allowed-tools: mcp__sentry__list_events, Read
---

Read `.claude/sentry-mcp.md` for config.

**Parse $ARGUMENTS:**
- Natural language → translate to params (time/level mapping from sentry-mcp.md)
- `--dataset=spans|logs|errors` → dataset (default: `errors`)
- `--period=1h|24h|7d` → statsPeriod (default: `24h`)
- Remaining text → query

Call `list_events` with `organizationSlug`, `projectSlug`, `regionUrl` from config + `dataset`, `query`, `statsPeriod`, `limit`: 10.

**Output**: compact table. If empty, show a few example queries.
