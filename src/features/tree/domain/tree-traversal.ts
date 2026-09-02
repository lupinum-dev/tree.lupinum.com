import type { DirectoryNode, TreeNode } from './tree.types'

export interface TreeVisit {
  node: TreeNode
  parent: DirectoryNode | null
  depth: number
  isLast: boolean
  ancestorIsLast: readonly boolean[]
  path: string
}

/** Pre-order traversal without recursion or parent pointers in the domain model. */
export function* walkTree(root: DirectoryNode): Generator<TreeVisit> {
  const stack: TreeVisit[] = [
    {
      node: root,
      parent: null,
      depth: 0,
      isLast: true,
      ancestorIsLast: [],
      path: '',
    },
  ]

  while (stack.length > 0) {
    const visit = stack.pop()!
    yield visit

    if (visit.node.kind !== 'directory') continue

    for (let index = visit.node.children.length - 1; index >= 0; index--) {
      const child = visit.node.children[index]!
      const isLast = index === visit.node.children.length - 1
      stack.push({
        node: child,
        parent: visit.node,
        depth: visit.depth + 1,
        isLast,
        ancestorIsLast: visit.depth === 0 ? [] : [...visit.ancestorIsLast, visit.isLast],
        path: visit.path ? `${visit.path}/${child.name}` : child.name,
      })
    }
  }
}
