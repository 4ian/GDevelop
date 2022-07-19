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
    const entryPoints = entryPointsForNamespace.get(namespace) || [];
    entryPoints.push(inPath);
    entryPointsForNamespace.set(namespace, entryPoints);
  }

  const namespacesWithEntryPoints = Array.from(
    entryPointsForNamespace.entries()
  );

  await Promise.all(
    namespacesWithEntryPoints.map(([namespace, entryPoints]) =>
      compileESModuleTypeDefinitions(entryPoints, namespace).catch((e) =>
        console.error('Error while creating type definitions! ', e)
      )
    )
  );
})();
