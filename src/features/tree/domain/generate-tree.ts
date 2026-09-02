import { LINE_STRINGS } from './line-strings'
import { walkTree } from './tree-traversal'
import type { DirectoryNode, TreeRenderOptions } from './tree.types'

export type TreeCharset = keyof typeof LINE_STRINGS

export const DEFAULT_TREE_RENDER_OPTIONS: TreeRenderOptions = {
  fullPath: false,
  trailingSlash: false,
  rootDot: true,
}

export function generateTree(
  structure: DirectoryNode,
  charset: TreeCharset = 'utf-8',
  options: TreeRenderOptions = DEFAULT_TREE_RENDER_OPTIONS,
): string {
  if (!structure) throw new Error('Structure is required')

  const characters = LINE_STRINGS[charset]
  const lines: string[] = []

  for (const visit of walkTree(structure)) {
    if (!visit.parent) {
      if (options.rootDot) lines.push(visit.node.name)
      continue
    }

    const suffix = options.trailingSlash && visit.node.kind === 'directory' ? '/' : ''
    const name = `${options.fullPath ? visit.path : visit.node.name}${suffix}`

    if (!options.rootDot && visit.depth === 1) {
      lines.push(name)
      continue
    }

    const visibleAncestors = options.rootDot ? visit.ancestorIsLast : visit.ancestorIsLast.slice(1)
    const ancestors = visibleAncestors
      .map((isLast) => (isLast ? characters.EMPTY : characters.DIRECTORY))
      .join('')
    lines.push(`${ancestors}${visit.isLast ? characters.LAST_CHILD : characters.CHILD}${name}`)
  }

  return lines.join('\n')
}
