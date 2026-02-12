---
allowed-tools: mcp__sentry__update_issue, mcp__sentry__get_issue_details, Read
---

Baca file `.claude/sentry-mcp.md` untuk mendapatkan nilai Organization Slug dan Region URL.

Argument yang diberikan user: $ARGUMENTS

Parse arguments:
- Argument pertama: Issue ID (contoh: PROJECT-123)
- Argument kedua: Action - salah satu dari: resolved, ignored, unresolved

Mapping action:
- "resolved" atau "resolve" -> status: "resolved"
- "ignored" atau "ignore" -> status: "ignored"
- "unresolved" atau "reopen" -> status: "unresolved"

Jika hanya Issue ID tanpa action, panggil `get_issue_details` dulu untuk menampilkan status saat ini, lalu tanya user mau action apa.

Panggil `update_issue` dengan:
- organizationSlug: (dari config)
- regionUrl: (dari config)
- issueId: (argument pertama)
- status: (dari mapping action)

Konfirmasi hasilnya ke user.

Jika tidak ada argument, tampilkan cara pakai:
- `/project:sentry-resolve PROJECT-123 resolved` - Resolve issue
- `/project:sentry-resolve PROJECT-123 ignored` - Ignore issue
- `/project:sentry-resolve PROJECT-123 unresolved` - Reopen issue
