# Sentry MCP — Query Reference

**Dashboard**: https://YOUR_SENTRY_HOST/organizations/YOUR_ORG_SLUG/issues/?project=YOUR_PROJECT_SLUG

## Query Syntax

Translate natural language to Sentry query:
- "latest errors" → query: `is:unresolved level:error`, sort: `date`
- "warnings today" → query: `is:unresolved level:warning lastSeen:-24h`
- "5 recent issues" → query: `is:unresolved`, sort: `date`, limit: `5`

**Time**: "1 hour" → `-1h`, "24 hours/today" → `-24h`, "1 week" → `-7d`, "1 month" → `-30d`
**Level**: "error" → `level:error`, "warning" → `level:warning`, "fatal/crash" → `level:fatal`

## Tool Params

| Tool | Key Params |
|---|---|
| `list_issues` | query, limit, sort |
| `get_issue_details` | issueId or issueUrl |
| `list_events` | query, dataset, statsPeriod |
| `update_issue` | issueId, status |
| `find_releases` | query |

## Response Language

Always respond in the same language the user is using.
