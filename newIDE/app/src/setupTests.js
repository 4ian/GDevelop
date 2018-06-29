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
global.gd = require('libGD.js-for-tests-only')();
