import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '~': path.join(root, 'app'),
      '@': path.join(root, 'app')
    }
  },
  test: {
    pool: 'forks',
    environment: 'node',
    include: ['**/*.test.{ts,js}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/*.test.{ts,js}']
    },
    testTimeout: 15000,
    hookTimeout: 10000,
    dangerouslyIgnoreUnhandledErrors: true,
    reporters: ['default']
  }
})
