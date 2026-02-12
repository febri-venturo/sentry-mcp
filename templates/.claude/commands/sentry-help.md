---
allowed-tools: Read
---

Baca `.claude/sentry-mcp.md` untuk config (Organization Slug, Project Slug, Region URL).

Tampilkan ringkas:

## Sentry MCP Commands

| Command | Deskripsi |
|---------|-----------|
| `/project:sentry-issues [query]` | List issues (support natural language) |
| `/project:sentry-detail <ID>` | Detail issue + stacktrace |
| `/project:sentry-fix [ID]` | Full workflow: detect → fix → resolve |
| `/project:sentry-resolve <ID> [action]` | Resolve, ignore, reopen |
| `/project:sentry-events [query]` | Search events/logs |
| `/project:sentry-releases [version]` | Lihat releases |
| `/project:sentry-help` | Bantuan ini |

**Tips**: Kamu juga bisa langsung bertanya natural language, contoh:
- "apa saja error 1 jam terakhir?"
- "tolong fix error login"
- "detail issue PROJECT-123"

Config: Organization=**ORG_SLUG**, Project=**PROJECT_SLUG**, Host=**REGION_URL** (dari `.claude/sentry-mcp.md`).
