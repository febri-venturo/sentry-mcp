---
allowed-tools: mcp__sentry__update_issue, Read
---

Read `.claude/sentry-mcp.md` for config.

**Parse $ARGUMENTS:**
- Arg 1: Issue ID (PROJECT-123)
- Arg 2: Action mapping:
  - "resolved/resolve/done/fix" → status: `resolved`
  - "ignored/ignore/skip" → status: `ignored`
  - "unresolved/reopen" → status: `unresolved`
- Natural language → parse ID and action from sentence

No action given → default to `resolved`, confirm with user first.

Call `update_issue` with `organizationSlug`, `regionUrl`, `issueId`, `status`.
