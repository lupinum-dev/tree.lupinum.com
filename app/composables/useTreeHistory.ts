import type { Ref } from 'vue'

export interface HistoryState {
  content: string
  cursorPosition: { start: number, end: number }
}

const HISTORY_BLOB_KEY = 'tree-history-blob-v1'
const MAX_HISTORY_SIZE = 1000

interface BlobV1 {
  version: 1
  byTabId: Record<string, { stack: HistoryState[], index: number }>
}

function readBlob(storage: Storage): BlobV1 | null {
  try {
    const raw = storage.getItem(HISTORY_BLOB_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as BlobV1
    if (parsed?.version === 1 && parsed.byTabId && typeof parsed.byTabId === 'object') {
      return parsed
    }
  } catch {
    // ignore
  }
  return null
}

function writeBlob(storage: Storage, byTabId: Record<string, { stack: HistoryState[], index: number }>) {
  storage.setItem(HISTORY_BLOB_KEY, JSON.stringify({ version: 1, byTabId } satisfies BlobV1))
}

/** Per-tab undo stacks; one versioned blob in localStorage */
export function useTreeHistory(activeTabId: Ref<string>) {
  const isUndoRedoOperation = { value: false }
  const tabState: Record<string, { stack: HistoryState[], index: number }> = {}

  const storage = (): Storage | null =>
    import.meta.client ? window.localStorage : null

  const persist = () => {
    const ls = storage()
    if (!ls) return
    writeBlob(ls, tabState)
  }

  const hydrate = () => {
    const ls = storage()
    if (!ls) return
    const blob = readBlob(ls)
    if (!blob) return
    for (const [id, payload] of Object.entries(blob.byTabId)) {
      tabState[id] = {
        stack: Array.isArray(payload.stack) ? [...payload.stack] : [],
        index: typeof payload.index === 'number' ? payload.index : -1
      }
    }
  }

  hydrate()

  const ensureTab = (tabId: string) => {
    if (!tabState[tabId]) tabState[tabId] = { stack: [], index: -1 }
    return tabState[tabId]
  }

  const saveToHistory = (content: string, start: number, end: number) => {
    const tabId = activeTabId.value
    if (!tabId) return
    if (isUndoRedoOperation.value) {
      isUndoRedoOperation.value = false
      return
    }

    const ts = ensureTab(tabId)
    if (ts.index < ts.stack.length - 1) ts.stack = ts.stack.slice(0, ts.index + 1)

    ts.stack.push({ content, cursorPosition: { start, end } })
    if (ts.stack.length > MAX_HISTORY_SIZE) {
      ts.stack = ts.stack.slice(-MAX_HISTORY_SIZE)
    }
    ts.index = ts.stack.length - 1
    persist()
  }

  const restoreState = (state: HistoryState, textareaRef: HTMLTextAreaElement | null) => {
    if (!textareaRef) return null
    isUndoRedoOperation.value = true
    return {
      content: state.content,
      applySelection: () => {
        textareaRef.selectionStart = state.cursorPosition.start
        textareaRef.selectionEnd = state.cursorPosition.end
        textareaRef.focus()
      }
    }
  }

  const undo = (textareaRef: HTMLTextAreaElement | null) => {
    const tabId = activeTabId.value
    if (!tabId) return null
    const ts = ensureTab(tabId)
    if (ts.index <= 0) return null
    ts.index--
    const hist = ts.stack[ts.index]
    persist()
    return hist ? restoreState(hist, textareaRef) : null
  }

  const redo = (textareaRef: HTMLTextAreaElement | null) => {
    const tabId = activeTabId.value
    if (!tabId) return null
    const ts = ensureTab(tabId)
    if (ts.index >= ts.stack.length - 1) return null
    ts.index++
    const hist = ts.stack[ts.index]
    persist()
    return hist ? restoreState(hist, textareaRef) : null
  }

  /** First entry for a tab with no persisted history */
  const bootstrapTabHistory = (content: string, start = 0, end = 0) => {
    const tabId = activeTabId.value
    if (!tabId) return
    const ts = ensureTab(tabId)
    if (ts.stack.length > 0) return
    ts.stack.push({ content, cursorPosition: { start, end } })
    ts.index = 0
    persist()
  }

  const resetHistoryForTab = (tabId: string) => {
    Reflect.deleteProperty(tabState, tabId)
    persist()
  }

  return {
    saveToHistory,
    undo,
    redo,
    bootstrapTabHistory,
    resetHistoryForTab
  }
}
