<script setup lang="ts">
const { public: pub } = useRuntimeConfig()

const siteBase = pub.siteUrl?.replace(/\/$/, '') ?? 'https://tree.lupinum.com'
const ogImage = `${siteBase}/og-image.png`

useSeoMeta({
  title: pub.siteTitle,
  description: pub.siteDescription,
  ogTitle: pub.siteTitle,
  ogDescription: pub.siteDescription,
  ogUrl: `${siteBase}/`,
  ogImage,
  ogSiteName: pub.siteName,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: pub.siteTitle,
  twitterDescription: pub.siteDescription,
  twitterImage: ogImage
})

const { data: navigation } = await useAsyncData('navigation', () =>
  Promise.resolve([] as unknown[])
)

provide('navigation', navigation)
</script>

<template>
  <UApp>
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <AppFooter />
  </UApp>
</template>
