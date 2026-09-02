import type { TreeNode } from './tree.types'
import type { FormatType, TreeFormatOptions } from './tree-formatters-impl'
import {
  formatAsciiTree,
  formatUtf8Tree,
  formatNestedJson,
  formatArrayJson,
  formatFlatJson,
  formatYaml,
  formatXml,
  formatDot,
  formatMarkdown,
  toGeneratorOptions,
} from './tree-formatters-impl'
import { generateTree } from './generate-tree'

export interface TreeRenderer {
  id: FormatType
  label: string
  group: string
  render(tree: TreeNode, options?: TreeFormatOptions): string
}

/** Single source of truth for format picker + formatter dispatch */
export const TREE_RENDERERS: TreeRenderer[] = [
  {
    id: 'utf-8',
    group: 'Tree Formats',
    label: 'UTF-8 Tree',
    render: (tree, opts) => formatUtf8Tree(tree, opts),
  },
  {
    id: 'ascii',
    group: 'Tree Formats',
    label: 'ASCII Tree',
    render: (tree, opts) => formatAsciiTree(tree, opts),
  },
  {
    id: 'markdown',
    group: 'Tree Formats',
    label: 'Markdown List',
    render: (tree) => formatMarkdown(tree),
  },
  {
    id: 'json-nested',
    group: 'JSON Formats',
    label: 'Nested JSON',
    render: (tree) => formatNestedJson(tree),
  },
  {
    id: 'json-array',
    group: 'JSON Formats',
    label: 'JSON Array',
    render: (tree) => formatArrayJson(tree),
  },
  {
    id: 'json-flat',
    group: 'JSON Formats',
    label: 'Flat JSON',
    render: (tree) => formatFlatJson(tree),
  },
  {
    id: 'yaml',
    group: 'Other Formats',
    label: 'YAML',
    render: (tree) => formatYaml(tree),
  },
  {
    id: 'xml',
    group: 'Other Formats',
    label: 'XML',
    render: (tree) => formatXml(tree),
  },
  {
    id: 'dot',
    group: 'Other Formats',
    label: 'Dot Notation',
    render: (tree) => formatDot(tree),
  },
]

export const RENDERERS_BY_ID = Object.fromEntries(TREE_RENDERERS.map((r) => [r.id, r])) as Record<
  FormatType,
  TreeRenderer
>

/** UI: grouped `{ name, formats: [{ id, label }] }` */
export function formatGroupsFromRegistry(): Array<{
  name: string
  formats: Array<{ id: FormatType; label: string }>
}> {
  const order = ['Tree Formats', 'JSON Formats', 'Other Formats']
  const map = new Map<string, Array<{ id: FormatType; label: string }>>()
  for (const r of TREE_RENDERERS) {
    if (!map.has(r.group)) map.set(r.group, [])
    map.get(r.group)!.push({ id: r.id, label: r.label })
  }
  return order.filter((g) => map.has(g)).map((name) => ({ name, formats: map.get(name)! }))
}

export function formatTreeFromNode(
  tree: TreeNode,
  format: FormatType,
  options: TreeFormatOptions = {},
): string {
  if (!tree) {
    throw new Error('Structure is required')
  }

  const renderer = RENDERERS_BY_ID[format]
  if (!renderer) {
    return generateTree(tree, toGeneratorOptions(options))
  }
  return renderer.render(tree, options)
}
