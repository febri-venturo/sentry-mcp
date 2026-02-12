# Sentry MCP Plugin for Claude Code

Plugin ini menambahkan slash commands di Claude Code untuk berinteraksi langsung dengan Sentry error tracking (self-hosted maupun cloud).

## Install

Jalankan di root project kamu:

```bash
npx github:febri-venturo/sentry-mcp init
```

Installer akan menanyakan:
1. **Sentry Host** — domain Sentry kamu (contoh: `sentry.company.com`)
2. **Organization Slug** — slug organisasi di Sentry
3. **Project Slug** — slug project di Sentry

Kemudian otomatis:
- Copy slash commands ke `.claude/commands/`
- Copy config ke `.claude/sentry-mcp.md`
- Copy `.mcp.json.example` sebagai template MCP config
- Copy `SENTRY-SETUP.md` sebagai panduan
- Menambahkan `.mcp.json` ke `.gitignore`

### Alternatif Install (jika npx gagal)

```bash
git clone https://github.com/febri-venturo/sentry-mcp.git /tmp/sentry-mcp
cd /path/to/your/project
node /tmp/sentry-mcp/bin/cli.js init
```

## Setelah Install

1. **Buat `.mcp.json`** dari template:
   ```bash
   cp .mcp.json.example .mcp.json
   ```

2. **Isi token** — edit `.mcp.json`, ganti `YOUR_SENTRY_ACCESS_TOKEN_HERE` dengan token dari Sentry:
   - Settings > User Auth Tokens > Create New Token
   - Scope: `project:read`, `event:read`, `issue:read`, `issue:write`, `org:read`, `team:read`

3. **Restart Claude Code**, lalu test:
   ```
   /project:sentry-help
   ```

> **Windows**: Jika MCP server gagal start, ganti `"command": "npx"` ke `"command": "npx.cmd"` di `.mcp.json`.

## Commands

| Command | Deskripsi |
|---------|-----------|
| `/project:sentry-issues [query]` | List unresolved issues |
| `/project:sentry-detail <ID>` | Detail issue + stacktrace |
| `/project:sentry-resolve <ID> <action>` | Resolve, ignore, atau reopen issue |
| `/project:sentry-events [query]` | Search events (errors, spans, logs) |
| `/project:sentry-releases [version]` | Lihat releases project |
| `/project:sentry-docs` | Info dokumentasi Sentry SDK |
| `/project:sentry-help` | Tampilkan daftar command |

## Contoh

```bash
# Lihat semua unresolved issues
/project:sentry-issues

# Filter error 24 jam terakhir
/project:sentry-issues level:error firstSeen:-24h

# Detail issue
/project:sentry-detail PROJECT-123

# Resolve issue
/project:sentry-resolve PROJECT-123 resolved

# Search error events
/project:sentry-events level:error
```

## Konfigurasi

Setelah install, config project ada di `.claude/sentry-mcp.md`:

```markdown
- **Organization Slug**: your-org
- **Project Slug**: your-project
- **Region URL**: https://your-sentry-host.com
```

Untuk ganti project, cukup edit file ini.

## Supported Platforms

Plugin ini bisa dipakai di project dengan framework apapun:
- PHP (Slim, Laravel)
- Golang
- JavaScript/Node (Express, Next.js)
- Python (Django, Flask)
- Dan lain-lain

Yang berubah per project hanya **Sentry Host**, **Organization Slug**, **Project Slug**, dan **token**.

## Catatan

- `sentry-docs` command tidak tersedia di Sentry self-hosted (fitur cloud only)
- `sentry-resolve` membutuhkan token dengan scope `issue:write`
- Seer AI analysis tidak tersedia di self-hosted (`MCP_DISABLE_SKILLS: seer`)
