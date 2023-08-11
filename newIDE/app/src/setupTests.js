/**
 * Set up the environment for tests.
 */

// * In the browser or in Electron, libGD.js is included as a separate file
// and imported using a <script> tag in index.html, so it's not part of the
// webpack build. It's made available as a global variable called gd.
// * To use it for tests, we need to require it, but without letting it being
// processed by Babel (it's a Emscripten generated file, so it's super heavy
// and will crash v8/node). Instead, we copied it to a node_modules directory
// so we can require it without having the Babel processing.
// * We use a convoluted name to avoid it being imported by mistake in the
// rest of the codebase. See scripts/import-libGD.js
const initializeGDevelopJs = require('libGD.js-for-tests-only');

// We create the global "gd" object **synchronously** here. This is done as
// the source files are using `global.gd` as a "top level" object (after imports).
// This is a side effect, so this file must be imported before any test.
// See also GDevelopJsInitializerDecorator.js for Storybook.
global.gd = {
  I_AM_NOT_YET_INITIALIZED_YOU_MUST_USE_GD_INSIDE_A_TEST_ONLY: true,
};

beforeAll(done => {
  initializeGDevelopJs().then(module => {
    // We're **updating** the global "gd" object here. This is done so that
    // the source files that are using `global.gd` have the proper reference to the
    // object.
    delete global.gd
      .I_AM_NOT_YET_INITIALIZED_YOU_MUST_USE_GD_INSIDE_A_TEST_ONLY;
    for (var key in module) {
      global.gd[key] = module[key];
    }
    done();
  });
});

// We increase the timeout for CIs (the default 5s can be too low sometimes, as a real browser is involved).
jest.setTimeout(10000);
