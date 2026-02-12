# Sentry MCP Configuration

- **Organization Slug**: YOUR_ORG_SLUG
- **Project Slug**: YOUR_PROJECT_SLUG
- **Region URL**: https://YOUR_SENTRY_HOST
- **Dashboard**: https://YOUR_SENTRY_HOST/organizations/YOUR_ORG_SLUG/issues/?project=YOUR_PROJECT_SLUG

## Natural Language Support

Ketika user bertanya tentang error, issue, atau bug menggunakan bahasa natural (Indonesia/English), terjemahkan ke MCP tool calls yang sesuai. Selalu gunakan `regionUrl` dari config di atas.

**Mapping natural language → tool:**
| Intent User | Tool | Parameter Kunci |
|---|---|---|
| error/issue/bug terbaru | `list_issues` | query, limit |
| detail issue / stacktrace | `get_issue_details` | issueId/issueUrl |
| event / log aktivitas | `list_events` | query, dataset, statsPeriod |
| resolve/selesaikan/abaikan | `update_issue` | issueId, status |
| release/deploy | `find_releases` | query |

**Mapping waktu:**
- "1 jam" → `-1h`, "24 jam/sehari" → `-24h`, "seminggu" → `-7d`, "sebulan" → `-30d`

**Mapping level:**
- "error" → `level:error`, "warning" → `level:warning`, "fatal/crash" → `level:fatal`

## Workflow: Error → Fix → Resolve

Jika user minta fix error, ikuti flow ini secara bertahap. **Jangan jalankan semua sekaligus** — tunggu konfirmasi user di setiap langkah utama.

1. **Detect** — `list_issues` untuk identifikasi error
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
