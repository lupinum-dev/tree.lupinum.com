<template>
  <div>
    <UContainer class="max-w-[2200px]">
      <TreeHeader />

      <noscript class="block my-6 rounded-lg border border-amber-600/40 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
        Enable JavaScript to use the ASCII tree editor (paste folders, upload projects, exports).
      </noscript>

      <ClientOnly>
        <TreeWorkspaceClient />
        <template #fallback>
          <TreeWorkspaceSkeleton />
        </template>
      </ClientOnly>

      <TreeFooter />
      <AppCredits />
    </UContainer>
  </div>
</template>
