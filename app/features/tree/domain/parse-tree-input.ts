// Adapted from https://gitlab.com/nfriend/tree-online/ (Apache License 2.0)
import type { ParseResult, TreeNode, TreeNodeKind } from './tree.types'

/**
 * Matches the whitespace in front of a file name.
 * Also matches an optional markdown bullet point.
 */
const leadingWhitespaceAndBulletRegex = /^((\s*)(?:-\s)?)/

const onlyWhitespaceRegex = /^\s*$/

let parseIdSeq = 0
function nextId(): string {
  parseIdSeq += 1
  return `node-${parseIdSeq}`
}

export interface RawLine {
  name: string
  indentCount: number
  explicitDirectory: boolean
  /** 1-based source line number */
  sourceLineNumber: number
  rawLine: string
}

type StackNode = TreeNode & {
  _indent: number
  _explicitDir: boolean
}

/**
 * Split user text into line records (exported for tests).
 */
export function splitInputLines(input: string): RawLine[] {
  const textLines = input.split(/\r?\n/)

  const out: RawLine[] = []

  textLines.forEach((lineContent, idx) => {
    if (onlyWhitespaceRegex.test(lineContent)) return

    const matchResult = leadingWhitespaceAndBulletRegex.exec(lineContent)

    if (!matchResult) {
      return
    }

    const prefix = matchResult[1] ?? ''
    const indentPart = matchResult[2] ?? ''
    const rest = lineContent.replace(prefix, '')
    const trimmed = rest.trimEnd()
    const explicitDirectory = trimmed.endsWith('/')
    const nameRaw = explicitDirectory ? trimmed.slice(0, -1) : trimmed
    const indentCount = indentPart.length

    out.push({
      name: nameRaw,
      indentCount,
      explicitDirectory,
      sourceLineNumber: idx + 1,
      rawLine: lineContent.trimEnd()
    })
  })

  return out
}

/** @deprecated Prefer splitInputLines */
export function splitInput(input: string): RawLine[] {
  return splitInputLines(input)
}

/**
 * Parses plain-text tree input into a rooted {@link TreeNode}.
 */
export function parseTreeInput(input: string): ParseResult {
  parseIdSeq = 0
  if (input === null || typeof input !== 'string') {
    return {
      ok: false,
      errors: [{ line: 1, message: 'Input must be a non-empty string' }]
    }
  }

  if (!input.trim()) {
    return {
      ok: false,
      errors: [{ line: 1, message: 'Input must be a non-empty string', lineContent: input }]
    }
  }

  const rawLines = splitInputLines(input)
  if (rawLines.length === 0) {
    return {
      ok: false,
      errors: [{ line: 1, message: 'Input must contain at least one non-blank line' }]
    }
  }

  const root = {
    id: nextId(),
    name: '.',
    kind: 'directory',
    children: [],
    _indent: -1,
    _explicitDir: false
  } satisfies StackNode

  const stack: StackNode[] = [root]

  for (const line of rawLines) {
    const lineNo = line.sourceLineNumber
    const peek = stack[stack.length - 1]!

    let lastIndent = peek._indent
    if (peek.name === '.') lastIndent = -1

    if (line.indentCount > lastIndent + 2 && lastIndent !== -1) {
      return {
        ok: false,
        errors: [{
          line: lineNo,
          message: `Bad indentation before "${line.name || '(empty)'}" (indent jumped more than 2 spaces)`,
          lineContent: line.rawLine
        }]
      }
    }

    while (stack.length > 1) {
      const top = stack[stack.length - 1]!
      const topIndent = top.name === '.' ? -1 : top._indent
      if (topIndent >= line.indentCount) {
        stack.pop()
      } else {
        break
      }
    }

    const parent = stack[stack.length - 1]
    if (!parent || stack.length === 0) {
      return {
        ok: false,
        errors: [{
          line: lineNo,
          message: `Bad indentation found at "${line.name}"`,
          lineContent: line.rawLine
        }]
      }
    }

    const provisionalKind: TreeNodeKind
      = line.explicitDirectory ? 'directory' : 'file'

    const node: StackNode = {
      id: nextId(),
      name: line.name,
      kind: provisionalKind,
      children: [],
      _indent: line.indentCount,
      _explicitDir: line.explicitDirectory
    }

    parent.children.push(node)
    stack.push(node)
  }

  finalizeKinds(root)
  stripInternal(root)

  return { ok: true, root }
}

function finalizeKinds(node: TreeNode): void {
  for (const child of node.children) {
    const s = child as StackNode
    if (child.children.length > 0) {
      child.kind = 'directory'
    } else if (s._explicitDir) {
      child.kind = 'directory'
    } else {
      child.kind = 'file'
    }
    finalizeKinds(child)
  }
}

function stripInternal(node: TreeNode): void {
  delete (node as Partial<StackNode>)._indent
  delete (node as Partial<StackNode>)._explicitDir
  for (const child of node.children) stripInternal(child)
}

/**
 * Parses input or throws with the first error message (compat for callers/tests).
 */
export function parseInputOrThrow(input: string): TreeNode {
  const r = parseTreeInput(input)
  if (!r.ok) {
    const first = r.errors[0]
    throw new Error(first?.message ?? 'Parse failed')
  }
  return r.root
}
