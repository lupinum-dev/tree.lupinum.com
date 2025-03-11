<script setup lang="ts">
// No props or state needed for this simple component
</script>

<template>
  <UCard class="my-8">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="font-medium">Credits</h3>
      </div>
    </template>
    
    <div class="space-y-4">
      <p>
        tree.lupinum.com is a modern version of 
        <a href="https://tree.nathanfriend.com" target="_blank" class="text-primary-600 hover:underline">tree.nathanfriend.com</a>
        with improved performance and advanced features.
      </p>
  
    </div>
  </UCard>
</template>