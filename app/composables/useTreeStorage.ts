import type { TreeOptions } from './useTreeGenerator'

export function useTreeStorage() {
  const isClient = process.client

  // Save data to localStorage
  const saveToStorage = <T>(key: string, value: T): void => {
    if (!isClient) return
    
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    } catch (e) {
      console.error(`Failed to save ${key} to localStorage:`, e)
    }
  }

  // Load data from localStorage
  const loadFromStorage = <T>(key: string, defaultValue: T): T => {
    if (!isClient) return defaultValue
    
    try {
      const savedValue = localStorage.getItem(key)
      if (savedValue === null) return defaultValue
      
      return typeof defaultValue === 'string' 
        ? savedValue as unknown as T
        : JSON.parse(savedValue) as T
    } catch (e) {
      console.error(`Failed to load ${key} from localStorage:`, e)
      return defaultValue
    }
  }

  // Save options to localStorage
  const saveOptions = (options: TreeOptions): void => {
    saveToStorage('editor-options', options)
  }

  // Load options from localStorage
  const loadOptions = (defaultOptions: TreeOptions): TreeOptions => {
    return loadFromStorage('editor-options', defaultOptions)
  }

  // Save editor content
  const saveContent = (content: string): void => {
    saveToStorage('editor-content', content)
  }

  // Load editor content
  const loadContent = (defaultContent: string): string => {
    return loadFromStorage('editor-content', defaultContent)
  }

  return {
    saveToStorage,
    loadFromStorage,
    saveOptions,
    loadOptions,
    saveContent,
    loadContent
  }
}