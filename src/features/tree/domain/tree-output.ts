import { parseTreeInput } from './parse-tree-input'
import { formatTree, type FormatType } from './tree-formatters'
import type { TreeDiagnostic } from './tree.types'
import type { TreeRenderOptions } from './tree.types'

export type BuildTreeOutput = { ok: true; output: string } | { ok: false; errors: TreeDiagnostic[] }

/** Parse + render in one step for the workspace UI. */
export function buildParsedTreeOutput(
  source: string,
  format: FormatType,
  options: TreeRenderOptions,
): BuildTreeOutput {
  const trimmed = source.trim()
  if (!trimmed) {
    return { ok: true, output: '' }
  }

  const parsed = parseTreeInput(source)
  if (!parsed.ok) {
    return { ok: false, errors: parsed.errors }
  }

  try {
    const output = formatTree(parsed.root, format, options)
    return { ok: true, output }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to render tree'
    return {
      ok: false,
      errors: [{ line: 1, message: msg }],
    }
  }
}
