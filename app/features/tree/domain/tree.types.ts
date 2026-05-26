/**
 * Domain model for parsed tree structures (framework-agnostic).
 */

export type TreeNodeKind = 'file' | 'directory'

/** Single node in a file tree */
export interface TreeNode {
  id: string
  name: string
  kind: TreeNodeKind
  children: TreeNode[]
}

export interface TreeDiagnostic {
  /** 1-based line number in user input */
  line: number
  column?: number
  message: string
  lineContent?: string
}

export type ParseResult =
  | { ok: true, root: TreeNode }
  | { ok: false, errors: TreeDiagnostic[] }

/** Options shared by ASCII/UTF tree renderers */
export interface TreeRenderOptions {
  charset?: 'ascii' | 'utf-8'
  trailingDirSlash?: boolean
  fullPath?: boolean
  rootDot?: boolean
}
