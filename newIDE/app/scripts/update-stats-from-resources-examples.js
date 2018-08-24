/**
 * Launch this script to re-generate all the web-app examples (stored in src/fixtures)
 * from the examples in resources/examples. All resource paths are updated to be URLs,
 * using the same base URL (specified below in the script).
 */
const gd = require('../public/libGD.js')();
const fs = require('fs');
const {mapFor} = require('./lib/mapFor');
const _ = require('lodash');
gd.initializePlatforms();

// This is the list of available examples in resources/examples folder.
// To add a new example, add it first in resources/examples, saving it using the desktop Electron version
// of GDevelop, then add it in this list and launch the script to have the web-app version
// of the example generated. Finally, add it in BrowserExamples.js, BrowserProjectOpener.js
// and upload the example resources online.
// TODO: Read from resources/examples folder and factor
const exampleNames = [
  'advanced-shape-based-painter',
  'animation-speed-scale',
  'asteroids',
  'basic-ai-with-pathfinding',
  'basic-artificial-intelligence',
  'basic-topdown-car-driving',
  'bomb-the-crate',
  'brakeout',
  'buttons',
  'car-physics',
  'center-object-within-another',
  'change-position-of-object',
  'change-scale-of-sprites',
  'change-sprite-animation',
  'change-sprite-color',
  'character-selection',
  'controller-input',
  'create-object-with-mouseclick',
  'custom-font',
  'customize-keys-with-lastpressedkey',
  'device-orientation-ballgame',
  'device-orientation-compass',
  'drag-camera-with-mouse',
  'drop-collect-items-from-storage',
  'exit-app',
  'find-diagonals',
  'health-bar',
  'infinite-scrolling-background',
  'instance-timer',
  'inventory-system',
  'isometric-game',
  'javascript-blocks-in-platformer',
  'keyboard-practice',
  'load-image-from-url',
  'magnet',
  'manipulate-text-object',
  'move-camera-to-position',
  'move-object-in-circle',
  'move-object-toward-position',
  'move-object-with-physics',
  'multitouch',
  'object-gravity',
  'object-selection',
  'open-url-in-browser',
  'parallax-scrolling',
  'parallax',
  'parse-json-from-api',
  'parse-json-string',
  'particles-explosions',
  'particles-various-effects',
  'pathfinding-basics',
  'pathfinding',
  'physics',
  'pin-object-to-another-multiple-parents',
  'pin-object-to-another',
  'platformer-double-jump',
  'platformer',
  'play-music-on-mobile',
  'play-stop-sprite-animation',
  'racing-game',
  'rain',
  'random-color-picker',
  'rotate-toward-mouse',
  'rotate-toward-position',
  'rotate-with-keypress',
  'save-load',
  'shoot-bullet-in-parabola',
  'shoot-bullets',
  'shooting-bullets-explanation',
  'snap-object-to-grid',
  'space-shooter',
  'splash-screen',
  'sprite-fade-in-out',
  'text-entry-object',
  'text-fade-in-out',
  'text-to-speech',
  'toggle-music-play-sound',
  'type-on-text-effect',
  'z-depth',
  'zombie-laser',
];

//TODO: Factor
const readProjectJSONFile = filepath => {
  return new Promise((resolve, reject) => {
    if (!fs) return reject('Not supported');

    fs.readFile(filepath, { encoding: 'utf8' }, (err, data) => {
      if (err) return reject(err);

      try {
        const dataObject = JSON.parse(data);
        return resolve(dataObject);
      } catch (ex) {
        return reject('Malformed file');
      }
    });
  });
};

const loadSerializedProject = projectObject => {
  const serializedProject = gd.Serializer.fromJSObject(projectObject);
  const newProject = gd.ProjectHelper.createNewGDJSProject();
  newProject.unserializeFrom(serializedProject);

  return newProject;
};

const getObjectTypes = (projectOrLayout) => {
  const types = [];
  for(let i = 0;i < projectOrLayout.getObjectsCount();++i) {
    const object = projectOrLayout.getObjectAt(i);
    types.push(object.getType());
  }

  return _.uniq(types);
}

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
}

const computeUsedExtensions = (project) => {
  const layoutExtensions = mapFor(0, project.getLayoutsCount(), i => {
    const layout = project.getLayoutAt(i);
    const extensionsFromObjects = getObjectTypes(layout).map(objectType => {
      return gd.MetadataProvider.getExtensionAndObjectMetadata(project.getCurrentPlatform(), objectType).getExtension();
    });
    const events = layout.getEvents();
    const eventsAndInstructionsTypes = getEventsAndInstructionsTypes(project, events);
    const extensionsFromConditions = eventsAndInstructionsTypes.conditions.map(conditionType => {
      return gd.MetadataProvider.getExtensionAndConditionMetadata(project.getCurrentPlatform(), conditionType).getExtension();
    });
    const extensionsFromActions = eventsAndInstructionsTypes.actions.map(actionType => {
      return gd.MetadataProvider.getExtensionAndActionMetadata(project.getCurrentPlatform(), actionType).getExtension();
    });

    return _.uniq([...extensionsFromObjects, ...extensionsFromConditions, ...extensionsFromActions]);
  });

  return _.uniq(_.flatMap(layoutExtensions));
};

Promise.all(
  exampleNames.map(exampleName => {
    return readProjectJSONFile(
      `../resources/examples/${exampleName}/${exampleName}.json`
    )
      .then(projectObject => {
        console.log(`Example "${exampleName}" loaded.`);
        const project = loadSerializedProject(projectObject);
        const usedExtensions = computeUsedExtensions(project);
        console.log(usedExtensions.map(extension => ({
          fullName: extension.getFullName(),
          name: extension.getName(),
        })));
      })
      .catch(error => {
        console.error('Error caught:', error);
      });
  })
);
