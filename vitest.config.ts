import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts', 'main.ts'],
      exclude: ['node_modules', 'tests'],
      all: true,
      thresholds: {
        lines: 55,
        functions: 75,
        branches: 90,
        statements: 55,
      },
    },
    alias: {
      obsidian: './tests/__mocks__/obsidian.ts',
    },
  },
});
