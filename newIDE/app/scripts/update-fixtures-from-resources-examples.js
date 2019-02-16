/**
 * Launch this script to re-generate all the web-app examples (stored in src/fixtures)
 * from the examples in resources/examples. All resource paths are updated to be URLs,
 * using the same base URL (specified below in the script).
 */
const gd = require('../public/libGD.js')();
const {
  readProjectJSONFile,
  loadSerializedProject,
} = require('./lib/LocalProjectOpener');
const { writeProjectJSONFile } = require('./lib/LocalProjectWriter');
const makeExtensionsLoader = require('./lib/LocalJsExtensionsLoader');
const { getExampleNames } = require('./lib/ExamplesLoader');
const fs = require('fs');

// The base URL where all resources of web-app examples are stored.
const baseUrl = 'https://df5lqcdudryde.cloudfront.net/examples';

const updateResources = (project, baseUrl) => {
  const worker = new gd.ArbitraryResourceWorkerJS();
  worker.exposeImage = file => {
    // Don't do anything
    return file;
  };
  worker.exposeShader = shader => {
    // Don't do anything
    return shader;
  };
  worker.exposeFile = file => {
    if (file.length === 0) return '';

    console.log('Updating resource: ', file);
    return baseUrl + '/' + file;
  };

  project.exposeResources(worker);
};

const noopTranslationFunction = str => str;
const extensionsLoader = makeExtensionsLoader({ gd, filterExamples: false });
extensionsLoader
  .loadAllExtensions(noopTranslationFunction)
  .then(loadingResults => {
    console.info('Loaded extensions', loadingResults);

    return getExampleNames();
  })
  .then(exampleNames =>
    Promise.all(
      exampleNames.map(exampleName => {
        return readProjectJSONFile(
          `../resources/examples/${exampleName}/${exampleName}.json`
        )
          .then(projectObject => {
            console.log(`Example "${exampleName}" loaded.`);
            const project = loadSerializedProject(gd, projectObject);
            updateResources(project, baseUrl + '/' + exampleName);
            fs.mkdir(`../src/fixtures/${exampleName}`, () => {
              writeProjectJSONFile(
                gd,
                project,
                `../src/fixtures/${exampleName}/${exampleName}.json`
              );
              console.log(`Update of "${exampleName}" done.`);
            });
          })
          .catch(error => {
            console.error('Error caught:', error);
          });
      })
    )
  );
