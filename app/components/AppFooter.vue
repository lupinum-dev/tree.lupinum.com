<script setup lang="ts">
const { footer } = useAppConfig()
</script>

<template>
  <UFooter>
    <template #left>
      Built with <UIcon name="lucide:heart" class="text-red-500"></UIcon> by <a href="https://lupinum.com" target="_blank" rel="noopener noreferrer" class="text-primary-500 hover:text-primary-600 transition-colors">Lupinum</a> using <a href="https://nuxt.com" target="_blank" rel="noopener noreferrer" class="text-primary-500 hover:text-primary-600 transition-colors">Nuxt</a> & <a href="https://ui.nuxt.com" target="_blank" rel="noopener noreferrer" class="text-primary-500 hover:text-primary-600 transition-colors">Nuxt UI Pro</a>
    
    </template>
    <UColorModeSelect />
    <template #right>


      <template v-if="footer?.links">
        <UButton
          v-for="(link, index) of footer?.links"
          :key="index"
          v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
        />
      </template>
    </template>
  </UFooter>
</template>
