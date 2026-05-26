/** Canonical SEO/app URLs shared between `nuxt.config.ts`, Vue components, and crawler-visible markup */

export const SITE_URL = 'https://tree.lupinum.com' as const

export const SITE_NAME = 'ASCII Tree Generator'

/** Optimised primary SERP snippet (~155 chars usable shown snippet varies). */
export const SITE_DESCRIPTION
  = 'Free ASCII & Unicode folder-tree maker for README docs & AI prompts. Paste indented text or upload a folder—export UTF-8/ASCII, JSON, YAML, XML, Markdown & more. Runs in your browser; nothing is uploaded.'

/** Extra discoverability in meta keywords (minor signal; kept concise). */
export const SITE_KEYWORDS
  = 'ASCII tree generator, folder tree, directory tree, tree command text, UTF-8 tree, project structure, README tree, file tree visualizer, JSON tree export, YAML tree, privacy, browser tool, open source'

/** Default document title (page can extend via titleTemplate). */
export const SITE_TITLE
  = 'ASCII Tree Generator — free folder & directory tree for README & docs'

export function siteMetaJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        'name': SITE_NAME,
        'url': `${SITE_URL}/`,
        'description': SITE_DESCRIPTION,
        'inLanguage': 'en',
        'publisher': {
          '@type': 'Organization',
          'name': 'Lupinum',
          'sameAs': 'https://github.com/lupinu-dev'
        }
      },
      {
        '@type': 'WebApplication',
        'name': SITE_NAME,
        'url': `${SITE_URL}/`,
        'description': SITE_DESCRIPTION,
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'Web browser',
        'browserRequirements': 'Requires JavaScript',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'isAccessibleForFree': true,
        'featureList': [
          'ASCII and UTF-8 tree output',
          'JSON, YAML, XML, Markdown, DOT exports',
          'Folder upload to tree text',
          'Copy, share link, image export',
          'Local-only processing in the browser'
        ]
      }
    ]
  }
}
