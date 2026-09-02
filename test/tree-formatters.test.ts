import { describe, expect, it } from 'vite-plus/test'
import { parseInputOrThrow } from '../src/features/tree/domain/parse-tree-input'
import {
  findTreeRenderer,
  formatGroupsFromRegistry,
  formatTree,
  isFormatType,
  TREE_RENDERERS,
  type FormatType,
} from '../src/features/tree/domain/tree-formatters'
import { createTreeNodeFixture, defaultRenderOptions } from './test-helpers'

const structure = createTreeNodeFixture()

describe('tree format registry', () => {
  it('is the source of all four public format IDs', () => {
    expect(TREE_RENDERERS.map((renderer) => renderer.id)).toEqual([
      'utf-8',
      'ascii',
      'markdown',
      'json-array',
    ])
    expect(formatGroupsFromRegistry()).toEqual([
      {
        name: 'Tree Formats',
        formats: [
          { id: 'utf-8', label: 'UTF-8 Tree' },
          { id: 'ascii', label: 'ASCII Tree' },
          { id: 'markdown', label: 'Markdown List' },
        ],
      },
      {
        name: 'JSON Formats',
        formats: [{ id: 'json-array', label: 'JSON Array' }],
      },
    ])
  })

  it('validates runtime values and rejects unknown formats', () => {
    expect(isFormatType('markdown')).toBe(true)
    expect(isFormatType('yaml')).toBe(false)
    expect(() => findTreeRenderer('yaml' as FormatType)).toThrow('Unknown tree format')
  })

  it('records which formats support tree options', () => {
    expect(
      Object.fromEntries(
        TREE_RENDERERS.map((renderer) => [renderer.id, renderer.supportsTreeOptions]),
      ),
    ).toEqual({
      'utf-8': true,
      ascii: true,
      markdown: false,
      'json-array': false,
    })
  })
})

describe('formatTree', () => {
  it('renders every supported format', () => {
    expect(formatTree(structure, 'utf-8', defaultRenderOptions)).toContain('└── app')
    expect(formatTree(structure, 'ascii', defaultRenderOptions)).toContain('`-- app')
    expect(formatTree(structure, 'markdown', defaultRenderOptions)).toContain('* app/')
    expect(() =>
      JSON.parse(formatTree(structure, 'json-array', defaultRenderOptions)),
    ).not.toThrow()
  })

  it('keeps duplicate sibling names in lossless Array JSON', () => {
    const output = JSON.parse(
      formatTree(parseInputOrThrow('app\n  same\n  same'), 'json-array', defaultRenderOptions),
    ) as { children: Array<{ children: Array<{ name: string }> }> }
    expect(output.children[0]!.children.map((node) => node.name)).toEqual(['same', 'same'])
  })

  it('preserves empty directories in Array JSON', () => {
    const output = JSON.parse(
      formatTree(parseInputOrThrow('app\n  empty/'), 'json-array', defaultRenderOptions),
    ) as { children: Array<{ children: unknown[] }> }
    expect(output.children[0]!.children[0]).toEqual({ name: 'empty', type: 'directory' })
  })

  it('escapes punctuation so Markdown renders filenames literally', () => {
    const output = formatTree(
      parseInputOrThrow('app\n  [draft]*.md\n  #notes'),
      'markdown',
      defaultRenderOptions,
    )
    expect(output).toBe('* app/\n  * \\[draft\\]\\*\\.md\n  * \\#notes\n')
  })

  it('preserves Unicode names in all formats', () => {
    const tree = parseInputOrThrow('mý-app\n  🌳.txt')
    for (const renderer of TREE_RENDERERS) {
      expect(formatTree(tree, renderer.id, defaultRenderOptions)).toContain('🌳')
    }
  })
})
