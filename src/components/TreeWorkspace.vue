<script setup lang="ts">
import { Check, CircleAlert, LoaderCircle } from '@lucide/vue'
import { computed } from 'vue'
import TreeOutputPanel from '@/components/TreeOutputPanel.vue'
import TreeSourceEditor from '@/components/TreeSourceEditor.vue'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useTreeWorkspace } from '@/features/tree/use-tree-workspace'

const workspace = useTreeWorkspace()

const saveMessage = computed(() => {
  if (workspace.saveStatus.value === 'saving') return 'Saving…'
  if (workspace.saveStatus.value === 'error') return 'Not saved'
  return 'Saved locally'
})
</script>

<template>
  <div
    class="workspace-shell flex min-h-svh min-w-0 flex-1 flex-col md:min-h-0"
    :aria-busy="!workspace.isReady.value"
  >
    <header
      class="sticky top-0 z-20 flex min-h-13 shrink-0 flex-wrap items-center gap-2 border-b bg-background/92 px-3 py-2 backdrop-blur md:px-4"
    >
      <SidebarTrigger class="-ml-1" />
      <div class="mx-1 h-4 w-px bg-border" aria-hidden="true" />
      <div class="min-w-0">
        <h1 class="truncate text-sm font-semibold tracking-[-0.01em]">
          {{ workspace.activeTree.value?.name ?? 'ASCII Tree Generator' }}
        </h1>
        <p class="sr-only">Turn an indented directory list into clean, shareable tree output.</p>
      </div>
      <div
        class="ml-auto flex items-center gap-1.5 text-xs"
        :class="
          workspace.saveStatus.value === 'error' ? 'text-destructive' : 'text-muted-foreground'
        "
        role="status"
        aria-live="polite"
      >
        <LoaderCircle
          v-if="workspace.saveStatus.value === 'saving'"
          class="size-3.5 animate-spin"
          aria-hidden="true"
        />
        <CircleAlert
          v-else-if="workspace.saveStatus.value === 'error'"
          class="size-3.5"
          aria-hidden="true"
        />
        <Check v-else class="size-3.5 text-primary" aria-hidden="true" />
        <span>{{ saveMessage }}</span>
      </div>
    </header>

    <div v-if="workspace.isReady.value" class="workspace-grid">
      <TreeSourceEditor />
      <TreeOutputPanel />
    </div>
    <div v-else class="workspace-grid animate-pulse" role="status">
      <p class="sr-only">Loading workspace</p>
      <div class="workspace-source min-h-96 bg-muted/60">
        <span class="sr-only">Loading source editor</span>
      </div>
      <div class="tree-output-surface min-h-96 bg-muted/35">
        <span class="sr-only">Loading output</span>
      </div>
    </div>
  </div>
</template>
