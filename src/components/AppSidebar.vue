<script setup lang="ts">
import {
  ArrowUpRight,
  Check,
  Copy,
  FolderTree,
  LockKeyhole,
  Moon,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Sun,
} from '@lucide/vue'
import { onMounted, ref } from 'vue'
import GitHubIcon from '@/components/GitHubIcon.vue'
import type { SavedTree } from '@/features/tree/domain/workspace.types'
import { useTreeWorkspace } from '@/features/tree/use-tree-workspace'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const workspace = useTreeWorkspace()
const sidebar = useSidebar()
const dialogTree = ref<SavedTree | null>(null)
const renameOpen = ref(false)
const deleteOpen = ref(false)
const resetOpen = ref(false)
const nextName = ref('')
const isDark = ref(false)

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
})

function openRename(tree: SavedTree) {
  dialogTree.value = tree
  nextName.value = tree.name
  renameOpen.value = true
}

function openDelete(tree: SavedTree) {
  dialogTree.value = tree
  deleteOpen.value = true
}

function openReset(tree: SavedTree) {
  dialogTree.value = tree
  resetOpen.value = true
}

function submitRename() {
  if (!dialogTree.value) return
  workspace.renameTree(dialogTree.value.id, nextName.value)
  renameOpen.value = false
}

function confirmDelete() {
  if (!dialogTree.value) return
  workspace.deleteTree(dialogTree.value.id)
}

function confirmReset() {
  if (!dialogTree.value) return
  workspace.resetTree(dialogTree.value.id)
}

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  try {
    localStorage.setItem('tree-theme', isDark.value ? 'dark' : 'light')
  } catch {
    // The current page can still switch theme when browser storage is unavailable.
  }
}

function addTree() {
  workspace.addTree()
  if (sidebar.isMobile.value) sidebar.setOpenMobile(false)
}

function selectTree(id: string) {
  workspace.selectTree(id)
  if (sidebar.isMobile.value) sidebar.setOpenMobile(false)
}
</script>

<template>
  <Sidebar variant="inset" collapsible="offcanvas" class="border-sidebar-border">
    <SidebarHeader class="gap-3 border-b border-sidebar-border p-3">
      <div class="flex min-w-0 items-center gap-2 px-1 py-1">
        <div
          class="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-xs"
        >
          <FolderTree class="size-4" aria-hidden="true" />
        </div>
        <div class="min-w-0 leading-tight">
          <h1 class="truncate text-sm font-semibold tracking-[-0.01em]">Lupinum Tree</h1>
          <p class="truncate text-xs text-muted-foreground">ASCII tree generator</p>
        </div>
      </div>
      <nav
        class="grid grid-cols-2 overflow-hidden rounded-md border border-sidebar-border bg-sidebar"
        aria-label="Primary"
      >
        <a
          href="/"
          aria-current="page"
          class="flex min-h-8 items-center justify-center bg-sidebar-primary px-2 text-xs font-medium text-sidebar-primary-foreground no-underline"
        >
          Workbench
        </a>
        <a
          href="/guide/"
          class="flex min-h-8 items-center justify-center px-2 text-xs font-medium text-sidebar-foreground no-underline hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        >
          Guide
        </a>
      </nav>
      <Button class="w-full justify-start" size="sm" @click="addTree">
        <Plus class="size-4" aria-hidden="true" />
        New tree
      </Button>
    </SidebarHeader>

    <SidebarContent class="overflow-x-hidden">
      <SidebarGroup>
        <SidebarGroupLabel>Trees</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu v-if="workspace.isReady.value">
            <SidebarMenuItem v-for="tree in workspace.trees.value" :key="tree.id">
              <SidebarMenuButton
                :is-active="tree.id === workspace.activeTreeId.value"
                :aria-pressed="tree.id === workspace.activeTreeId.value"
                class="pr-8"
                @click="selectTree(tree.id)"
              >
                <FolderTree class="size-4 text-muted-foreground" aria-hidden="true" />
                <span class="truncate" :title="tree.name">{{ tree.name }}</span>
                <Check
                  v-if="tree.id === workspace.activeTreeId.value"
                  class="ml-auto size-3.5 text-primary"
                  aria-hidden="true"
                />
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <SidebarMenuAction show-on-hover :aria-label="`More actions for ${tree.name}`">
                    <MoreHorizontal aria-hidden="true" />
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" class="w-40">
                  <DropdownMenuItem @select="workspace.duplicateTree(tree.id)">
                    <Copy class="size-4" aria-hidden="true" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem @select="openRename(tree)">Rename</DropdownMenuItem>
                  <DropdownMenuItem @select="openReset(tree)">
                    <RotateCcw class="size-4" aria-hidden="true" />
                    Reset tree
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    class="text-destructive focus:text-destructive"
                    :disabled="workspace.trees.value.length === 1"
                    @select="openDelete(tree)"
                  >
                    Delete tree
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
          <div v-else class="space-y-2 px-2 py-1" aria-label="Loading saved trees">
            <SidebarMenuSkeleton v-for="item in 3" :key="item" :show-icon="true" />
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="border-t border-sidebar-border p-3">
      <div class="space-y-2 rounded-lg bg-sidebar-accent/60 p-2.5 text-xs text-muted-foreground">
        <p class="flex items-center gap-2 text-sidebar-foreground">
          <LockKeyhole class="size-3.5 text-primary" aria-hidden="true" />
          Files stay on this device
        </p>
        <p class="pl-5">Trees are saved in this browser.</p>
      </div>
      <div class="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          :aria-label="isDark ? 'Use light theme' : 'Use dark theme'"
          @click="toggleTheme"
        >
          <Sun v-if="isDark" class="size-4" aria-hidden="true" />
          <Moon v-else class="size-4" aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon-sm" as-child>
          <a
            href="https://github.com/lupinum-dev/tree.lupinum.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
          >
            <GitHubIcon class="size-4" aria-hidden="true" />
          </a>
        </Button>
        <Button variant="ghost" size="sm" class="ml-auto text-xs text-muted-foreground" as-child>
          <a href="https://lupinum.com">
            Lupinum
            <ArrowUpRight class="size-3" aria-hidden="true" />
          </a>
        </Button>
      </div>
    </SidebarFooter>
  </Sidebar>

  <AlertDialog v-model:open="renameOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Rename tree</AlertDialogTitle>
        <AlertDialogDescription
          >Choose a short name that helps you find this tree later.</AlertDialogDescription
        >
      </AlertDialogHeader>
      <form class="space-y-2" @submit.prevent="submitRename">
        <Label for="tree-name">Tree name</Label>
        <Input id="tree-name" v-model="nextName" autocomplete="off" autofocus />
      </form>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction :disabled="!nextName.trim()" @click="submitRename"
          >Rename tree</AlertDialogAction
        >
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <AlertDialog v-model:open="deleteOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete “{{ dialogTree?.name }}”?</AlertDialogTitle>
        <AlertDialogDescription
          >This removes the tree from this browser. This action cannot be
          undone.</AlertDialogDescription
        >
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" @click="confirmDelete"
          >Delete tree</AlertDialogAction
        >
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <AlertDialog v-model:open="resetOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Reset “{{ dialogTree?.name }}”?</AlertDialogTitle>
        <AlertDialogDescription
          >This replaces its source and settings with the example tree.</AlertDialogDescription
        >
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction @click="confirmReset">Reset tree</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
