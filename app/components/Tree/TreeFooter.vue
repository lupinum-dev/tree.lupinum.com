<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Network status
const networkStatus = ref('online')

// Setup network status monitoring
onMounted(() => {
  if (process.client) {
    networkStatus.value = navigator.onLine ? 'online' : 'offline'
    
    const handleOffline = () => {
      networkStatus.value = 'offline'
    }
    
    const handleOnline = () => {
      networkStatus.value = 'online'
    }
    
    window.addEventListener('online', handleOnline)
    
    // Cleanup events on component unmount
    onBeforeUnmount(() => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    })
  }
})
</script>

<template>
  <div class="flex-none flex items-center mt-4 flex-col md:flex-row">
    <p class="text-gray-500 text-center sm:text-left mb-2 pr-0 sm:pr-4 mr-auto">
      <span v-if="networkStatus === 'offline'" class="text-red-500">
        You are currently offline. Some features may be unavailable.
      </span>
    </p>
    
    <div class="flex flex-col sm:flex-row items-center sm:items-start mb-2 mt-md-0">
      <UButton
        variant="link"
        class="pr-0 sm:pr-4 view-source-link whitespace-nowrap"
        to="https://github.com/example/tree-generator"
        target="_blank"
        :disabled="networkStatus === 'offline'"
      >
        View the source on GitHub
        <UIcon name="i-heroicons-code-bracket" class="ml-1" />
      </UButton>
    </div>
  </div>
</template>offline', handleOffline)
    window.addEventListener('