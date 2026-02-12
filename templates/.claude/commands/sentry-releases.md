---
allowed-tools: mcp__sentry__find_releases, Read
---

Baca file `.claude/sentry-mcp.md` untuk mendapatkan nilai Organization Slug, Project Slug, dan Region URL.

Panggil `find_releases` dengan:
- organizationSlug: (dari config)
- projectSlug: (dari config)
- regionUrl: (dari config)
- query: "$ARGUMENTS" (jika ada, untuk filter versi tertentu)

Tampilkan daftar releases dengan versi, tanggal, dan informasi deployment.

Jika tidak ada releases, beritahu user bahwa release tracking belum dikonfigurasi. Sarankan untuk menambahkan opsi `release` pada Sentry SDK init di project mereka. Lihat dokumentasi: https://docs.sentry.io/product/releases/
