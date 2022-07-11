const {
  compileESModuleTypeDefinitions,
} = require('./lib/build-esm-library-types');
const { getAllInOutFilePaths } = require('./lib/runtime-files-list');

(async () => {
  // Generate the output file paths
  const { allESMInOutFilePaths } = await getAllInOutFilePaths({
    bundledOutPath: __dirname, // Dummy directory name, since we do not care about compilation destination.
  });

  await Promise.all(
    allESMInOutFilePaths.map(({ inPath, namespace }) =>
      compileESModuleTypeDefinitions(inPath, namespace)
    )
  );
})();
