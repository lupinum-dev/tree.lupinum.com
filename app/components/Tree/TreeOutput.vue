<script setup lang="ts">
import type { TreeDiagnostic } from '~/features/tree/domain/tree.types'

defineProps<{
  tree: string
  parseErrors?: TreeDiagnostic[] | null
}>()

const emit = defineEmits<{
  copy: []
  export: []
}>()

const copyTree = () => emit('copy')
const exportTree = () => emit('export')
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="text-sm font-medium mb-1 px-1 flex justify-between items-center">
      <span>Output</span>
      <div class="flex space-x-1">
        <UTooltip text="Copy tree to clipboard">
          <UButton
            size="lg"
            variant="ghost"
            color="neutral"
            icon="i-heroicons-clipboard-document"
            @click="copyTree"
          />
        </UTooltip>
        <UTooltip text="Download as image">
          <UButton
            size="lg"
            variant="ghost"
            color="neutral"
            icon="i-heroicons-photo"
            @click="exportTree"
          />
        </UTooltip>
      </div>
    </div>

    <UAlert
      v-if="parseErrors?.length && tree === 'Error parsing input'"
      class="mb-2"
      icon="i-heroicons-information-circle"
      color="neutral"
      variant="soft"
      title="Parsing failed — see input panel for details"
    />

    <div
      id="tree-output"
      class="tree flex-1 p-4 rounded bg-gray-100 dark:bg-gray-800 whitespace-pre font-mono overflow-auto border border-gray-200 dark:border-gray-700 min-h-[12rem]"
    >
      {{ tree }}
    </div>
  </div>
</template>

<style scoped>
.tree {
  white-space: pre;
}
</style>
