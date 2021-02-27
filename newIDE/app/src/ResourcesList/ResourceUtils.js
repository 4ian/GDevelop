// @flow
import ResourcesLoader from '../ResourcesLoader';
import optionalRequire from '../Utils/OptionalRequire.js';
import newNameGenerator from '../Utils/NewNameGenerator';
const fs = optionalRequire('fs');
const path = optionalRequire('path');
const gd: libGDevelop = global.gd;

export const RESOURCE_EXTENSIONS = {
  image: 'png,jpg,jpeg,PNG,JPG,JPEG',
  audio: 'wav,mp3,ogg,WAV,MP3,OGG',
  font: 'ttf,ttc,otf,TTF,TTC,OTF',
  video: 'mp4,MP4',
};

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

/*
TODO rework ce fichier pour merge getResourceFilePathStatus et getResourceStatus
*/
export const getResourceStatus = (
  project: gdProject,
  resourceName: string
) => {
  const codeStatus = ResourcesLoader.getStatusCode(project, resourceName);

  if (!codeStatus) return;

  return codeStatus.indexOf('ERROR')
    ? 'error'
    : codeStatus.indexOf('WARNING')
    ? 'warning'
    : ''; // The resource path seems ok if no status
};
