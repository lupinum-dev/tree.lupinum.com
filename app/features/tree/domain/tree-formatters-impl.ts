import type { TreeNode } from './tree.types'
import { generateTree, type GenerateTreeOptions } from './generate-tree'
import { buildParentMap, fullPathBelowRoot } from './path-utils'

export type FormatType =
  | 'ascii'
  | 'utf-8'
  | 'json-nested'
  | 'json-array'
  | 'json-flat'
  | 'yaml'
  | 'xml'
  | 'dot'
  | 'markdown'

export interface TreeFormatOptions extends Partial<GenerateTreeOptions> {
  /** Alias used by UI */
  trailingSlash?: boolean
}

export function toGeneratorOptions(o: TreeFormatOptions): GenerateTreeOptions {
  return {
    charset: o.charset,
    trailingDirSlash: o.trailingDirSlash ?? o.trailingSlash,
    fullPath: o.fullPath,
    rootDot: o.rootDot
  }
}

export function formatNestedJson(structure: TreeNode): string {
  if (!structure) throw new Error('Structure is required')

  const createNestedObject = (item: TreeNode): unknown => {
    if (item.kind === 'file') return null
    if (item.children.length === 0) return {}
    const result: Record<string, unknown> = {}
    for (const child of item.children) {
      result[child.name] = createNestedObject(child)
    }
    return result
  }

  const rootObj: Record<string, unknown> = {}
  rootObj[structure.name] = createNestedObject(structure)
  return JSON.stringify(rootObj, null, 2)
}

export function formatArrayJson(structure: TreeNode): string {
  if (!structure) throw new Error('Structure is required')

  const convert = (item: TreeNode): Record<string, unknown> => {
    const result: Record<string, unknown> = {
      name: item.name === '.' ? 'root' : item.name,
      type: item.kind === 'directory' ? 'directory' : 'file'
    }
    if (item.kind === 'directory' && item.children.length > 0) {
      result.children = item.children.map(convert)
    }
    return result
  }

  return JSON.stringify(convert(structure), null, 2)
}

export function formatFlatJson(structure: TreeNode): string {
  if (!structure) throw new Error('Structure is required')
  const parentMap = buildParentMap(structure)
  const files: Array<{ path: string, type: 'file' }> = []
  const directories: Array<{ path: string }> = []

  const walk = (item: TreeNode): void => {
    if (item.name !== '.') {
      const path = fullPathBelowRoot(item, parentMap)
      if (item.kind === 'directory') directories.push({ path })
      else files.push({ path, type: 'file' })
    }
    for (const c of item.children) walk(c)
  }
  walk(structure)

  return JSON.stringify({ files, directories }, null, 2)
}

const jsonToYaml = (obj: Record<string, unknown>, indent = 0): string => {
  let result = ''
  const spaces = ' '.repeat(indent)

  for (const [key, value] of Object.entries(obj)) {
    if (value === null) {
      result += `${spaces}${key}: null\n`
    } else if (typeof value === 'object' && value !== null) {
      result += `${spaces}${key}:\n`
      result += jsonToYaml(value as Record<string, unknown>, indent + 2)
    }
  }

  return result
}

export function formatYaml(structure: TreeNode): string {
  if (!structure) throw new Error('Structure is required')
  const jsonString = formatNestedJson(structure)
  const obj = JSON.parse(jsonString) as Record<string, unknown>
  const rootObj: Record<string, unknown> = {}
  const originalKey = Object.keys(obj)[0]
  rootObj.root = obj[originalKey as string]
  return jsonToYaml(rootObj)
}

export function formatXml(structure: TreeNode): string {
  if (!structure) throw new Error('Structure is required')

  const escape = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')

  const elem = (item: TreeNode, indent = 0): string => {
    const spaces = ' '.repeat(indent)
    const isRoot = item.name === '.'
    const name = isRoot ? 'root' : item.name
    const escapedName = escape(name)

    if (item.kind === 'file') {
      return `${spaces}<file name="${escapedName}" />\n`
    }

    let result = `${spaces}<directory name="${escapedName}">\n`
    for (const child of item.children) {
      result += elem(child, indent + 2)
    }
    result += `${spaces}</directory>\n`
    return result
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n${elem(structure)}`
}

export function formatDot(structure: TreeNode): string {
  if (!structure) throw new Error('Structure is required')
  const pm = buildParentMap(structure)
  const paths: string[] = []
  const walk = (item: TreeNode): void => {
    if (item.name !== '.') paths.push(fullPathBelowRoot(item, pm))
    for (const c of item.children) walk(c)
  }
  walk(structure)
  return paths.sort().join('\n')
}

export function formatMarkdown(structure: TreeNode): string {
  if (!structure) throw new Error('Structure is required')

  const list = (item: TreeNode, indent = 0): string => {
    const spaces = ' '.repeat(indent)
    if (item.name === '.') {
      return item.children.map(child => list(child, indent)).join('')
    }
    const suffix = item.kind === 'directory' ? '/' : ''
    let result = `${spaces}* ${item.name}${suffix}\n`
    for (const child of item.children) {
      result += list(child, indent + 2)
    }
    return result
  }

  return list(structure)
}

export function formatAsciiTree(tree: TreeNode, opts?: TreeFormatOptions): string {
  return generateTree(tree, { ...toGeneratorOptions(opts || {}), charset: 'ascii' })
}

export function formatUtf8Tree(tree: TreeNode, opts?: TreeFormatOptions): string {
  return generateTree(tree, { ...toGeneratorOptions(opts || {}), charset: 'utf-8' })
}
