---
allowed-tools: mcp__sentry__list_issues, Read
---

Baca file `.claude/sentry-mcp.md` untuk mendapatkan nilai Organization Slug, Project Slug, dan Region URL.

Kemudian panggil tool `list_issues` dengan parameter:
- organizationSlug: (dari sentry-mcp.md)
- projectSlugOrId: (dari sentry-mcp.md)
- regionUrl: (dari sentry-mcp.md)
- query: "$ARGUMENTS" (jika kosong, gunakan "is:unresolved")
- sort: "date"
- limit: 25

Tampilkan hasil dalam format tabel yang jelas: Issue ID, Title, Events, Users, Last Seen.

Jika tidak ada arguments, tampilkan juga contoh filter yang bisa dipakai:
- `is:unresolved is:unassigned` - Belum resolved dan belum di-assign
- `level:error` - Hanya error level
- `firstSeen:-24h` - Issue baru dalam 24 jam terakhir
- `lastSeen:-1h` - Issue yang muncul dalam 1 jam terakhir
