<script setup lang="ts">
import { FolderOpen, TriangleAlert } from '@lucide/vue'
import { computed, nextTick } from 'vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useTreeWorkspace } from '@/features/tree/use-tree-workspace'

const workspace = useTreeWorkspace()

const source = computed({
  get: () => workspace.activeTree.value?.source ?? '',
  set: (value: string) => workspace.updateSource(value),
})

const firstError = computed(() => workspace.parseErrors.value[0] ?? null)
let releaseTab = false

function handleEditorKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    releaseTab = true
    return
  }
  if (event.key === 'Tab') {
    if (releaseTab) {
      releaseTab = false
      return
    }
    void indentSelection(event)
    return
  }
  releaseTab = false
}

async function indentSelection(event: KeyboardEvent) {
  event.preventDefault()
  const textarea = event.currentTarget as HTMLTextAreaElement
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const before = source.value.slice(0, start)
  const selection = source.value.slice(start, end)

  if (event.shiftKey) {
    const lineStart = before.lastIndexOf('\n') + 1
    const block = source.value.slice(lineStart, end)
    const unindented = block.replace(/^ {1,2}/gm, '')
    const removedBeforeSelection = block.length - unindented.length
    source.value = source.value.slice(0, lineStart) + unindented + source.value.slice(end)
    await nextTick()
    textarea.setSelectionRange(
      Math.max(lineStart, start - Math.min(2, removedBeforeSelection)),
      end - removedBeforeSelection,
    )
    return
  }

  if (selection.includes('\n')) {
    const lineStart = before.lastIndexOf('\n') + 1
    const block = source.value.slice(lineStart, end)
    const indented = block.replace(/^/gm, '  ')
    source.value = source.value.slice(0, lineStart) + indented + source.value.slice(end)
    await nextTick()
    textarea.setSelectionRange(start + 2, end + (indented.length - block.length))
    return
  }

  source.value = source.value.slice(0, start) + '  ' + source.value.slice(end)
  await nextTick()
  textarea.setSelectionRange(start + 2, start + 2)
}
</script>

<template>
  <section
    class="workspace-source flex min-h-[28rem] min-w-0 flex-col bg-background"
    aria-labelledby="source-heading"
  >
    <div class="flex min-h-13 shrink-0 flex-wrap items-center gap-3 border-b px-4 py-2">
      <div class="min-w-0">
        <Label id="source-heading" for="tree-source" class="text-sm font-semibold"
          >Tree source</Label
        >
        <p class="text-xs text-muted-foreground">Use two spaces for each level.</p>
      </div>
      <Button
        class="ml-auto"
        variant="outline"
        size="sm"
        :disabled="workspace.isImporting.value"
        @click="workspace.importFolder"
      >
        <FolderOpen class="size-4" aria-hidden="true" />
        {{ workspace.isImporting.value ? 'Reading…' : 'Choose folder' }}
      </Button>
    </div>

    <div class="relative flex min-h-0 flex-1 flex-col">
      <textarea
        id="tree-source"
        v-model="source"
        class="workspace-editor-surface min-h-80 flex-1 resize-none border-0 bg-transparent p-4 font-mono text-[13px] leading-6 outline-none transition-[background-color,box-shadow] placeholder:text-muted-foreground focus-visible:bg-card/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/60 aria-invalid:ring-2 aria-invalid:ring-inset aria-invalid:ring-destructive/40"
        spellcheck="false"
        autocomplete="off"
        autocapitalize="off"
        placeholder="my-app\n  src\n    index.html"
        :aria-invalid="firstError ? 'true' : undefined"
        :aria-describedby="firstError ? 'tree-source-help tree-source-error' : 'tree-source-help'"
        @keydown="handleEditorKeydown"
      />
      <p id="tree-source-help" class="border-t px-4 py-2 text-xs text-muted-foreground">
        Changes save automatically. Tab changes indentation; press Escape, then Tab to leave.
      </p>
      <div
        v-if="firstError"
        id="tree-source-error"
        class="flex items-start gap-2 border-t border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        role="alert"
      >
        <TriangleAlert class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          <span class="font-medium">Line {{ firstError.line }}:</span>
          {{ firstError.message }}
        </p>
      </div>
    </div>
  </section>
</template>
