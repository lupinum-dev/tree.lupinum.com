export default defineAppConfig({
  ui: {
    colors: {
      primary: 'teal',
      neutral: 'slate'
    }
  },
  uiPro: {
    footer: {
      slots: {
        root: 'border-t border-(--ui-border)',
        left: 'text-sm text-(--ui-text-muted)'
      }
    }
  },
  seo: {
    siteName: 'ASCII Tree Generator',
    description: 'A modern open-source ASCII folder structure generator that works entirely in your browser. Your files and text never leave your device - zero server processing.'
  },
  header: {
    title: 'ASCII Tree Generator',
    to: '/',
    logo: {
      alt: 'ASCII Tree Generator Logo',
      light: '/logo-light.png',
      dark: '/logo-dark.png'
    },
    search: true,
    colorMode: true,
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/nuxt-ui-pro/docs/tree/v3',
      'target': '_blank',
      'aria-label': 'GitHub'
    }]
  },
  footer: {
    colorMode: false,
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/lupinum/tree.lupinum.com',
      'target': '_blank',
      'aria-label': 'ASCII Tree Generator on GitHub'
    }]
  },
})
