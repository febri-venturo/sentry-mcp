# Sentry MCP Plugin for Claude Code

Plugin ini menambahkan slash commands dan natural language support di Claude Code untuk berinteraksi langsung dengan Sentry error tracking (self-hosted maupun cloud).

## Fitur Utama

- 🗣️ **Natural Language** — tanya langsung: "apa saja error 1 jam terakhir?"
- 🔧 **Full Fix Workflow** — detect error → analyze stacktrace → fix code → resolve issue
- 💰 **Token Efficient** — output ringkas, default limit rendah, skip verbose data
- 🌐 **Framework Agnostic** — PHP, Golang, Node.js, Python, dll.
- 🏠 **Self-Hosted Support** — kompatibel dengan Sentry self-hosted

## Install

```bash
npx github:febri-venturo/sentry-mcp init
```

Installer akan menanyakan Sentry Host, Organization Slug, dan Project Slug, kemudian otomatis:
- Copy slash commands ke `.claude/commands/`
- Copy config ke `.claude/sentry-mcp.md`
- Copy `.mcp.json.example` sebagai template
- Menambahkan `.mcp.json` ke `.gitignore`

### Alternatif Install

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
| `/project:sentry-issues [query]` | List issues (support natural language) |
| `/project:sentry-detail <ID>` | Detail issue + stacktrace |
| `/project:sentry-fix [ID]` | **Full workflow**: detect → fix → resolve |
| `/project:sentry-resolve <ID> [action]` | Resolve, ignore, reopen |
| `/project:sentry-events [query]` | Search events/logs |
| `/project:sentry-releases [version]` | Lihat releases |
| `/project:sentry-docs` | Info dokumentasi Sentry SDK |
| `/project:sentry-help` | Daftar command |

## Natural Language

Selain slash commands, kamu bisa langsung bertanya menggunakan bahasa natural:

```
# Cek error
"apa saja error di sentry 1 jam terakhir?"
"tampilkan 3 error terbaru"
"ada warning apa aja hari ini?"

# Detail & fix
"lihat detail issue PROJECT-123"
"dimana letak error nya di kodinganku?"
"tolong fix error nya"

# Resolve
"resolve issue PROJECT-123"
"abaikan issue ini"
```

## Workflow: Error → Fix → Resolve

Flow paling umum yang didukung plugin ini:

```
1. "apa error terbaru?"          → list issues dari Sentry
2. "detail issue PROJECT-123"    → stacktrace + error location
3. "dimana errornya di kodeku?"  → buka file, tunjukkan line error
4. "tolong fix"                  → suggest & apply fix
5. "resolve issue nya"           → update status di Sentry
```

Atau cukup jalankan `/project:sentry-fix` untuk guided workflow.

## Token Efficiency

Plugin ini dioptimasi untuk hemat token:
- Default limit: **5 issues** (bukan 25)
- Output ringkas: hanya field penting
- Stacktrace: hanya application code frames
- Tidak menampilkan contoh usage kecuali diminta

## Konfigurasi

Config project ada di `.claude/sentry-mcp.md`:

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

## Catatan

- `sentry-docs` command tidak tersedia di Sentry self-hosted (fitur cloud only)
- `sentry-resolve` membutuhkan token dengan scope `issue:write`
- Seer AI analysis tidak tersedia di self-hosted (`MCP_DISABLE_SKILLS: seer`)
