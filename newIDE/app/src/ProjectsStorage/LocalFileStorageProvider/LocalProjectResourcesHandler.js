// @flow

import {
  applyResourceDefaults,
  getLocalResourceFullPath,
  getResourceFilePathStatus,
} from '../../ResourcesList/ResourceUtils';
import { mapVector } from '../../Utils/MapFor';
import newNameGenerator from '../../Utils/NewNameGenerator';
import optionalLazyRequire from '../../Utils/OptionalLazyRequire';
import optionalRequire from '../../Utils/OptionalRequire';

const gd: libGDevelop = global.gd;

const lazyRequireGlob = optionalLazyRequire('glob');
const path = optionalRequire('path');

// It's important to use remote and not electron for folder actions,
// otherwise they will be opened in the background.
// See https://github.com/electron/electron/issues/4349#issuecomment-777475765
const remote = optionalRequire('@electron/remote');

export const locateResourceFile = ({
  project,
  resource,
}: {|
  project: gdProject,
  resource: gdResource,
|}) => {
  const resourceFilePath = getLocalResourceFullPath(
    project,
    resource.getName()
  );

  remote.shell.showItemInFolder(path.resolve(resourceFilePath));
};

export const openResourceFile = ({
  project,
  resource,
}: {|
  project: gdProject,
  resource: gdResource,
|}) => {
  const resourceFilePath = getLocalResourceFullPath(
    project,
    resource.getName()
  );
  remote.shell.openPath(path.resolve(resourceFilePath));
};

export const copyResourceFilePath = ({
  project,
  resource,
}: {|
  project: gdProject,
  resource: gdResource,
|}) => {
  const resourceFilePath = getLocalResourceFullPath(
    project,
    resource.getName()
  );
  remote.clipboard.writeText(path.resolve(resourceFilePath));
};

export const scanForNewResources = async ({
  project,
  extensions,
  createResource,
}: {|
  project: gdProject,
  extensions: Array<string>,
  createResource: () => gdResource,
|}) => {
  const glob = lazyRequireGlob();
  if (!glob) return;

  const resourcesManager = project.getResourcesManager();
  const projectPath = path.dirname(project.getProjectFile());

  const allExtensions = [
    ...extensions,
    ...extensions.map(extension => extension.toUpperCase()),
  ];

  try {
    const allFiles = await new Promise((resolve, reject) => {
      glob(
        projectPath + '/**/*.{' + allExtensions.join(',') + '}',
        (error, files) => {
          if (error) reject(error);
          else resolve(files);
        }
      );
    });

    const filesToCheck = new gd.VectorString();
    allFiles.forEach(filePath =>
      filesToCheck.push_back(path.relative(projectPath, filePath))
    );
    const filePathsNotInResources = project
      .getResourcesManager()
      .findFilesNotInResources(filesToCheck);
    filesToCheck.delete();

    mapVector(filePathsNotInResources, (relativeFilePath: string) => {
      const resourceName = newNameGenerator(relativeFilePath, name =>
        resourcesManager.hasResource(name)
      );

      const resource = createResource();
      resource.setFile(relativeFilePath);
      resource.setName(resourceName);
      applyResourceDefaults(project, resource);
      resourcesManager.addResource(resource);
      resource.delete();

      console.info(
        `"${relativeFilePath}" added to project as resource named "${resourceName}".`
      );
    });
  } catch (error) {
    console.error(`Error finding files inside ${projectPath}:`, error);
    return;
  }
};

export const removeAllResourcesWithInvalidPath = ({
  project,
}: {|
  project: gdProject,
|}) => {
  const resourcesManager = project.getResourcesManager();
  const removedResourceNames = resourcesManager
    .getAllResourceNames()
    .toJSArray()
    .filter(resourceName => {
      return getResourceFilePathStatus(project, resourceName) === 'error';
    });

  removedResourceNames.forEach(resourceName => {
    resourcesManager.removeResource(resourceName);
    console.info('Removed due to invalid path: ' + resourceName);
  });
};
