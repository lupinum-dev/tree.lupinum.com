import type { TreeNode } from '../src/features/tree/domain/tree.types'

/** Small hand-built tree useful for sanity checks */
export function createTreeNodeFixture(): TreeNode {
  const indexJs: TreeNode = {
    id: 'h-index',
    name: 'index.js',
    kind: 'file',
    children: [],
  }
  const src: TreeNode = {
    id: 'h-src',
    name: 'src',
    kind: 'directory',
    children: [indexJs],
  }
  const packageJson: TreeNode = {
    id: 'h-pkg',
    name: 'package.json',
    kind: 'file',
    children: [],
  }
  const app: TreeNode = {
    id: 'h-app',
    name: 'app',
    kind: 'directory',
    children: [src, packageJson],
  }
  return {
    id: 'h-root',
    name: '.',
    kind: 'directory',
    children: [app],
  }
}
