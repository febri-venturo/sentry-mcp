#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const PROJECT_DIR = process.cwd();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function updateAllFiles(dir, replacements) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      updateAllFiles(fullPath, replacements);
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.json') || entry.name.endsWith('.example')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      for (const [search, replace] of Object.entries(replacements)) {
        content = content.replace(new RegExp(search, 'g'), replace);
      }
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

function addToGitignore(entry) {
  const gitignorePath = path.join(PROJECT_DIR, '.gitignore');
  let content = '';

  if (fs.existsSync(gitignorePath)) {
    content = fs.readFileSync(gitignorePath, 'utf8');
    if (content.includes(entry)) {
      return false;
    }
  }

  const newline = content.length > 0 && !content.endsWith('\n') ? '\n' : '';
  fs.writeFileSync(gitignorePath, content + newline + entry + '\n', 'utf8');
  return true;
}

function parseArgs(args) {
  const parsed = {};
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, ...valueParts] = arg.slice(2).split('=');
      parsed[key] = valueParts.join('=') || true;
    }
  }
  return parsed;
}

async function main() {
  const command = process.argv[2];
  const flags = parseArgs(process.argv.slice(3));

  if (command !== 'init') {
    console.log('');
    console.log('  Sentry MCP Plugin for Claude Code');
    console.log('');
    console.log('  Usage:');
    console.log('    npx github:febri-venturo/sentry-mcp init');
    console.log('');
    console.log('  Options:');
    console.log('    --host=<sentry-host>       Sentry host (contoh: sentry.company.com)');
    console.log('    --org=<org-slug>           Organization slug');
    console.log('    --project=<project-slug>   Project slug');
    console.log('');
    rl.close();
    return;
  }

  console.log('');
  console.log('  ================================');
  console.log('  Sentry MCP Plugin for Claude Code');
  console.log('  ================================');
  console.log('');

  // Check if already installed
  const commandsDir = path.join(PROJECT_DIR, '.claude', 'commands');
  if (fs.existsSync(path.join(commandsDir, 'sentry-help.md'))) {
    if (!flags.force) {
      const overwrite = await ask('  Sentry MCP sudah terinstall. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('  Dibatalkan.');
        rl.close();
        return;
      }
    }
    console.log('');
  }

  // Get Sentry host (from flag or prompt)
  const sentryHost = flags.host || await ask('  Sentry Host (contoh: sentry.company.com): ');
  if (!sentryHost) {
    console.log('  Error: Sentry Host wajib diisi.');
    rl.close();
    return;
  }

  // Get organization slug (from flag or prompt)
  const orgSlug = flags.org || await ask('  Organization Slug (contoh: my-org): ');
  if (!orgSlug) {
    console.log('  Error: Organization Slug wajib diisi.');
    rl.close();
    return;
  }

  // Get project slug (from flag or prompt)
  if (!flags.project) {
    console.log('');
    console.log('  Daftar project bisa dilihat di:');
    console.log('  https://' + sentryHost + '/organizations/' + orgSlug + '/projects/');
    console.log('');
  }
  const projectSlug = flags.project || await ask('  Project Slug (contoh: my-project-php): ');
  if (!projectSlug) {
    console.log('  Error: Project Slug wajib diisi.');
    rl.close();
    return;
  }

  console.log('');
  console.log('  Installing...');

  // 1. Copy .claude/sentry-mcp.md
  const claudeDir = path.join(PROJECT_DIR, '.claude');
  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
  }
  fs.copyFileSync(
    path.join(TEMPLATES_DIR, '.claude', 'sentry-mcp.md'),
    path.join(claudeDir, 'sentry-mcp.md')
  );
  console.log('  [OK] .claude/sentry-mcp.md');

  // 2. Copy .claude/commands/sentry-*.md
  copyDir(
    path.join(TEMPLATES_DIR, '.claude', 'commands'),
    path.join(claudeDir, 'commands')
  );
  console.log('  [OK] .claude/commands/sentry-*.md (7 commands)');

  // 3. Copy .mcp.json.example
  fs.copyFileSync(
    path.join(TEMPLATES_DIR, '.mcp.json.example'),
    path.join(PROJECT_DIR, '.mcp.json.example')
  );
  console.log('  [OK] .mcp.json.example');

  // 4. Copy SENTRY-SETUP.md
  fs.copyFileSync(
    path.join(TEMPLATES_DIR, 'SENTRY-SETUP.md'),
    path.join(PROJECT_DIR, 'SENTRY-SETUP.md')
  );
  console.log('  [OK] SENTRY-SETUP.md');

  // 5. Replace all placeholders in copied files
  const replacements = {
    'YOUR_SENTRY_HOST': sentryHost,
    'YOUR_ORG_SLUG': orgSlug,
    'YOUR_PROJECT_SLUG': projectSlug,
  };

  updateAllFiles(claudeDir, replacements);

  // Update single files
  const filesToUpdate = [
    path.join(PROJECT_DIR, '.mcp.json.example'),
    path.join(PROJECT_DIR, 'SENTRY-SETUP.md'),
  ];
  for (const filePath of filesToUpdate) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of Object.entries(replacements)) {
      content = content.replace(new RegExp(search, 'g'), replace);
    }
    fs.writeFileSync(filePath, content, 'utf8');
  }

  console.log('  [OK] Sentry Host: ' + sentryHost);
  console.log('  [OK] Organization: ' + orgSlug);
  console.log('  [OK] Project Slug: ' + projectSlug);

  // 6. Add .mcp.json to .gitignore
  if (addToGitignore('.mcp.json')) {
    console.log('  [OK] .mcp.json ditambahkan ke .gitignore');
  } else {
    console.log('  [OK] .mcp.json sudah ada di .gitignore');
  }

  console.log('');
  console.log('  ================================');
  console.log('  Install selesai!');
  console.log('  ================================');
  console.log('');
  console.log('  Langkah selanjutnya:');
  console.log('');
  console.log('  1. Buat .mcp.json dari template:');
  console.log('     cp .mcp.json.example .mcp.json');
  console.log('');
  console.log('  2. Edit .mcp.json, ganti YOUR_SENTRY_ACCESS_TOKEN_HERE');
  console.log('     dengan token dari https://' + sentryHost);
  console.log('     (Settings > User Auth Tokens > Create New Token)');
  console.log('');
  console.log('  3. Restart Claude Code, lalu test:');
  console.log('     /project:sentry-help');
  console.log('');
  console.log('  Dokumentasi lengkap: SENTRY-SETUP.md');
  console.log('');

  rl.close();
}

main().catch((err) => {
  console.error('Error:', err.message);
  rl.close();
  process.exit(1);
});
