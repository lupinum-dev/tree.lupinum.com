import { bench, describe } from 'vite-plus/test'
import { generateTree } from '../src/features/tree/domain/generate-tree'
import { parseInputOrThrow } from '../src/features/tree/domain/parse-tree-input'
import { formatTree } from '../src/features/tree/domain/tree-formatters'
import { defaultRenderOptions, nestedSource } from './test-helpers'

const wideInput = ['root', ...Array.from({ length: 9_999 }, (_, index) => `  file-${index}`)].join(
  '\n',
)
const deepInput = nestedSource(256)
const wideTree = parseInputOrThrow(wideInput)
const deepTree = parseInputOrThrow(deepInput)

describe('tree engine benchmarks', () => {
  bench('parse a 256-level tree', () => {
    parseInputOrThrow(deepInput)
  })

  bench('parse a 10,000-node tree', () => {
    parseInputOrThrow(wideInput)
  })

  bench('render a 256-level UTF-8 tree', () => {
    generateTree(deepTree)
  })

  bench('render a 10,000-node UTF-8 tree', () => {
    generateTree(wideTree)
  })

  bench('render a 10,000-node Array JSON tree', () => {
    formatTree(wideTree, 'json-array', defaultRenderOptions)
  })
})
