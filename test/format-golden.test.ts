import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { parseInput } from '../app/lib/parse-input'
import { formatTreeFromNode } from '../app/lib/tree-formatters'

const here = dirname(fileURLToPath(import.meta.url))
const fixture = (name: string) => readFileSync(join(here, 'fixtures', name), 'utf8')

describe('golden fixtures', () => {
  it('basic input matches utf-8 tree snapshot', () => {
    const input = fixture('basic.input.txt')
    const tree = parseInput(input.trim())
    const out = formatTreeFromNode(tree, 'utf-8', { rootDot: true })
    expect(out).toMatchSnapshot()
  })
})
