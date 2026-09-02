/**
 * Domain model for parsed tree structures (framework-agnostic).
 */

export interface FileNode {
  name: string
  kind: 'file'
}

export interface DirectoryNode {
  name: string
  kind: 'directory'
  children: TreeNode[]
}

/** A file cannot contain children; directories always own their child list. */
export type TreeNode = FileNode | DirectoryNode

export interface TreeDiagnostic {
  /** 1-based line number in user input */
  line: number
  column?: number
  message: string
  lineContent?: string
}

export type ParseResult =
  | { ok: true; root: DirectoryNode }
  | { ok: false; errors: TreeDiagnostic[] }

export interface TreeRenderOptions {
  fullPath: boolean
  trailingSlash: boolean
  rootDot: boolean
}
