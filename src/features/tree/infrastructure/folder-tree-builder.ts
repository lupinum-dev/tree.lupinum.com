/** Build tree input text from folder {@link File[]} (webkitRelativePath). */
export function filesToTreeSourceText(files: File[]): string | null {
  if (files.length === 0) return null

  const fileStructure = new Map<string, Set<string>>()

  for (const file of files) {
    const path = file.webkitRelativePath

    if (path.includes('/.ignore/') || path.split('/').some((part) => part.endsWith('.ignore'))) {
      continue
    }

    const parts = path.split('/')
    for (let j = 0; j < parts.length; j++) {
      const currentPath = parts.slice(0, j).join('/')
      const childName = parts[j]!
      if (!fileStructure.has(currentPath)) fileStructure.set(currentPath, new Set())
      fileStructure.get(currentPath)!.add(childName)
    }
  }

  let result = ''

  const buildTree = (path: string, indent: number) => {
    const children = fileStructure.get(path)
    if (!children) return

    const sortedChildren = Array.from(children).sort((a, b) => {
      const childPathA = path ? `${path}/${a}` : a
      const childPathB = path ? `${path}/${b}` : b
      const aIsDir = fileStructure.has(childPathA)
      const bIsDir = fileStructure.has(childPathB)
      if (aIsDir && !bIsDir) return -1
      if (!aIsDir && bIsDir) return 1
      return a.localeCompare(b)
    })

    for (const child of sortedChildren) {
      const childPath = path ? `${path}/${child}` : child
      const isDirectory = fileStructure.has(childPath)
      result += ' '.repeat(indent)
      result += isDirectory ? `${child}/` : child
      result += '\n'
      if (isDirectory) buildTree(childPath, indent + 2)
    }
  }

  const rootDir = files[0]!.webkitRelativePath.split('/')[0]!
  result = `${rootDir}/\n`
  buildTree(rootDir, 2)

  return result.trim()
}
