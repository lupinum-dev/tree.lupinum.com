import { ref } from 'vue'
import { useTreeStorage } from './useTreeStorage'

// Interface for history state
export interface HistoryState {
  content: string
  cursorPosition: {
    start: number
    end: number
  }
}

export function useTreeHistory() {
  const { saveToStorage } = useTreeStorage()
  
  const MAX_HISTORY_SIZE = 1000
  const history = ref<HistoryState[]>([])
  const currentHistoryIndex = ref(-1)
  const isUndoRedoOperation = ref(false)

  // Function to save state to history
  const saveToHistory = (content: string, start: number, end: number) => {
    if (isUndoRedoOperation.value) {
      isUndoRedoOperation.value = false
      return
    }

    // Remove any future states if we're not at the end
    if (currentHistoryIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentHistoryIndex.value + 1)
    }

    // Add new state
    history.value.push({
      content,
      cursorPosition: { start, end }
    })

    // Limit history size
    if (history.value.length > MAX_HISTORY_SIZE) {
      history.value = history.value.slice(-MAX_HISTORY_SIZE)
    }

    currentHistoryIndex.value = history.value.length - 1

    // Save to localStorage
    saveToStorage('editor-history', history.value)
    saveToStorage('editor-history-index', currentHistoryIndex.value.toString())
  }

  // Restore state from history
  const restoreState = (state: HistoryState, textareaRef: HTMLTextAreaElement | null) => {
    if (!textareaRef) return null

    isUndoRedoOperation.value = true
    
    // Need to return the new content value
    return {
      content: state.content,
      applySelection: () => {
        textareaRef.selectionStart = state.cursorPosition.start
        textareaRef.selectionEnd = state.cursorPosition.end
        textareaRef.focus()
      }
    }
  }

  // Undo function
  const undo = (textareaRef: HTMLTextAreaElement | null) => {
    if (currentHistoryIndex.value > 0) {
      currentHistoryIndex.value--
      const historyState = history.value[currentHistoryIndex.value]
      if (historyState) {
        const result = restoreState(historyState, textareaRef)
        saveToStorage('editor-history-index', currentHistoryIndex.value.toString())
        return result
      }
    }
    return null
  }

  // Redo function
  const redo = (textareaRef: HTMLTextAreaElement | null) => {
    if (currentHistoryIndex.value < history.value.length - 1) {
      currentHistoryIndex.value++
      const historyState = history.value[currentHistoryIndex.value]
      if (historyState) {
        const result = restoreState(historyState, textareaRef)
        saveToStorage('editor-history-index', currentHistoryIndex.value.toString())
        return result
      }
    }
    return null
  }

  // Initialize history
  const initHistory = (initialContent: string) => {
    if (history.value.length === 0) {
      saveToHistory(initialContent, 0, 0)
    }
  }

  // Load history from storage
  const loadHistory = () => {
    try {
      const savedHistory = localStorage.getItem('editor-history')
      const savedIndex = localStorage.getItem('editor-history-index')
      
      if (savedHistory) {
        history.value = JSON.parse(savedHistory)
        currentHistoryIndex.value = savedIndex ? parseInt(savedIndex) : history.value.length - 1
        return history.value[currentHistoryIndex.value] || null
      }
    } catch (e) {
      console.error('Failed to load history from localStorage:', e)
    }
    return null
  }

  return {
    history,
    currentHistoryIndex,
    saveToHistory,
    restoreState,
    undo,
    redo,
    initHistory,
    loadHistory
  }
}