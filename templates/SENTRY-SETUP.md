# Sentry MCP Plugin - Setup Guide

Plugin ini menyediakan slash commands dan natural language support di Claude Code untuk berinteraksi langsung dengan Sentry error tracking.

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

**Jika sudah punya `.mcp.json`** — tambahkan config `sentry` ke dalam `mcpServers`:

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

> **Windows**: Jika MCP server gagal start, ganti `"command": "npx"` ke `"command": "npx.cmd"`.

### Step 2: Cara Mendapatkan Token

1. Buka https://YOUR_SENTRY_HOST
2. Settings > User Auth Tokens > Create New Token
3. Scope: `project:read`, `event:read`, `issue:read`, `issue:write`, `org:read`, `team:read`
4. Copy token

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
| 403 Permission Denied | Token expired atau scope kurang. Buat token baru. |
| Windows: npx error | Ganti `"command": "npx"` ke `"command": "npx.cmd"`. |
| Command tidak muncul | Pastikan `.claude/commands/sentry-*.md` ada. |
