<p align="center"><img src="public/icon.svg" width="128" alt="Lupinum Tree icon"></p>
<h1 align="center">Lupinum Tree</h1>
<p align="center">Turn indented text or a local folder into clean ASCII and Unicode directory trees.</p>

<p align="center">
  <a href="https://github.com/lupinum-dev/lupinum-tree/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/lupinum-dev/lupinum-tree/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="Apache-2.0 license" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg"></a>
</p>

## Why use Lupinum Tree?

Lupinum Tree creates copy-ready directory trees without sending your file names to a server. Edit the source and review the result side by side, then copy, share, or export it.

Choose Unicode for polished documentation, plain ASCII for maximum compatibility, Markdown for a ready-to-paste code block, or lossless JSON for structured data. Save multiple named trees in your browser and return to them later.

## When to use it

Use Lupinum Tree when you need an editable file or folder hierarchy for:

- a README file or technical guide;
- a code review, issue, or source comment;
- a chat or AI prompt; or
- an architecture or migration plan.

Use the operating system `tree` command when you need a repeatable command-line inventory or want to automate output in a script. Lupinum Tree is designed for trees that you want to edit, format, save, or share visually.

## Requirements

The hosted application needs a modern browser. Local development needs:

- Node.js 22.18 or newer in the Node.js 22 line, Node.js 24.12 or newer in the Node.js 24 line, or Node.js 26; and
- pnpm 11.

## Installation

```sh
git clone https://github.com/lupinum-dev/lupinum-tree.git
cd lupinum-tree
pnpm install --frozen-lockfile
```

## Quick start

```sh
pnpm dev
```

Open the local URL that Vite+ prints. Or use the hosted application at [tree.lupinum.com](https://tree.lupinum.com/).

Enter two spaces for each nesting level:

```text
project
  src
    main.ts
  public
    icon.svg
  README.md
```

Lupinum Tree turns it into:

```text
project
├── src
│   └── main.ts
├── public
│   └── icon.svg
└── README.md
```

## Product concepts

- **Tree source:** One file or folder name per line, with two spaces for each nesting level.
- **Output format:** Unicode, plain ASCII, Markdown, or lossless JSON.
- **Saved tree:** One source and its output settings, stored in this browser.
- **Share link:** One compressed tree stored in the URL fragment. The browser does not send the fragment to the server.
- **Folder import:** A local folder converted in the browser. Its names and structure stay on your device.

## How it works

The application uses Vue 3, TypeScript, Tailwind CSS 4, and shadcn-vue. Vite+ runs development, checks, tests, and builds. Static server rendering produces searchable initial HTML for the Workbench and Guide.

All parsing, saved trees, folder imports, and exports stay in the browser. Lupinum Tree has no account system, database, or server-side file processing.

Core tree generation is adapted from [Nathan Friend's tree-online repository](https://gitlab.com/nfriend/tree-online) under the Apache License 2.0.

## Documentation

Use the [in-app guide](https://tree.lupinum.com/guide/) for the main workflow, formats, sharing behavior, privacy details, and answers to common questions. Maintainer procedures are in [MAINTAINING.md](MAINTAINING.md).

Vercel deploys the application from the repository root. To create the static production build locally, run `pnpm build`. The generated Workbench and Guide are written to `dist/`.

## Contributing and development

Read [CONTRIBUTING.md](CONTRIBUTING.md) before you open a pull request. Run `pnpm verify` before review.

## Support and security

Ask questions in the [Lupinum OSS Discord](https://discord.gg/RPH6SeA36N). Report vulnerabilities through [GitHub private vulnerability reporting](https://github.com/lupinum-dev/lupinum-tree/security/advisories/new). Do not report a vulnerability in a public issue.

## License

[Apache License 2.0](LICENSE) © Lupinum OG. See [NOTICE](NOTICE) for third-party attribution.
