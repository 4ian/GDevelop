/**
 * Launch this script to re-generate all the web-app examples (stored in src/fixtures)
 * from the examples in resources/examples. All resource paths are updated to be URLs,
 * using the same base URL (specified below in the script).
 */
const gd = require('../public/libGD.js')();
const fs = require('fs');

// The base URL where all resources of web-app examples are stored.
const baseUrl = 'https://df5lqcdudryde.cloudfront.net/examples';

// This is the list of available examples in resources/examples folder.
// To add a new example, add it first in resources/examples, saving it using the desktop Electron version
// of GDevelop, then add it in this list and launch the script to have the web-app version
// of the example generated. Finally, add it in BrowserExamples.js, BrowserProjectOpener.js
// and upload the example resources online.
const exampleNames = [
  'asteroids',
  'brakeout',
  'change-position-of-object',
  'change-scale-of-sprites',
  'change-sprite-animation',
  'create-object-with-mouseclick',
  'drag-camera-with-mouse',
  'infinite-scrolling-background',
  'instance-timer',
  'inventory-system',
  'keyboard-practice',
  'manipulate-text-object',
  'move-camera-to-position',
  'move-object-toward-position',
  'move-object-with-physics',
  'parallax',
  'parallax-scrolling',
  'parse-json-from-api',
  'particles-explosions',
  'particles-various-effects',
  'pathfinding',
  'pathfinding-basics',
  'physics',
  'platformer',
  'play-stop-sprite-animation',
  'random-color-picker',
  'rotate-toward-mouse',
  'rotate-toward-position',
  'rotate-with-keypress',
  'save-load',
  'shoot-bullets',
  'space-shooter',
  'splash-screen',
  'toggle-music-play-sound',
  'type-on-text-effect',
  'z-depth',
  'zombie-laser',
];

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

const serializeToJSObject = (serializable, methodName = 'serializeTo') => {
  const serializedElement = new gd.SerializerElement();
  serializable[methodName](serializedElement);
  const object = JSON.parse(gd.Serializer.toJSON(serializedElement));
  serializedElement.delete();

  return object;
};

const writeProjectJSONFile = (project, filepath) => {
  return new Promise((resolve, reject) => {
    if (!fs) return reject('Not supported');

    try {
      const content = JSON.stringify(serializeToJSObject(project), null, 2);
      fs.writeFile(filepath, content, err => {
        if (err) return reject(err);

        resolve();
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const loadSerializedProject = projectObject => {
  const serializedProject = gd.Serializer.fromJSObject(projectObject);
  const newProject = gd.ProjectHelper.createNewGDJSProject();
  newProject.unserializeFrom(serializedProject);

  return newProject;
};

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

Promise.all(
  exampleNames.map(exampleName => {
    return readProjectJSONFile(
      `../resources/examples/${exampleName}/${exampleName}.json`
    )
      .then(projectObject => {
        console.log(`Example "${exampleName}" loaded.`);
        const project = loadSerializedProject(projectObject);
        updateResources(project, baseUrl + '/' + exampleName);
        fs.mkdir(`../src/fixtures/${exampleName}`, () => {
          writeProjectJSONFile(
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
);
