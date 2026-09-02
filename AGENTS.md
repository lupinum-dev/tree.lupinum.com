# Working on Lupinum Tree

Read this file before changing the repository. `README.md` explains the
product, `CONTRIBUTING.md` explains contributor expectations, and
`MAINTAINING.md` owns operational procedures.

## Product boundary

Lupinum Tree is a static, browser-based ASCII and Unicode tree generator. It
does not publish an npm package and has no production backend.

## Architecture

- `src/features/tree/domain/` owns parsing and tree generation.
- `src/features/tree/infrastructure/` owns browser APIs and export adapters.
- `src/components/` owns the Vue interface.
- `public/` owns deployed static assets and discovery files.
- `test/` verifies domain behavior, application state, accessibility, SSR,
  metadata, and public contracts.

Keep domain logic independent of Vue and browser APIs. Keep each important
concept in one source of truth. Prefer deletion, then simplification, then
replacement, and only then addition.

## Public contracts and invariants

- Preserve exact text input, keyboard editing, and local-only processing.
- Shared trees use the validated URL-fragment contract. Browsers do not send
  fragments to the server. Do not describe them as remote storage.
- Keep the deployment static. Do not add accounts, a backend, remote tree
  storage, analytics that capture tree contents, or npm publication without an
  explicit product decision.
- Preserve Nathan Friend attribution and the Apache-2.0 license obligations.
- Keep the Workbench focused on editing. Put explanatory content in the
  in-app Guide and keep it available in prerendered HTML.
- Interactive controls must remain usable with a keyboard and reduced-motion
  preferences.

## Working method

1. Read the relevant source, tests, and current `git status` before editing.
2. Preserve unrelated user changes. Do not rewrite or discard them.
3. Make the smallest direct change that solves the stated problem.
4. Add focused tests when behavior, accessibility, or a public contract
   changes.
5. Update public documentation when supported behavior changes.
6. Use Conventional Commits for commit and pull-request titles.

Do not commit credentials, customer data, private file names, local plans,
agent transcripts, generated scratch files, or temporary migration notes.
Track a migration only while real compatibility work remains.

## Commands

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm verify
pnpm docs:build
pnpm audit:all
pnpm release:verify
```

Run `pnpm verify` before handoff. Run `pnpm release:verify` before a production
deployment or open-source launch review.

## Prohibited actions

- Do not bypass the dependency release-age policy for convenience.
- Do not add `NPM_TOKEN`, package-release workflows, or a second package
  manager.
- Do not push, deploy, publish, transfer the repository, change DNS, or mutate
  external services unless the user explicitly authorizes that action.
- Do not weaken tests, accessibility, attribution, or license requirements to
  make a check pass.

Follow `MAINTAINING.md` for deployment, rollback, dependency updates, and
incident response.
