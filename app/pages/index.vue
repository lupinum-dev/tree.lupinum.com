<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTreeGenerator } from '~/composables/useTreeGenerator'
import { useTreeStorage } from '~/composables/useTreeStorage'
import { useTreeHistory } from '~/composables/useTreeHistory'
import { useTreeTabs } from '~/composables/useTreeTabs'
import { generateTree } from '~/lib/generate-tree'
import { parseInput } from '~/lib/parse-input'
import { formatTree } from '~/lib/tree-formatters'

// Tree tabs composable
const { 
  tabs, 
  activeTabId, 
  activeTab, 
  loadTabs, 
  saveTabs, 
  addTab, 
  renameTab, 
  deleteTab, 
  setActiveTab,
  updateActiveSource,
  updateActiveOptions
} = useTreeTabs()

// History composable
const { initHistory, loadHistory } = useTreeHistory()

// Toast
const toast = useToast()

// Computed values based on the active tab
const source = computed({
  get: () => activeTab.value?.source || '',
  set: (value) => {
    updateActiveSource(value)
    saveTabs()
  }
})

const options = computed({
  get: () => activeTab.value?.options || {
    fancy: true,
    fullPath: false,
    trailingSlash: false,
    rootDot: true
  },
  set: (value) => {
    updateActiveOptions(value)
    saveTabs()
  }
})

const tree = computed(() => {
  if (!activeTab.value) return ''
  
  // Show welcome message instead of error when input is empty
  if (!activeTab.value.source.trim()) {
    return ''
  }
  
  try {
    const structure = parseInput(activeTab.value.source)
    return formatTree(structure, activeTab.value.options.format, {
      fullPath: activeTab.value.options.fullPath,
      trailingDirSlash: activeTab.value.options.trailingSlash,
      rootDot: activeTab.value.options.rootDot
    })
  } catch (error) {
    console.error('Error generating tree:', error)
    return 'Error parsing input'
  }
})

// Initialize from storage if available
onMounted(() => {
  if (process.client) {
    // Load tabs from localStorage
    loadTabs()
    
    // Initialize history for the active tab
    initHistory(source.value)
    
    // Add SEO-specific setup for the index page
    useSeoMeta({
      title: 'ASCII Tree Generator - Modern Browser-Based Tool',
      description: 'A modern open-source ASCII folder structure generator that works entirely in your browser. Your files and text never leave your device - zero server processing.',
      ogTitle: 'ASCII Tree Generator - Modern Browser-Based Tool',
      ogDescription: 'A modern open-source ASCII folder structure generator that works entirely in your browser. Your files and text never leave your device - zero server processing.'
    })
  }
})

// Reset active tab to default
const resetToDefault = () => {
  if (activeTab.value) {
    const { resetToDefault } = useTreeGenerator()
    const { source: defaultSource, options: defaultOptions } = resetToDefault()
    
    updateActiveSource(defaultSource)
    updateActiveOptions(defaultOptions)
    saveTabs()
  }
}

// Add a new tab
const handleAddTab = () => {
  addTab()
  saveTabs()
}

// Rename a tab
const handleRenameTab = (id: string, newName: string) => {
  renameTab(id, newName)
  saveTabs()
}

// Delete a tab
const handleDeleteTab = (id: string) => {
  deleteTab(id)
  saveTabs()
}

// Copy tree to clipboard
const copyToClipboard = () => {
  if (process.client) {
    navigator.clipboard.writeText(tree.value)
    toast.add({
      title: 'Tree copied to clipboard!',
      icon: 'i-heroicons-clipboard-document',
      color: 'success',
      duration: 1200
    })
  }
}

// Capture tree as image
const captureScreenshot = () => {
  if (!process.client) return
  
  try {
    const treeElement = document.getElementById('tree-output')
    if (!treeElement) return
    
    // Create a temporary canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set dimensions
    const styles = window.getComputedStyle(treeElement)
    const padding = parseInt(styles.padding || '0')
    const width = treeElement.clientWidth - (padding * 2)
    const height = treeElement.clientHeight - (padding * 2)
    
    canvas.width = width
    canvas.height = height
    
    // Apply background
    const isDarkMode = document.documentElement.classList.contains('dark')
    ctx.fillStyle = isDarkMode ? '#1f2937' : '#f3f4f6'
    ctx.fillRect(0, 0, width, height)
    
    // Apply text
    ctx.font = '14px monospace'
    ctx.fillStyle = isDarkMode ? '#e5e7eb' : '#111827'
    
    // Split text into lines and render each line
    const lines = tree.value.split('\n')
    const lineHeight = 18
    lines.forEach((line, i) => {
      ctx.fillText(line, 10, (i + 1) * lineHeight)
    })
    
    // Create download link
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `${activeTab.value?.name || 'ascii_tree'}.png`
    link.href = dataUrl
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.add({
      title: 'Tree image downloaded!',
      icon: 'i-heroicons-photo',
      color: 'success',
      duration: 1200
    })
  } catch (error) {
    console.error('Error generating image:', error)
    toast.add({
      title: 'Failed to generate image',
      icon: 'i-heroicons-exclamation-circle',
      color: 'error',
      duration: 1200
    })
  }
}

// Share URL
const shareUrl = () => {
  if (process.client) {
    navigator.clipboard.writeText(window.location.href)
    toast.add({
      title: 'URL copied to clipboard!',
      icon: 'i-heroicons-link',
      color: 'success',
      duration: 1200
    })
  }
}

// Update active tab when tabs change
watch(activeTabId, () => {
  // Initialize history for the newly active tab
  if (activeTab.value) {
    initHistory(activeTab.value.source)
  }
})
</script>

<template>
  <div>
    <UContainer class="max-w-[2200px]">
      <TreeHeader />
      
      <div class="app w-full min-h-screen flex flex-col">
        <!-- Tab navigation -->
        <TreeTabs 
          :tabs="tabs"
          v-model:activeTabId="activeTabId"
          @add="handleAddTab"
          @rename="handleRenameTab"
          @delete="handleDeleteTab"
        />
        
        <div class="flex-1 flex flex-col lg:flex-row gap-3 min-h-[500px]">
          <!-- Input panel - exactly 50% on large screens -->
          <div class="w-full lg:w-1/2 flex-shrink-0 min-h-[500px]">
            <TreeInput 
              v-model="source" 
              :is-undo-redo-enabled="true"
              @reset="resetToDefault"
            />
          </div>
          
          <!-- Output panel - exactly 50% on large screens -->
          <div class="w-full lg:w-1/2 flex-shrink-0 min-h-[500px]">
            <TreeOutput 
              :tree="tree"
              @copy="copyToClipboard"
              @export="captureScreenshot"
            />
          </div>
        </div>

        <p class="my-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded inline-block">
          <span class="inline-flex items-center">
            <UIcon name="i-heroicons-shield-check" class="mr-1 text-green-600 dark:text-green-400" />
            Your files and text never leave your device - zero server processing
          </span>
        </p>
        
        <!-- Options panel -->
        <div class="flex-none mt-4">
          <TreeOptions 
            :options="options"
            @update:options="newOptions => options = newOptions"
            @copy="copyToClipboard"
            @export="captureScreenshot"
            @share="shareUrl"
          />
        </div>
        <TreeFooter />  
        <AppCredits />

      </div>
    </UContainer>
  </div>
</template>