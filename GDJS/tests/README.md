These are the tests for the GDevelop JavaScript game engine.

## Launching tests

Make sure you have [Node.js](https://nodejs.org/) installed. Update dependencies:

```bash
cd GDJS/tests
npm install
```

Then launch tests:

```bash
npm run test:watch # This will use Chrome Headless
npm run test-benchmark:watch # This will also run benchmarks
npm run test:firefox:watch # To run tests using Firefox
```

> ⚠️ If you're working on GDJS or extensions, make sure to have the development version of GDevelop running so that changes in GDJS or extension files are rebuilt (or run `npm run build` in `GDJS/`, but better run GDevelop so that any changes are watched).

## About the tests

### Unit tests

Tests are launched using Chrome. You need Chrome installed to run them. You can change the browser by modifying the package.json "test" command and install the appropriate karma package.

Tests are located in the **tests** folder for the game engine, or directly in the folder of the tested extensions.

### Benchmarks

Benchmarks are in the **benchmarks** folder: micro benchmarks of the game engine functions, and scene benchmarks (`scenes.js`) running scenes like a game with the gameplay test harness (`harness.benchmark`).

To compare the speed of your changes with the version your branch started from:

```bash
npm run benchmark:compare -- --base-ref=origin/master --grep="Scene benchmarks" # --grep is optional
```

Both versions are built and the benchmarks are run alternately on each one (3 times by default, set with `--rounds`). A change is only reported when larger than 5% and measured between every round of one version and every round of the other, as speed varies between runs of a browser (by up to ~15% on a shared machine). The same comparison runs on pull requests changing the game engine (see `.github/workflows/benchmarks.yml`).

### Games in the _games_ folder

Games contained in the _games_ folder are mainly here to be launched manually to check that a particular feature is working. Read the comments in the events to see what is the expected behavior, or compare with the native platform if you can.
