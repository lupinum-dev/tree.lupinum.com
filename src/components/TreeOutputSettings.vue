<script setup lang="ts">
import { computed } from 'vue'
import {
  findTreeRenderer,
  formatGroupsFromRegistry,
  type FormatType,
} from '@/features/tree/domain/tree-formatters'
import { useTreeWorkspace } from '@/features/tree/use-tree-workspace'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const workspace = useTreeWorkspace()
const formatGroups = formatGroupsFromRegistry()

const activeFormat = computed({
  get: () => workspace.activeTree.value?.options.format ?? 'utf-8',
  set: (value: FormatType) => workspace.updateFormat(value),
})

const supportsTreeOptions = computed(() => findTreeRenderer(activeFormat.value).supportsTreeOptions)
</script>

<template>
  <div v-if="workspace.activeTree.value" class="space-y-4">
    <div class="space-y-1.5">
      <Label for="output-format" class="text-xs text-muted-foreground">Format</Label>
      <Select v-model="activeFormat">
        <SelectTrigger id="output-format" class="w-full">
          <SelectValue placeholder="Choose a format" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup v-for="group in formatGroups" :key="group.name">
            <SelectLabel>{{ group.name }}</SelectLabel>
            <SelectItem v-for="format in group.formats" :key="format.id" :value="format.id">
              {{ format.label }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>

    <fieldset v-if="supportsTreeOptions" class="space-y-1">
      <legend class="mb-1 text-xs font-medium text-muted-foreground">Path display</legend>
      <div class="flex items-center gap-3">
        <Checkbox
          id="full-path"
          :model-value="workspace.activeTree.value.options.fullPath"
          @update:model-value="workspace.updateOption('fullPath', $event === true)"
        />
        <Label for="full-path" class="cursor-pointer font-normal">Show full paths</Label>
      </div>
      <div class="flex items-center gap-3">
        <Checkbox
          id="trailing-slash"
          :model-value="workspace.activeTree.value.options.trailingSlash"
          @update:model-value="workspace.updateOption('trailingSlash', $event === true)"
        />
        <Label for="trailing-slash" class="cursor-pointer font-normal">Add trailing slashes</Label>
      </div>
      <div class="flex items-center gap-3">
        <Checkbox
          id="root-dot"
          :model-value="workspace.activeTree.value.options.rootDot"
          @update:model-value="workspace.updateOption('rootDot', $event === true)"
        />
        <Label for="root-dot" class="cursor-pointer font-normal">Show root dot</Label>
      </div>
    </fieldset>
  </div>
</template>
