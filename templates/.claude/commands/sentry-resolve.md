---
allowed-tools: mcp__sentry__update_issue, Read
---

Baca `.claude/sentry-mcp.md` untuk config (Organization Slug, Region URL).

**Parse $ARGUMENTS:**
- Arg 1: Issue ID (PROJECT-123)
- Arg 2: Action — mapping:
  - "resolved/resolve/selesai/fix/done" → status: "resolved"
  - "ignored/ignore/abaikan/skip" → status: "ignored"
  - "unresolved/reopen/buka" → status: "unresolved"
- Jika natural language ("resolve issue PROJECT-123"), parse ID dan action dari kalimat

Jika hanya Issue ID tanpa action, default ke "resolved" dan konfirmasi ke user.

Panggil `update_issue` dengan organizationSlug, regionUrl, issueId, status.

Konfirmasi singkat: "✅ Issue PROJECT-123 resolved."
