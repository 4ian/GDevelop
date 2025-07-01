import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      headless: true,
      screenshotFailures: false,
      indexHtmlPath: './index.html',
    },
    globals: true,
    setupFiles: [
      './vitest-setup.js',
      './tests-utils/init.js'
    ],
    include: [
      './tests/**/*.js',
      './tests/**/*.spec.js'
    ],
    exclude: [
      './games/**',
      'node_modules/**',
      'vitest.config.js',
      'vitest.benchmark.config.js',
      'vitest-setup.js'
    ],
    timeout: 10000,
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  esbuild: {
    target: 'es2017'
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Map expect.js to the actual file
      'expect.js': resolve('./node_modules/expect.js/index.js'),
    }
  },
  server: {
    fs: {
      allow: ['../..', '.']  // Allow access to parent directories for GDJS files
    }
  }
});