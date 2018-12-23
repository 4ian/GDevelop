// @flow
import ResourcesLoader from '../ResourcesLoader';
import optionalRequire from '../Utils/OptionalRequire.js';
const electron = optionalRequire('electron');
const dialog = electron ? electron.remote.dialog : null;
const path = optionalRequire('path');
const fs = optionalRequire('fs');

export const createOrUpdateResource = (
  project: gdProject,
  gdResource: gdResource,
  resourceName: string
) => {
  const resourcesManager = project.getResourcesManager();
  if (resourcesManager.hasResource(resourceName)) {
    resourcesManager.removeResource(resourceName);
  }
  gdResource.setFile(resourceName);
  gdResource.setName(resourceName);
  resourcesManager.addResource(gdResource);
  gdResource.delete();
};

export const getLocalResourceFullPath = (
  project: gdProject,
  resourceName: string
) => {
  let resourcePath = ResourcesLoader.getResourceFullUrl(project, resourceName);
  resourcePath = resourcePath.substring(7, resourcePath.lastIndexOf('?cache='));
  return resourcePath;
};

export const resourceHasValidPath = (
  project: gdProject,
  resourceName: string
) => {
  const resourcePath = getLocalResourceFullPath(project, resourceName);
  return fs.existsSync(resourcePath);
};

export const selectLocalResourcePath = (
  project: gdProject,
  options: {
    multiSelections: boolean,
    title: string,
    name: string,
    extensions: Array<string>,
    forEachPath: any,
    callback?: ?() => any,
  }
) => {
  return new Promise((resolve, reject) => {
    if (!dialog) return reject('Not supported');

    const properties = ['openFile'];
    if (options.multiSelections) properties.push('multiSelections');
    const projectPath = path.dirname(project.getProjectFile());

    const browserWindow = electron.remote.getCurrentWindow();
    dialog.showOpenDialog(
      browserWindow,
      {
        title: options.title,
        properties,
        filters: [{ name: options.name, extensions: options.extensions }],
        defaultPath: projectPath,
      },
      paths => {
        if (!paths) return resolve([]);

        const resources = paths.map(resourcePath => {
          return options.forEachPath(resourcePath);
        });

        if (options.callback) {
          options.callback();
        }
        return resolve(resources);
      }
    );
  });
};
