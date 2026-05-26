<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { provideTreeWorkspace } from '~/features/tree/composables/useTreeWorkspace'

const ws = provideTreeWorkspace()

onMounted(() => {
  if (import.meta.client) {
    ws.initWorkspaceClient()
  }
})

watch(ws.activeTabId, () => ws.saveTabs())

const handleAddTab = () => {
  ws.addTab()
  ws.saveTabs()
}

const handleRenameTab = (id: string, newName: string) => {
  ws.renameTab(id, newName)
  ws.saveTabs()
}

const handleDeleteTab = (id: string) => {
  ws.deleteTab(id)
  ws.saveTabs()
}
</script>

<template>
  <div>
    <UContainer class="max-w-[2200px]">
      <TreeHeader />

      <div class="app w-full min-h-screen flex flex-col">
        <TreeTabs
          v-model:active-tab-id="ws.activeTabId"
          :tabs="ws.tabs"
          @add="handleAddTab"
          @rename="handleRenameTab"
          @delete="handleDeleteTab"
        />

        <div class="flex-1 flex flex-col lg:flex-row gap-3 min-h-[500px]">
          <div class="w-full lg:w-1/2 flex-shrink-0 min-h-[500px]">
            <TreeInput
              v-model="ws.source"
              :parse-errors="ws.parseErrors"
              :is-undo-redo-enabled="true"
              @reset="ws.resetActiveTabExample"
            />
          </div>

          <div class="w-full lg:w-1/2 flex-shrink-0 min-h-[500px]">
            <TreeOutput
              :tree="ws.treeOutput"
              :parse-errors="ws.parseErrors"
              @copy="ws.copyOutput"
              @export="ws.captureScreenshot"
            />
          </div>
        </div>

        <p class="my-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded inline-block">
          <span class="inline-flex items-center">
            <UIcon
              name="i-heroicons-shield-check"
              class="mr-1 text-green-600 dark:text-green-400"
            />
            Your files and text never leave your device - zero server processing
          </span>
        </p>

        <div class="flex-none mt-4">
          <TreeOptions
            :options="ws.options"
            @update:options="(v) => (ws.options = v)"
            @copy="ws.copyOutput"
            @export="ws.captureScreenshot"
            @share="ws.shareUrl"
          />
        </div>

        <TreeFooter />
        <AppCredits />
      </div>
    </UContainer>
  </div>
</template>
