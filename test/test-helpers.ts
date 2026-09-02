import type { DirectoryNode, TreeNode } from '../src/features/tree/domain/tree.types'
import type { FormatType } from '../src/features/tree/domain/tree-formatters'

export const defaultRenderOptions = {
  fullPath: false,
  trailingSlash: false,
  rootDot: true,
} as const

/** Small hand-built tree useful for formatter sanity checks. */
export function createTreeNodeFixture(): DirectoryNode {
  return {
    name: '.',
    kind: 'directory',
    children: [
      {
        name: 'app',
        kind: 'directory',
        children: [
          {
            name: 'src',
            kind: 'directory',
            children: [{ name: 'index.js', kind: 'file' }],
          },
          { name: 'package.json', kind: 'file' },
        ],
      },
    ],
  }
}

// @ts-expect-error Files cannot contain children.
export const invalidFileNode: TreeNode = { name: 'invalid', kind: 'file', children: [] }

// @ts-expect-error Removed formats cannot enter typed application state.
export const removedFormat: FormatType = 'yaml'

export function nestedSource(depth: number): string {
  return Array.from({ length: depth }, (_, index) => `${'  '.repeat(index)}level-${index}`).join(
    '\n',
  )
}
