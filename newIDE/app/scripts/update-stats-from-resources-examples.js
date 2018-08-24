/**
 * Launch this script to re-generate all the web-app examples (stored in src/fixtures)
 * from the examples in resources/examples. All resource paths are updated to be URLs,
 * using the same base URL (specified below in the script).
 */
const gd = require('../public/libGD.js')();
const { mapFor } = require('./lib/MapFor');
const makeExtensionsLoader = require('./lib/LocalJsExtensionsLoader');
const { getExampleNames } = require('./lib/ExamplesLoader');
const {
  readProjectJSONFile,
  loadSerializedProject,
} = require('./lib/LocalProjectOpener');
const fs = require('fs');
const _ = require('lodash');
var shell = require('shelljs');

shell.exec('node import-GDJS-Runtime.js');
gd.initializePlatforms();

const getObjectTypes = projectOrLayout => {
  return _.uniq(
    mapFor(0, projectOrLayout.getObjectsCount(), i =>
      projectOrLayout.getObjectAt(i).getType()
    )
  );
};

const getEventsAndInstructionsTypes = (project, events) => {
  const eventsTypesLister = new gd.EventsTypesLister(project);
  eventsTypesLister.launch(events);
  const types = {
    events: _.uniq(eventsTypesLister.getAllEventsTypes().toJSArray()),
    conditions: _.uniq(eventsTypesLister.getAllConditionsTypes().toJSArray()),
    actions: _.uniq(eventsTypesLister.getAllActionsTypes().toJSArray()),
  };
  eventsTypesLister.delete();
  return types;
};

const computeUsedExtensions = project => {
  const layoutExtensions = mapFor(0, project.getLayoutsCount(), i => {
    const layout = project.getLayoutAt(i);
    const extensionsFromObjects = getObjectTypes(layout).map(objectType => {
      return gd.MetadataProvider
        .getExtensionAndObjectMetadata(project.getCurrentPlatform(), objectType)
        .getExtension();
    });
    const events = layout.getEvents();
    const eventsAndInstructionsTypes = getEventsAndInstructionsTypes(
      project,
      events
    );
    const extensionsFromConditions = eventsAndInstructionsTypes.conditions.map(
      conditionType => {
        return gd.MetadataProvider
          .getExtensionAndConditionMetadata(
            project.getCurrentPlatform(),
            conditionType
          )
          .getExtension();
      }
    );
    const extensionsFromActions = eventsAndInstructionsTypes.actions.map(
      actionType => {
        return gd.MetadataProvider
          .getExtensionAndActionMetadata(
            project.getCurrentPlatform(),
            actionType
          )
          .getExtension();
      }
    );

    return _.uniq([
      ...extensionsFromObjects,
      ...extensionsFromConditions,
      ...extensionsFromActions,
    ]);
  });

  return _.uniq(_.flatMap(layoutExtensions));
};

const writeFile = object => {
  return new Promise((resolve, reject) => {
    fs.writeFile('test.json', JSON.stringify(object, null, 2), err => {
      if (err) return reject(err);

      resolve();
    });
  });
};

const examplesExtensionsUsed = {};
const extensionsLoader = makeExtensionsLoader({ gd, filterExamples: false });
extensionsLoader
  .loadAllExtensions()
  .then(loadingResults => {
    console.info('Loaded extensions', loadingResults);

    return getExampleNames();
  })
  .then(
    exampleNames => {
      return Promise.all(
        exampleNames.map(exampleName => {
          return readProjectJSONFile(
            `../resources/examples/${exampleName}/${exampleName}.json`
          )
            .then(projectObject => {
              console.log(`Example "${exampleName}" loaded.`);
              const project = loadSerializedProject(gd, projectObject);
              const usedExtensions = computeUsedExtensions(project);
              examplesExtensionsUsed[
                exampleName
              ] = usedExtensions.map(extension => ({
                fullName: extension.getFullName(),
                name: extension.getName(),
              }));
            })
            .catch(error => {
              console.error('Error caught:', error);
            });
        })
      );
    },
    err => console.error('Error while loading extensions', err)
  )
  .then(() => {
    return writeFile(examplesExtensionsUsed);
  })
  .then(
    () => console.info('Done.'),
    err => console.error('Error while writing output', err)
  );
