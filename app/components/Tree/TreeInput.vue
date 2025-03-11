<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { useTreeHistory } from '~/composables/useTreeHistory'
import { useFileUpload } from '~/composables/useFileUpload'

const props = defineProps<{
  modelValue: string
  isUndoRedoEnabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'reset'): void
}>()

// Input value
const inputValue = ref(props.modelValue)

// Textarea ref
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// History management
const { saveToHistory, undo, redo } = useTreeHistory()

// File upload handling
const { isProcessingUpload, handleFolderUpload } = useFileUpload()

// Toast
const toast = useToast()

// Reset to default example
const onReset = () => {
  emit('reset')
}

// Handle tab key in textarea
const handleTabKey = (event: KeyboardEvent) => {
  if (!textareaRef.value) return
  
  event.preventDefault() // Prevent default tab behavior
  
  const textarea = textareaRef.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  
  // Get selected text
  const selectedText = inputValue.value.substring(start, end)
  
  // Check if shift is pressed (for outdent)
  if (event.shiftKey) {
    // Handle Shift+Tab (outdent)
    if (start === end) {
      // No selection - remove indent from current line
      // First, find the start of the current line
      const beforeCursor = inputValue.value.substring(0, start)
      const lineStart = beforeCursor.lastIndexOf('\n') + 1
      const lineEnd = inputValue.value.indexOf('\n', start)
      const currentLine = inputValue.value.substring(lineStart, lineEnd === -1 ? inputValue.value.length : lineEnd)
      
      // Check if the line starts with spaces we can remove
      if (/^(\s{1,2})/.test(currentLine)) {
        // Remove up to 2 spaces from the beginning of the line
        const spacesToRemove = /^(\s{2})/.test(currentLine) ? 2 : 1
        const newValue = 
          inputValue.value.substring(0, lineStart) + 
          currentLine.substring(spacesToRemove) + 
          inputValue.value.substring(lineEnd === -1 ? inputValue.value.length : lineEnd)
        
        inputValue.value = newValue
        emit('update:modelValue', newValue)
        
        // Adjust cursor position
        nextTick(() => {
          const newCursorPos = Math.max(start - spacesToRemove, lineStart)
          textarea.selectionStart = textarea.selectionEnd = newCursorPos
        })
      }
    } else {
      // Multi-line selection - remove indent from each line
      const lines = selectedText.split('\n')
      let totalSpacesRemoved = 0
      
      const outdentedLines = lines.map((line, index) => {
        // Check if the line starts with spaces we can remove
        if (/^(\s{1,2})/.test(line)) {
          // Remove up to 2 spaces from the beginning of the line
          const spacesToRemove = /^(\s{2})/.test(line) ? 2 : 1
          
          // Keep track of total spaces removed to adjust selection later
          totalSpacesRemoved += spacesToRemove
          
          return line.substring(spacesToRemove)
        }
        return line
      })
      
      const newText = outdentedLines.join('\n')
      
      // Replace selection with outdented text
      const newValue = inputValue.value.substring(0, start) + newText + inputValue.value.substring(end)
      inputValue.value = newValue
      emit('update:modelValue', newValue)
      
      // Restore selection, adjusted for removed spaces
      nextTick(() => {
        textarea.selectionStart = start
        textarea.selectionEnd = end - totalSpacesRemoved
      })
    }
  } else {
    // Handle Tab (indent)
    if (start === end) {
      // No selection - just insert tab at cursor
      const beforeCursor = inputValue.value.substring(0, start)
      const afterCursor = inputValue.value.substring(end)
      const newValue = beforeCursor + '  ' + afterCursor
      inputValue.value = newValue
      emit('update:modelValue', newValue)
      
      // Move cursor after tab
      nextTick(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      })
    } else {
      // Handle multi-line selection
      const lines = selectedText.split('\n')
      const indentedLines = lines.map(line => '  ' + line)
      const newText = indentedLines.join('\n')
      
      // Replace selection with indented text
      const newValue = inputValue.value.substring(0, start) + newText + inputValue.value.substring(end)
      inputValue.value = newValue
      emit('update:modelValue', newValue)
      
      // Restore selection
      nextTick(() => {
        textarea.selectionStart = start
        textarea.selectionEnd = start + newText.length
      })
    }
  }
}


// Handle keyboard shortcuts
const handleKeyDown = (event: KeyboardEvent) => {
  if (!textareaRef.value || !props.isUndoRedoEnabled) return

  // Handle undo
  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    const result = undo(textareaRef.value)
    if (result) {
      inputValue.value = result.content
      emit('update:modelValue', result.content)
      nextTick(() => {
        result.applySelection()
      })
    }
    return
  }

  // Handle redo (Ctrl+Shift+Z or Ctrl+Y)
  if ((event.ctrlKey || event.metaKey) && ((event.key === 'z' && event.shiftKey) || event.key === 'y')) {
    event.preventDefault()
    const result = redo(textareaRef.value)
    if (result) {
      inputValue.value = result.content
      emit('update:modelValue', result.content)
      nextTick(() => {
        result.applySelection()
      })
    }
    return
  }
}

// Focus the textarea when tab changes
onMounted(() => {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus()
    }
  })
})

// Update the internal value when the prop changes
watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue
})

// Save history on every change
watch(() => inputValue.value, (newValue) => {
  if (textareaRef.value && props.isUndoRedoEnabled) {
    saveToHistory(
      newValue,
      textareaRef.value.selectionStart,
      textareaRef.value.selectionEnd
    )
  }
  emit('update:modelValue', newValue)
})

const updateSource = (text: string) => {
  inputValue.value = text
  emit('update:modelValue', text)
}

// Upload folder handler
const uploadFolder = async () => {
  await handleFolderUpload(updateSource, toast)
}
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
          @click="uploadFolder"
          :loading="isProcessingUpload"
          title="Upload folder structure"
        >
          Upload folder
        </UButton>
        <UButton
          size="lg"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-arrow-path"
          @click="onReset"
          title="Reset to default example"
        />
      </div>
    </div>
    <div class="input flex-1 p-2 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <ClientOnly>
        <div class="relative w-full h-full">
          <textarea
            ref="textareaRef"
            v-model="inputValue"
            class="w-full h-full font-mono resize-none p-2 bg-transparent focus:outline-none focus:ring-0 border-0"
            @keydown.tab.prevent="handleTabKey"
            @keydown="handleKeyDown"
            autofocus
            placeholder="Type your tree structure here..."
            spellcheck="false"
          ></textarea>
        </div>
        <template #fallback>
          <div class="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped>
/* Add responsive height for mobile */
@media (max-width: 1023px) {
  .flex-col {
    min-height: 300px;
  }
  
  /* Ensure the textarea takes up all available space */
  textarea {
    min-height: 250px;
  }
}
</style>