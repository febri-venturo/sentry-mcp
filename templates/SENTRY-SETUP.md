# Sentry MCP Plugin - Setup Guide

Plugin ini menyediakan slash commands dan natural language support di Claude Code untuk berinteraksi langsung dengan Sentry error tracking.

## Prerequisites

- **Node.js >= 20** (cek: `node -v`)
- **Claude Code** (VSCode extension atau CLI)
- **Sentry access token** dari YOUR_SENTRY_HOST

## Setup

### Step 1: Konfigurasi .mcp.json

**Jika menggunakan installer** (`npx github:febri-venturo/sentry-mcp init`):

`.mcp.json` sudah otomatis dibuat oleh installer dengan konfigurasi yang benar.
Tidak perlu manual copy atau edit — token, host, dan OS sudah dikonfigurasi otomatis.

**Jika setup manual** — buat `.mcp.json` dengan format berikut:

```json
{
  "mcpServers": {
    "sentry": {
      "type": "stdio",
      "command": "npx",
      "args": ["@sentry/mcp-server"],
      "env": {
        "SENTRY_ACCESS_TOKEN": "your-token-here",
        "SENTRY_HOST": "YOUR_SENTRY_HOST",
        "MCP_DISABLE_SKILLS": "seer"
      }
    }
  }
}
```

> **Windows**: Installer otomatis mendeteksi OS. Jika setup manual di Windows, gunakan:
> ```json
> "command": "cmd",
> "args": ["/c", "npx", "@sentry/mcp-server"]
> ```

**Jika sudah punya `.mcp.json`** — installer akan otomatis merge config `sentry` ke dalam `mcpServers` yang sudah ada.

### Step 2: Cara Mendapatkan Token

1. Buka https://YOUR_SENTRY_HOST
2. Settings > User Auth Tokens > Create New Token
3. Scope: `project:read`, `event:read`, `issue:read`, `issue:write`, `org:read`, `team:read`
4. Copy token (akan diminta saat install)

### Step 3: Verifikasi

Restart Claude Code, lalu jalankan:

```
/project:sentry-help
```

## Commands

| Command | Deskripsi |
|---------|-----------|
| `/project:sentry-issues [query]` | List issues (support natural language) |
| `/project:sentry-detail <ID>` | Detail issue + stacktrace |
| `/project:sentry-fix [ID]` | Full workflow: detect → fix → resolve |
| `/project:sentry-resolve <ID> [action]` | Resolve, ignore, reopen |
| `/project:sentry-events [query]` | Search events/logs |
| `/project:sentry-releases [version]` | Lihat releases |
| `/project:sentry-help` | Bantuan |

## Natural Language

Selain slash commands, kamu bisa langsung bertanya:

```
"apa saja error 1 jam terakhir?"
"detail issue PROJECT-123"
"dimana letak errornya di kodinganku?"
"tolong fix error login"
"resolve issue PROJECT-123"
```

## Workflow: Error → Fix → Resolve

```
1. Tanya error terbaru    → list issues
2. Detail issue            → stacktrace + file location
3. Lokasi error di code    → buka file, tunjukkan line
4. Fix error               → suggest & apply
5. Resolve di Sentry       → update status
```

Gunakan `/project:sentry-fix` atau tanya langsung "tolong fix error terbaru".

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| MCP server tidak muncul | Pastikan Node.js >= 20. Restart Claude Code. |
| MCP server not connected | Cek token dan host di `.mcp.json`. Pastikan env var `SENTRY_ACCESS_TOKEN` benar. |
| 403 Permission Denied | Token expired atau scope kurang. Buat token baru. |
| Windows: npx error | Installer sudah otomatis handle. Jika manual, gunakan `"command": "cmd"` dengan `"args": ["/c", "npx", ...]`. |
| Command tidak muncul | Pastikan `.claude/commands/sentry-*.md` ada. |
