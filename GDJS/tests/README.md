These are the tests for the GDevelop JavaScript game engine.

## Launching tests

Make sure you have [Node.js](https://nodejs.org/) installed. Update dependencies:

```bash
cd GDJS/tests
npm install
```

Then launch tests:

```bash
npm run test:watch          # Runs tests in a headless browser using Vitest
npm run test-benchmark:watch # This will also run benchmarks
```

> ⚠️ If you're working on GDJS or extensions, make sure to have the development version of GDevelop running so that changes in GDJS or extension files are rebuilt (or run `npm run build` in `GDJS/`, but better run GDevelop so that any changes are watched).

## About the tests

### Unit tests

Tests are launched using [Vitest](https://vitest.dev/) in a headless browser. You can change the browser by editing the `vitest.config.js` file.

Tests are located in the **tests** folder for the game engine, or directly in the folder of the tested extensions.

### Games in the _games_ folder

Games contained in the _games_ folder are mainly here to be launched manually to check that a particular feature is working. Read the comments in the events to see what is the expected behavior, or compare with the native platform if you can.
