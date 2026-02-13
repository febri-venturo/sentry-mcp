---
allowed-tools: mcp__sentry__get_issue_details, Read
---

**Parse $ARGUMENTS:**
- URL → use as `issueUrl`
- Issue ID (PROJECT-123) → use as `issueId` + `organizationSlug`
- Empty → ask user for Issue ID

Call `get_issue_details` with `regionUrl` from config.

**Output** (compact):
1. **Summary**: title, status, level, events count, first/last seen
2. **Stacktrace**: app code frames only (skip vendor/library), show file:line + snippet
3. **Link**: Sentry dashboard URL

If stacktrace points to a file in this project, offer to open and help fix it.
