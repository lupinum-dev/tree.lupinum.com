// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui-pro',
    '@nuxt/test-utils/module'
  ],

  ssr: false,

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-07-11',

  // SEO Configuration
  site: {
    url: 'https://ascii-file-tree.com',
    name: 'ASCII Tree Generator',
    description: 'A modern open-source ASCII folder structure generator that works entirely in your browser. Your files and text never leave your device - zero server processing.',
    defaultLocale: 'en'
  },


  // App Configuration
  app: {
    head: {
      meta: [
        { name: 'application-name', content: 'ASCII Tree Generator' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'theme-color', content: '#10b981' },
        { name: 'robots', content: 'index, follow' }
      ]
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  icon: {
    provider: 'iconify'
  },


})
