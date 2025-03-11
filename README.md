# tree.lupinum.com
A modern, high-performance copy/paste file tree generator built with Nuxt.js.

![tree.lupinum Logo](public/tree-logo.png)

## What is Tree.Lupinum?

Tree.Lupinum is a powerful web application for generating copy/paste folder structure diagrams in multiple formats. It's designed for speed and flexibility, handling even large directory structures with ease.

This project is a modern reimagining of the excellent [tree.nathanfriend.com](https://tree.nathanfriend.com), built to address performance issues with large trees and add advanced features like multi-tab support and multiple output formats.

## Features

Tree.Lupinum takes input like this:

```
my-project
  src
    index.html
    my-project.scss
  build
    index.html
    my-project.css
```

And transforms it into various formats, including traditional ASCII tree diagrams:

```
.
└── my-project/
    ├── src/
    │   ├── index.html
    │   └── my-project.scss
    └── build/
        ├── index.html
        └── my-project.css
```

### Key Features

- **High Performance**: Efficiently handles large directory structures
- **Multi-tab Support**: Work with multiple tree structures simultaneously
- **Multiple Output Formats**:
  - ASCII and UTF-8 trees
  - Nested JSON, Array JSON, and Flat JSON
  - YAML representation
  - XML structure
  - Markdown lists
  - Dot notation
- **Folder Upload**: Import real directory structures directly
- **History Management**: Full undo/redo support
- **Export Options**: Copy to clipboard or download as image
- **Browser Storage**: Your trees are saved automatically
- **Zero Server Processing**: All operations run entirely in your browser
- **Modern, Responsive UI**: Works great on desktop and mobile


## About the project

tree-lupinum.com is written in TypeScript and Vue.js (Nuxt.js), with the UI built using Nuxt UI. It's designed as a modern, component-based application with full reactivity and state management.

### Technologies Used

- [Nuxt.js](https://nuxt.com/) for the application framework
- [Nuxt UI](https://ui.nuxt.com/) for the component library
- [Vue.js](https://vuejs.org/) with the Composition API
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [Tailwind CSS](https://tailwindcss.com/) for styling
- Local storage for automatic state persistence
- Client-side file system access for folder uploads
- Canvas API for image exports

### Original Tree Implementation

The core tree generation logic is adapted from Nathan Friend's excellent implementation, with optimizations and extensions to support additional output formats. The original code can be found at [https://gitlab.com/nfriend/tree-online/](https://gitlab.com/nfriend/tree-online/).

## Developing

This project uses Nuxt.js, so it contains all the standard Nuxt scripts:

### `npm install`

Installs all dependencies.

### `npm run dev`

Runs the app in development mode with hot reloading.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run build`

Builds the app for production. Only possible with valid Nuxt UI pro License!

### `npm run start`

Starts the production server.

## License

This project is licensed under the Apache License 2.0, the same as the original project it's based on. See the [LICENSE](LICENSE) file for details.

## Credits

tree.lupinum.com is based on [tree.nathanfriend.com](https://tree.nathanfriend.com) by Nathan Friend, available at [https://gitlab.com/nfriend/tree-online/](https://gitlab.com/nfriend/tree-online/).

The original project is licensed under the Apache License 2.0.