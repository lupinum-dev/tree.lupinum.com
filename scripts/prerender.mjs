import { readFile, writeFile } from 'node:fs/promises'

const templatePath = new URL('../dist/index.html', import.meta.url)
const rendererPath = new URL('../dist-ssr/entry-server.js', import.meta.url)
const marker = '<div id="app"><!--ssr-outlet--></div>'

const template = await readFile(templatePath, 'utf8')
const { render } = await import(rendererPath.href)
const appHtml = await render()

if (!template.includes(marker)) {
  throw new Error('Unable to find the SSR outlet in dist/index.html')
}

const output = template.replace(marker, `<div id="app" data-prerendered="true">${appHtml}</div>`)
await writeFile(templatePath, output)
