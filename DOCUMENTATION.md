# Sentry MCP Plugin for Claude Code
### Dokumentasi Lengkap — v1.0

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Masalah yang Diselesaikan](#2-masalah-yang-diselesaikan)
3. [Fitur Utama](#3-fitur-utama)
4. [Arsitektur Plugin](#4-arsitektur-plugin)
5. [Cara Kerja](#5-cara-kerja)
6. [Instalasi](#6-instalasi)
7. [Daftar Commands](#7-daftar-commands)
8. [Natural Language Support](#8-natural-language-support)
9. [Workflow: Error → Fix → Resolve](#9-workflow-error--fix--resolve)
10. [Token Efficiency](#10-token-efficiency)
11. [Keunggulan Plugin](#11-keunggulan-plugin)
12. [Perbandingan dengan Tools Lain](#12-perbandingan-dengan-tools-lain)
13. [Supported Platforms](#13-supported-platforms)
14. [Troubleshooting](#14-troubleshooting)
15. [Roadmap & Kontribusi](#15-roadmap--kontribusi)

---

## 1. Pendahuluan

**Sentry MCP Plugin** adalah plugin untuk Claude Code yang menghubungkan developer langsung ke Sentry error tracking tanpa perlu membuka browser. Plugin ini menggunakan teknologi **MCP (Model Context Protocol)** dari Anthropic untuk berkomunikasi antara Claude AI dan Sentry API.

### Apa itu MCP?

MCP (Model Context Protocol) adalah standar terbuka dari Anthropic yang memungkinkan AI assistant (seperti Claude) berinteraksi dengan tools dan services external. Dengan MCP, Claude bisa:
- Memanggil API external (Sentry, GitHub, dll.)
- Membaca dan menulis data
- Mengeksekusi workflow yang kompleks

### Apa itu Sentry?

Sentry adalah platform error tracking dan performance monitoring yang digunakan developer untuk:
- Menangkap error/exception secara real-time
- Melacak performance aplikasi
- Mendapatkan stacktrace lengkap saat error terjadi
- Memonitor health aplikasi di production

---

## 2. Masalah yang Diselesaikan

### Workflow Debugging Konvensional (Sebelum Plugin)

```
Developer melihat bug report
        ↓
Buka browser → login Sentry
        ↓
Cari issue yang relevan
        ↓
Buka detail issue, baca stacktrace
        ↓
Copy file path & line number
        ↓
Kembali ke code editor, buka file
        ↓
Analisis dan fix error
        ↓
Kembali ke browser Sentry
        ↓
Resolve issue secara manual
```

**Masalah**: Banyak context switching (editor ↔ browser), memakan waktu, dan rawan kehilangan konteks.

### Workflow dengan Plugin (Sesudah)

```
Developer langsung bertanya di Claude Code:
"apa saja error 1 jam terakhir?"
        ↓
Claude menampilkan list error
        ↓
"detail issue PROJECT-123"
        ↓
Claude menampilkan stacktrace + buka file error
        ↓
"tolong fix errornya"
        ↓
Claude fix code + resolve issue di Sentry
```

**Solusi**: Semua dilakukan dalam satu tempat (code editor), tanpa context switching.

---

## 3. Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🗣️ **Natural Language** | Tanya pakai bahasa Indonesia/English, tanpa perlu hafal format query Sentry |
| 🔧 **Full Fix Workflow** | Dari detect error sampai fix code dan resolve issue — semua dalam editor |
| 💰 **Token Efficient** | Output ringkas, default limit rendah, hemat biaya token AI |
| 🌐 **Framework Agnostic** | Bisa dipakai di project PHP, Golang, Node.js, Python, dll. |
| 🏠 **Self-Hosted Support** | Kompatibel dengan Sentry self-hosted dan Sentry Cloud |
| 📦 **Zero Dependencies** | Tidak ada dependency npm — ringan dan cepat install |
| ⚡ **One-Command Install** | Install cukup `npx github:febri-venturo/sentry-mcp init` |
| 🔒 **Secure by Default** | Token otomatis di-gitignore, tidak pernah ter-commit |

---

## 4. Arsitektur Plugin

### Struktur File

```
sentry-mcp/
├── bin/
│   └── cli.js                      # CLI installer
├── templates/
│   ├── .claude/
│   │   ├── sentry-mcp.md           # Config + NL instructions (otak plugin)
│   │   └── commands/
│   │       ├── sentry-issues.md    # List issues
│   │       ├── sentry-detail.md    # Detail + stacktrace
│   │       ├── sentry-fix.md       # Full workflow command
│   │       ├── sentry-resolve.md   # Resolve/ignore/reopen
│   │       ├── sentry-events.md    # Search events/logs
│   │       ├── sentry-releases.md  # Lihat releases
│   │       ├── sentry-docs.md      # Dokumentasi SDK
│   │       └── sentry-help.md      # Bantuan
│   ├── .mcp.json.example           # Template MCP config
│   └── SENTRY-SETUP.md             # Panduan setup
├── package.json
└── README.md
```

### Diagram Arsitektur

```
┌─────────────────────────────────────────────────┐
│                  DEVELOPER                       │
│  "apa error 1 jam terakhir?"                     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│              CLAUDE CODE (AI)                    │
│                                                  │
│  1. Baca .claude/sentry-mcp.md (config + rules) │
│  2. Terjemahkan natural language → Sentry query  │
│  3. Panggil MCP tool yang sesuai                 │
└──────────────────┬──────────────────────────────┘
                   │ MCP Protocol
                   ▼
┌─────────────────────────────────────────────────┐
│           SENTRY MCP SERVER                      │
│  (@sentry/mcp-server via npx)                    │
│                                                  │
│  - Terima request dari Claude                    │
│  - Panggil Sentry API dengan auth token          │
│  - Return data ke Claude                         │
└──────────────────┬──────────────────────────────┘
                   │ REST API
                   ▼
┌─────────────────────────────────────────────────┐
│         SENTRY (Self-Hosted / Cloud)             │
│                                                  │
│  - Issues, Events, Stacktraces                   │
│  - Releases, Tags, Statistics                    │
└─────────────────────────────────────────────────┘
```

### Peran Setiap Komponen

| Komponen | Peran |
|----------|-------|
| **Plugin (sentry-mcp)** | Installer yang meng-copy config + slash commands ke project |
| **sentry-mcp.md** | "Otak" plugin — berisi config, NL instructions, workflow rules |
| **Slash Commands** | Template instruksi untuk setiap action (issues, detail, fix, dll.) |
| **Claude Code** | AI yang membaca instruksi dan melakukan aksi |
| **@sentry/mcp-server** | MCP server official dari Sentry untuk bridge ke API |
| **Sentry** | Platform error tracking yang menyimpan data error |

---

## 5. Cara Kerja

### Alur Natural Language → Action

```
User: "tampilkan 3 error terakhir"

Step 1: Claude baca .claude/sentry-mcp.md
        → Dapat config: org, project, host
        → Dapat NL mapping rules

Step 2: Claude parsing natural language
        → "3" = limit: 3
        → "error" = level:error
        → "terakhir" = sort: date

Step 3: Claude panggil MCP tool
        → list_issues(org, project, regionUrl,
           query: "level:error",
           sort: "date", limit: 3)

Step 4: MCP Server call Sentry API
        → GET /api/0/projects/{org}/{project}/issues/
           ?query=level:error&sort=date&limit=3

Step 5: Claude format & tampilkan hasil
        → Tabel ringkas: Issue ID, Title, Level, Last Seen
```

### Alur Slash Command

```
User: /project:sentry-issues level:error lastSeen:-1h

Step 1: Claude baca sentry-issues.md (command template)
Step 2: Claude baca sentry-mcp.md (config)
Step 3: Claude panggil list_issues dengan parameter
Step 4: Tampilkan hasil
```

---

## 6. Instalasi

### Prasyarat

- **Node.js >= 20** (`node -v` untuk cek)
- **Claude Code** (VSCode extension atau CLI)
- **Sentry instance** (self-hosted atau cloud)

### Langkah Install

```bash
# 1. Jalankan di root project
npx github:febri-venturo/sentry-mcp init

# 2. Isi config yang ditanyakan:
#    - Sentry Host (contoh: sentry.company.com)
#    - Organization Slug
#    - Project Slug

# 3. Buat .mcp.json dari template
cp .mcp.json.example .mcp.json

# 4. Edit .mcp.json, isi token Sentry
#    Ganti YOUR_SENTRY_ACCESS_TOKEN_HERE

# 5. Restart Claude Code, lalu test
/project:sentry-help
```

### Cara Mendapatkan Token Sentry

1. Buka Sentry → **Settings** → **User Auth Tokens** → **Create New Token**
2. Pilih scope:
   - `project:read` — baca data project
   - `event:read` — baca events/errors
   - `issue:read` — baca issues
   - `issue:write` — resolve/ignore issues
   - `org:read` — baca data organisasi
   - `team:read` — baca data team
3. Copy token ke `.mcp.json`

### File yang Di-generate

Setelah install, file berikut akan ter-copy ke project:

| File | Fungsi |
|------|--------|
| `.claude/sentry-mcp.md` | Config + NL instructions |
| `.claude/commands/sentry-*.md` | 8 slash commands |
| `.mcp.json.example` | Template MCP config |
| `SENTRY-SETUP.md` | Panduan setup |

---

## 7. Daftar Commands

### Tabel Commands

| Command | Deskripsi | Contoh |
|---------|-----------|--------|
| `/project:sentry-issues` | List issues | `/project:sentry-issues level:error` |
| `/project:sentry-detail` | Detail + stacktrace | `/project:sentry-detail PROJECT-123` |
| `/project:sentry-fix` | Full workflow: detect → fix → resolve | `/project:sentry-fix PROJECT-123` |
| `/project:sentry-resolve` | Resolve, ignore, reopen | `/project:sentry-resolve PROJECT-123 resolved` |
| `/project:sentry-events` | Search events/logs | `/project:sentry-events level:error` |
| `/project:sentry-releases` | Lihat releases | `/project:sentry-releases` |
| `/project:sentry-docs` | Dokumentasi SDK | `/project:sentry-docs` |
| `/project:sentry-help` | Daftar command | `/project:sentry-help` |

### Detail Setiap Command

#### `/project:sentry-issues [query]`
- **Fungsi**: Menampilkan daftar issues dari Sentry
- **Default**: 5 unresolved issues terbaru
- **Filter**: `level:error`, `lastSeen:-1h`, `firstSeen:-24h`, `is:unassigned`
- **Output**: Tabel ringkas (Issue ID, Title, Level, Events, Last Seen)

#### `/project:sentry-detail <ID>`
- **Fungsi**: Menampilkan detail lengkap sebuah issue
- **Input**: Issue ID (PROJECT-123) atau URL Sentry
- **Output**: Summary, stacktrace (application frames only), link dashboard

#### `/project:sentry-fix [ID]`
- **Fungsi**: Full workflow dari detect sampai resolve
- **Tanpa ID**: Mulai dari list 5 error terbaru
- **Dengan ID**: Langsung ke analisis dan fix
- **Flow**: Detect → Analyze → Locate file → Fix code → Resolve

#### `/project:sentry-resolve <ID> [action]`
- **Fungsi**: Update status issue di Sentry
- **Actions**: resolved, ignored, unresolved (reopen)
- **Default**: Jika tanpa action, default ke resolved

#### `/project:sentry-events [query]`
- **Fungsi**: Search raw events (errors, spans, logs)
- **Flags**: `--dataset=errors|spans|logs`, `--period=1h|24h|7d`
- **Default**: Error events 24 jam terakhir

---

## 8. Natural Language Support

### Konsep

Plugin ini mendukung interaksi menggunakan **bahasa natural** (Indonesia & English). Developer tidak perlu menghafal format query Sentry — cukup bertanya seperti biasa.

### Mapping Natural Language → Sentry Query

| Bahasa User | Diterjemahkan Menjadi |
|---|---|
| "error", "bug", "masalah" | `level:error` |
| "warning", "peringatan" | `level:warning` |
| "fatal", "crash" | `level:fatal` |
| "1 jam terakhir" | `lastSeen:-1h` |
| "24 jam", "hari ini" | `lastSeen:-24h` |
| "seminggu" | `lastSeen:-7d` |
| "sebulan" | `lastSeen:-30d` |
| "3 error" | `limit: 3` |
| "resolve", "selesaikan" | `status: resolved` |
| "abaikan", "ignore" | `status: ignored` |
| "buka lagi", "reopen" | `status: unresolved` |

### Contoh Interaksi Natural Language

```
👤 "apa saja error di sentry 1 jam terakhir?"
🤖 [Menampilkan tabel 5 error terbaru dalam 1 jam]

👤 "detail issue PROJECT-123"
🤖 [Menampilkan stacktrace, error message, file location]

👤 "dimana letak errornya di kodinganku?"
🤖 [Membuka file, menunjukkan line yang error]

👤 "tolong fix errornya"
🤖 [Menganalisis root cause, suggest fix, apply setelah konfirmasi]

👤 "resolve issue-nya"
🤖 ✅ Issue PROJECT-123 resolved.
```

### Contoh Interaksi Lanjutan

```
👤 "ada warning apa aja hari ini?"
🤖 [list_issues query: "level:warning lastSeen:-24h"]

👤 "tampilkan 10 error terbaru"
🤖 [list_issues limit: 10, query: "level:error"]

👤 "cek log aktivitas untuk endpoint /api/login"
🤖 [list_events query: "url:/api/login"]

👤 "abaikan issue PROJECT-456"
🤖 ✅ Issue PROJECT-456 ignored.
```

---

## 9. Workflow: Error → Fix → Resolve

### Flow Lengkap

Ini adalah flow paling umum yang didukung plugin ini. Bisa dijalankan via `/project:sentry-fix` atau bahasa natural step-by-step.

```
┌──────────────────────────────────────────────┐
│  STEP 1: DETECT                              │
│  "apa error terbaru?"                        │
│  → list 5 unresolved errors dari Sentry      │
│  → Tampilkan tabel ringkas                   │
└──────────────────┬───────────────────────────┘
                   ↓
┌──────────────────────────────────────────────┐
│  STEP 2: ANALYZE                             │
│  "detail issue PROJECT-123"                  │
│  → Get issue details + stacktrace            │
│  → Identifikasi file:line yang error         │
│  → Tampilkan error message + app frames      │
└──────────────────┬───────────────────────────┘
                   ↓
┌──────────────────────────────────────────────┐
│  STEP 3: LOCATE                              │
│  "dimana errornya di kodeku?"                │
│  → Buka file yang error di project           │
│  → Tampilkan code di sekitar line error      │
│  → Highlight root cause                      │
└──────────────────┬───────────────────────────┘
                   ↓
┌──────────────────────────────────────────────┐
│  STEP 4: FIX                                 │
│  "tolong fix errornya"                       │
│  → Analisis root cause                       │
│  → Suggest perbaikan code                    │
│  → Apply fix setelah user konfirmasi         │
└──────────────────┬───────────────────────────┘
                   ↓
┌──────────────────────────────────────────────┐
│  STEP 5: RESOLVE                             │
│  "resolve issue-nya di sentry"               │
│  → Update issue status ke "resolved"         │
│  → ✅ Konfirmasi selesai                     │
└──────────────────────────────────────────────┘
```

### Prinsip Workflow

- **Step-by-step** — Claude tidak menjalankan semua sekaligus, menunggu konfirmasi user di setiap langkah penting
- **Kontekstual** — setiap step mempertimbangkan hasil dari step sebelumnya
- **Reversible** — jika fix salah, issue bisa di-reopen

---

## 10. Token Efficiency

### Apa itu Token?

Token adalah satuan pemrosesan teks di AI. Semakin banyak token yang dipakai, semakin tinggi biaya dan semakin lambat respons. Oleh karena itu, plugin ini dioptimasi untuk meminimalkan penggunaan token.

### Strategi Hemat Token

| Strategi | Implementasi | Dampak |
|----------|-------------|--------|
| **Default limit rendah** | 5 issues (bukan 25) | Mengurangi data yang diproses |
| **Output ringkas** | Hanya field penting (ID, Title, Level, Last Seen) | Mengurangi token output |
| **Skip vendor frames** | Stacktrace hanya application code | Mengurangi 60-80% data stacktrace |
| **No auto tag fetch** | Tag detail hanya jika diminta | Menghilangkan 1 API call per issue |
| **Compact instructions** | Template command lebih pendek | Mengurangi token instruksi |
| **No contoh usage** | Contoh hanya ditampilkan jika diminta | Mengurangi output yang tidak perlu |

### Perbandingan Token Usage

```
SEBELUM (tanpa optimasi):
  list 25 issues × full detail per issue      = ~2000 tokens
  stacktrace lengkap (termasuk vendor)         = ~1500 tokens
  auto fetch tags (environment, url, browser)  = ~800 tokens
  contoh usage setiap command                  = ~300 tokens
  TOTAL per interaksi                          ≈ ~4600 tokens

SESUDAH (dengan optimasi):
  list 5 issues × ringkas                      = ~400 tokens
  stacktrace app frames only                   = ~300 tokens
  no auto tag fetch                            = 0 tokens
  no contoh usage                              = 0 tokens
  TOTAL per interaksi                          ≈ ~700 tokens

PENGHEMATAN: ~85% lebih hemat token per interaksi
```

---

## 11. Keunggulan Plugin

### 1. Zero Dependencies
Tidak ada package npm yang perlu di-install. Plugin hanya menggunakan modul bawaan Node.js (`fs`, `path`, `readline`). Ini berarti:
- Tidak ada risiko security vulnerability dari third-party
- Install sangat cepat (< 3 detik)
- Tidak ada `node_modules` yang membengkak

### 2. One-Command Installation
```bash
npx github:febri-venturo/sentry-mcp init
```
Satu perintah, semua file ter-setup. Tidak perlu manual copy-paste.

### 3. Framework Agnostic
Bisa dipakai di project apapun:
- PHP (Laravel, Slim, CodeIgniter)
- Golang (Gin, Echo, Fiber)
- JavaScript/Node (Express, Next.js, Nest)
- Python (Django, Flask, FastAPI)
- Dan framework lainnya

Yang berubah hanya konfigurasi (host, org, project, token).

### 4. Self-Hosted Support
Banyak tools hanya mendukung Sentry Cloud. Plugin ini **eksplisit mendukung self-hosted Sentry** dengan:
- Custom host configuration
- Auto-disable Seer AI (fitur cloud-only)
- Kompatibel dengan Sentry versi on-premise

### 5. Natural Language Support
Developer bisa berinteraksi menggunakan bahasa sehari-hari tanpa perlu menghafal format query.

### 6. Secure by Default
- Token disimpan di `.mcp.json` yang otomatis di-gitignore
- Template `.mcp.json.example` aman untuk di-commit
- Tidak ada hardcoded credentials

### 7. Token Efficient
Output dioptimasi untuk hemat token — ~85% lebih hemat dibanding tanpa optimasi.

### 8. Full Fix Workflow
Satu-satunya plugin yang mendukung workflow lengkap dari detect error sampai fix code dan resolve issue, semua dalam editor.

---

## 12. Perbandingan dengan Tools Lain

| Fitur | Sentry MCP Plugin | Sentry Dashboard (Browser) | Sentry Seer AI | VS Code Sentry Extension |
|-------|-------|-------|-------|-------|
| List issues | ✅ | ✅ | ❌ | ✅ |
| Detail + stacktrace | ✅ | ✅ | ✅ | ✅ |
| Natural language | ✅ | ❌ | ❌ | ❌ |
| Fix code langsung | ✅ | ❌ | ❌ | ❌ |
| Resolve dari editor | ✅ | ✅ (browser) | ❌ | ✅ |
| Baca project code | ✅ | ❌ | ❌ | ✅ |
| Root cause analysis | ✅ (Claude) | ❌ | ✅ | ❌ |
| Full fix workflow | ✅ | ❌ | ❌ | ❌ |
| Self-hosted support | ✅ | ✅ | ❌ | ✅ |
| Token efficient | ✅ | N/A | N/A | N/A |
| Zero context switch | ✅ | ❌ | ❌ | ✅ |

### Keunggulan Utama vs Semua Tools

1. **Satu-satunya yang bisa fix code langsung** — tools lain hanya menampilkan error, developer tetap harus fix manual
2. **Natural language** — tidak ada tools lain yang mendukung interaksi bahasa natural
3. **Full workflow** — dari detect sampai resolve, semua dalam satu tempat

---

## 13. Supported Platforms

### Sentry Instance
- ✅ Sentry Self-Hosted (semua versi)
- ✅ Sentry Cloud (sentry.io)

### Bahasa / Framework
| Bahasa | Framework | Status |
|--------|-----------|--------|
| PHP | Laravel, Slim, CodeIgniter, Yii | ✅ |
| Golang | Gin, Echo, Fiber, Standard | ✅ |
| JavaScript | Express, Next.js, Nest, Nuxt | ✅ |
| TypeScript | All JS frameworks | ✅ |
| Python | Django, Flask, FastAPI | ✅ |
| Java | Spring Boot | ✅ |
| Ruby | Rails | ✅ |
| C# | .NET | ✅ |
| Dart | Flutter | ✅ |

### Operating System
- ✅ Windows (dengan workaround `npx.cmd`)
- ✅ macOS
- ✅ Linux

---

## 14. Troubleshooting

| Masalah | Kemungkinan Penyebab | Solusi |
|---------|---------------------|--------|
| MCP server tidak muncul | Node.js < 20 | Update Node.js ke v20+ |
| MCP server tidak muncul | Claude Code belum restart | Restart Claude Code |
| 403 Permission Denied | Token expired | Buat token baru di Sentry |
| 403 Permission Denied | Scope kurang | Pastikan semua scope terpenuhi |
| Command tidak muncul | File command belum ter-copy | Jalankan install ulang |
| Windows: npx error | PowerShell issue | Ganti `"npx"` → `"npx.cmd"` di `.mcp.json` |
| Seer error | Self-hosted tidak support | Pastikan `MCP_DISABLE_SKILLS: seer` ada |
| Issues kosong | Project slug salah | Cek `.claude/sentry-mcp.md`, pastikan slug benar |

---

## 15. Roadmap & Kontribusi

### Rencana Pengembangan

| Fitur | Status | Target |
|-------|--------|--------|
| Natural language support | ✅ Done | v1.0 |
| Token efficiency | ✅ Done | v1.0 |
| Full fix workflow (sentry-fix) | ✅ Done | v1.0 |
| Multi-project support | 🔜 Planned | v1.1 |
| Auto-assign issue ke developer | 🔜 Planned | v1.1 |
| Performance monitoring | 🔜 Planned | v1.2 |
| Alert integration | 🔜 Planned | v1.2 |

### Kontribusi

Repository: [github.com/febri-venturo/sentry-mcp](https://github.com/febri-venturo/sentry-mcp)

```bash
# Clone repository
git clone https://github.com/febri-venturo/sentry-mcp.git

# Test install di project lokal
cd /path/to/your/project
node /path/to/sentry-mcp/bin/cli.js init
```

---

## Ringkasan

**Sentry MCP Plugin** memungkinkan developer:
1. 🗣️ Bertanya tentang error menggunakan bahasa natural
2. 🔍 Melihat detail error dan stacktrace langsung di editor
3. 🔧 Fix code dengan bantuan AI — tanpa buka browser
4. ✅ Resolve issue di Sentry — tanpa context switching
5. 💰 Hemat token AI — output ringkas dan efisien

> **"Dari error ke fix dalam hitungan menit, bukan jam."**

---

*Dokumentasi ini dibuat untuk detail plugins. Untuk panduan teknis, lihat README.md dan SENTRY-SETUP.md di repository.*

*Author: Febri — MIT License*
