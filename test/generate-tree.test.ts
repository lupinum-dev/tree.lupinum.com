import { describe, expect, it } from 'vite-plus/test'
import { generateTree } from '../src/features/tree/domain/generate-tree'
import { parseInputOrThrow } from '../src/features/tree/domain/parse-tree-input'
import type { DirectoryNode, TreeRenderOptions } from '../src/features/tree/domain/tree.types'
import { createTreeNodeFixture, defaultRenderOptions } from './test-helpers'

const structure = createTreeNodeFixture()

function render(options: Partial<TreeRenderOptions> = {}, charset: 'ascii' | 'utf-8' = 'utf-8') {
  return generateTree(structure, charset, { ...defaultRenderOptions, ...options })
}

describe('generateTree', () => {
  it('generates the complete UTF-8 tree', () => {
    expect(render()).toBe(
      ['.', '└── app', '    ├── src', '    │   └── index.js', '    └── package.json'].join('\n'),
    )
  })

  it('generates the complete ASCII tree', () => {
    expect(render({}, 'ascii')).toBe(
      ['.', '`-- app', '    |-- src', '    |   `-- index.js', '    `-- package.json'].join('\n'),
    )
  })

  it('supports root, path, and directory suffix options together', () => {
    expect(render({ rootDot: false, fullPath: true, trailingSlash: true })).toBe(
      ['app/', '├── app/src/', '│   └── app/src/index.js', '└── app/package.json'].join('\n'),
    )
  })

  it('covers every boolean option combination', () => {
    for (let flags = 0; flags < 8; flags++) {
      const output = render({
        fullPath: (flags & 1) !== 0,
        trailingSlash: (flags & 2) !== 0,
        rootDot: (flags & 4) === 0,
      })
      expect(output).toContain('index.js')
      expect(output.startsWith('.') === ((flags & 4) === 0)).toBe(true)
      expect(output.includes('app/src/index.js')).toBe((flags & 1) !== 0)
      expect(output.includes('app/')).toBe((flags & 2) !== 0 || (flags & 1) !== 0)
    }
  })

  it('supports multiple top-level nodes without a virtual root line', () => {
    const tree = parseInputOrThrow('one\ntwo')
    expect(generateTree(tree, 'utf-8', { ...defaultRenderOptions, rootDot: false })).toBe(
      'one\ntwo',
    )
  })

  it('handles an empty virtual root', () => {
    const empty: DirectoryNode = { name: '.', kind: 'directory', children: [] }
    expect(generateTree(empty)).toBe('.')
  })

  it('rejects a missing structure at the runtime boundary', () => {
    // @ts-expect-error Testing an invalid runtime caller.
    expect(() => generateTree(null)).toThrow('Structure is required')
  })
})
