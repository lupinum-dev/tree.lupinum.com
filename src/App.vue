<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import TreeWorkspace from '@/components/TreeWorkspace.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { createTreeWorkspace, provideTreeWorkspace } from '@/features/tree/use-tree-workspace'

const workspace = createTreeWorkspace()
provideTreeWorkspace(workspace)

onMounted(workspace.initClient)
onBeforeUnmount(workspace.dispose)
</script>

<template>
  <SidebarProvider :default-open="true">
    <AppSidebar />
    <SidebarInset
      class="min-w-0 overflow-hidden bg-background dark:shadow-none dark:ring-1 dark:ring-sidebar-border"
    >
      <TreeWorkspace />
    </SidebarInset>
  </SidebarProvider>
  <Toaster close-button position="bottom-right" />
</template>
