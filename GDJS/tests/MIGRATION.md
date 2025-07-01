# Migration from Karma to Vitest

This document describes the migration from Karma to Vitest browser testing for GDJS tests.

## Changes Made

### 1. Updated package.json
- Replaced Karma-related dependencies with Vitest and Playwright
- Updated test scripts to use Vitest commands
- Removed mocha dependency (Vitest has its own test runner)

### 2. New Configuration Files
- `vitest.config.js` - Main Vitest configuration for regular tests
- `vitest.benchmark.config.js` - Vitest configuration for benchmark tests
- `index.html` - HTML file that loads all GDJS engine files in correct order
- `vitest-setup.js` - Setup file for globals and compatibility layers

### 3. Removed Files
- `karma.conf.js` - Old Karma configuration (no longer needed)

### 4. Test Compatibility
- Tests continue to use `expect.js` assertion library for compatibility
- Mocha-style `describe()`, `it()`, `beforeEach()` functions are available
- Simple Sinon polyfill added for basic mocking functionality

## Running Tests

### Regular Tests
```bash
npm test                    # Run all tests (headless Chrome)
npm run test:watch         # Run tests in watch mode
npm run test:firefox       # Run tests in Firefox
npm run test:chrome        # Run tests in Chrome (visible browser)
```

### Benchmarks
```bash
npm run test-benchmark              # Run benchmarks (headless)
npm run test-benchmark:watch       # Run benchmarks in watch mode
```

## Key Differences from Karma

1. **File Loading**: Instead of Karma's file loading configuration, we use an `index.html` file to load all GDJS engine scripts in order.

2. **Browser Support**: Vitest browser mode uses Playwright, providing better browser automation and debugging capabilities.

3. **Configuration**: Vitest configuration is more declarative and easier to understand than Karma's plugin-based approach.

4. **Performance**: Vitest generally provides faster test execution and better watch mode performance.

## Migration Notes

- All existing test files should work without modification
- The test structure (`describe`, `it`, `expect`) remains the same
- GDJS engine loading order is preserved through the index.html file
- Assets and utilities are still accessible in the same way