// @vitest-environment node
import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vite-plus/test'

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

describe('search and discovery metadata', () => {
  it('uses one canonical Lupinum Tree identity', async () => {
    const html = await read('index.html')

    expect(html).toContain('<title>ASCII Tree Generator — Lupinum Tree</title>')
    expect(html).toContain('<link rel="canonical" href="https://tree.lupinum.com/"')
    expect(html).toContain('content="https://tree.lupinum.com/og-image.png"')
    expect(html).toContain('"name": "Lupinum Tree"')
    expect(html).toContain('"@type": "WebApplication"')
    expect(html).not.toContain('github.com/lupinum/tree.lupinum.com')
  })

  it('publishes matching crawl and app files', async () => {
    const [robots, sitemap, manifest, security, prerender] = await Promise.all([
      read('public/robots.txt'),
      read('public/sitemap.xml'),
      read('public/site.webmanifest'),
      read('public/.well-known/security.txt'),
      read('scripts/prerender.mjs'),
    ])

    expect(robots).toContain('https://tree.lupinum.com/sitemap.xml')
    expect(sitemap).toContain('<loc>https://tree.lupinum.com/</loc>')
    expect(sitemap).toContain('<loc>https://tree.lupinum.com/guide/</loc>')
    expect(prerender).toContain('How to Add a Folder Tree to a README — Lupinum Tree')
    expect(prerender).toContain("page: 'guide'")
    expect(JSON.parse(manifest)).toMatchObject({ name: 'Lupinum Tree', start_url: '/' })
    expect(security).toContain(
      'https://github.com/lupinum-dev/lupinum-tree/security/advisories/new',
    )
  })
})
