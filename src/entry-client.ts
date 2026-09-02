import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import 'vue-sonner/style.css'
import './style.css'

import { createApp, createSSRApp } from 'vue'
import App from './App.vue'

const root = document.querySelector<HTMLDivElement>('#app')
if (!root) throw new Error('App root was not found')

const page =
  root.dataset.page === 'guide' || window.location.pathname.startsWith('/guide')
    ? 'guide'
    : 'workbench'
const application =
  root.dataset.prerendered === 'true' ? createSSRApp(App, { page }) : createApp(App, { page })
application.mount(root)
