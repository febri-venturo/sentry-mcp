---
allowed-tools: mcp__sentry__list_issues, mcp__sentry__get_issue_details, mcp__sentry__update_issue, Read, Edit, MultiEdit, Write
---

Baca `.claude/sentry-mcp.md` untuk config (Organization Slug, Project Slug, Region URL).

Command ini menjalankan workflow lengkap: **Detect → Analyze → Fix → Resolve**.

**PENTING**: Setiap MCP call WAJIB sertakan `organizationSlug`, `projectSlugOrId`, dan `regionUrl` dari config.

**Parse $ARGUMENTS:**
- Jika Issue ID (PROJECT-123) → langsung ke step 2
- Jika natural language ("fix error terbaru", "fix error login") → mulai dari step 1
- Jika kosong → mulai dari step 1 dengan 5 error terbaru

**Step 1: Detect**
Panggil `list_issues` dengan organizationSlug, **projectSlugOrId**, regionUrl, query: "is:unresolved level:error", sort: "date", limit: 5.
Tampilkan tabel ringkas (ID, Title, Last Seen), lalu tanya user mau fix yang mana.

**Step 2: Analyze**
Panggil `get_issue_details` untuk issue yang dipilih/diberikan.
Dari stacktrace, identifikasi file dan line number yang error di project ini (skip vendor/library frames).
Tampilkan ringkas: error message, file:line, snippet code.

**Step 3: Locate & Fix**
Buka file yang error di project. Tampilkan code di sekitar line error.
Analisis root cause, kemudian suggest fix. Terapkan fix setelah user konfirmasi.

**Step 4: Resolve**
Setelah fix diterapkan, tanya: "Fix sudah diterapkan. Mau resolve issue di Sentry?"
Jika ya, panggil `update_issue` status: "resolved".

**Hemat token**: Jangan tampilkan full stacktrace, hanya relevant frames. Jawab ringkas di setiap step.
