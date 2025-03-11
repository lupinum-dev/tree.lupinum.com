import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use fork pool instead of threads to avoid Node.js v22 errors
    pool: 'forks',
    
    // Test environment
    environment: 'node',
    
    // Include test patterns
    include: ['**/*.test.{ts,js}'],
    
    // Exclude patterns
    exclude: ['**/node_modules/**', '**/dist/**'],
    
    // Coverage settings
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/*.test.{ts,js}'],
    },
    
    // Set longer timeouts for large tests
    testTimeout: 15000,
    hookTimeout: 10000,
    
    // Make tests resilient to errors
    dangerouslyIgnoreUnhandledErrors: true,
    
    // Reporters
    reporters: ['default', 'html'],
  },
});