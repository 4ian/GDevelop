//@ts-check
const {
  compileESModuleTypeDefinitions,
} = require('./lib/build-esm-library-types');
const { getAllInOutFilePaths } = require('./lib/runtime-files-list');

(async () => {
  // Generate the output file paths
  const { allESMInOutFilePaths } = await getAllInOutFilePaths({
    bundledOutPath: __dirname, // Dummy directory name, since we do not care about compilation destination.
  });

  const entryPointsForNamespace = new Map();
  for (const { inPath, namespace } of allESMInOutFilePaths) {
    let entryPoints = entryPointsForNamespace.get(namespace);
    if (!entryPoints) {
      entryPoints = [];
      entryPointsForNamespace.set(namespace, entryPoints);
    }
    entryPoints.push(inPath);
  }

  for (const [namespace, entryPoints] of entryPointsForNamespace.entries())
    compileESModuleTypeDefinitions(entryPoints, namespace).catch((e) =>
      console.error('Error while creating type definitions! ', e)
    );
})();
