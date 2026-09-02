import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import { parseInputOrThrow } from '../src/features/tree/domain/parse-tree-input'
import { formatTree, TREE_RENDERERS } from '../src/features/tree/domain/tree-formatters'
import { defaultRenderOptions } from './test-helpers'

const here = dirname(fileURLToPath(import.meta.url))

describe('format golden fixture', () => {
  it('locks the output of every public format', () => {
    const source = readFileSync(join(here, 'fixtures', 'basic.input.txt'), 'utf8').trim()
    const tree = parseInputOrThrow(source)
    const outputs = Object.fromEntries(
      TREE_RENDERERS.map((renderer) => [
        renderer.id,
        formatTree(tree, renderer.id, defaultRenderOptions),
      ]),
    )
    expect(outputs).toMatchSnapshot()
  })
})
