/**
 * Launch this script to open and save, without changes, all the example files.
 *
 * This is useful to "upgrade" examples when a new field is added in the serialization
 * of some extension/behavior/class in the Core or in extensions.
 *
 * This also ensures UUID (for instances on the scene) are generated
 * (and so won't change when examples are updated for the web-app).
 *
 * This should be a no-op if examples are not changed.
 */
const initializeGDevelopJs = require('../public/libGD.js');
const {
  readProjectFile,
  loadSerializedProject,
} = require('./lib/LocalProjectOpener');
const { writeProjectJSONFile } = require('./lib/LocalProjectWriter');
const makeExtensionsLoader = require('./lib/LocalJsExtensionsLoader');
const { getExampleNames } = require('./lib/ExamplesLoader');
const fs = require('fs').promises;
const shell = require('shelljs');

initializeGDevelopJs().then(async gd => {
  const noopTranslationFunction = str => str;

  const loadingResults = await makeExtensionsLoader({
    gd,
    filterExamples: false,
  }).loadAllExtensions(noopTranslationFunction);

  console.info('Loaded extensions', loadingResults);

  const exampleNames = await getExampleNames();
  const exampleErrors = {};
  await Promise.all(
    exampleNames.map(async exampleName => {
      try {
        const exampleFilePath = `../resources/examples/${exampleName}/${exampleName}.json`;
        const projectObject = await readProjectFile(
          exampleFilePath
        );
        console.log(`Example "${exampleName}" loaded.`);
        const project = loadSerializedProject(gd, projectObject);

        await writeProjectJSONFile(
          gd,
          project,
          exampleFilePath
        );

        console.log(`Update of "${exampleName}" done.`);
      } catch (error) {
        console.error(`❌ Error caught for ${exampleName}:`, error);
        exampleErrors[exampleName] = error;
      }
    })
  );

  const erroredExampleNames = Object.keys(exampleErrors);
  if (erroredExampleNames.length) {
    console.error(
      `❌ Examples updated, but some examples had errors:`,
      exampleErrors
    );
    shell.exit(1);
  }
  console.error(`✅ Done.`);
});
