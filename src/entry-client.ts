import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import 'vue-sonner/style.css'
import './style.css'

import { createApp, createSSRApp } from 'vue'
import App from './App.vue'

const root = document.querySelector<HTMLDivElement>('#app')
if (!root) throw new Error('App root was not found')

const application = root.dataset.prerendered === 'true' ? createSSRApp(App) : createApp(App)
application.mount(root)
