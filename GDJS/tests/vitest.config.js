import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chrome',
      headless: true,
    },
    setupFiles: [
      './vitest.setup.js',
      './tests-utils/init.js',
      './tests-utils/init.pixiruntimegamewithassets.js',
      './tests-utils/init.pixiruntimegame.js',
      './tests-utils/MockedCustomObject.js',
    ],
    include: ['tests/**/*.js', 'benchmarks/**/*.js', '../Extensions/**/tests/**/*.js'],
  },
});
