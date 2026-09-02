<script setup lang="ts">
import { Copy, ImageDown, SlidersHorizontal, Sparkles } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSidebar } from '@/components/ui/sidebar'
import { useTreeWorkspace } from '@/features/tree/use-tree-workspace'

const workspace = useTreeWorkspace()
const sidebar = useSidebar()
</script>

<template>
  <section
    class="tree-output-surface workspace-output flex min-h-[28rem] min-w-0 flex-col"
    aria-labelledby="output-heading"
  >
    <div class="flex min-h-13 shrink-0 flex-wrap items-center gap-2 border-b px-4 py-2">
      <div class="flex min-w-0 items-center gap-2">
        <h2 id="output-heading" class="text-sm font-semibold">Output</h2>
        <Badge variant="secondary" class="hidden font-normal md:inline-flex">{{
          workspace.activeFormatLabel.value
        }}</Badge>
        <Button
          variant="ghost"
          size="xs"
          class="font-normal md:hidden"
          aria-label="Open output format settings"
          @click="sidebar.toggleSidebar"
        >
          <SlidersHorizontal class="size-3.5" aria-hidden="true" />
          {{ workspace.activeFormatLabel.value }}
        </Button>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          aria-label="Export output as PNG"
          :disabled="!workspace.output.value"
          @click="workspace.exportOutput"
        >
          <ImageDown class="size-4" aria-hidden="true" />
          <span class="hidden sm:inline">Export PNG</span>
          <span class="sm:hidden">Save PNG</span>
        </Button>
        <Button size="sm" :disabled="!workspace.output.value" @click="workspace.copyOutput">
          <Copy class="size-4" aria-hidden="true" />
          Copy output
        </Button>
      </div>
    </div>

    <div class="min-h-0 flex-1">
      <pre
        v-if="workspace.output.value"
        id="tree-output"
        tabindex="0"
        class="workspace-scroll-surface tree-output-surface h-full min-h-80 overflow-auto p-4 font-mono text-[13px] leading-6 selection:bg-primary/25"
        aria-label="Generated tree output"
      ><code>{{ workspace.output.value }}</code></pre>
      <div v-else class="grid h-full min-h-80 place-items-center p-8 text-center">
        <div class="max-w-xs">
          <div
            class="mx-auto mb-3 grid size-9 place-items-center rounded-full bg-accent text-primary"
          >
            <Sparkles class="size-4" aria-hidden="true" />
          </div>
          <h3 class="font-medium">
            {{
              workspace.parseErrors.value.length
                ? 'Fix the source to continue'
                : 'Output appears here'
            }}
          </h3>
          <p class="mt-1 text-sm text-muted-foreground">
            {{
              workspace.parseErrors.value.length
                ? 'The last valid output is hidden until the indentation error is fixed.'
                : 'Type a directory list or choose a folder. The tree updates as you work.'
            }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
