import { defineConfig } from 'vitest/config';

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
      './tests-utils/init.js',
      './benchmarks/init.js'
    ],
    include: [
      './benchmarks/**/*.js',
      '../Extensions/**/benchmark/**/*.benchmark.js'
    ],
    exclude: [
      './games/**',
      'node_modules/**'
    ],
    timeout: 400000,
    testTimeout: 400000,
    hookTimeout: 400000,
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
      'expect.js': new URL('./node_modules/expect.js/index.js', import.meta.url).pathname,
    }
  },
  server: {
    fs: {
      allow: ['../..']  // Allow access to parent directories for GDJS files and Extensions
    }
  }
});