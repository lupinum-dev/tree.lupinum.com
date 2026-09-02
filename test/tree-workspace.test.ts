import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { nextTick } from 'vue'
import { toast } from 'vue-sonner'
import { DEFAULT_TREE_OPTIONS, type SavedTree } from '../src/features/tree/domain/workspace.types'
import { createTreeWorkspace } from '../src/features/tree/use-tree-workspace'
import {
  persistWorkspace,
  WORKSPACE_KEY_V1,
} from '../src/features/tree/infrastructure/persisted-workspace'

vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const existingTree: SavedTree = {
  id: 'existing',
  name: 'Existing',
  source: 'existing\n  file.ts',
  options: { ...DEFAULT_TREE_OPTIONS },
}

describe('tree workspace share integration', () => {
  beforeEach(() => {
    localStorage.clear()
    history.replaceState(null, '', '/')
    vi.clearAllMocks()
  })

  it('adds, selects, persists, and cleans a valid shared tree', async () => {
    persistWorkspace(localStorage, { tabs: [existingTree], activeTabId: existingTree.id })
    history.replaceState(null, '', '/#t=r.WzEsInNoYXJlZFxuICBmaWxlLnRzIl0')

    const workspace = createTreeWorkspace()
    await workspace.initClient()
    await nextTick()

    expect(workspace.trees.value).toHaveLength(2)
    expect(workspace.activeTree.value).toMatchObject({
      name: 'shared',
      source: 'shared\n  file.ts',
      options: DEFAULT_TREE_OPTIONS,
    })
    expect(workspace.trees.value[0]).toEqual(existingTree)
    expect(location.hash).toBe('')
    expect(JSON.parse(localStorage.getItem(WORKSPACE_KEY_V1) ?? '')).toMatchObject({
      tabs: [{ id: 'existing' }, { name: 'shared' }],
    })
    expect(toast.success).toHaveBeenCalledWith('Shared tree added')
    workspace.dispose()
  })

  it('selects an exact existing tree instead of importing the same link again', async () => {
    const matchingTree: SavedTree = {
      id: 'matching',
      name: 'Renamed local tree',
      source: 'shared\n  file.ts',
      options: { ...DEFAULT_TREE_OPTIONS },
    }
    persistWorkspace(localStorage, {
      tabs: [existingTree, matchingTree],
      activeTabId: existingTree.id,
    })
    history.replaceState(null, '', '/#t=r.WzEsInNoYXJlZFxuICBmaWxlLnRzIl0')

    const workspace = createTreeWorkspace()
    await workspace.initClient()

    expect(workspace.trees.value).toHaveLength(2)
    expect(workspace.activeTree.value).toEqual(matchingTree)
    expect(location.hash).toBe('')
    expect(toast.success).toHaveBeenCalledWith('Shared tree already open')
    workspace.dispose()
  })

  it('preserves local state and the fragment when a shared link is invalid', async () => {
    persistWorkspace(localStorage, { tabs: [existingTree], activeTabId: existingTree.id })
    history.replaceState(null, '', '/#t=r.invalid')

    const workspace = createTreeWorkspace()
    await workspace.initClient()

    expect(workspace.trees.value).toEqual([existingTree])
    expect(location.hash).toBe('#t=r.invalid')
    expect(toast.error).toHaveBeenCalledWith(
      'Unable to open shared tree',
      expect.objectContaining({ duration: Infinity }),
    )
    workspace.dispose()
  })

  it('keeps the fragment when the imported tree cannot be persisted', async () => {
    history.replaceState(null, '', '/#t=r.WzEsInNoYXJlZFxuICBmaWxlLnRzIl0')
    const setItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable')
    })

    const workspace = createTreeWorkspace()
    await workspace.initClient()

    expect(workspace.activeTree.value?.source).toBe('shared\n  file.ts')
    expect(location.hash).toContain('#t=')
    expect(workspace.saveStatus.value).toBe('error')
    expect(toast.success).not.toHaveBeenCalledWith('Shared tree added')
    setItem.mockRestore()
    workspace.dispose()
  })

  it('copies a share link without changing the current address', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    const workspace = createTreeWorkspace()
    await workspace.initClient()
    const before = location.href
    await workspace.copyShareLink()

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('#t='))
    expect(location.href).toBe(before)
    expect(toast.success).toHaveBeenCalledWith('Share link copied')
    workspace.dispose()
  })

  it('duplicates a tree with an independent options object and selects it', async () => {
    persistWorkspace(localStorage, { tabs: [existingTree], activeTabId: existingTree.id })
    const workspace = createTreeWorkspace()
    await workspace.initClient()

    const duplicate = workspace.duplicateTree(existingTree.id)

    expect(duplicate).toMatchObject({
      name: 'Existing copy',
      source: existingTree.source,
      options: existingTree.options,
    })
    expect(duplicate?.id).not.toBe(existingTree.id)
    expect(duplicate?.options).not.toBe(workspace.trees.value[0]?.options)
    expect(workspace.activeTreeId.value).toBe(duplicate?.id)
    expect(workspace.trees.value).toHaveLength(2)
    expect(toast.success).toHaveBeenCalledWith('Tree duplicated')
    workspace.dispose()
  })
})
