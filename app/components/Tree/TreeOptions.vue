<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TreeOptions } from '~/composables/useTreeTabs'
import type { FormatType } from '~/lib/tree-formatters'
import { formatGroupsFromRegistry } from '~/lib/tree-formatters'

const props = defineProps<{
  options: TreeOptions
}>()

const emit = defineEmits<{
  'update:options': [value: TreeOptions]
  'copy': []
  'export': []
  'share': []
}>()

const formatGroups = formatGroupsFromRegistry()

const currentFormatLabel = computed(() => {
  const currentFormat = formatGroups
    .flatMap(group => group.formats)
    .find(format => format.id === props.options.format)

  return currentFormat?.label || 'Unknown Format'
})

// Button status texts
const copyText = ref('Copy')
const shareText = ref('Share')

// Format selection modal
const isFormatModalOpen = ref(false)

// Copy handler
const copyToClipboard = () => {
  emit('copy')
  copyText.value = 'Copied!'
  setTimeout(() => {
    copyText.value = 'Copy'
  }, 1200)
}

// Export handler
const exportAsImage = () => {
  emit('export')
}

// Share handler
const shareUrl = () => {
  emit('share')
  shareText.value = 'URL copied!'
  setTimeout(() => {
    shareText.value = 'Share'
  }, 1200)
}

// Open format selection modal
const openFormatModal = () => {
  isFormatModalOpen.value = true
}

// Select format handler
const selectFormat = (format: FormatType) => {
  emit('update:options', { ...props.options, format })
  isFormatModalOpen.value = false
}

// Options update handlers
const updateFullPath = (fullPath?: boolean) => {
  emit('update:options', { ...props.options, fullPath: !!fullPath })
}

const updateTrailingSlash = (trailingSlash?: boolean) => {
  emit('update:options', { ...props.options, trailingSlash: !!trailingSlash })
}

const updateRootDot = (rootDot?: boolean) => {
  emit('update:options', { ...props.options, rootDot: !!rootDot })
}
</script>

<template>
  <UCard class="w-full">
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-base font-medium">
          Tree Options
        </h3>
        <div class="flex gap-2">
          <UButton
            variant="solid"
            color="primary"
            class="share-button"
            size="lg"
            @click="shareUrl"
          >
            <UIcon
              name="i-heroicons-share"
              class="mr-1"
            />
            {{ shareText }}
          </UButton>
        </div>
      </div>
    </template>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div>
        <UForm :state="{}">
          <UFormField
            label="Format"
            class="mb-2"
          >
            <UButton
              class="w-full text-left flex justify-between items-center"
              @click="openFormatModal"
            >
              <span>{{ currentFormatLabel }}</span>
              <UIcon name="i-heroicons-chevron-down" />
            </UButton>
          </UFormField>
        </UForm>
      </div>

      <div class="space-y-2">
        <UForm :state="{}">
          <UFormField
            label="Options"
            class="mb-2"
          >
            <div class="space-y-3">
              <div class="flex items-center">
                <USwitch
                  :model-value="options.fullPath"
                  size="lg"
                  @update:model-value="updateFullPath"
                />
                <span class="ml-2">Full path</span>
              </div>

              <div class="flex items-center">
                <USwitch
                  :model-value="options.trailingSlash"
                  size="lg"
                  @update:model-value="updateTrailingSlash"
                />
                <span class="ml-2">Trailing /</span>
              </div>

              <div class="flex items-center">
                <USwitch
                  :model-value="options.rootDot"
                  size="lg"
                  @update:model-value="updateRootDot"
                />
                <span class="ml-2">Root .</span>
              </div>
            </div>
          </UFormField>
        </UForm>
      </div>

      <div>
        <UForm :state="{}">
          <UFormField
            label="Actions"
            class="mb-2"
          >
            <div class="flex space-x-1">
              <UTooltip text="Copy tree to clipboard">
                <UButton
                  variant="outline"
                  size="lg"
                  class="flex-1"
                  @click="copyToClipboard"
                >
                  <UIcon
                    name="i-heroicons-clipboard-document"
                    class="mr-1"
                  />
                  {{ copyText }}
                </UButton>
              </UTooltip>

              <UTooltip text="Download as image">
                <UButton
                  variant="outline"
                  size="lg"
                  class="flex-1"
                  @click="exportAsImage"
                >
                  <UIcon
                    name="i-heroicons-photo"
                    class="mr-1"
                  />
                  Export
                </UButton>
              </UTooltip>
            </div>
          </UFormField>
        </UForm>
      </div>
    </div>

    <!-- Format selection modal -->
    <UModal
      v-model:open="isFormatModalOpen"
      title="Select Format"
    >
      <!-- Hidden trigger button -->
      <div class="hidden" />

      <template #body>
        <div class="space-y-6">
          <div
            v-for="group in formatGroups"
            :key="group.name"
            class="space-y-2"
          >
            <h4 class="font-medium text-sm text-gray-500">
              {{ group.name }}
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <UButton
                v-for="format in group.formats"
                :key="format.id"
                :variant="format.id === options.format ? 'solid' : 'outline'"
                :color="format.id === options.format ? 'primary' : 'neutral'"
                class="justify-start"
                @click="selectFormat(format.id as FormatType)"
              >
                {{ format.label }}
              </UButton>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end">
          <UButton @click="isFormatModalOpen = false">
            Cancel
          </UButton>
        </div>
      </template>
    </UModal>
  </UCard>
</template>
