# Sentry MCP Configuration

- **Organization Slug**: YOUR_ORG_SLUG
- **Project Slug**: YOUR_PROJECT_SLUG
- **Region URL**: https://YOUR_SENTRY_HOST
- **Dashboard**: https://YOUR_SENTRY_HOST/organizations/YOUR_ORG_SLUG/issues/?project=YOUR_PROJECT_SLUG

## Required Parameters

**ALWAYS** include these in EVERY MCP tool call:
- `organizationSlug`: "YOUR_ORG_SLUG"
- `projectSlugOrId`: "YOUR_PROJECT_SLUG"
- `regionUrl`: "https://YOUR_SENTRY_HOST"

Never call MCP tools without `projectSlugOrId` — without it, Sentry returns issues from ALL projects.

## NEVER Use `search_issues`

`search_issues` requires an internal OpenAI API that fails on self-hosted Sentry (quota errors). **Always use `list_issues`** and translate natural language to Sentry query syntax manually:
- "latest errors" → query: `is:unresolved level:error`, sort: `date`
- "warnings today" → query: `is:unresolved level:warning lastSeen:-24h`
- "5 recent issues" → query: `is:unresolved`, sort: `date`, limit: `5`

## Natural Language Mapping

When user asks about errors/issues in any language, map to the correct MCP tool:

| Intent | Tool | Key Params |
|---|---|---|
| list/recent errors | `list_issues` | query, limit, sort |
| issue detail/stacktrace | `get_issue_details` | issueId or issueUrl |
| events/logs | `list_events` | query, dataset, statsPeriod |
| resolve/ignore/reopen | `update_issue` | issueId, status |
| releases | `find_releases` | query |

**Time mapping**: "1 hour" → `-1h`, "24 hours/today" → `-24h`, "1 week" → `-7d`, "1 month" → `-30d`
**Level mapping**: "error" → `level:error`, "warning" → `level:warning`, "fatal/crash" → `level:fatal`

## Fix Workflow (Detect → Analyze → Fix → Resolve)

When user asks to fix an error, follow these steps. **Wait for user confirmation** between major steps.

1. **Detect** — `list_issues` with `projectSlugOrId`
2. **Analyze** — `get_issue_details` for stacktrace, identify file:line
3. **Locate** — Open the file, show code around the error
4. **Fix** — Suggest and apply fix (ask user first)
5. **Resolve** — `update_issue` status:"resolved" after fix is applied

## Token Efficiency

- Default `limit: 5` (not 25) unless user asks for more
- Compact output: only Issue ID, Title, Level, Last Seen
- Stacktrace: only application code frames (skip vendor/library)
- Don't repeat config or instructions already shown
- Use `regionUrl` from this config — never ask user to re-enter

## Response Language

Always respond in the same language the user is using. If user writes in Indonesian, respond in Indonesian. If in English, respond in English. The instructions here are in English for token efficiency, but your responses should match the user's language.
