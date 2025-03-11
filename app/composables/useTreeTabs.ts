import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { TreeOptions } from './useTreeGenerator'
import { mockInput } from '~/lib/mock-input'

export interface TreeTab {
  id: string
  name: string
  source: string
  options: TreeOptions
}

export function useTreeTabs() {
  // List of all tree tabs
  const tabs = ref<TreeTab[]>([])
  
  // Currently active tab id
  const activeTabId = ref<string>('')

  // Get the active tab
  const activeTab = computed(() => {
    return tabs.value.find(tab => tab.id === activeTabId.value) || null
  })

  // Initialize with a default tab
  const initializeTabs = () => {
    if (tabs.value.length === 0) {
      const defaultTab: TreeTab = {
        id: uuidv4(),
        name: 'Tree 1',
        source: mockInput,
        options: {
          format: 'utf-8',
          fullPath: false,
          trailingSlash: false,
          rootDot: true
        }
      }
      
      tabs.value.push(defaultTab)
      activeTabId.value = defaultTab.id
    }
  }

  // Add a new tab
  const addTab = () => {
    const newTabNumber = tabs.value.length + 1
    const newTab: TreeTab = {
      id: uuidv4(),
      name: `Tree ${newTabNumber}`,
      source: '',
      options: {
        format: 'utf-8',
        fullPath: false,
        trailingSlash: false,
        rootDot: true
      }
    }
    
    tabs.value.push(newTab)
    activeTabId.value = newTab.id
    
    return newTab
  }

  // Rename a tab
  const renameTab = (id: string, newName: string) => {
    const tab = tabs.value.find(tab => tab.id === id)
    if (tab) {
      tab.name = newName
    }
  }

  // Delete a tab
  const deleteTab = (id: string) => {
    const index = tabs.value.findIndex(tab => tab.id === id)
    if (index !== -1) {
      tabs.value.splice(index, 1)
      
      // If we deleted the active tab, select another one
      if (id === activeTabId.value) {
        if (tabs.value.length > 0) {
          // Select the previous tab, or the first one if there's no previous
          const newIndex = Math.max(0, index - 1)
          activeTabId.value = tabs.value[newIndex].id
        } else {
          // If no tabs left, create a new one
          const newTab = addTab()
          activeTabId.value = newTab.id
        }
      }
    }
  }

  // Set active tab
  const setActiveTab = (id: string) => {
    activeTabId.value = id
  }

  // Update active tab source
  const updateActiveSource = (source: string) => {
    if (activeTab.value) {
      activeTab.value.source = source
    }
  }

  // Update active tab options
  const updateActiveOptions = (options: TreeOptions) => {
    if (activeTab.value) {
      activeTab.value.options = { ...options }
    }
  }

  // Load tabs from localStorage
  const loadTabs = () => {
    if (process.client) {
      try {
        const savedTabs = localStorage.getItem('tree-tabs')
        const savedActiveId = localStorage.getItem('active-tab-id')
        
        if (savedTabs) {
          tabs.value = JSON.parse(savedTabs)
        }
        
        if (savedActiveId) {
          // Make sure the active tab still exists
          if (tabs.value.some(tab => tab.id === savedActiveId)) {
            activeTabId.value = savedActiveId
          } else if (tabs.value.length > 0) {
            activeTabId.value = tabs.value[0].id
          }
        }
      } catch (error) {
        console.error('Failed to load tabs from localStorage:', error)
      }
    }
    
    // If no tabs were loaded, initialize with a default one
    if (tabs.value.length === 0) {
      initializeTabs()
    }
  }

  // Save tabs to localStorage
  const saveTabs = () => {
    if (process.client) {
      try {
        localStorage.setItem('tree-tabs', JSON.stringify(tabs.value))
        localStorage.setItem('active-tab-id', activeTabId.value)
      } catch (error) {
        console.error('Failed to save tabs to localStorage:', error)
      }
    }
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