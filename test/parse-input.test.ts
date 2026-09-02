import { describe, expect, it } from 'vite-plus/test'
import {
  MAX_TREE_DEPTH,
  parseInputOrThrow,
  parseTreeInput,
  splitInputLines,
} from '../src/features/tree/domain/parse-tree-input'
import type { DirectoryNode, TreeNode } from '../src/features/tree/domain/tree.types'
import { nestedSource } from './test-helpers'

function getChild(root: DirectoryNode, ...names: string[]): TreeNode {
  let current: TreeNode = root
  for (const name of names) {
    if (current.kind !== 'directory') throw new Error(`"${current.name}" is not a directory`)
    const child: TreeNode | undefined = current.children.find(
      (candidate: TreeNode) => candidate.name === name,
    )
    if (!child) throw new Error(`Missing "${name}" under "${current.name}"`)
    current = child
  }
  return current
}

describe('splitInputLines', () => {
  it('normalizes spaces, tabs, bullets, blank lines, and trailing directory slashes', () => {
    const lines = splitInputLines('- app/\n\n\t- src\n\t\tindex.js')
    expect(lines).toMatchObject([
      { name: 'app', indentCount: 0, explicitDirectory: true, sourceLineNumber: 1 },
      { name: 'src', indentCount: 2, explicitDirectory: false, sourceLineNumber: 3 },
      { name: 'index.js', indentCount: 4, explicitDirectory: false, sourceLineNumber: 4 },
    ])
  })
})

describe('parseTreeInput', () => {
  it.each([
    ['two spaces', 'app\n  src\n    index.js'],
    ['four spaces', 'app\n    src\n        index.js'],
    ['tabs', 'app\n\tsrc\n\t\tindex.js'],
    ['shared leading indentation', '      app\n        src\n          index.js'],
  ])('parses %s as the same hierarchy', (_, source) => {
    const root = parseInputOrThrow(source)
    expect(getChild(root, 'app', 'src', 'index.js')).toEqual({
      name: 'index.js',
      kind: 'file',
    })
  })

  it('supports valid dedents and multiple top-level entries', () => {
    const root = parseInputOrThrow('app\n  src\n    index.js\n  README.md\nother')
    expect(root.children.map((node) => node.name)).toEqual(['app', 'other'])
    const app = getChild(root, 'app')
    expect(app.kind === 'directory' && app.children.map((node) => node.name)).toEqual([
      'src',
      'README.md',
    ])
  })

  it('rejects a dedent that does not match an established level', () => {
    const result = parseTreeInput('app\n    src\n  misplaced')
    expect(result).toMatchObject({
      ok: false,
      errors: [{ line: 3, column: 3 }],
    })
  })

  it.each(['', '  \n\t'])('rejects empty input', (source) => {
    expect(parseTreeInput(source).ok).toBe(false)
  })

  it.each(['- ', '/'])('rejects entries without names', (source) => {
    expect(parseTreeInput(source)).toMatchObject({
      ok: false,
      errors: [{ line: 1, message: 'Every tree entry needs a name' }],
    })
  })

  it('preserves explicit empty directories', () => {
    expect(getChild(parseInputOrThrow('app\n  empty/'), 'app', 'empty')).toEqual({
      name: 'empty',
      kind: 'directory',
      children: [],
    })
  })

  it('accepts the maximum depth and rejects one more level', () => {
    expect(parseTreeInput(nestedSource(MAX_TREE_DEPTH)).ok).toBe(true)
    expect(parseTreeInput(nestedSource(MAX_TREE_DEPTH + 1))).toMatchObject({
      ok: false,
      errors: [{ line: MAX_TREE_DEPTH + 1 }],
    })
  })

  it('returns diagnostics instead of throwing for non-string runtime input', () => {
    expect(parseTreeInput(null as unknown as string).ok).toBe(false)
  })
})
