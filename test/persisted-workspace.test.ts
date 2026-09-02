import { beforeEach, describe, expect, it } from 'vite-plus/test'
import type { SavedTree } from '../src/features/tree/domain/workspace.types'
import {
  loadPersistedWorkspace,
  persistWorkspace,
  WORKSPACE_KEY_V1,
} from '../src/features/tree/infrastructure/persisted-workspace'

const savedTree: SavedTree = {
  id: 'tree-a',
  name: 'Website',
  source: 'website\n  src',
  options: {
    format: 'utf-8',
    fullPath: false,
    trailingSlash: true,
    rootDot: true,
  },
}

describe('persisted workspace', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips the existing version 1 storage contract', () => {
    persistWorkspace(localStorage, { tabs: [savedTree], activeTabId: savedTree.id })

    expect(loadPersistedWorkspace(localStorage)).toEqual({
      version: 1,
      activeTabId: savedTree.id,
      tabs: [savedTree],
    })
  })

  it('migrates legacy tab keys without losing content', () => {
    localStorage.setItem('tree-tabs', JSON.stringify([savedTree]))
    localStorage.setItem('active-tab-id', savedTree.id)

    expect(loadPersistedWorkspace(localStorage)?.tabs).toEqual([savedTree])
    expect(localStorage.getItem('tree-tabs')).toBeNull()
    expect(JSON.parse(localStorage.getItem(WORKSPACE_KEY_V1) ?? '')).toMatchObject({
      version: 1,
      activeTabId: savedTree.id,
    })
  })

  it('ignores malformed saved data', () => {
    localStorage.setItem(WORKSPACE_KEY_V1, '{broken')
    localStorage.setItem('tree-tabs', JSON.stringify([{ id: 1 }]))

    expect(loadPersistedWorkspace(localStorage)).toBeNull()
  })
})
