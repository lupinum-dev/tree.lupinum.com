# Maintaining Lupinum Tree

## Architecture and boundaries

- `src/features/tree/domain/` owns parsing and output generation.
- `src/features/tree/infrastructure/` owns browser APIs and export adapters.
- `src/components/` owns the Vue interface.
- Shared tree links use the validated URL-fragment contract. Browsers do not send fragments to the server.
- Keep the deployment static. Do not add accounts, a backend, remote tree storage, or npm publication without an explicit product decision.
- Preserve keyboard editing, exact text input, local-only processing, Nathan Friend attribution, and the Apache-2.0 license.

## Quick fix

Create a focused branch. Add a regression test when behavior changes. Run `pnpm verify`. Open a pull request with the result, verification, and risk.

## Large change

Open an issue first. Record important architecture decisions only when the history and tradeoff must remain visible. Keep migration and rollback steps explicit.

## Dependency update

Use Renovate for routine updates. Do not bypass the 24-hour dependency quarantine. Run `pnpm audit:all` and `pnpm verify` after a lockfile change.

## Documentation or copy change

Use plain, direct public copy. Run `pnpm docs:build`. Inspect the app at desktop and mobile widths.

## Deployment

Merge only after required CI and Vercel checks pass. Vercel deploys current `main` from the repository root.

After deployment, verify:

- the editor, output settings, copy action, share link, and folder picker;
- the Workbench and Guide navigation in both directions;
- desktop and mobile layouts;
- the distinct home and guide canonical URLs, social image, icons, robots file, and sitemap;
- GitHub, contact, privacy, and legal links;
- the browser console and failed network requests.

## Rollback

Use Vercel to promote the last known-good deployment. Then revert or fix the responsible commit through a pull request. Do not leave production and `main` different without an incident note.

## Credential incident

Stop deployments. Revoke the affected credential, review logs, and rotate it in the owning service. Never commit replacement secrets. Confirm that old deployments cannot read the new value.
