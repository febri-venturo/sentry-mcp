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

function injectClaudeMd(projectDir) {
  const claudeDir = path.join(projectDir, '.claude');
  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
  }
  const claudeMdPath = path.join(claudeDir, 'CLAUDE.md');
  const sectionPath = path.join(TEMPLATES_DIR, 'CLAUDE.md.section');
  const section = fs.readFileSync(sectionPath, 'utf8').trim();

  if (fs.existsSync(claudeMdPath)) {
    let content = fs.readFileSync(claudeMdPath, 'utf8');
    const startMarker = '<!-- SENTRY_MCP_START -->';
    const endMarker = '<!-- SENTRY_MCP_END -->';
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker);

    if (startIdx !== -1 && endIdx !== -1) {
      // Replace existing section
      content = content.slice(0, startIdx) + section + content.slice(endIdx + endMarker.length);
      fs.writeFileSync(claudeMdPath, content, 'utf8');
      return 'replaced';
    }

    // Append section
    const newline = content.length > 0 && !content.endsWith('\n') ? '\n\n' : '\n';
    fs.writeFileSync(claudeMdPath, content + newline + section + '\n', 'utf8');
    return 'appended';
  }

  // Create new file
  fs.writeFileSync(claudeMdPath, section + '\n', 'utf8');
  return 'created';
}

function removeClaudeMdSection(projectDir) {
  const claudeMdPath = path.join(projectDir, '.claude', 'CLAUDE.md');
  if (!fs.existsSync(claudeMdPath)) return false;

  const content = fs.readFileSync(claudeMdPath, 'utf8');
  const startMarker = '<!-- SENTRY_MCP_START -->';
  const endMarker = '<!-- SENTRY_MCP_END -->';
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) return false;

  let cleaned = content.slice(0, startIdx) + content.slice(endIdx + endMarker.length);
  cleaned = cleaned.trim();

  if (cleaned.length === 0) {
    fs.unlinkSync(claudeMdPath);
    return 'deleted';
  }

  fs.writeFileSync(claudeMdPath, cleaned + '\n', 'utf8');
  return 'removed';
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

function getMcpCommand() {
  const isWindows = process.platform === 'win32';
  if (isWindows) {
    return {
      command: 'cmd',
      args: ['/c', 'npx', '@sentry/mcp-server'],
    };
  }
  return {
    command: 'npx',
    args: ['@sentry/mcp-server'],
  };
}

function generateMcpConfig(sentryHost, accessToken) {
  const { command, args } = getMcpCommand();
  return {
    mcpServers: {
      sentry: {
        type: 'stdio',
        command: command,
        args: args,
        env: {
          SENTRY_ACCESS_TOKEN: accessToken,
          SENTRY_HOST: sentryHost,
          MCP_DISABLE_SKILLS: 'seer',
        },
      },
    },
  };
}

function writeMcpJson(projectDir, sentryHost, accessToken) {
  const mcpJsonPath = path.join(projectDir, '.mcp.json');
  const newConfig = generateMcpConfig(sentryHost, accessToken);

  if (fs.existsSync(mcpJsonPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(mcpJsonPath, 'utf8'));
      if (existing.mcpServers) {
        existing.mcpServers.sentry = newConfig.mcpServers.sentry;
      } else {
        existing.mcpServers = newConfig.mcpServers;
      }
      fs.writeFileSync(mcpJsonPath, JSON.stringify(existing, null, 2) + '\n', 'utf8');
      return 'merged';
    } catch (e) {
      // Invalid JSON — overwrite
    }
  }

  fs.writeFileSync(mcpJsonPath, JSON.stringify(newConfig, null, 2) + '\n', 'utf8');
  return 'created';
}

function removeFromGitignore(entry) {
  const gitignorePath = path.join(PROJECT_DIR, '.gitignore');
  if (!fs.existsSync(gitignorePath)) return false;

  const content = fs.readFileSync(gitignorePath, 'utf8');
  const lines = content.split('\n');
  const filtered = lines.filter((line) => line.trim() !== entry);

  if (lines.length === filtered.length) return false;

  fs.writeFileSync(gitignorePath, filtered.join('\n'), 'utf8');
  return true;
}

function removeSentryFromMcpJson() {
  const mcpJsonPath = path.join(PROJECT_DIR, '.mcp.json');
  if (!fs.existsSync(mcpJsonPath)) return 'not_found';

  try {
    const config = JSON.parse(fs.readFileSync(mcpJsonPath, 'utf8'));
    if (!config.mcpServers || !config.mcpServers.sentry) return 'not_found';

    delete config.mcpServers.sentry;

    // If no MCP servers left, delete the file
    if (Object.keys(config.mcpServers).length === 0) {
      fs.unlinkSync(mcpJsonPath);
      return 'deleted';
    }

    fs.writeFileSync(mcpJsonPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
    return 'removed';
  } catch (e) {
    return 'error';
  }
}

async function runUninstall(flags) {
  console.log('');
  console.log('  ================================');
  console.log('  Sentry MCP Plugin — Uninstall');
  console.log('  ================================');
  console.log('');

  // Check if installed
  const commandsDir = path.join(PROJECT_DIR, '.claude', 'commands');
  const configFile = path.join(PROJECT_DIR, '.claude', 'sentry-mcp.md');
  const hasCommands = fs.existsSync(path.join(commandsDir, 'sentry-help.md'));
  const hasConfig = fs.existsSync(configFile);

  if (!hasCommands && !hasConfig) {
    console.log('  Sentry MCP tidak terinstall di project ini.');
    return;
  }

  if (!flags.force) {
    const confirm = await ask('  Hapus Sentry MCP dari project ini? (y/N): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('  Dibatalkan.');
      return;
    }
    console.log('');
  }

  console.log('  Uninstalling...');

  // 1. Remove sentry command files
  const sentryCommands = [
    'sentry-issues.md', 'sentry-detail.md', 'sentry-fix.md',
    'sentry-resolve.md', 'sentry-events.md', 'sentry-releases.md',
    'sentry-docs.md', 'sentry-help.md',
  ];
  let removedCommands = 0;
  for (const cmd of sentryCommands) {
    const cmdPath = path.join(commandsDir, cmd);
    if (fs.existsSync(cmdPath)) {
      fs.unlinkSync(cmdPath);
      removedCommands++;
    }
  }
  if (removedCommands > 0) {
    console.log('  [OK] Removed ' + removedCommands + ' sentry commands from .claude/commands/');
  }

  // Clean up empty commands dir (only if no other files remain)
  if (fs.existsSync(commandsDir)) {
    const remaining = fs.readdirSync(commandsDir);
    if (remaining.length === 0) {
      fs.rmdirSync(commandsDir);
      console.log('  [OK] Removed empty .claude/commands/');
    }
  }

  // 2. Remove .claude/sentry-mcp.md
  if (fs.existsSync(configFile)) {
    fs.unlinkSync(configFile);
    console.log('  [OK] Removed .claude/sentry-mcp.md');
  }

  // Clean up empty .claude dir
  const claudeDir = path.join(PROJECT_DIR, '.claude');
  if (fs.existsSync(claudeDir)) {
    const remaining = fs.readdirSync(claudeDir);
    if (remaining.length === 0) {
      fs.rmdirSync(claudeDir);
      console.log('  [OK] Removed empty .claude/');
    }
  }

  // 3. Remove sentry from .mcp.json (keep other servers)
  const mcpResult = removeSentryFromMcpJson();
  if (mcpResult === 'deleted') {
    console.log('  [OK] Removed .mcp.json (no other MCP servers)');
  } else if (mcpResult === 'removed') {
    console.log('  [OK] Removed sentry config from .mcp.json (kept other servers)');
  }

  // 4. Remove .mcp.json.example
  const examplePath = path.join(PROJECT_DIR, '.mcp.json.example');
  if (fs.existsSync(examplePath)) {
    fs.unlinkSync(examplePath);
    console.log('  [OK] Removed .mcp.json.example');
  }

  // 5. Remove SENTRY-SETUP.md
  const setupPath = path.join(PROJECT_DIR, 'SENTRY-SETUP.md');
  if (fs.existsSync(setupPath)) {
    fs.unlinkSync(setupPath);
    console.log('  [OK] Removed SENTRY-SETUP.md');
  }

  // 6. Remove Sentry section from .claude/CLAUDE.md
  const claudeMdResult = removeClaudeMdSection(PROJECT_DIR);
  if (claudeMdResult === 'deleted') {
    console.log('  [OK] Removed .claude/CLAUDE.md (was only sentry config)');
  } else if (claudeMdResult === 'removed') {
    console.log('  [OK] Removed sentry section from .claude/CLAUDE.md');
  }

  // 7. Clean up .gitignore entries
  const gitignoreEntries = ['.mcp.json', '.mcp.json.example', '.claude/commands/', '.claude/sentry-mcp.md', '.claude/CLAUDE.md'];
  for (const entry of gitignoreEntries) {
    if (removeFromGitignore(entry)) {
      console.log('  [OK] Removed ' + entry + ' from .gitignore');
    }
  }

  console.log('');
  console.log('  ================================');
  console.log('  Uninstall selesai!');
  console.log('  ================================');
  console.log('');
  console.log('  Restart Claude Code untuk menerapkan perubahan.');
  console.log('');
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

  if (command === 'uninstall') {
    await runUninstall(flags);
    rl.close();
    return;
  }

  if (command !== 'init') {
    console.log('');
    console.log('  Sentry MCP Plugin for Claude Code');
    console.log('');
    console.log('  Usage:');
    console.log('    npx github:febri-venturo/sentry-mcp init');
    console.log('    npx github:febri-venturo/sentry-mcp uninstall');
    console.log('');
    console.log('  Init options:');
    console.log('    --host=<sentry-host>       Sentry host (contoh: sentry.company.com)');
    console.log('    --org=<org-slug>           Organization slug');
    console.log('    --project=<project-slug>   Project slug');
    console.log('    --token=<access-token>     Sentry access token');
    console.log('    --force                    Overwrite tanpa konfirmasi');
    console.log('');
    console.log('  Uninstall options:');
    console.log('    --force                    Uninstall tanpa konfirmasi');
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

  // Get Sentry access token (from flag or prompt)
  if (!flags.token) {
    console.log('');
    console.log('  Token bisa dibuat di:');
    console.log('  https://' + sentryHost + '/settings/account/api/auth-tokens/');
    console.log('  Scope: project:read, event:read, issue:read, issue:write, org:read, team:read');
    console.log('');
  }
  const accessToken = flags.token || await ask('  Sentry Access Token: ');
  if (!accessToken) {
    console.log('  Error: Sentry Access Token wajib diisi.');
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
  console.log('  [OK] .claude/commands/sentry-*.md (8 commands)');

  // 3. Generate .mcp.json directly (auto-detect OS + env vars)
  const mcpResult = writeMcpJson(PROJECT_DIR, sentryHost, accessToken);
  if (mcpResult === 'merged') {
    console.log('  [OK] .mcp.json (sentry config ditambahkan ke existing file)');
  } else {
    console.log('  [OK] .mcp.json (auto-generated)');
  }

  // 4. Copy .mcp.json.example (reference template)
  fs.copyFileSync(
    path.join(TEMPLATES_DIR, '.mcp.json.example'),
    path.join(PROJECT_DIR, '.mcp.json.example')
  );
  console.log('  [OK] .mcp.json.example (reference template)');

  // 5. Copy SENTRY-SETUP.md
  fs.copyFileSync(
    path.join(TEMPLATES_DIR, 'SENTRY-SETUP.md'),
    path.join(PROJECT_DIR, 'SENTRY-SETUP.md')
  );
  console.log('  [OK] SENTRY-SETUP.md');

  // 6. Inject Sentry section into .claude/CLAUDE.md (auto-loaded by Claude Code, stays local)
  const claudeMdResult = injectClaudeMd(PROJECT_DIR);
  if (claudeMdResult === 'replaced') {
    console.log('  [OK] .claude/CLAUDE.md (sentry section updated)');
  } else if (claudeMdResult === 'appended') {
    console.log('  [OK] .claude/CLAUDE.md (sentry section ditambahkan)');
  } else {
    console.log('  [OK] .claude/CLAUDE.md (created with sentry config)');
  }

  // 7. Replace all placeholders in copied files
  const replacements = {
    'YOUR_SENTRY_HOST': sentryHost,
    'YOUR_ORG_SLUG': orgSlug,
    'YOUR_PROJECT_SLUG': projectSlug,
  };

  updateAllFiles(claudeDir, replacements);

  // Update single files (.mcp.json.example, SENTRY-SETUP.md)
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

  const isWindows = process.platform === 'win32';
  console.log('  [OK] Sentry Host: ' + sentryHost);
  console.log('  [OK] Organization: ' + orgSlug);
  console.log('  [OK] Project Slug: ' + projectSlug);
  console.log('  [OK] Access Token: ' + accessToken.slice(0, 8) + '...' + accessToken.slice(-4));
  console.log('  [OK] Platform: ' + (isWindows ? 'Windows (cmd /c npx)' : process.platform + ' (npx)'));

  // 8. Add .mcp.json, .claude/commands/, .claude/sentry-mcp.md to .gitignore
  const gitignoreEntries = ['.mcp.json', '.mcp.json.example', '.claude/commands/', '.claude/sentry-mcp.md', '.claude/CLAUDE.md'];
  for (const entry of gitignoreEntries) {
    if (addToGitignore(entry)) {
      console.log('  [OK] ' + entry + ' ditambahkan ke .gitignore');
    } else {
      console.log('  [OK] ' + entry + ' sudah ada di .gitignore');
    }
  }

  console.log('');
  console.log('  ================================');
  console.log('  Install selesai!');
  console.log('  ================================');
  console.log('');
  console.log('  .mcp.json sudah dikonfigurasi otomatis.');
  console.log('');
  console.log('  Langkah selanjutnya:');
  console.log('');
  console.log('  1. Restart Claude Code');
  console.log('  2. Test: /project:sentry-help');
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
