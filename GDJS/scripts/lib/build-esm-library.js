const { build } = require('esbuild');

module.exports = {
  /**
   * Transpile an ES Modules into a bundle that can be used in namespaced TypeScript.
   * @param {string} modulePath The path relative to the root GDevelop folder to the module entry point.
   * @param {string} outPath The output path name.
   * @param {string} namespaceName The namespace in which to expose the module.
   * @returns {Promise<void>}
   */
  compileESModuleToNamespace: (modulePath, outPath, namespaceName) =>
    build({
      entryPoints: [modulePath],
      outfile: outPath,
      format: 'iife',
      globalName: namespaceName,
      minify: true,
      bundle: true,
      sourcemap: true,
      // Make bundles importable via CommonJS for usage in electron
      footer: { js: `if(typeof module === "object") module.exports = ${namespaceName};` },
    }),
};
