# Sentry MCP Plugin - Setup Guide

Plugin ini menyediakan slash commands di Claude Code untuk berinteraksi langsung dengan Sentry error tracking.

## Prerequisites

- **Node.js >= 20** (cek: `node -v`)
- **Claude Code** (VSCode extension atau CLI)
- **Sentry access token** dari YOUR_SENTRY_HOST

## Setup

### Step 1: Konfigurasi .mcp.json

**Jika belum punya `.mcp.json`** — copy template:

```bash
cp .mcp.json.example .mcp.json
```

Edit `.mcp.json`, ganti `YOUR_SENTRY_ACCESS_TOKEN_HERE` dengan token asli.

**Jika sudah punya `.mcp.json`** (karena pakai MCP tools lain) — tambahkan config `sentry` ke dalam `mcpServers` yang sudah ada:

```json
{
  "mcpServers": {
    "existing-mcp-tool": { "..." },
    "sentry": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "@sentry/mcp-server",
        "--access-token=YOUR_SENTRY_ACCESS_TOKEN_HERE",
        "--host=YOUR_SENTRY_HOST"
      ],
      "env": {
        "MCP_DISABLE_SKILLS": "seer"
      }
    }
  }
}
```

> **Jangan replace** seluruh file jika sudah ada MCP lain — cukup tambahkan key `"sentry"` di dalam `mcpServers`.

> **Windows**: Jika MCP server gagal start, coba ganti `"command": "npx"` ke `"command": "npx.cmd"` di `.mcp.json`.

### Step 2: Cara Mendapatkan Token

1. Buka https://YOUR_SENTRY_HOST
2. Klik **Settings** > **User Auth Tokens** > **Create New Token**
3. Pilih scope yang dibutuhkan:
   - `project:read`
   - `event:read`
   - `issue:read` dan `issue:write`
   - `org:read`
   - `team:read`
   - `release:admin` (opsional, untuk fitur releases)
   - `member:read` (opsional, untuk assign issue)
4. Copy token yang dihasilkan

### Step 3: Pastikan .gitignore

Pastikan `.mcp.json` ada di `.gitignore` supaya token tidak ter-commit:

```
.mcp.json
```

### Step 4: Verifikasi

Restart Claude Code, lalu jalankan:

```
/project:sentry-help
```

Jika berhasil, akan tampil daftar command dan konfigurasi project kamu.

## Commands yang Tersedia

| Command | Deskripsi |
|---------|-----------|
| `/project:sentry-issues [query]` | List unresolved issues |
| `/project:sentry-detail <ID>` | Detail issue lengkap + stacktrace |
| `/project:sentry-resolve <ID> <action>` | Resolve, ignore, atau reopen issue |
| `/project:sentry-events [query]` | Search events (errors, spans, logs) |
| `/project:sentry-releases [version]` | Lihat releases project |
| `/project:sentry-docs <query>` | Cari dokumentasi Sentry SDK |
| `/project:sentry-help` | Tampilkan daftar command |

## Contoh Penggunaan

```
# Lihat semua unresolved issues
/project:sentry-issues

# Filter error dalam 24 jam terakhir
/project:sentry-issues level:error firstSeen:-24h

# Lihat detail issue tertentu
/project:sentry-detail PROJECT-123

# Resolve issue
/project:sentry-resolve PROJECT-123 resolved

# Search error events
/project:sentry-events level:error
```

## Konfigurasi

Config project ada di `.claude/sentry-mcp.md`. Untuk ganti project, edit file tersebut.

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| MCP server tidak muncul | Pastikan Node.js >= 20 (`node -v`). Restart Claude Code. |
| 403 Permission Denied | Token expired atau scope kurang. Buat token baru. |
| `npx` tidak ditemukan | Install Node.js atau jalankan `npm install -g @sentry/mcp-server`. |
| Windows: npx error | Ganti `"command": "npx"` ke `"command": "npx.cmd"` di `.mcp.json`. |
| Command tidak muncul | Pastikan file `.claude/commands/sentry-*.md` ada dan formatnya benar. |
