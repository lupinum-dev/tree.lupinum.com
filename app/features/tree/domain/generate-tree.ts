import type { TreeNode } from './tree.types'
import { LINE_STRINGS } from '~/lib/line-strings'

export interface GenerateTreeOptions {
  charset?: 'ascii' | 'utf-8'
  trailingDirSlash?: boolean
  fullPath?: boolean
  rootDot?: boolean
}

const defaultOptions: GenerateTreeOptions = {
  charset: 'utf-8',
  trailingDirSlash: false,
  fullPath: false,
  rootDot: true
}

/** Parent pointer map for traversal (TreeNode intentionally has no parent field). */
function buildParentMap(root: TreeNode): Map<TreeNode, TreeNode | null> {
  const m = new Map<TreeNode, TreeNode | null>()
  m.set(root, null)
  function walk(n: TreeNode): void {
    for (const c of n.children) {
      m.set(c, n)
      walk(c)
    }
  }
  walk(root)
  return m
}

function isLastChild(node: TreeNode, parent: TreeNode): boolean {
  const ch = parent.children
  return ch.length > 0 && ch[ch.length - 1]!.id === node.id
}

export function generateTree(structure: TreeNode, options?: GenerateTreeOptions): string {
  if (!structure) {
    throw new Error('Structure is required')
  }

  const mergedOptions: GenerateTreeOptions = { ...defaultOptions, ...(options || {}) }
  const parentMap = buildParentMap(structure)
  const lines: string[] = []
  const stack: TreeNode[] = [structure]

  while (stack.length > 0) {
    const item = stack.pop()!
    const parent = parentMap.get(item) ?? null
    const line = getAsciiLine(item, parent, parentMap, mergedOptions)
    if (line !== null) lines.push(line)

    for (let i = item.children.length - 1; i >= 0; i--) {
      stack.push(item.children[i]!)
    }
  }

  return lines.join('\n')
}

const getAsciiLine = (
  node: TreeNode,
  parent: TreeNode | null,
  parentMap: Map<TreeNode, TreeNode | null>,
  options: GenerateTreeOptions
): string | null => {
  const charset = options.charset || 'utf-8'
  if (!LINE_STRINGS[charset]) {
    throw new Error(`Unknown charset: ${charset}`)
  }

  const lines = LINE_STRINGS[charset]

  if (!parent) {
    return options.rootDot ? node.name : null
  }

  const chunks = [
    isLastChild(node, parent) ? lines.LAST_CHILD : lines.CHILD,
    getName(node, parent, parentMap, options)
  ]

  let current: TreeNode | null = parent
  while (current) {
    const grandparent = parentMap.get(current)
    if (!grandparent) break
    chunks.unshift(isLastChild(current, grandparent) ? lines.EMPTY : lines.DIRECTORY)
    current = grandparent
  }

  const prefixCut = options.rootDot ? 0 : lines.CHILD.length
  return chunks.join('').substring(prefixCut)
}

const getName = (
  node: TreeNode,
  parent: TreeNode,
  parentMap: Map<TreeNode, TreeNode | null>,
  options: GenerateTreeOptions
): string => {
  const nameChunks = [node.name]

  const dirSlash
    = options.trailingDirSlash
      && isDirectory(node)
      && !/\/\s*$/.test(node.name)
  if (dirSlash) {
    nameChunks.push('/')
  }

  if (options.fullPath) {
    const pathParts: string[] = []
    let current: TreeNode | null = parent
    while (current && current.name !== '.') {
      pathParts.unshift(current.name)
      current = parentMap.get(current) ?? null
    }
    if (pathParts.length > 0) {
      nameChunks.unshift(`${pathParts.join('/')}/`)
    }
  }

  return nameChunks.join('')
}

function isDirectory(node: TreeNode): boolean {
  return node.kind === 'directory'
}
