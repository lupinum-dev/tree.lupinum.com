# Design system

## Product thesis and direction

ASCII Tree Generator is a focused, local-only workbench for turning an indented file list or selected folder into copy-ready structured output. The common path—edit, choose a format, copy—must remain immediate, with source and result visible together whenever width permits.

The visual language is compact and neutral, based on shadcn-vue's `reka-vega` style and inset sidebar composition. The workspace sits as a rounded, lightly elevated canvas inside the sidebar background. Tailwind Slate surfaces, fine borders, restrained elevation, and a single Cyan accent create hierarchy without competing with the tree content. This is a utility interface, not a promotional page: controls are concise, density is moderate, and the editable and generated text are the main visual objects.

## Information architecture

- The sidebar owns the product identity, saved trees, output settings, local-storage reassurance, theme control, and external links.
- The sticky workspace header owns the active tree name, sidebar toggle, and save status.
- The main workspace contains two peer sections: **Tree source** and **Output**.
- Tree management is secondary to editing. Rename, reset, and delete live in each tree's overflow menu; rename and destructive changes use confirmation dialogs.
- Output settings are persistent context. They remain in the desktop sidebar and are reached from the format action beside the Output heading on mobile.

## Color and tokens

All component colors must use the semantic CSS variables in `src/style.css`, not raw component-specific colors.

| Role             | Light                       | Dark                        | Use                                                      |
| ---------------- | --------------------------- | --------------------------- | -------------------------------------------------------- |
| Background       | Slate 50                    | Slate 900                   | Inset workspace and source section                       |
| Foreground       | Slate 950                   | Slate 50                    | Primary text                                             |
| Card             | White                       | Slate 800                   | Menus, dialogs, and focused editor feedback              |
| Primary          | Cyan 700                    | Cyan 400                    | Primary buttons, checks, brand mark, focus/caret         |
| Muted            | Slate 100                   | Slate 800                   | Subtle fills and loading skeletons                       |
| Muted foreground | Slate 600                   | Slate 400                   | Help text and secondary metadata                         |
| Accent           | Cyan 100                    | Cyan 950                    | Selected rows, quiet emphasis, empty-state icon          |
| Destructive      | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Delete actions, invalid input, save and operation errors |

Light borders use Slate 200 and inputs use Slate 300. Dark borders use a restrained Slate 700 and inputs use the full Slate 700 value. The dark sidebar is Slate 950 while the inset workspace is Slate 900, so the workspace reads as an elevated surface instead of disappearing into black. Output uses a slight Slate 800 tint to distinguish the generated side from the editable side. The source and output remain flat planes inside the inset shell rather than nested cards.

## Typography

- Use Geist Variable for interface text and Geist Mono Variable for the editor and generated output.
- The base is `14px` with `1.45` line height. Section titles and the active tree name are `14px`, semibold, with slight negative tracking where used.
- Help text, group labels, status text, and badges are `12px` with muted color.
- Source and output text are `13px` mono with a `24px` line height. Preserve whitespace and never substitute proportional type for tree content.
- Use weight and color before increasing type size. The current interface has no display typography.

## Geometry and elevation

- Use the existing spacing rhythm: compact `4–8px` gaps inside controls, `12px` compact padding, and `16px` panel/content padding at desktop widths.
- The base radius is `10px`; derived tokens are `4px` (`xs`), `6px` (`sm`), `8px` (`md`), `10px` (`lg`), and `14px` (`xl`). The inset shell owns the workspace radius; controls and alerts generally use `md`; dialogs use `xl`.
- One-pixel borders divide sidebar regions, the app header, section headers, and the desktop source/output split.
- Use `shadow-xs` on outlined controls. Menus may use `shadow-md`; overlays may use stronger elevation. The inset shell owns workspace elevation; source, output, loading, and empty states do not add nested shadows.
- Header and section-header height is `52px` (`h-13`). Standard controls are `36px`; compact actions are `32px`.

## Responsive layout

Desktop uses a fixed `17rem` left sidebar and shadcn's inset workspace with an `8px` outer gutter, rounded frame, and subtle shadow. Source and output each occupy half of the remaining width when the workspace has enough usable space and fill the inset canvas below the `52px` workspace header. The source has the vertical divider; the workspace header stays sticky.

The panes stack when the workspace itself is narrower than `45rem`, including at 200% text scaling. The sidebar becomes an off-canvas sheet capped at the viewport width minus a `16px` gutter on each side. Stacked panes use a `28rem` minimum height and let long content extend the page instead of creating nested vertical scrolling. The output format badge becomes a compact settings action that opens the sidebar. Export copy changes from “Export PNG” to “Save PNG” at the small breakpoint, while Copy output remains explicit. The document has a `320px` minimum width.

Keep action groups intact when space narrows. Section headers may wrap; content must not create horizontal page scrolling. Tree names truncate, while editor and output surfaces handle their own overflow.

## Components and action hierarchy

- **Primary:** New tree and Copy output use the Cyan filled button. Use this treatment for the clearest next or repeat action, not every available action.
- **Secondary:** Choose folder and Export/Save PNG use outlined buttons.
- **Utility:** Sidebar toggle, format access on mobile, theme, GitHub, and Lupinum links use ghost or icon buttons.
- **Selected:** The active tree uses the sidebar accent fill, medium text, `aria-pressed`, and a Cyan check.
- **Destructive:** Delete is red and confirmed. It is disabled when only one tree remains. Reset is confirmed but is not styled as deletion.
- Lucide icons reinforce labels. Keep visible text on important actions; icon-only controls require an accessible name.

## States and feedback

- **Loading:** Before browser state is ready, show three sidebar row skeletons and two large pulsing workspace skeletons. Label both loading regions for assistive technology.
- **Empty source/output:** Disable copy and export. Show the dashed Output card with “Output appears here” and instructions to type or choose a folder.
- **Parse error:** Mark the editor invalid with destructive border/ring, show the first error with line number in an alert, hide the last valid output, and replace the empty-state message with “Fix the source to continue.”
- **Saving:** The sticky header is the persistent status location: spinner plus “Saving…”, Cyan check plus “Saved locally”, or destructive icon plus “Not saved”. Announce it through a polite live region.
- **Importing:** Disable Choose folder and change its label to “Reading…”.
- **Operations:** Copy, folder import, and image export use success toasts. Failures use actionable error toasts that remain until dismissed. Save failure also remains visible as the header status.

## Interaction and accessibility

- All workflows must remain keyboard operable with visible semantic-token focus rings. Interactive controls use at least a 2–3px ring; invalid controls use the destructive equivalent.
- The source textarea treats `Tab` as two-space indentation and `Shift+Tab` as outdent. To leave it by keyboard, press `Escape`, then `Tab`. Keep this instruction visible and connected to the textarea with `aria-describedby`.
- Give sections programmatic headings, associate labels with controls, mark decorative icons `aria-hidden`, and give icon-only actions explicit labels.
- Keep generated output keyboard-focusable and scrollable. Preserve text selection using the primary-tinted selection color.
- Use native disabled states while output is unavailable or work is in progress. Do not rely on color alone for selection, errors, saving, or completion.
- Respect `prefers-reduced-motion`: remove spatial, pulsing, and spinning motion while preserving immediate color and state feedback. Smooth scrolling is disabled.
- Dialogs must state the object and consequence, provide Cancel, and autofocus the rename field where applicable.

## Principles for future changes

1. Protect the direct edit → inspect → copy path. New controls belong outside the main text surfaces unless they are essential to that path.
2. Keep one source of truth for semantic tokens and reuse existing component variants before adding visual exceptions.
3. Preserve local-only language wherever storage or folder access could be misunderstood; do not imply accounts, uploads, or sync.
4. Keep source and output as peers on desktop and in source-first order on mobile.
5. Add hierarchy with Slate surfaces and borders before adding color or elevation. Reserve Cyan for primary intent, selection, focus, and success-adjacent confirmation.
6. Design every new state for keyboard use, visible focus, reduced motion, `200%` zoom, and the `320px` viewport before considering it complete.
