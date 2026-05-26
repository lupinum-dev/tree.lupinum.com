import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { PersistedTreeWorkspaceV1, TreeOptions, TreeTab } from '~/features/tree/domain/workspace.types'
import { loadPersistedWorkspace, persistWorkspace } from '~/features/tree/infrastructure/persisted-workspace'
import { RENDERERS_BY_ID } from '~/features/tree/domain/tree-format-registry'
import type { FormatType } from '~/features/tree/domain/tree-formatters-impl'
import { mockInput } from '~/lib/mock-input'

export type { TreeTab, TreeOptions }

const defaultOpts = (): TreeOptions => ({
  format: 'utf-8',
  fullPath: false,
  trailingSlash: false,
  rootDot: true
})

function normalizeTab(tab: TreeTab): TreeTab {
  const fmt = tab.options?.format
  const safeFormat: FormatType = fmt && fmt in RENDERERS_BY_ID ? fmt : 'utf-8'
  return {
    ...tab,
    options: {
      ...defaultOpts(),
      ...tab.options,
      format: safeFormat
    }
  }
}

export function useTreeTabs() {
  const tabs = ref<TreeTab[]>([])
  const activeTabId = ref<string>('')

  const activeTab = computed(() => tabs.value.find(t => t.id === activeTabId.value) ?? null)

  const initializeTabs = () => {
    if (tabs.value.length > 0) return
    const defaultTab: TreeTab = {
      id: uuidv4(),
      name: 'Tree 1',
      source: mockInput,
      options: defaultOpts()
    }
    tabs.value.push(defaultTab)
    activeTabId.value = defaultTab.id
  }

  const addTab = () => {
    const n = tabs.value.length + 1
    const newTab: TreeTab = {
      id: uuidv4(),
      name: `Tree ${n}`,
      source: '',
      options: defaultOpts()
    }
    tabs.value.push(newTab)
    activeTabId.value = newTab.id
    return newTab
  }

  const renameTab = (id: string, newName: string) => {
    const tab = tabs.value.find(t => t.id === id)
    if (tab) tab.name = newName
  }

  const deleteTab = (id: string) => {
    const index = tabs.value.findIndex(t => t.id === id)
    if (index === -1) return
    tabs.value.splice(index, 1)
    if (id === activeTabId.value) {
      if (tabs.value.length > 0) {
        const newIndex = Math.max(0, index - 1)
        activeTabId.value = tabs.value[newIndex]!.id
      } else {
        const t = addTab()
        activeTabId.value = t.id
      }
    }
  }

  const setActiveTab = (id: string) => {
    activeTabId.value = id
  }

  const updateActiveSource = (source: string) => {
    if (activeTab.value) activeTab.value.source = source
  }

  const updateActiveOptions = (options: TreeOptions) => {
    if (activeTab.value) activeTab.value.options = { ...options }
  }

  const loadTabs = () => {
    if (!import.meta.client) return

    try {
      const persisted = loadPersistedWorkspace(window.localStorage) as PersistedTreeWorkspaceV1 | null

      if (persisted?.tabs?.length) {
        tabs.value = persisted.tabs.map(normalizeTab)
        if (persisted.tabs.some(t => t.id === persisted.activeTabId)) {
          activeTabId.value = persisted.activeTabId
        } else if (persisted.tabs[0]) {
          activeTabId.value = persisted.tabs[0].id
        }
        return
      }
    } catch (error) {
      console.error('Failed to load persisted workspace:', error)
    }

    initializeTabs()
  }

  const saveTabs = () => {
    if (!import.meta.client || tabs.value.length === 0) return
    persistWorkspace(window.localStorage, {
      tabs: tabs.value,
      activeTabId: activeTabId.value
    })
  }

  return {
    tabs,
    activeTabId,
    activeTab,
    initializeTabs,
    addTab,
    renameTab,
    deleteTab,
    setActiveTab,
    updateActiveSource,
    updateActiveOptions,
    loadTabs,
    saveTabs
  }
}
