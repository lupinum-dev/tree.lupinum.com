import { renderToString } from '@vue/server-renderer'
import { createSSRApp } from 'vue'
import App from './App.vue'

export function render(page: 'workbench' | 'guide' = 'workbench') {
  return renderToString(createSSRApp(App, { page }))
}
