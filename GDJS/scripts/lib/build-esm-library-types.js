const ts = require('typescript');
const path = require('path');
const { writeFile } = require('fs/promises');
const { readFileSync } = require('fs');

/** @param {string[]} str */
const relativePath = (...str) => path.relative(...str).replace(/\\/g, '/');

const gdevelopRootPath = path.join(__dirname, '..', '..', '..');
const gdevelopTypesDirectory = path.join(
  gdevelopRootPath,
  'GDJS',
  'Runtime',
  'types',
  'auto-generated'
);

/**
 * Generates a bundled dts for a module using the TypeScript programmatic API.
 * @param {string} pathToModule The path to the module to generate a dts from.
 * @returns {Promise<[string, string]>} The DTS file contents as plain text.
 */
const generateDTS = (pathToModule) => {
  const mainModuleDirectoryName = path.dirname(pathToModule);
  const modulePrefix = path.basename(pathToModule, '.ts');
  const expectedMainModuleOutputName = pathToModule
    .replace('.ts', '.d.ts')
    .replace(/\\/g, '/');

  /**
   * @param {string} dts
   * @param {string} relativePath
   */
  const rewriteImports = (dts, dtsPath) => {
    let rewrittenDTS = dts;

    for (const match of dts.matchAll(
      /((export|import) .*) from ["'](\.?\.\/.*)["']/gm
    ))
      rewrittenDTS = rewrittenDTS.replace(
        match[0],
        `${match[1]} from '${modulePrefix}/${relativePath(
          mainModuleDirectoryName,
          `${mainModuleDirectoryName}/${dtsPath}/${match[3]}`
        )}'`
      );

    return rewrittenDTS;
  };

  let mainDTS = '';
  let bundledSubModules = '';

  const program = ts.createProgram([pathToModule], {
    declaration: true,
    emitDeclarationOnly: true,
    typeRoots: [
      gdevelopTypesDirectory,
      path.join(gdevelopRootPath, 'GDJS', 'node_modules', '@types'),
    ],
  });
  const { diagnostics } = program.emit(
    undefined,
    (fileName, dts) => {
      if (fileName !== expectedMainModuleOutputName) {
        const moduleName = path
          .relative(mainModuleDirectoryName, fileName)
          .replace(/\\/g, '/')
          .replace('.d.ts', '');
        const modulePath = path.dirname(moduleName);
        const moduleFinalDTS = rewriteImports(dts, modulePath).replace(
          /declare /gm,
          ''
        );
        bundledSubModules += `declare module "${modulePrefix}/${moduleName}" {${moduleFinalDTS}};\n\n`;
      } else {
        // This is the root module, we do not declare a module for it and just export it as the namespace.
        mainDTS = rewriteImports(dts, './');
      }
    },
    undefined,
    true
  );

  if (diagnostics.length)
    console.error(
      ts.formatDiagnostics(
        ts.getPreEmitDiagnostics(program).concat(diagnostics),
        {
          getCanonicalFileName: (p) => path.join(mainModuleDirectoryName, p),
          getCurrentDirectory: () => gdevelopRootPath,
          getNewLine: () => ts.sys.newLine,
        }
      )
    );

  return [mainDTS, bundledSubModules];
};

module.exports = {
  /**
   * Generates types definitions for usage of bundled ES Modules in namespaced TypeScript.
   * @param {string} entryPoints The path relative to the root GDevelop folder to the module entry point.
   * @param {string} namespaceName The namespace in which to expose the module.
   * @returns {Promise<void>}
   */
  compileESModuleTypeDefinitions: async (entryPoints, namespaceName) => {
    const [fullDTS, fullBundledSubModules] = entryPoints.reduce(
      ([accumulatedDTS, accumulatedBundledModules], modulePath) => {
        const [dts, bundledSubModules] = generateDTS(modulePath);
        const finalDTS = dts.replace(
          /\/\*\* TYPES_REPLACE \*\/\r?\n([^]*)\/\*\* WITH\r?\n([^]*)\r?\n\*\//gm,
          '$2'
        );

        return [
          accumulatedDTS + finalDTS,
          accumulatedBundledModules + bundledSubModules,
        ];
      },
      ['', '']
    );

    if (fullBundledSubModules)
      await writeFile(
        path.join(gdevelopTypesDirectory, `${namespaceName}-modules.d.ts`),
        `// Autogenereted types, see GDJS/scripts/lib/build-esm-library-types.js to modify those.\n${fullBundledSubModules}`
      );

    return writeFile(
      path.join(gdevelopTypesDirectory, `${namespaceName}-types.d.ts`),
      `// Autogenereted types, see GDJS/scripts/lib/build-esm-library-types.js to modify those.

${fullDTS}

export as namespace ${namespaceName}
`
    );
  },
};
