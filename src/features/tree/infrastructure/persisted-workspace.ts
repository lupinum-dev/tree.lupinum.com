import type { PersistedTreeWorkspaceV1, SavedTree } from '../domain/workspace.types'

const WORKSPACE_KEY_V1 = 'tree-workspace-v1'
const LEGACY_TABS_KEY = 'tree-tabs'
const LEGACY_ACTIVE_KEY = 'active-tab-id'

function safeJsonParse(raw: string | null): unknown {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function isWorkspaceV1(val: unknown): val is PersistedTreeWorkspaceV1 {
  if (!val || typeof val !== 'object') return false
  const o = val as Record<string, unknown>
  return (
    o.version === 1 &&
    typeof o.activeTabId === 'string' &&
    Array.isArray(o.tabs) &&
    o.tabs.every(isSavedTree)
  )
}

function isSavedTree(value: unknown): value is SavedTree {
  if (!value || typeof value !== 'object') return false
  const tree = value as Record<string, unknown>
  const options = tree.options
  if (!options || typeof options !== 'object') return false
  const treeOptions = options as Record<string, unknown>

  return (
    typeof tree.id === 'string' &&
    typeof tree.name === 'string' &&
    typeof tree.source === 'string' &&
    typeof treeOptions.format === 'string' &&
    typeof treeOptions.fullPath === 'boolean' &&
    typeof treeOptions.trailingSlash === 'boolean' &&
    typeof treeOptions.rootDot === 'boolean'
  )
}

/** Read versioned workspace snapshot (or migrate legacy keys once). */
export function loadPersistedWorkspace(client: Storage): PersistedTreeWorkspaceV1 | null {
  const fromV1 = safeJsonParse(client.getItem(WORKSPACE_KEY_V1))
  if (isWorkspaceV1(fromV1)) {
    return fromV1
  }

  const tabsRaw = safeJsonParse(client.getItem(LEGACY_TABS_KEY))
  const activeId = client.getItem(LEGACY_ACTIVE_KEY)
  if (!Array.isArray(tabsRaw) || tabsRaw.length === 0) {
    return null
  }

  const tabs = tabsRaw.filter(isSavedTree)
  if (tabs.length === 0) return null
  let activeTabId = typeof activeId === 'string' && activeId ? activeId : (tabs[0]?.id ?? '')
  if (!tabs.some((t) => t.id === activeTabId)) {
    activeTabId = tabs[0]!.id
  }

  const migrated: PersistedTreeWorkspaceV1 = {
    version: 1,
    activeTabId,
    tabs,
  }

  client.setItem(WORKSPACE_KEY_V1, JSON.stringify(migrated))
  client.removeItem(LEGACY_TABS_KEY)
  client.removeItem(LEGACY_ACTIVE_KEY)
  return migrated
}

export function persistWorkspace(
  client: Storage,
  workspace: Omit<PersistedTreeWorkspaceV1, 'version'> & { tabs: SavedTree[]; activeTabId: string },
) {
  const payload: PersistedTreeWorkspaceV1 = {
    version: 1,
    activeTabId: workspace.activeTabId,
    tabs: workspace.tabs,
  }
  client.setItem(WORKSPACE_KEY_V1, JSON.stringify(payload))
}

export { WORKSPACE_KEY_V1 }
