import { generateTree } from './generate-tree'
import { walkTree } from './tree-traversal'
import type { DirectoryNode, TreeNode, TreeRenderOptions } from './tree.types'

interface ArrayJsonFile {
  name: string
  type: 'file'
}

interface ArrayJsonDirectory {
  name: string
  type: 'directory'
  children?: ArrayJsonNode[]
}

type ArrayJsonNode = ArrayJsonFile | ArrayJsonDirectory

function formatArrayJson(structure: DirectoryNode): string {
  const outputByNode = new Map<TreeNode, ArrayJsonNode>()
  const rootOutput: ArrayJsonDirectory = {
    name: 'root',
    type: 'directory',
  }
  outputByNode.set(structure, rootOutput)

  for (const visit of walkTree(structure)) {
    if (!visit.parent) continue

    const output: ArrayJsonNode =
      visit.node.kind === 'directory'
        ? { name: visit.node.name, type: 'directory' }
        : { name: visit.node.name, type: 'file' }
    const parentOutput = outputByNode.get(visit.parent)
    if (!parentOutput || parentOutput.type !== 'directory') {
      throw new Error('Tree traversal produced an invalid parent')
    }
    parentOutput.children ??= []
    parentOutput.children.push(output)
    outputByNode.set(visit.node, output)
  }

  return JSON.stringify(rootOutput, null, 2)
}

const markdownPunctuation = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g

function escapeMarkdownName(name: string): string {
  return name.replace(markdownPunctuation, '\\$&')
}

function formatMarkdown(structure: DirectoryNode): string {
  const lines: string[] = []
  for (const visit of walkTree(structure)) {
    if (!visit.parent) continue
    const suffix = visit.node.kind === 'directory' ? '/' : ''
    lines.push(`${'  '.repeat(visit.depth - 1)}* ${escapeMarkdownName(visit.node.name)}${suffix}`)
  }
  return lines.length > 0 ? `${lines.join('\n')}\n` : ''
}

export const TREE_RENDERERS = [
  {
    id: 'utf-8',
    group: 'Tree Formats',
    label: 'UTF-8 Tree',
    supportsTreeOptions: true,
    render: (tree: DirectoryNode, options: TreeRenderOptions) =>
      generateTree(tree, 'utf-8', options),
  },
  {
    id: 'ascii',
    group: 'Tree Formats',
    label: 'ASCII Tree',
    supportsTreeOptions: true,
    render: (tree: DirectoryNode, options: TreeRenderOptions) =>
      generateTree(tree, 'ascii', options),
  },
  {
    id: 'markdown',
    group: 'Tree Formats',
    label: 'Markdown List',
    supportsTreeOptions: false,
    render: (tree: DirectoryNode) => formatMarkdown(tree),
  },
  {
    id: 'json-array',
    group: 'JSON Formats',
    label: 'JSON Array',
    supportsTreeOptions: false,
    render: (tree: DirectoryNode) => formatArrayJson(tree),
  },
] as const

export type FormatType = (typeof TREE_RENDERERS)[number]['id']
export type TreeRenderer = (typeof TREE_RENDERERS)[number]

export function isFormatType(value: unknown): value is FormatType {
  return typeof value === 'string' && TREE_RENDERERS.some((renderer) => renderer.id === value)
}

export function findTreeRenderer(format: FormatType): TreeRenderer {
  const renderer = TREE_RENDERERS.find((candidate) => candidate.id === format)
  if (!renderer) throw new Error(`Unknown tree format: ${format}`)
  return renderer
}

export function formatGroupsFromRegistry(): Array<{
  name: string
  formats: Array<{ id: FormatType; label: string }>
}> {
  const groups = new Map<string, Array<{ id: FormatType; label: string }>>()
  for (const renderer of TREE_RENDERERS) {
    const formats = groups.get(renderer.group) ?? []
    formats.push({ id: renderer.id, label: renderer.label })
    groups.set(renderer.group, formats)
  }
  return [...groups].map(([name, formats]) => ({ name, formats }))
}

export function formatTree(
  tree: DirectoryNode,
  format: FormatType,
  options: TreeRenderOptions,
): string {
  if (!tree) throw new Error('Structure is required')
  return findTreeRenderer(format).render(tree, options)
}

export { formatArrayJson, formatMarkdown }
