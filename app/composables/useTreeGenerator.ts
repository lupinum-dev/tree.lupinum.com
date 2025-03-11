import { mockInput } from '~/lib/mock-input'
import type { FormatType } from '~/lib/tree-formatters'

export interface TreeOptions {
  format: FormatType
  fullPath: boolean
  trailingSlash: boolean
  rootDot: boolean
}

export function useTreeGenerator() {
  // Default options
  const defaultOptions: TreeOptions = {
    format: 'utf-8',
    fullPath: false,
    trailingSlash: false,
    rootDot: true
  }

  // Reset to default example
  const resetToDefault = () => {
    return {
      source: mockInput,
      options: {
        format: 'utf-8',
        fullPath: false,
        trailingSlash: false,
        rootDot: true
      }
    }
  }

  return {
    defaultOptions,
    resetToDefault
  }
}