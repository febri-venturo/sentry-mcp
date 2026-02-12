---
allowed-tools: mcp__sentry__get_issue_details, Read
---

Baca `.claude/sentry-mcp.md` untuk config (Organization Slug, Region URL).

**Parse $ARGUMENTS:**
- URL (http...) → gunakan sebagai `issueUrl`
- Issue ID (PROJECT-123) → gunakan sebagai `issueId` + organizationSlug

Jika kosong, minta user berikan Issue ID.

Panggil `get_issue_details` dengan regionUrl dari config.

**Format output** (ringkas, hemat token):
1. **Summary**: Title, status, level, events count, first/last seen
2. **Stacktrace**: Hanya application code frames (skip vendor/library). Tampilkan file:line + snippet
3. **Link**: URL ke Sentry dashboard

Jika stacktrace menunjuk file di project ini, tawarkan: "Mau saya buka file errornya dan bantu fix?"
