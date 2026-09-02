import type { FormatType } from './tree-formatters'
import type { TreeRenderOptions } from './tree.types'

export interface TreeOptions extends TreeRenderOptions {
  format: FormatType
}

export const DEFAULT_TREE_OPTIONS = {
  format: 'utf-8',
  fullPath: false,
  trailingSlash: false,
  rootDot: true,
} as const satisfies TreeOptions

export interface SharedTree {
  source: string
  options: TreeOptions
}

export interface SavedTree {
  id: string
  name: string
  source: string
  options: TreeOptions
}

export interface PersistedTreeWorkspaceV1 {
  version: 1
  activeTabId: string
  tabs: SavedTree[]
}
