import { mockInput } from '~/lib/mock-input'
import type { TreeOptions } from '~/features/tree/domain/workspace.types'

export function useTreeGenerator() {
  const resetToDefault = () => ({
    source: mockInput,
    options: {
      format: 'utf-8',
      fullPath: false,
      trailingSlash: false,
      rootDot: true
    } satisfies TreeOptions
  })

  return {
    resetToDefault
  }
}
