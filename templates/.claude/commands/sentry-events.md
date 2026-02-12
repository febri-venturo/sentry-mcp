---
allowed-tools: mcp__sentry__list_events, Read
---

Baca `.claude/sentry-mcp.md` untuk config (Organization Slug, Project Slug, Region URL).

**Parse $ARGUMENTS:**
- Natural language: terjemahkan ke parameter (lihat mapping waktu dan level di sentry-mcp.md)
  - Contoh: "error logs 1 jam terakhir" → dataset: "errors", query: "level:error", statsPeriod: "1h"
- `--dataset=spans|logs|errors` → dataset (default: "errors")
- `--period=1h|24h|7d` → statsPeriod (default: "24h")
- Sisa text → query

Panggil `list_events` — **WAJIB** sertakan parameter dari config:
- `organizationSlug`: dari config
- `projectSlug`: dari config (**WAJIB** — tanpa ini akan return events dari SEMUA project!)
- `regionUrl`: dari config
- `dataset`, `query`, `statsPeriod`, `limit`: 10

**Format output** — tabel ringkas. Jika kosong, tampilkan 3 contoh singkat.
