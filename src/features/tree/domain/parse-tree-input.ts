// Adapted from https://gitlab.com/nfriend/tree-online/ (Apache License 2.0)
import type { DirectoryNode, ParseResult, TreeNode } from './tree.types'

export const MAX_TREE_DEPTH = 256

const onlyWhitespaceRegex = /^\s*$/

export interface RawLine {
  name: string
  indentCount: number
  explicitDirectory: boolean
  /** 1-based source line number */
  sourceLineNumber: number
  /** 1-based column where the node name starts */
  nameColumn: number
  rawLine: string
}

interface DraftNode {
  name: string
  explicitDirectory: boolean
  children: DraftNode[]
}

interface IndentFrame {
  indent: number
  node: DraftNode
}

function indentationWidth(prefix: string): number {
  let width = 0
  for (const character of prefix) {
    width = character === '\t' ? width + (2 - (width % 2)) : width + 1
  }
  return width
}

/** Split user text into normalized line records. */
export function splitInputLines(input: string): RawLine[] {
  const output: RawLine[] = []

  input.split(/\r?\n/).forEach((lineContent, index) => {
    if (onlyWhitespaceRegex.test(lineContent)) return

    const leadingWhitespace = /^[ \t]*/.exec(lineContent)?.[0] ?? ''
    let content = lineContent.slice(leadingWhitespace.length)
    let bulletWidth = 0
    if (/^-\s/.test(content)) {
      bulletWidth = 2
      content = content.slice(2)
    }

    const trimmed = content.trimEnd()
    const explicitDirectory = trimmed.endsWith('/')

    output.push({
      name: explicitDirectory ? trimmed.slice(0, -1) : trimmed,
      indentCount: indentationWidth(leadingWhitespace),
      explicitDirectory,
      sourceLineNumber: index + 1,
      nameColumn: indentationWidth(leadingWhitespace) + bulletWidth + 1,
      rawLine: lineContent.trimEnd(),
    })
  })

  return output
}

/** Parse plain indentation into a typed virtual-root tree. */
export function parseTreeInput(input: string): ParseResult {
  if (typeof input !== 'string' || !input.trim()) {
    return {
      ok: false,
      errors: [
        {
          line: 1,
          column: 1,
          message: 'Input must be a non-empty string',
          lineContent: typeof input === 'string' ? input : undefined,
        },
      ],
    }
  }

  const lines = splitInputLines(input)
  const rootDraft: DraftNode = { name: '.', explicitDirectory: true, children: [] }
  const frames: IndentFrame[] = []
  const baseline = lines[0]!.indentCount

  for (const line of lines) {
    if (!line.name) {
      return {
        ok: false,
        errors: [
          {
            line: line.sourceLineNumber,
            column: line.nameColumn,
            message: 'Every tree entry needs a name',
            lineContent: line.rawLine,
          },
        ],
      }
    }

    let parent = rootDraft
    const current = frames.at(-1)

    if (current && line.indentCount > current.indent) {
      parent = current.node
    } else if (current) {
      let matchingLevel = -1
      for (let index = frames.length - 1; index >= 0; index--) {
        if (frames[index]!.indent === line.indentCount) {
          matchingLevel = index
          break
        }
      }
      if (matchingLevel === -1) {
        return {
          ok: false,
          errors: [
            {
              line: line.sourceLineNumber,
              column: line.nameColumn,
              message: `Indentation must return to an earlier level before "${line.name}"`,
              lineContent: line.rawLine,
            },
          ],
        }
      }
      frames.length = matchingLevel
      parent = frames.at(-1)?.node ?? rootDraft
    } else if (line.indentCount !== baseline) {
      return {
        ok: false,
        errors: [
          {
            line: line.sourceLineNumber,
            column: line.nameColumn,
            message: `Indentation before "${line.name}" is outside the tree's base level`,
            lineContent: line.rawLine,
          },
        ],
      }
    }

    const depth = frames.length + 1
    if (depth > MAX_TREE_DEPTH) {
      return {
        ok: false,
        errors: [
          {
            line: line.sourceLineNumber,
            column: line.nameColumn,
            message: `Trees can be at most ${MAX_TREE_DEPTH} levels deep`,
            lineContent: line.rawLine,
          },
        ],
      }
    }

    const node: DraftNode = {
      name: line.name,
      explicitDirectory: line.explicitDirectory,
      children: [],
    }
    parent.children.push(node)
    frames.push({ indent: line.indentCount, node })
  }

  return { ok: true, root: finalizeTree(rootDraft) }
}

function finalizeTree(root: DraftNode): DirectoryNode {
  const finalized = new Map<DraftNode, TreeNode>()
  const stack: Array<{ node: DraftNode; visited: boolean }> = [{ node: root, visited: false }]

  while (stack.length > 0) {
    const frame = stack.pop()!
    if (!frame.visited) {
      stack.push({ node: frame.node, visited: true })
      for (let index = frame.node.children.length - 1; index >= 0; index--) {
        stack.push({ node: frame.node.children[index]!, visited: false })
      }
      continue
    }

    const children = frame.node.children.map((child) => finalized.get(child)!)
    finalized.set(
      frame.node,
      children.length > 0 || frame.node.explicitDirectory
        ? { name: frame.node.name, kind: 'directory', children }
        : { name: frame.node.name, kind: 'file' },
    )
  }

  const finalizedRoot = finalized.get(root)
  if (!finalizedRoot || finalizedRoot.kind !== 'directory') {
    throw new Error('Virtual tree root must be a directory')
  }
  return finalizedRoot
}

/** Parse input or throw with the first diagnostic message. */
export function parseInputOrThrow(input: string): DirectoryNode {
  const result = parseTreeInput(input)
  if (!result.ok) throw new Error(result.errors[0]?.message ?? 'Parse failed')
  return result.root
}
