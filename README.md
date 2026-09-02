# tree.lupinum.com

A fast, private directory-tree workbench built with Vue, Vite+, and shadcn-vue.

Paste an indented directory list or choose a local folder. The app turns it into a clean tree, JSON, YAML, XML, Markdown, or dot notation while you type.

## Why it is useful

- Keep several named trees in one sidebar.
- Import a folder without uploading its files.
- Copy generated text or export it as a PNG.
- Adjust paths, trailing slashes, and root display per tree.
- Keep work automatically in browser storage.
- Use the full editor by keyboard, including Tab and Shift+Tab indentation.

All parsing and exporting happens in the browser. There is no account, database, or server-side file processing.

## Development

Requirements: Node.js 22.18 or newer and pnpm 11.

```bash
pnpm install
pnpm dev
```

The local URL is printed in the terminal.

Before opening a pull request, run:

```bash
pnpm run check
pnpm run test
pnpm run build
```

`pnpm run build` creates a statically prerendered app in `dist/`.

## Foundation

- Vue 3 and TypeScript
- Vite+ for development, checks, tests, and builds
- Tailwind CSS 4
- shadcn-vue with Reka UI primitives
- Browser local storage for saved trees

The core tree-generation logic is adapted from [tree.nathanfriend.com](https://tree.nathanfriend.com) under the Apache License 2.0.

## License

[Apache License 2.0](LICENSE)
