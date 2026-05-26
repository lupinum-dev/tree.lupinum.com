import { describe, it, expect } from 'vitest'
import {
  splitInputLines,
  parseTreeInput,
  parseInputOrThrow as parseInput
} from '../app/lib/parse-input'
import type { TreeNode } from '../app/features/tree/domain/tree.types'

describe('splitInputLines', () => {
  it('should split a simple string into RawLine records', () => {
    const input = 'app\n  src\n    index.js'
    const result = splitInputLines(input)

    expect(result).toHaveLength(3)
    expect(result[0]?.name).toBe('app')
    expect(result[0]?.indentCount).toBe(0)
    expect(result[1]?.name).toBe('src')
    expect(result[1]?.indentCount).toBe(2)
    expect(result[2]?.name).toBe('index.js')
    expect(result[2]?.indentCount).toBe(4)
  })

  it('should handle markdown bullet points', () => {
    const input = '- app\n  - src\n    - index.js'
    const result = splitInputLines(input)

    expect(result).toHaveLength(3)
    expect(result[0]?.name).toBe('app')
    expect(result[0]?.indentCount).toBe(0)
  })

  it('should filter out empty lines', () => {
    const input = 'app\n\n  src\n    \n    index.js'
    expect(splitInputLines(input)).toHaveLength(3)
  })

  it('should return empty array for empty input', () => {
    expect(splitInputLines('')).toEqual([])
  })

  it('detects trailing slash as explicit directory marker', () => {
    const r = splitInputLines('packages/\n  a')
    expect(r[0]?.explicitDirectory).toBe(true)
    expect(r[0]?.name).toBe('packages')
  })
})

function getChild(root: TreeNode, ...names: string[]): TreeNode {
  let cur: TreeNode = root
  for (const name of names) {
    const next = cur.children.find(c => c.name === name)
    if (!next) throw new Error(`Missing "${name}" under ${cur.name}`)
    cur = next
  }
  return cur
}

describe('parseTreeInput', () => {
  it('parses OK for valid input', () => {
    const r = parseTreeInput('app\n  x')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.root.name).toBe('.')
  })

  it('rejects non-string inputs', () => {
    expect(parseTreeInput(null as unknown as string).ok).toBe(false)
    expect(parseTreeInput(123 as unknown as string).ok).toBe(false)
  })

  it('rejects empty string', () => {
    expect(parseTreeInput('').ok).toBe(false)
    expect(parseTreeInput('   \n  ').ok).toBe(false)
  })

  it('includes line number on indentation errors when possible', () => {
    const r = parseTreeInput('app\n        bad')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors.some(e => e.line >= 2)).toBe(true)
  })
})

describe('parseInput', () => {
  it('should parse a basic tree structure', () => {
    const input = 'app\n  src\n    index.js\n  package.json'
    const result = parseInput(input)

    expect(result.name).toBe('.')
    expect(result.children).toHaveLength(1)

    const app = getChild(result, 'app')
    expect(app.kind).toBe('directory')
    expect(app.children).toHaveLength(2)

    const src = getChild(result, 'app', 'src')
    expect(src.kind).toBe('directory')
    expect(src.children).toHaveLength(1)

    const indexJs = getChild(result, 'app', 'src', 'index.js')
    expect(indexJs.kind).toBe('file')
    expect(indexJs.children).toHaveLength(0)

    const pkg = getChild(result, 'app', 'package.json')
    expect(pkg.kind).toBe('file')
  })

  it('should handle files at the same level', () => {
    const input = 'app\n  file1.js\n  file2.js\n  file3.js'
    const result = parseInput(input)
    const app = getChild(result, 'app')
    expect(app.children).toHaveLength(3)
    expect(app.children.every(c => c.kind === 'file')).toBe(true)
  })

  it('should handle multiple root level items', () => {
    const input = 'app1\napp2\napp3'
    const result = parseInput(input)
    expect(result.children).toHaveLength(3)
    expect(result.children.map(c => c.name)).toEqual(['app1', 'app2', 'app3'])
  })

  it('should throw error for invalid string inputs via parseInput', () => {
    expect(() => parseInput(null as unknown as string)).toThrow(/Input must be a non-empty string/)
    expect(() => parseInput(123 as unknown as string)).toThrow(/Input must be a non-empty string/)
    expect(() => parseInput('')).toThrow(/Input must be a non-empty string/)
  })

  it('should handle real-world example', () => {
    const input = [
      'my-project',
      '  node_modules',
      '    lodash',
      '      package.json',
      '  src',
      '    components',
      '      Button.js',
      '      Card.js',
      '    App.js',
      '    index.js',
      '  package.json',
      '  README.md'
    ].join('\n')

    const result = parseInput(input)

    expect(result.children).toHaveLength(1)
    expect(getChild(result, 'my-project').children).toHaveLength(4)
    expect(getChild(result, 'my-project', 'src', 'components', 'Button.js').kind).toBe('file')
    expect(getChild(result, 'my-project', 'node_modules', 'lodash', 'package.json').kind).toBe('file')
    expect(getChild(result, 'my-project', 'README.md').kind).toBe('file')
  })
})
