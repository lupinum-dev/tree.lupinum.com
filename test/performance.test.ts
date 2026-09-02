import { describe, expect, it } from 'vite-plus/test'
import { generateTree } from '../src/features/tree/domain/generate-tree'
import { MAX_TREE_DEPTH, parseInputOrThrow } from '../src/features/tree/domain/parse-tree-input'
import { formatTree } from '../src/features/tree/domain/tree-formatters'
import { defaultRenderOptions, nestedSource } from './test-helpers'

describe('large tree behavior', () => {
  it('parses and renders the maximum supported depth without recursion errors', () => {
    const tree = parseInputOrThrow(nestedSource(MAX_TREE_DEPTH))
    const output = generateTree(tree)
    expect(output.split('\n')).toHaveLength(MAX_TREE_DEPTH + 1)
    expect(output).toContain(`level-${MAX_TREE_DEPTH - 1}`)
  })

  it('parses and renders a wide 10,000-node tree', () => {
    const source = ['root', ...Array.from({ length: 9_999 }, (_, index) => `  file-${index}`)].join(
      '\n',
    )
    const tree = parseInputOrThrow(source)
    expect(generateTree(tree).split('\n')).toHaveLength(10_001)
    expect(JSON.parse(formatTree(tree, 'json-array', defaultRenderOptions))).toBeDefined()
  })
})
