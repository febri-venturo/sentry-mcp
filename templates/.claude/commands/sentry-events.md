---
allowed-tools: mcp__sentry__list_events, Read
---

Baca file `.claude/sentry-mcp.md` untuk mendapatkan nilai Organization Slug, Project Slug, dan Region URL.

Argument yang diberikan user: $ARGUMENTS

Parse arguments:
- Jika ada `--dataset=spans` atau `--dataset=logs`, gunakan dataset tersebut dan hapus dari query
- Jika ada `--period=24h` (atau nilai lain), gunakan sebagai statsPeriod dan hapus dari query
- Default dataset: "errors"
- Default period: "14d"
- Sisa text menjadi query string

Panggil `list_events` dengan:
- organizationSlug: (dari config)
- projectSlug: (dari config)
- regionUrl: (dari config)
- dataset: (parsed atau default "errors")
- query: (sisa arguments, atau kosong untuk semua)
- statsPeriod: (parsed atau default "14d")
- limit: 20

Tampilkan hasil dalam format yang jelas.

Jika tidak ada argument, tampilkan contoh penggunaan:
- `/project:sentry-events level:error` - Error events terbaru
- `/project:sentry-events --dataset=spans span.op:http.client` - HTTP spans
- `/project:sentry-events --period=24h message:"timeout"` - Timeout dalam 24 jam
- `/project:sentry-events --dataset=logs log.level:error` - Error logs
