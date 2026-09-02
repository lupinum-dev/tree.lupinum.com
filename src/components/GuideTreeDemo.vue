<script setup lang="ts">
import { Check, Copy, RotateCcw } from '@lucide/vue'
import { computed, onBeforeUnmount, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { FormatType } from '@/features/tree/domain/tree-formatters'
import { buildParsedTreeOutput } from '@/features/tree/domain/tree-output'
import { writeTextToClipboard } from '@/features/tree/infrastructure/write-clipboard'

const initialSource = `project
  src
    App.vue
  public
    icon.svg
  README.md`

const source = ref(initialSource)
const format = ref<Extract<FormatType, 'utf-8' | 'ascii'>>('utf-8')
const copied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | undefined

const result = computed(() =>
  buildParsedTreeOutput(source.value, format.value, {
    fullPath: false,
    trailingSlash: true,
    rootDot: true,
  }),
)

const output = computed(() => (result.value.ok ? result.value.output : ''))
const firstError = computed(() => (result.value.ok ? undefined : result.value.errors[0]))

function resetDemo() {
  source.value = initialSource
  format.value = 'utf-8'
}

async function copyOutput() {
  if (!output.value) return
  copied.value = await writeTextToClipboard(output.value)
  if (!copied.value) return

  if (copiedTimer) clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => {
    copied.value = false
  }, 2000)
}

onBeforeUnmount(() => {
  if (copiedTimer) clearTimeout(copiedTimer)
})
</script>

<template>
  <div class="mt-7 overflow-hidden rounded-xl border bg-border shadow-xs">
    <div class="grid gap-px lg:grid-cols-2">
      <section class="flex min-w-0 flex-col bg-card" aria-labelledby="demo-source-label">
        <div class="flex min-h-12 items-center gap-3 border-b px-4 py-2.5">
          <Label id="demo-source-label" for="guide-tree-source">Source</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="ml-auto text-xs text-muted-foreground"
            @click="resetDemo"
          >
            <RotateCcw class="size-3.5" aria-hidden="true" />
            Reset
          </Button>
        </div>
        <Textarea
          id="guide-tree-source"
          v-model="source"
          aria-describedby="guide-tree-help"
          class="h-72 min-h-72 resize-none rounded-none border-0 bg-transparent p-5 font-mono text-[13px] leading-6 shadow-none focus-visible:ring-0"
          spellcheck="false"
        />
        <p id="guide-tree-help" class="border-t px-5 py-3 text-xs text-muted-foreground">
          Use two spaces for each level. The output updates as you type.
        </p>
      </section>

      <section
        class="flex min-w-0 flex-col bg-slate-950 text-slate-100"
        aria-labelledby="demo-output-label"
      >
        <div class="flex min-h-12 items-center gap-2 border-b border-slate-800 px-4 py-2">
          <span id="demo-output-label" class="text-sm font-medium">Output</span>
          <Select v-model="format">
            <SelectTrigger
              size="sm"
              class="ml-auto border-slate-700 bg-slate-900 text-slate-100 shadow-none hover:bg-slate-800"
              aria-label="Output format"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="utf-8">Unicode</SelectItem>
              <SelectItem value="ascii">Plain ASCII</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            class="text-slate-300 hover:bg-slate-800 hover:text-white"
            :disabled="!output"
            :aria-label="copied ? 'Output copied' : 'Copy output'"
            @click="copyOutput"
          >
            <Check v-if="copied" class="size-4 text-cyan-300" aria-hidden="true" />
            <Copy v-else class="size-4" aria-hidden="true" />
          </Button>
        </div>

        <pre
          v-if="output"
          class="min-h-72 flex-1 overflow-auto p-5 font-mono text-[13px] leading-6 text-slate-100"
          tabindex="0"
        ><code>{{ output }}</code></pre>
        <div v-else class="grid min-h-72 flex-1 place-items-center p-5 text-center">
          <p class="max-w-xs text-sm leading-6 text-slate-400">
            {{
              firstError
                ? `Line ${firstError.line}: ${firstError.message}`
                : 'Add source to create output.'
            }}
          </p>
        </div>
        <p class="sr-only" aria-live="polite">{{ copied ? 'Output copied.' : '' }}</p>
      </section>
    </div>
  </div>
</template>
