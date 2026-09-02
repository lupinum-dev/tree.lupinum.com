import { parseTreeInput } from './parse-tree-input'
import type { FormatType, TreeFormatOptions } from './tree-formatters-impl'
import type { TreeDiagnostic } from './tree.types'
import { formatTreeFromNode } from './tree-format-registry'

export type BuildTreeOutput = { ok: true; output: string } | { ok: false; errors: TreeDiagnostic[] }

/** Parse + render in one step for the workspace UI. */
export function buildParsedTreeOutput(
  source: string,
  format: FormatType,
  options: TreeFormatOptions,
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
    const output = formatTreeFromNode(parsed.root, format, {
      trailingDirSlash: options.trailingDirSlash ?? options.trailingSlash,
      fullPath: options.fullPath,
      rootDot: options.rootDot,
      charset: options.charset,
    })
    return { ok: true, output }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to render tree'
    return {
      ok: false,
      errors: [{ line: 1, message: msg }],
    }
  }
}
