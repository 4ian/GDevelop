/**
 * Allow to require a Node.js/npm module without having it bundled by webpack.
 * This means that this module will only be available when running on Electron.
 * When running without Electron, `null` will be returned.
 *
 * @param {string} moduleName The name of the module. For example: `fs`.
 */
export default function optionalRequire(moduleName, config = {
  rethrowException: false,
}) {
  try {
    // Avoid webpack trying to inject the module by using an expression
    // and global to get the require function.
    return global['require'](moduleName);
  } catch (ex) {
    if (config.rethrowException) throw ex;
    return null;
  }
}
