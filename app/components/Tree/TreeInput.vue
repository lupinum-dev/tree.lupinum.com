<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import { injectTreeWorkspace } from '~/features/tree/composables/useTreeWorkspace'
import { useFolderUpload } from '~/composables/useFolderUpload'
import type { TreeDiagnostic } from '~/features/tree/domain/tree.types'

const props = defineProps<{
  modelValue: string
  isUndoRedoEnabled?: boolean
  parseErrors?: TreeDiagnostic[] | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'reset'): void
}>()

const ws = injectTreeWorkspace()
const { saveToHistory, undo: historyUndo, redo: historyRedo } = ws

const inputValue = ref(props.modelValue)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
/** Skip one history snapshot (tab switch, undo/redo sync, programmatic text). */
const suppressHistorySnapshot = ref(false)

const { isProcessingUpload, pickFolderAndMergeText } = useFolderUpload()

const toast = useToast()

const firstParseError = computed(() => props.parseErrors?.[0] ?? null)

const pushHistorySnapshot = () => {
  const ta = textareaRef.value
  if (!ta || !props.isUndoRedoEnabled) return
  if (suppressHistorySnapshot.value) {
    suppressHistorySnapshot.value = false
    return
  }
  saveToHistory(inputValue.value, ta.selectionStart, ta.selectionEnd)
}

watch(
  () => props.modelValue,
  (v) => {
    if (v === inputValue.value) return
    suppressHistorySnapshot.value = true
    inputValue.value = v
  }
)

watch(inputValue, (v) => {
  emit('update:modelValue', v)
  nextTick(pushHistorySnapshot)
})

const onReset = () => {
  emit('reset')
}

const handleTabKey = (event: KeyboardEvent) => {
  if (!textareaRef.value) return
  event.preventDefault()

  const textarea = textareaRef.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = inputValue.value.substring(start, end)

  if (event.shiftKey) {
    if (start === end) {
      const beforeCursor = inputValue.value.substring(0, start)
      const lineStart = beforeCursor.lastIndexOf('\n') + 1
      const lineEnd = inputValue.value.indexOf('\n', start)
      const currentLine = inputValue.value.substring(
        lineStart,
        lineEnd === -1 ? inputValue.value.length : lineEnd
      )
      if (/^(\s{1,2})/.test(currentLine)) {
        const spacesToRemove = /^(\s{2})/.test(currentLine) ? 2 : 1
        inputValue.value
          = inputValue.value.substring(0, lineStart)
            + currentLine.substring(spacesToRemove)
            + inputValue.value.substring(lineEnd === -1 ? inputValue.value.length : lineEnd)

        nextTick(() => {
          const newCursorPos = Math.max(start - spacesToRemove, lineStart)
          textarea.selectionStart = textarea.selectionEnd = newCursorPos
        })
      }
    } else {
      const lines = selectedText.split('\n')
      let totalSpacesRemoved = 0
      const outdentedLines = lines.map((line) => {
        if (/^(\s{1,2})/.test(line)) {
          const spacesToRemove = /^(\s{2})/.test(line) ? 2 : 1
          totalSpacesRemoved += spacesToRemove
          return line.substring(spacesToRemove)
        }
        return line
      })
      const newText = outdentedLines.join('\n')
      inputValue.value
        = inputValue.value.substring(0, start)
          + newText
          + inputValue.value.substring(end)

      nextTick(() => {
        textarea.selectionStart = start
        textarea.selectionEnd = end - totalSpacesRemoved
      })
    }
  } else if (start === end) {
    inputValue.value
      = inputValue.value.substring(0, start) + '  ' + inputValue.value.substring(end)
    nextTick(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 2
    })
  } else {
    const lines = selectedText.split('\n')
    const indentedLines = lines.map(line => `  ${line}`)
    const newText = indentedLines.join('\n')
    inputValue.value
      = inputValue.value.substring(0, start) + newText + inputValue.value.substring(end)
    nextTick(() => {
      textarea.selectionStart = start
      textarea.selectionEnd = start + newText.length
    })
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (!textareaRef.value || !props.isUndoRedoEnabled) return

  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    const result = historyUndo(textareaRef.value)
    if (result) {
      suppressHistorySnapshot.value = true
      inputValue.value = result.content
      nextTick(() => {
        result.applySelection()
      })
    }
    return
  }

  if ((event.ctrlKey || event.metaKey) && ((event.key === 'z' && event.shiftKey) || event.key === 'y')) {
    event.preventDefault()
    const result = historyRedo(textareaRef.value)
    if (result) {
      suppressHistorySnapshot.value = true
      inputValue.value = result.content
      nextTick(() => {
        result.applySelection()
      })
    }
  }
}

const uploadFolder = async () => {
  await pickFolderAndMergeText((text) => {
    suppressHistorySnapshot.value = true
    inputValue.value = text
  }, opts => toast.add(opts))
}

onMounted(() => nextTick(() => textareaRef.value?.focus()))
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="text-sm font-medium mb-1 px-1 flex justify-between items-center">
      <span>Input</span>
      <div class="flex space-x-1">
        <UButton
          size="lg"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-folder-open"
          :loading="isProcessingUpload"
          title="Upload folder structure"
          @click="uploadFolder"
        >
          Upload folder
        </UButton>
        <UButton
          size="lg"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-arrow-path"
          title="Reset to default example"
          @click="onReset"
        />
      </div>
    </div>

    <UAlert
      v-if="firstParseError"
      class="mb-2"
      icon="i-heroicons-exclamation-triangle"
      color="warning"
      variant="soft"
      :title="`Line ${firstParseError.line}`"
      :description="firstParseError.message"
    />

    <div class="input flex-1 p-2 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <ClientOnly>
        <div class="relative w-full h-full">
          <textarea
            ref="textareaRef"
            v-model="inputValue"
            class="w-full h-full font-mono resize-none p-2 bg-transparent focus:outline-none focus:ring-0 border-0"
            autofocus
            spellcheck="false"
            placeholder="Type your tree structure here..."
            @keydown.tab.prevent="handleTabKey"
            @keydown="handleKeyDown"
          />
        </div>
        <template #fallback>
          <div class="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 1023px) {
  .flex-col {
    min-height: 300px;
  }

  textarea {
    min-height: 250px;
  }
}
</style>
