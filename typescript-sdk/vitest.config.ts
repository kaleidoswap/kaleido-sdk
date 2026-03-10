import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Include test files
    include: ['tests/**/*.test.ts'],

    // Exclude node_modules and dist
    exclude: ['node_modules', 'dist', 'pkg'],

    // Enable globals (describe, it, expect)
    globals: true,

    // TypeScript support
    typecheck: {
      enabled: false, // Skip type checking in tests for speed
    },

    // Coverage settings
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/generated/**', 'src/**/*.d.ts'],
    },

    // Timeout for async tests
    testTimeout: 10000,

    // Reporter
    reporters: ['verbose', ['junit', { outputFile: 'test-results.xml' }]],
  },
});
