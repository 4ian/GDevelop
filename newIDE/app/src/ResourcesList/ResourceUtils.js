// @flow
import ResourcesLoader from '../ResourcesLoader';
import optionalRequire from '../Utils/OptionalRequire';
import newNameGenerator from '../Utils/NewNameGenerator';
import { toNewGdMapStringString } from '../Utils/MapStringString';
const fs = optionalRequire('fs');
const path = optionalRequire('path');
const gd: libGDevelop = global.gd;

export const createOrUpdateResource = (
  project: gdProject,
  newlyCreatedResource: gdResource,
  resourceName: string
) => {
  const resourcesManager = project.getResourcesManager();
  if (resourcesManager.hasResource(resourceName)) {
    resourcesManager.removeResource(resourceName);
  }
  newlyCreatedResource.setFile(resourceName);
  newlyCreatedResource.setName(resourceName);
  applyResourceDefaults(project, newlyCreatedResource);

  // Important, we are responsible for deleting the resources that was given to us.
  // Otherwise we have a memory leak.
  resourcesManager.addResource(newlyCreatedResource);

  newlyCreatedResource.delete();
};

/**
 * Get the local path of a resource. This works by asking the ResourcesLoader
 * for the resource URL, then stripping anything that is specific to a URL.
 */
export const getLocalResourceFullPath = (
  project: gdProject,
  resourceName: string
) => {
  let resourcePath = ResourcesLoader.getResourceFullUrl(
    project,
    resourceName,
    {}
  ).substring(7 /* Remove "file://" from the URL to get a local path */);

  if (resourcePath.indexOf('?cache=') !== -1) {
    // Remove, if needed, the cache bursting argument from the URL.
    resourcePath = resourcePath.substring(
      0,
      resourcePath.lastIndexOf('?cache=')
    );
  }
  return resourcePath;
};

export const isPathInProjectFolder = (
  project: gdProject,
  resourcePath: string
) => {
  const projectPath = path.dirname(project.getProjectFile());
  return resourcePath.includes(projectPath);
};

export const copyAllToProjectFolder = (
  project: gdProject,
  resourcePaths: Array<string>
): Promise<Array<string>> => {
  if (!fs || !path) {
    return Promise.resolve(resourcePaths);
  }

  const projectPath = path.dirname(project.getProjectFile());

  return Promise.all(
    resourcePaths.map(resourcePath => {
      if (isPathInProjectFolder(project, resourcePath)) {
        return resourcePath;
      }

      const resourceBasename = path.basename(resourcePath),
        fileExtension = path.extname(resourceBasename),
        fileNameWithoutExtension = path.basename(
          resourceBasename,
          fileExtension
        );

      const newFileNameWithoutExtension = newNameGenerator(
        fileNameWithoutExtension,
        tentativeFileName => {
          const tentativePath =
            path.join(projectPath, tentativeFileName) + fileExtension;
          return fs.existsSync(tentativePath);
        }
      );

      const resourceNewPath = path.join(
        projectPath,
        newFileNameWithoutExtension + fileExtension
      );

      return new Promise(resolve => {
        fs.copyFile(resourcePath, resourceNewPath, err => {
          if (err) {
            return resolve(resourcePath);
          }

          return resolve(resourceNewPath);
        });
      });
    })
  );
};

export const getResourceFilePathStatus = (
  project: gdProject,
  resourceName: string
) => {
  if (!fs) return '';
  const resourcePath = path.normalize(
    getLocalResourceFullPath(project, resourceName)
  );

  // The resource path doesn't exist
  if (!fs.existsSync(resourcePath)) return 'error';

  // The resource path is outside of the project folder
  if (!isPathInProjectFolder(project, resourcePath)) return 'warning';

  // The resource path seems ok
  return '';
};

export const applyResourceDefaults = (
  project: gdProject,
  newResource: gdResource
) => {
  if (newResource instanceof gd.ImageResource) {
    newResource.setSmooth(project.getScaleMode() !== 'nearest');
  }
};

/**
 * Refactor an entire project to rename a resource
 * @param project The project
 * @param resourceNewNames The map from old resource name to new resource name.
 */
export const renameResourcesInProject = (
  project: gdProject,
  resourceNewNames: { [string]: string }
) => {
  const renamedResourcesMap = toNewGdMapStringString(resourceNewNames);
  const resourcesRenamer = new gd.ResourcesRenamer(renamedResourcesMap);
  renamedResourcesMap.delete();
  project.exposeResources(resourcesRenamer);
  resourcesRenamer.delete();
};

export const isFetchableUrl = (url: string) => {
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('ftp://')
  );
};

export const isURL = (filename: string) => {
  return (
    filename.startsWith('http://') ||
    filename.startsWith('https://') ||
    filename.startsWith('ftp://') ||
    filename.startsWith('blob:') ||
    filename.startsWith('data:')
  );
};

export const isBlobURL = (filename: string) => {
  return filename.startsWith('blob:');
};
