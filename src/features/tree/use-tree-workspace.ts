import { computed, inject, provide, ref, shallowRef, watch, type InjectionKey } from 'vue'
import { toast } from 'vue-sonner'
import { buildParsedTreeOutput } from './domain/tree-output'
import { RENDERERS_BY_ID } from './domain/tree-format-registry'
import type { FormatType } from './domain/tree-formatters-impl'
import type { TreeDiagnostic } from './domain/tree.types'
import type { SavedTree, TreeOptions } from './domain/workspace.types'
import { filesToTreeSourceText } from './infrastructure/folder-tree-builder'
import { pickFolderFiles } from './infrastructure/folder-picker'
import { exportTreeTextAsImageFromElement } from './infrastructure/image-export'
import { loadPersistedWorkspace, persistWorkspace } from './infrastructure/persisted-workspace'
import { writeTextToClipboard } from './infrastructure/write-clipboard'
import { mockInput } from './mock-input'

const OUTPUT_DEBOUNCE_LENGTH = 4_000
const OUTPUT_DEBOUNCE_MS = 85
const PERSIST_DEBOUNCE_MS = 250

export type SaveStatus = 'saved' | 'saving' | 'error'

function defaultOptions(): TreeOptions {
  return {
    format: 'utf-8',
    fullPath: false,
    trailingSlash: false,
    rootDot: true,
  }
}

function createId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `tree-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createSavedTree(name: string, source = ''): SavedTree {
  return {
    id: createId(),
    name,
    source,
    options: defaultOptions(),
  }
}

function normalizeTree(tree: SavedTree): SavedTree {
  const format = tree.options.format in RENDERERS_BY_ID ? tree.options.format : 'utf-8'
  return {
    ...tree,
    options: {
      ...defaultOptions(),
      ...tree.options,
      format: format as FormatType,
    },
  }
}

export function createTreeWorkspace() {
  const trees = ref<SavedTree[]>([])
  const activeTreeId = ref('')
  const parseErrors = shallowRef<TreeDiagnostic[]>([])
  const output = shallowRef('')
  const isReady = ref(false)
  const isImporting = ref(false)
  const saveStatus = ref<SaveStatus>('saved')

  const activeTree = computed(
    () => trees.value.find((tree) => tree.id === activeTreeId.value) ?? null,
  )

  const activeFormatLabel = computed(() => {
    const format = activeTree.value?.options.format ?? 'utf-8'
    return RENDERERS_BY_ID[format]?.label ?? 'UTF-8 Tree'
  })

  let outputTimer: ReturnType<typeof setTimeout> | undefined
  let persistTimer: ReturnType<typeof setTimeout> | undefined

  function rebuildOutput() {
    const tree = activeTree.value
    if (!tree || !tree.source.trim()) {
      output.value = ''
      parseErrors.value = []
      return
    }

    const result = buildParsedTreeOutput(tree.source, tree.options.format, {
      trailingSlash: tree.options.trailingSlash,
      fullPath: tree.options.fullPath,
      rootDot: tree.options.rootDot,
    })

    if (!result.ok) {
      output.value = ''
      parseErrors.value = result.errors
      return
    }

    output.value = result.output
    parseErrors.value = []
  }

  function persistNow() {
    if (!isReady.value || typeof window === 'undefined' || trees.value.length === 0) return
    clearTimeout(persistTimer)
    try {
      persistWorkspace(window.localStorage, {
        tabs: trees.value,
        activeTabId: activeTreeId.value,
      })
      saveStatus.value = 'saved'
    } catch {
      saveStatus.value = 'error'
      toast.error('Changes could not be saved in this browser', {
        description: 'Check whether browser storage is available, then try again.',
        duration: Infinity,
      })
    }
  }

  function schedulePersist() {
    if (!isReady.value) return
    saveStatus.value = 'saving'
    clearTimeout(persistTimer)
    persistTimer = setTimeout(persistNow, PERSIST_DEBOUNCE_MS)
  }

  watch(
    () => ({
      id: activeTreeId.value,
      source: activeTree.value?.source,
      options: activeTree.value?.options,
    }),
    () => {
      clearTimeout(outputTimer)
      const source = activeTree.value?.source ?? ''
      if (source.length <= OUTPUT_DEBOUNCE_LENGTH) {
        rebuildOutput()
        return
      }
      outputTimer = setTimeout(rebuildOutput, OUTPUT_DEBOUNCE_MS)
    },
    { deep: true, immediate: true },
  )

  function initClient() {
    if (isReady.value || typeof window === 'undefined') return
    const persisted = loadPersistedWorkspace(window.localStorage)
    if (persisted?.tabs.length) {
      trees.value = persisted.tabs.map(normalizeTree)
      activeTreeId.value = trees.value.some((tree) => tree.id === persisted.activeTabId)
        ? persisted.activeTabId
        : trees.value[0]!.id
    } else {
      const firstTree = createSavedTree('Tree 1', mockInput)
      trees.value = [firstTree]
      activeTreeId.value = firstTree.id
    }

    window.localStorage.removeItem('editor-history')
    window.localStorage.removeItem('editor-history-index')
    window.localStorage.removeItem('tree-history-blob-v1')
    window.addEventListener('visibilitychange', persistWhenHidden)
    isReady.value = true
    rebuildOutput()
  }

  function persistWhenHidden() {
    if (document.visibilityState === 'hidden') persistNow()
  }

  function dispose() {
    clearTimeout(outputTimer)
    clearTimeout(persistTimer)
    if (typeof window !== 'undefined') {
      window.removeEventListener('visibilitychange', persistWhenHidden)
    }
  }

  function selectTree(id: string) {
    if (!trees.value.some((tree) => tree.id === id)) return
    activeTreeId.value = id
    schedulePersist()
  }

  function addTree() {
    const tree = createSavedTree(`Tree ${trees.value.length + 1}`)
    trees.value.push(tree)
    activeTreeId.value = tree.id
    schedulePersist()
    return tree
  }

  function renameTree(id: string, name: string) {
    const tree = trees.value.find((candidate) => candidate.id === id)
    const normalizedName = name.trim()
    if (!tree || !normalizedName) return
    tree.name = normalizedName
    schedulePersist()
  }

  function deleteTree(id: string) {
    const index = trees.value.findIndex((tree) => tree.id === id)
    if (index === -1) return
    trees.value.splice(index, 1)
    if (trees.value.length === 0) {
      const replacement = createSavedTree('Tree 1')
      trees.value.push(replacement)
      activeTreeId.value = replacement.id
    } else if (activeTreeId.value === id) {
      activeTreeId.value = trees.value[Math.max(0, index - 1)]!.id
    }
    schedulePersist()
  }

  function resetTree(id: string) {
    const tree = trees.value.find((candidate) => candidate.id === id)
    if (!tree) return
    tree.source = mockInput
    tree.options = defaultOptions()
    schedulePersist()
  }

  function updateSource(source: string) {
    if (!activeTree.value) return
    activeTree.value.source = source
    schedulePersist()
  }

  function updateFormat(format: FormatType) {
    if (!activeTree.value || !(format in RENDERERS_BY_ID)) return
    activeTree.value.options.format = format
    schedulePersist()
  }

  function updateOption(option: keyof Omit<TreeOptions, 'format'>, value: boolean) {
    if (!activeTree.value) return
    activeTree.value.options[option] = value
    schedulePersist()
  }

  async function importFolder() {
    if (!activeTree.value || isImporting.value) return
    isImporting.value = true
    try {
      const files = await pickFolderFiles()
      const source = filesToTreeSourceText(files)
      if (!source) return
      const tree = activeTree.value
      tree.source = source
      if (/^Tree \d+$/.test(tree.name)) {
        tree.name = source.split('\n')[0]!.replace(/\/$/, '')
      }
      schedulePersist()
      toast.success('Folder structure loaded')
    } catch {
      toast.error('Unable to read that folder', {
        description: 'Choose the folder again and allow access when your browser asks.',
        duration: Infinity,
      })
    } finally {
      isImporting.value = false
    }
  }

  async function copyOutput() {
    if (!output.value) return
    const copied = await writeTextToClipboard(output.value)
    if (copied) {
      toast.success('Output copied')
      return
    }
    toast.error('Unable to copy output', {
      description: 'Allow clipboard access, then try again.',
      duration: Infinity,
    })
  }

  async function exportOutput() {
    if (!output.value) return
    const exported = await exportTreeTextAsImageFromElement({
      treeText: output.value,
      filenameBase: activeTree.value?.name ?? 'ascii-tree',
      treeOutputElementId: 'tree-output',
    })
    if (exported) {
      toast.success('Image downloaded')
      return
    }
    toast.error('Unable to export the image', {
      description: 'Try a smaller tree or copy the text output instead.',
      duration: Infinity,
    })
  }

  return {
    trees,
    activeTreeId,
    activeTree,
    activeFormatLabel,
    output,
    parseErrors,
    isReady,
    isImporting,
    saveStatus,
    initClient,
    dispose,
    selectTree,
    addTree,
    renameTree,
    deleteTree,
    resetTree,
    updateSource,
    updateFormat,
    updateOption,
    importFolder,
    copyOutput,
    exportOutput,
    persistNow,
  }
}

export type TreeWorkspace = ReturnType<typeof createTreeWorkspace>

const TreeWorkspaceKey: InjectionKey<TreeWorkspace> = Symbol('tree-workspace')

export function provideTreeWorkspace(workspace: TreeWorkspace) {
  provide(TreeWorkspaceKey, workspace)
}

export function useTreeWorkspace(): TreeWorkspace {
  const workspace = inject(TreeWorkspaceKey)
  if (!workspace) throw new Error('Tree workspace was not provided')
  return workspace
}
