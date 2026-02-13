---
allowed-tools: mcp__sentry__list_issues, Read
---

Baca `.claude/sentry-mcp.md` untuk config (Organization Slug, Project Slug, Region URL).

**PENTING: JANGAN gunakan `search_issues`** — selalu gunakan `list_issues`. Tool `search_issues` membutuhkan OpenAI API yang tidak tersedia di self-hosted dan akan error.

**Parse $ARGUMENTS:**
- Jika natural language (contoh: "5 error 1 jam terakhir"), terjemahkan ke Sentry query:
  - Angka → limit (default: 5)
  - "error/warning/fatal" → level:X
  - Waktu ("1 jam" → `lastSeen:-1h`, "24 jam" → `lastSeen:-24h`, "seminggu" → `lastSeen:-7d`)
- Jika Sentry query format, gunakan langsung
- Jika kosong → query: "is:unresolved", limit: 5

Panggil `list_issues` — **WAJIB** sertakan parameter dari config:
- `organizationSlug`: dari config
- `projectSlugOrId`: dari config (**WAJIB** — tanpa ini akan return issues dari SEMUA project!)
- `regionUrl`: dari config
- `query`, `sort`: "date", `limit`

**Format output** — tabel ringkas: Issue ID, Title, Level, Events, Last Seen.

Setelah tampilkan, tawarkan: "Mau lihat detail atau fix salah satu issue?"
