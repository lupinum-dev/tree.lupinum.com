<script setup lang="ts">
defineProps<{
  tree: string
}>()

const emit = defineEmits<{
  (e: 'copy'): void
  (e: 'export'): void
}>()

// Copy tree to clipboard handler
const copyTree = () => {
  emit('copy')
}

// Export tree as image handler
const exportTree = () => {
  emit('export')
}
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
    <div
      id="tree-output"
      class="tree flex-1 p-4 rounded bg-gray-100 dark:bg-gray-800 whitespace-pre font-mono overflow-auto border border-gray-200 dark:border-gray-700"
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