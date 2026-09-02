# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers, technical writers, and people preparing README files, documentation, chats, or AI prompts who need to turn an indented file listing into a readable directory tree.

## Product Purpose

ASCII Tree Generator converts pasted text or a locally selected folder into copy-ready tree diagrams and structured formats. Success means a user can move from source to a correct, useful result in seconds without uploading their files.

## Positioning

It combines a fast live tree editor, multiple saved trees, many output formats, and local-only processing in one focused browser tool.

## Operating Context

Users paste or edit indented file names, inspect the result beside the source, adjust output rules, then copy or export the result for use elsewhere. Some users import a real project folder. Work is saved in the current browser.

## Capabilities and Constraints

- Generate UTF-8 and ASCII trees, Markdown lists, and lossless Array JSON.
- Keep multiple named trees and their output settings in browser storage.
- Import folder structures with the browser directory picker.
- Copy output and download it as an image.
- Share one tree through a compact, local-only URL payload.
- Process all file names and text locally. There is no backend, account, or cross-device sync.
- Preserve the existing `tree-workspace-v1` browser data contract during modernization.

## Brand Commitments

The public product name is **ASCII Tree Generator** and it belongs to Lupinum. The interface should share the compact, neutral shadcn-vue workbench language used by Lupinum Colors while remaining clearly focused on tree editing.

## Evidence on Hand

- Existing product copy and metadata in `index.html`.
- Existing logos, icons, and social assets in `public/`.
- A tested tree parser and formatter suite in `src/features/tree/domain/` and `test/`.
- No testimonials, usage metrics, or commercial claims are available and none should be invented.

## Product Principles

- Keep source and result visible together whenever space permits.
- Make the common path—edit, choose format, copy—immediate.
- Keep user content local and make that boundary clear.
- Prefer direct, recoverable actions over hidden automation.
- Preserve output correctness while simplifying the surrounding application.

## Accessibility & Inclusion

The full workflow must work with a keyboard, visible focus, programmatically named controls, reduced motion, 200% zoom, and a 320px-wide viewport.
