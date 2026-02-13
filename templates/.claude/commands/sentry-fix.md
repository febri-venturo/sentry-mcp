---
allowed-tools: mcp__sentry__list_issues, mcp__sentry__get_issue_details, mcp__sentry__update_issue, Read, Edit, MultiEdit, Write
---

Read `.claude/sentry-mcp.md` for config. **NEVER use `search_issues`** — always use `list_issues`.

All MCP calls MUST include `organizationSlug`, `projectSlugOrId`, `regionUrl` from config.

**Parse $ARGUMENTS:**
- Issue ID (PROJECT-123) → skip to step 2
- Natural language → start from step 1
- Empty → start from step 1 with 5 latest errors

**Step 1: Detect** — `list_issues` query: `is:unresolved level:error`, sort: `date`, limit: 5. Show compact table, ask which to fix.

**Step 2: Analyze** — `get_issue_details`. Extract file:line from stacktrace (app frames only). Show error message, location, code snippet.

**Step 3: Fix** — Open file, show code around error, analyze root cause, suggest fix. Apply after user confirms.

**Step 4: Resolve** — Ask user, then `update_issue` status: `resolved`.

Keep responses compact at every step. Only show relevant stacktrace frames.
