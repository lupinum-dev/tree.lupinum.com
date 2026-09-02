import { isFormatType } from '../domain/tree-formatters'
import {
  DEFAULT_TREE_OPTIONS,
  type PersistedTreeWorkspaceV1,
  type SavedTree,
} from '../domain/workspace.types'

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

function readSavedTree(value: unknown): SavedTree | null {
  if (!value || typeof value !== 'object') return null

  const tree = value as Record<string, unknown>
  const options = tree.options
  if (!options || typeof options !== 'object') return null
  const treeOptions = options as Record<string, unknown>

  if (
    typeof tree.id !== 'string' ||
    typeof tree.name !== 'string' ||
    typeof tree.source !== 'string' ||
    typeof treeOptions.format !== 'string' ||
    typeof treeOptions.fullPath !== 'boolean' ||
    typeof treeOptions.trailingSlash !== 'boolean' ||
    typeof treeOptions.rootDot !== 'boolean'
  ) {
    return null
  }

  return {
    id: tree.id,
    name: tree.name,
    source: tree.source,
    options: {
      format: isFormatType(treeOptions.format) ? treeOptions.format : DEFAULT_TREE_OPTIONS.format,
      fullPath: treeOptions.fullPath,
      trailingSlash: treeOptions.trailingSlash,
      rootDot: treeOptions.rootDot,
    },
  }
}

function readWorkspace(value: unknown): PersistedTreeWorkspaceV1 | null {
  if (!value || typeof value !== 'object') return null
  const workspace = value as Record<string, unknown>
  if (
    workspace.version !== 1 ||
    typeof workspace.activeTabId !== 'string' ||
    !Array.isArray(workspace.tabs)
  ) {
    return null
  }

  const tabs = workspace.tabs.map(readSavedTree).filter((tree) => tree !== null)
  if (tabs.length === 0) return null

  return {
    version: 1,
    activeTabId: tabs.some((tree) => tree.id === workspace.activeTabId)
      ? workspace.activeTabId
      : tabs[0]!.id,
    tabs,
  }
}

/** Read the versioned workspace snapshot, normalizing obsolete formats at the boundary. */
export function loadPersistedWorkspace(client: Storage): PersistedTreeWorkspaceV1 | null {
  const current = readWorkspace(safeJsonParse(client.getItem(WORKSPACE_KEY_V1)))
  if (current) return current

  const legacyTabs = safeJsonParse(client.getItem(LEGACY_TABS_KEY))
  if (!Array.isArray(legacyTabs)) return null

  const tabs = legacyTabs.map(readSavedTree).filter((tree) => tree !== null)
  if (tabs.length === 0) return null

  const requestedActiveId = client.getItem(LEGACY_ACTIVE_KEY)
  const activeTabId =
    requestedActiveId && tabs.some((tree) => tree.id === requestedActiveId)
      ? requestedActiveId
      : tabs[0]!.id
  const migrated: PersistedTreeWorkspaceV1 = { version: 1, activeTabId, tabs }

  client.setItem(WORKSPACE_KEY_V1, JSON.stringify(migrated))
  client.removeItem(LEGACY_TABS_KEY)
  client.removeItem(LEGACY_ACTIVE_KEY)
  return migrated
}

export function persistWorkspace(
  client: Storage,
  workspace: Omit<PersistedTreeWorkspaceV1, 'version'>,
): void {
  client.setItem(
    WORKSPACE_KEY_V1,
    JSON.stringify({ version: 1, ...workspace } satisfies PersistedTreeWorkspaceV1),
  )
}

export { WORKSPACE_KEY_V1 }
