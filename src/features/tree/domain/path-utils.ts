import type { TreeNode } from './tree.types'

/** Path segments joined from virtual root excluding `.`. */
export function fullPathBelowRoot(
  item: TreeNode,
  parentOf: Map<TreeNode, TreeNode | null>,
): string {
  const segments: string[] = []
  let current: TreeNode | null = item
  while (current && current.name !== '.') {
    segments.unshift(current.name)
    current = parentOf.get(current) ?? null
  }
  return segments.join('/')
}

/** Parent pointers for traversal */
export function buildParentMap(root: TreeNode): Map<TreeNode, TreeNode | null> {
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
