---
allowed-tools: Read
---

Baca file `.claude/sentry-mcp.md` untuk mendapatkan konfigurasi Sentry project saat ini (Organization Slug, Project Slug, Region URL).

Kemudian tampilkan informasi berikut:

## Sentry MCP Commands

| Command | Deskripsi |
|---------|-----------|
| `/project:sentry-issues [query]` | List unresolved issues. Contoh: `/project:sentry-issues level:error` |
| `/project:sentry-detail <ID>` | Detail issue lengkap dengan stacktrace |
| `/project:sentry-resolve <ID> <action>` | Resolve, ignore, atau reopen issue |
| `/project:sentry-events [query]` | Search events (errors, spans, logs) |
| `/project:sentry-releases [version]` | Lihat releases project |
| `/project:sentry-docs <query>` | Cari dokumentasi Sentry SDK |
| `/project:sentry-help` | Tampilkan bantuan ini |

## Konfigurasi Saat Ini

Tampilkan nilai Organization Slug, Project Slug, dan Region URL yang dibaca dari `.claude/sentry-mcp.md`.
Tampilkan juga link ke Sentry dashboard project ini.
