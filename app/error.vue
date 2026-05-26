<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

const { public: pub } = useRuntimeConfig()

useHead({
  htmlAttrs: {
    lang: 'en'
  },
  meta: [{ name: 'robots', content: 'noindex, follow' }]
})

useSeoMeta({
  title: `Page not found · ${pub.siteName}`,
  description: `${pub.siteName} could not show this address. Open the generator at ${pub.siteUrl}/.`
})

const { data: navigation } = await useAsyncData('navigation', () =>
  Promise.resolve([] as unknown[])
)
const { data: files } = useLazyAsyncData('search', () => Promise.resolve([] as unknown[]), {
  server: false
})

provide('navigation', navigation)
</script>

<template>
  <UApp>
    <UError :error="error" />

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
      />
    </ClientOnly>
  </UApp>
</template>
