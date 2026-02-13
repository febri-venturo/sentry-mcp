# Sentry MCP Configuration

- **Organization Slug**: YOUR_ORG_SLUG
- **Project Slug**: YOUR_PROJECT_SLUG
- **Region URL**: https://YOUR_SENTRY_HOST
- **Dashboard**: https://YOUR_SENTRY_HOST/organizations/YOUR_ORG_SLUG/issues/?project=YOUR_PROJECT_SLUG

## PENTING: Parameter Wajib

**SELALU** gunakan parameter berikut di SETIAP MCP tool call:
- `organizationSlug`: "YOUR_ORG_SLUG"
- `projectSlugOrId`: "YOUR_PROJECT_SLUG"
- `regionUrl`: "https://YOUR_SENTRY_HOST"

Jangan pernah panggil MCP tool tanpa `projectSlugOrId` — tanpa parameter ini, Sentry akan mengembalikan issues dari SEMUA project di organization.

## DILARANG: Jangan Pakai `search_issues`

**JANGAN PERNAH** gunakan tool `search_issues`. Tool ini membutuhkan OpenAI API internal yang tidak tersedia di self-hosted Sentry dan sering gagal karena quota limit.

**SELALU** gunakan `list_issues` sebagai gantinya. Terjemahkan natural language dari user menjadi Sentry query syntax secara manual:
- "error terbaru" → query: `is:unresolved level:error`, sort: `date`
- "warning hari ini" → query: `is:unresolved level:warning lastSeen:-24h`
- "5 issue terakhir" → query: `is:unresolved`, sort: `date`, limit: `5`

Ini berlaku untuk semua konteks — baik slash command maupun natural language prompt.

## Natural Language Support

Ketika user bertanya tentang error, issue, atau bug menggunakan bahasa natural (Indonesia/English), terjemahkan ke MCP tool calls yang sesuai.

**Mapping natural language → tool:**
| Intent User | Tool | Parameter Kunci |
|---|---|---|
| error/issue/bug terbaru | `list_issues` | organizationSlug, **projectSlugOrId**, regionUrl, query, limit |
| detail issue / stacktrace | `get_issue_details` | organizationSlug, regionUrl, issueId/issueUrl |
| event / log aktivitas | `list_events` | organizationSlug, **projectSlug**, regionUrl, query, dataset, statsPeriod |
| resolve/selesaikan/abaikan | `update_issue` | organizationSlug, regionUrl, issueId, status |
| release/deploy | `find_releases` | organizationSlug, **projectSlug**, regionUrl, query |

**Mapping waktu:**
- "1 jam" → `-1h`, "24 jam/sehari" → `-24h`, "seminggu" → `-7d`, "sebulan" → `-30d`

**Mapping level:**
- "error" → `level:error`, "warning" → `level:warning`, "fatal/crash" → `level:fatal`

## Workflow: Error → Fix → Resolve

Jika user minta fix error, ikuti flow ini secara bertahap. **Jangan jalankan semua sekaligus** — tunggu konfirmasi user di setiap langkah utama.

1. **Detect** — `list_issues` (dengan `projectSlugOrId`) untuk identifikasi error
2. **Analyze** — `get_issue_details` untuk stacktrace, identifikasi file:line di project
3. **Locate** — Buka file yang error, tampilkan code sekitar error
4. **Fix** — Suggest dan apply fix (minta konfirmasi user)
5. **Resolve** — `update_issue` status:"resolved" setelah fix diterapkan

## Token Efficiency Rules

- Gunakan `limit: 5` sebagai default (bukan 25) kecuali user minta lebih
- Tampilkan output dalam format ringkas: Issue ID, Title, Level, Last Seen. Tidak perlu semua field
- Untuk stacktrace, tampilkan hanya frame dari application code (skip vendor/library frames)
- Jangan ulangi instruksi atau config yang sudah ditampilkan sebelumnya
- Jika user hanya bertanya, jawab langsung tanpa contoh penggunaan command
- Gunakan `regionUrl` dari config ini — jangan minta user input ulang
