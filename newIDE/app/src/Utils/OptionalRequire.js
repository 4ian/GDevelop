// Note: this file don't use export/imports to allow its usage from Node.js
const nodeRequire = require('node-require-function')(); //TODO

/**
 * Allow to require a Node.js/npm module without having it bundled by webpack.
 * This means that this module will only be available when running on Electron or Node.js.
 * When running without Electron or Node.js, `null` will be returned.
 *
 * Note: **in most cases**, prefer `optionalLazyRequire` to avoid loading too many modules
 * at the app startup. Only use optionalRequire for "well-known" Node.js modules (fs, path...)
 *
 * @param {string} moduleName The name of the module. For example: `fs`.
 */
const optionalRequire = (
  moduleName,
  config = {
    rethrowException: false,
  }
) => {
  try {
    if (global.require) {
      // Electron will expose require on global object. Use it, with an
      // expression to avoid webpack to try to bundle the call to require.
      return global['require'](moduleName);
    } else if (nodeRequire) {
      //Node.js
      // nodeRequire is Node.js' require function that is properly extracted
      // by node-require-function when running on Node.js
      return nodeRequire(moduleName);
    }

    // We don't have Electron require nor Node.js require (we must be in a browser)
    return null;
  } catch (ex) {
    if (config.rethrowException) throw ex;

    return null;
  }
};

module.exports = optionalRequire;
