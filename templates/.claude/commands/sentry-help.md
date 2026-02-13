---
allowed-tools: Read
---

Read `.claude/sentry-mcp.md` for config, then show:

## Sentry MCP Commands

| Command | Description |
|---------|-------------|
| `/project:sentry-issues [query]` | List issues (supports natural language) |
| `/project:sentry-detail <ID>` | Issue detail + stacktrace |
| `/project:sentry-fix [ID]` | Full workflow: detect → fix → resolve |
| `/project:sentry-resolve <ID> [action]` | Resolve, ignore, reopen |
| `/project:sentry-events [query]` | Search events/logs |
| `/project:sentry-releases [version]` | List releases |
| `/project:sentry-help` | This help |

You can also ask in natural language, e.g.: "show recent errors", "fix error in login", "detail issue PROJECT-123".
