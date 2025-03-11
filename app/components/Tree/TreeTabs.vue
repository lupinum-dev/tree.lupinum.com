<script setup lang="ts">
import { ref } from 'vue'
import type { TreeTab } from '~/composables/useTreeTabs'

const props = defineProps<{
  tabs: TreeTab[]
  activeTabId: string
}>()

const emit = defineEmits<{
  (e: 'update:activeTabId', id: string): void
  (e: 'add'): void
  (e: 'rename', id: string, name: string): void
  (e: 'delete', id: string): void
}>()

// State for rename modal
const isRenameModalOpen = ref(false)
const tabToRename = ref<TreeTab | null>(null)
const newTabName = ref('')

// State for delete modal
const isDeleteModalOpen = ref(false)
const tabToDelete = ref<TreeTab | null>(null)

// Handle tab click
const onTabClick = (id: string) => {
  emit('update:activeTabId', id)
}

// Handle add tab click
const onAddTab = () => {
  emit('add')
}

// Open rename modal
const openRenameModal = (tab: TreeTab, event: Event) => {
  event.stopPropagation() // Prevent tab activation
  tabToRename.value = tab
  newTabName.value = tab.name
  isRenameModalOpen.value = true
}

// Submit rename
const submitRename = () => {
  if (tabToRename.value && newTabName.value.trim()) {
    emit('rename', tabToRename.value.id, newTabName.value.trim())
    isRenameModalOpen.value = false
    tabToRename.value = null
    newTabName.value = ''
  }
}

// Cancel rename
const cancelRename = () => {
  isRenameModalOpen.value = false
  tabToRename.value = null
  newTabName.value = ''
}

// Open delete modal
const openDeleteModal = (tab: TreeTab, event: Event) => {
  event.stopPropagation() // Prevent tab activation
  tabToDelete.value = tab
  isDeleteModalOpen.value = true
}

// Confirm delete
const confirmDelete = () => {
  if (tabToDelete.value) {
    emit('delete', tabToDelete.value.id)
    isDeleteModalOpen.value = false
    tabToDelete.value = null
  }
}

// Cancel delete
const cancelDelete = () => {
  isDeleteModalOpen.value = false
  tabToDelete.value = null
}
</script>

<template>
  <div class="tree-tabs-container mb-4">
    <div class="flex items-center space-x-1 border-b border-gray-200 dark:border-gray-700">
      <!-- Tab list -->
      <div 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-item relative"
        :class="{'active-tab': tab.id === activeTabId}"
        @click="onTabClick(tab.id)"
      >
        <div class="flex items-center py-2 px-4 cursor-pointer bg-gray-100 dark:bg-gray-800 rounded-t-md">
          <span>{{ tab.name }}</span>
          
          <div class="ml-2 flex items-center space-x-1">
            <UButton
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-heroicons-pencil-square"
              class="opacity-50 hover:opacity-100"
              @click="openRenameModal(tab, $event)"
              title="Rename tab"
            />
            
            <UButton
              v-if="tabs.length > 1"
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-heroicons-trash"
              class="opacity-50 hover:opacity-100"
              @click="openDeleteModal(tab, $event)"
              title="Delete tab"
            />
          </div>
        </div>
        <div 
          v-if="tab.id === activeTabId" 
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
        ></div>
      </div>
      
      <!-- Add tab button -->
      <UButton
        size="sm"
        variant="ghost"
        color="neutral"
        icon="i-heroicons-plus"
        @click="onAddTab"
        title="Add new tree"
      />
    </div>

    <!-- Rename Modal -->
    <UModal v-model:open="isRenameModalOpen" title="Rename Tab">
      <!-- This is an empty hidden button that acts as the trigger -->
      <div class="hidden"></div>
      
      <template #body>
        <UFormGroup label="New name">
          <UInput
            v-model="newTabName"
            placeholder="Enter tab name"
            @keyup.enter="submitRename"
            autofocus
          />
        </UFormGroup>
      </template>
      
      <template #footer>
        <div class="flex justify-end space-x-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="cancelRename"
          >
            Cancel
          </UButton>
          
          <UButton
            color="primary"
            :disabled="!newTabName.trim()"
            @click="submitRename"
          >
            Rename
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Delete Modal -->
    <UModal v-model:open="isDeleteModalOpen" title="Delete Tab">
      <!-- This is an empty hidden button that acts as the trigger -->
      <div class="hidden"></div>
      
      <template #body>
        <p>
          Are you sure you want to delete "{{ tabToDelete?.name }}"?
          This action cannot be undone.
        </p>
      </template>
      
      <template #footer>
        <div class="flex justify-end space-x-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="cancelDelete"
          >
            Cancel
          </UButton>
          
          <UButton
            color="error"
            @click="confirmDelete"
          >
            Delete
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.active-tab {
  background-color: white;
}

.dark .active-tab {
  background-color: #111827;
}
</style>