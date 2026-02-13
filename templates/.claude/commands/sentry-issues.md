---
allowed-tools: mcp__sentry__list_issues
---

**Parse $ARGUMENTS:**
- Number → limit (default: 5)
- "error/warning/fatal" → `level:X`
- Time ("1 hour" → `lastSeen:-1h`, "24h/today" → `lastSeen:-24h`, "week" → `lastSeen:-7d`)
- Sentry query format → use directly
- Empty → query: `is:unresolved`, limit: 5

Call `list_issues` with `organizationSlug`, `projectSlugOrId`, `regionUrl` + `query`, `sort`: "date", `limit`.

**Output**: compact table — Issue ID, Title, Level, Events, Last Seen. Then offer detail or fix.
