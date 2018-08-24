// Note: this file don't use export/imports to allow its usage from Node.js

/**
 * Allow to require a Node.js/npm module without having it bundled by webpack.
 * This means that this module will only be available when running on Electron or Node.js.
 * When running without Electron or Node.js, `null` will be returned.
 *
 * @param {string} moduleName The name of the module. For example: `fs`.
 */
const optionalRequire = (moduleName, config = {
  rethrowException: false,
}) => {
  try {
    // Avoid webpack trying to inject the module by using an expression
    // and global to get the require function.
    if (global.require) { // Electron/webpack
      return global['require'](moduleName);
    } else if (typeof require !== 'undefined') { //Node.js/CommonJS
      const nodeRequire = require;
      return nodeRequire(moduleName);
    }

    return null;
  } catch (ex) {
    if (config.rethrowException) throw ex;
    return null;
  }
}

module.exports = optionalRequire;