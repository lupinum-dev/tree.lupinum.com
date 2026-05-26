import { SITE_DESCRIPTION, SITE_NAME } from '../site-meta'

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
    siteName: SITE_NAME,
    description: SITE_DESCRIPTION
  },
  header: {
    title: SITE_NAME,
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
      'to': 'https://github.com/lupinum/tree.lupinum.com',
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
  }
})
