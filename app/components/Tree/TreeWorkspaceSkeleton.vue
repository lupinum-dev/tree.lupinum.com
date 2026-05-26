<template>
  <div
    class="app w-full min-h-screen flex flex-col"
    aria-busy="true"
    aria-live="polite"
  >
    <div class="flex flex-wrap gap-2 mb-2">
      <div class="h-9 w-24 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      <div class="h-9 w-28 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
    </div>

    <div class="flex-1 flex flex-col lg:flex-row gap-3 min-h-[500px]">
      <div
        class="w-full lg:w-1/2 min-h-[500px] rounded-lg border border-transparent bg-neutral-200 dark:bg-neutral-800 animate-pulse"
      />
      <div
        class="w-full lg:w-1/2 min-h-[500px] rounded-lg border border-transparent bg-neutral-200 dark:bg-neutral-800 animate-pulse"
      />
    </div>

    <p class="my-4 text-sm text-gray-500 dark:text-gray-400">
      Loading the editor…
    </p>

    <div class="flex gap-2 mt-4">
      <div class="h-10 w-32 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      <div class="h-10 w-32 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
    </div>
  </div>
</template>
