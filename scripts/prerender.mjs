import { mkdir, readFile, writeFile } from 'node:fs/promises'

const templatePath = new URL('../dist/index.html', import.meta.url)
const rendererPath = new URL('../dist-ssr/entry-server.js', import.meta.url)
const marker = '<div id="app"><!--ssr-outlet--></div>'

const template = await readFile(templatePath, 'utf8')
const { render } = await import(rendererPath.href)

if (!template.includes(marker)) {
  throw new Error('Unable to find the SSR outlet in dist/index.html')
}

const pages = [
  {
    page: 'workbench',
    output: templatePath,
  },
  {
    page: 'guide',
    output: new URL('../dist/guide/index.html', import.meta.url),
    title: 'How to Add a Folder Tree to a README — Lupinum Tree',
    description:
      'Learn how to create an ASCII or Unicode directory tree and add it to a GitHub README or technical documentation.',
    canonical: 'https://tree.lupinum.com/guide/',
  },
]

function replaceMetaContent(html, attribute, name, content) {
  const pattern = new RegExp(`<meta\\s+${attribute}="${name}"\\s+content="[^"]*"\\s*/?>`)
  return html.replace(pattern, `<meta ${attribute}="${name}" content="${content}" />`)
}

function applyPageMetadata(html, page) {
  if (!page.title) return html

  let result = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${page.title}</title>`)
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${page.canonical}" />`,
    )

  result = replaceMetaContent(result, 'name', 'description', page.description)
  result = replaceMetaContent(result, 'property', 'og:url', page.canonical)
  result = replaceMetaContent(result, 'property', 'og:title', page.title)
  result = replaceMetaContent(result, 'property', 'og:description', page.description)
  result = replaceMetaContent(result, 'name', 'twitter:title', page.title)
  result = replaceMetaContent(result, 'name', 'twitter:description', page.description)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'How to add a folder tree to your README',
    description: page.description,
    url: page.canonical,
    publisher: {
      '@type': 'Organization',
      name: 'Lupinum',
      url: 'https://lupinum.com/',
    },
  }

  return result.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`,
  )
}

for (const page of pages) {
  const appHtml = await render(page.page)
  const pageTemplate = applyPageMetadata(template, page)
  const output = pageTemplate.replace(
    marker,
    `<div id="app" data-prerendered="true" data-page="${page.page}">${appHtml}</div>`,
  )

  await mkdir(new URL('.', page.output), { recursive: true })
  await writeFile(page.output, output)
}
