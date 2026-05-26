import { computed, shallowRef, watch, provide, inject, reactive, type InjectionKey } from 'vue'
import { useTreeTabs } from '~/composables/useTreeTabs'
import { useTreeHistory } from '~/composables/useTreeHistory'
import { useTreeGenerator } from '~/composables/useTreeGenerator'
import type { TreeOptions } from '~/features/tree/domain/workspace.types'
import type { FormatType } from '~/features/tree/domain/tree-formatters-impl'
import { buildParsedTreeOutput } from '~/features/tree/domain/tree-output'
import type { TreeDiagnostic } from '~/features/tree/domain/tree.types'
import { RENDERERS_BY_ID } from '~/features/tree/domain/tree-format-registry'
import { writeTextToClipboard } from '~/features/tree/infrastructure/write-clipboard'
import { shareCurrentLocation } from '~/features/tree/infrastructure/share-url'
import { exportTreeTextAsImageFromElement } from '~/features/tree/infrastructure/image-export'

const DEBOUNCE_LEN = 4000
const DEBOUNCE_MS = 85

/** Public workspace handle (reactive shell around composable state + actions). */
// Vue reactive() unwraps nested refs for templates; precise typing duplicates createTreeWorkspace.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- reactive shell for template binding
export type TreeWorkspaceApi = any

export const TreeWorkspaceKey: InjectionKey<TreeWorkspaceApi> = Symbol('tree-workspace')

function defaultOptions(): TreeOptions {
  return {
    format: 'utf-8',
    fullPath: false,
    trailingSlash: false,
    rootDot: true
  }
}

function createTreeWorkspace() {
  const toast = useToast()
  const { resetToDefault } = useTreeGenerator()

  const {
    tabs,
    activeTabId,
    activeTab,
    loadTabs,
    saveTabs,
    addTab,
    renameTab,
    deleteTab,
    updateActiveSource,
    updateActiveOptions
  } = useTreeTabs()

  const { bootstrapTabHistory, saveToHistory, undo, redo, resetHistoryForTab }
    = useTreeHistory(activeTabId)

  const source = computed({
    get: () => activeTab.value?.source ?? '',
    set: (v) => {
      updateActiveSource(v)
      saveTabs()
    }
  })

  const options = computed<TreeOptions>({
    get: () =>
      activeTab.value?.options
        ? ({ ...activeTab.value.options })
        : defaultOptions(),
    set: (v) => {
      updateActiveOptions(v)
      saveTabs()
    }
  })

  const parseErrors = shallowRef<TreeDiagnostic[] | null>(null)
  const treeOutputStable = shallowRef('')

  function rebuildOutput() {
    if (!activeTab.value) {
      parseErrors.value = null
      treeOutputStable.value = ''
      return
    }

    const tab = activeTab.value
    const fmt = tab.options.format in RENDERERS_BY_ID
      ? tab.options.format
      : 'utf-8'

    const r = buildParsedTreeOutput(tab.source, fmt as FormatType, {
      trailingSlash: tab.options.trailingSlash,
      fullPath: tab.options.fullPath,
      rootDot: tab.options.rootDot
    })

    if (!r.ok) {
      parseErrors.value = r.errors
      treeOutputStable.value = 'Error parsing input'
      return
    }
    parseErrors.value = null
    treeOutputStable.value = r.output
  }

  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  watch(
    () => ({
      id: activeTabId.value,
      src: activeTab.value?.source,
      format: activeTab.value?.options.format,
      fullPath: activeTab.value?.options.fullPath,
      trailingSlash: activeTab.value?.options.trailingSlash,
      rootDot: activeTab.value?.options.rootDot
    }),
    () => {
      clearTimeout(debounceTimer)
      const text = activeTab.value?.source ?? ''
      if (!text.trim()) {
        debounceTimer = undefined
        rebuildOutput()
        return
      }
      if (text.length <= DEBOUNCE_LEN) {
        rebuildOutput()
        return
      }
      debounceTimer = setTimeout(() => {
        debounceTimer = undefined
        rebuildOutput()
      }, DEBOUNCE_MS)
    },
    { flush: 'post', immediate: true }
  )

  watch(activeTabId, () => {
    bootstrapTabHistory(source.value)
  })

  const resetActiveTabExample = () => {
    const d = resetToDefault()
    if (activeTab.value) {
      updateActiveSource(d.source)
      updateActiveOptions(d.options)
      resetHistoryForTab(activeTab.value.id)
      bootstrapTabHistory(d.source)
      saveTabs()
    }
  }

  const copyOutput = async () => {
    const ok = await writeTextToClipboard(treeOutputStable.value)
    toast.add({
      title: ok ? 'Tree copied to clipboard!' : 'Clipboard failed',
      icon: ok ? 'i-heroicons-clipboard-document' : 'i-heroicons-exclamation-circle',
      color: ok ? 'success' : 'error',
      duration: 1200
    })
  }

  const captureScreenshot = async () => {
    const ok = await exportTreeTextAsImageFromElement({
      treeText: treeOutputStable.value,
      filenameBase: activeTab.value?.name ?? 'ascii_tree',
      treeOutputElementId: 'tree-output'
    })
    toast.add({
      title: ok ? 'Tree image downloaded!' : 'Failed to generate image',
      icon: ok ? 'i-heroicons-photo' : 'i-heroicons-exclamation-circle',
      color: ok ? 'success' : 'error',
      duration: 1200
    })
  }

  const shareUrl = async () => {
    const ok = await shareCurrentLocation()
    toast.add({
      title: ok ? 'URL copied to clipboard!' : 'Could not copy URL',
      icon: ok ? 'i-heroicons-link' : 'i-heroicons-exclamation-circle',
      color: ok ? 'success' : 'error',
      duration: 1200
    })
  }

  const initWorkspaceClient = () => {
    if (import.meta.client) {
      window.localStorage.removeItem('editor-history')
      window.localStorage.removeItem('editor-history-index')
    }
    loadTabs()
    rebuildOutput()
    bootstrapTabHistory(source.value)
  }

  return {
    tabs,
    activeTabId,
    activeTab,
    source,
    options,
    treeOutput: treeOutputStable,
    parseErrors,
    saveTabs,
    addTab,
    renameTab,
    deleteTab,
    updateActiveSource,
    updateActiveOptions,
    saveToHistory,
    undo,
    redo,
    bootstrapTabHistory,
    resetHistoryForTab,
    resetActiveTabExample,
    copyOutput,
    captureScreenshot,
    shareUrl,
    initWorkspaceClient,
    rebuildOutput
  }
}

/** Create and provide workspace (call once from the page shell). */
export function provideTreeWorkspace(): TreeWorkspaceApi {
  const ws = reactive(createTreeWorkspace())
  provide(TreeWorkspaceKey, ws)
  return ws
}

export function injectTreeWorkspace(): TreeWorkspaceApi {
  const ctx = inject(TreeWorkspaceKey, null)
  if (!ctx) {
    throw new Error('[tree] TreeWorkspace was not provided')
  }
  return ctx
}
