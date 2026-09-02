import type { FormatType } from './tree-formatters-impl'

export interface TreeOptions {
  format: FormatType
  fullPath: boolean
  trailingSlash: boolean
  rootDot: boolean
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
