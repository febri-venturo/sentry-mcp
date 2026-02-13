---
allowed-tools: mcp__sentry__find_releases, Read
---

Read `.claude/sentry-mcp.md` for config.

Call `find_releases` with `organizationSlug`, `projectSlug`, `regionUrl` from config + `query`: "$ARGUMENTS" (if provided).

Show releases with version, date, and deployment info.

If no releases found, inform user that release tracking is not configured. Suggest adding `release` option to Sentry SDK init. Docs: https://docs.sentry.io/product/releases/
