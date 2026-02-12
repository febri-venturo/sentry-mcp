---
allowed-tools: mcp__sentry__get_issue_details, mcp__sentry__get_issue_tag_values, Read
---

Baca file `.claude/sentry-mcp.md` untuk mendapatkan nilai Organization Slug dan Region URL.

Argument yang diberikan user: $ARGUMENTS

Jika argument berupa URL (dimulai dengan http), gunakan sebagai `issueUrl` langsung.
Jika argument berupa Issue ID (contoh: PROJECT-123), gunakan sebagai `issueId` dengan organizationSlug dari config.

Panggil `get_issue_details` dengan parameter yang sesuai dan regionUrl dari config.

Setelah mendapat detail issue, panggil juga `get_issue_tag_values` untuk tag "environment" dan "url" agar tahu distribusi error.

Tampilkan hasil dengan format:
1. **Summary**: title, status, level, first/last seen, jumlah event
2. **Stacktrace**: highlight frame dari application code
3. **Distribusi**: environment dan URL yang terdampak
4. **Link**: URL langsung ke issue di Sentry dashboard

Jika tidak ada argument, beritahu user cara pakai:
`/project:sentry-detail PROJECT-123`
`/project:sentry-detail <sentry-issue-url>`
