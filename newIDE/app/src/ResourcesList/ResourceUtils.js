// @flow
import ResourcesLoader from '../ResourcesLoader';
import optionalRequire from '../Utils/OptionalRequire';
import newNameGenerator from '../Utils/NewNameGenerator';
import { toNewGdMapStringString } from '../Utils/MapStringString';
const fs = optionalRequire('fs');
const path = optionalRequire('path');
const gd: libGDevelop = global.gd;

export const DEFAULT_IMPORTED_RESOURCES_FOLDER = 'assets';

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

export const removeUnusedResources = (
  project: gdProject,
  resourceKind: string
): Array<string> => {
  const removedResourceNames = gd.ProjectResourcesAdder.getAllUseless(
    project,
    resourceKind
  ).toJSArray();
  gd.ProjectResourcesAdder.removeAllUseless(project, resourceKind);
  return removedResourceNames;
};

export const removeAllUnusedResources = (project: gdProject): Array<string> => {
  const resourcesManager = project.getResourcesManager();
  const resourceKinds = Array.from(
    new Set(
      resourcesManager
        .getAllResourceNames()
        .toJSArray()
        .map(resourceName =>
          resourcesManager.getResource(resourceName).getKind()
        )
    )
  );

  return resourceKinds.reduce(
    (removedResourceNames, resourceKind) =>
      removedResourceNames.concat(removeUnusedResources(project, resourceKind)),
    []
  );
};

/**
 * Get the local path of a resource. This works by asking the ResourcesLoader
 * for the resource URL, then stripping anything that is specific to a URL.
 */
export const getLocalResourceFullPath = (
  project: gdProject,
  resourceName: string
): any => {
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

export const isPathInFolder = (
  folderPath: string,
  resourcePath: string
): boolean => {
  const relativePath = path.relative(
    path.resolve(folderPath),
    path.resolve(resourcePath)
  );
  return (
    relativePath === '' ||
    (!!relativePath &&
      !relativePath.startsWith('..') &&
      !path.isAbsolute(relativePath))
  );
};

export const isPathInProjectFolder = (
  project: gdProject,
  resourcePath: string
): boolean => {
  const projectPath = path.dirname(project.getProjectFile());
  return isPathInFolder(projectPath, resourcePath);
};

export const copyAllToProjectFolder = (
  project: gdProject,
  resourcePaths: Array<string>,
  newToOldFilePaths: Map<string, string>,
  importedResourcesFolder?: string
): Promise<Array<string>> => {
  if (!fs || !path) {
    return Promise.resolve(resourcePaths);
  }

  const projectPath = path.dirname(project.getProjectFile());
  const destinationFolderPath = importedResourcesFolder
    ? path.join(projectPath, importedResourcesFolder)
    : projectPath;
  const reservedDestinationPaths = new Set<string>();

  const getUniqueResourceDestinationPath = (resourcePath: string): string => {
    const resourceBasename = path.basename(resourcePath);
    const fileExtension = path.extname(resourceBasename);
    const fileNameWithoutExtension = path.basename(
      resourceBasename,
      fileExtension
    );

    const newFileNameWithoutExtension = newNameGenerator(
      fileNameWithoutExtension,
      tentativeFileName => {
        const tentativePath = path.join(
          destinationFolderPath,
          tentativeFileName + fileExtension
        );
        const normalizedTentativePath = path.resolve(tentativePath);
        return (
          reservedDestinationPaths.has(normalizedTentativePath) ||
          fs.existsSync(tentativePath)
        );
      }
    );

    const resourceNewPath = path.join(
      destinationFolderPath,
      newFileNameWithoutExtension + fileExtension
    );
    reservedDestinationPaths.add(path.resolve(resourceNewPath));

    return resourceNewPath;
  };

  const copyResources = (): Promise<Array<string>> => {
    // $FlowFixMe[incompatible-type]
    return Promise.all(
      resourcePaths.map(resourcePath => {
        const isAlreadyInDestinationFolder = importedResourcesFolder
          ? isPathInFolder(destinationFolderPath, resourcePath)
          : isPathInProjectFolder(project, resourcePath);
        if (isAlreadyInDestinationFolder) {
          newToOldFilePaths.set(resourcePath, resourcePath);

          return resourcePath;
        }

        const resourceNewPath = getUniqueResourceDestinationPath(resourcePath);

        return new Promise(resolve => {
          fs.copyFile(resourcePath, resourceNewPath, err => {
            if (err) {
              newToOldFilePaths.set(resourcePath, resourcePath);

              return resolve(resourcePath);
            }

            newToOldFilePaths.set(resourceNewPath, resourcePath);

            return resolve(resourceNewPath);
          });
        });
      })
    );
  };

  if (importedResourcesFolder) {
    return new Promise(resolve => {
      fs.mkdir(
        destinationFolderPath,
        { recursive: true },
        // Continue with the regular copy path if the folder creation failed.
        // Individual copy failures already fall back to the original file path.
        () => resolve()
      );
    }).then(copyResources);
  }

  return copyResources();
};

export const getResourceFilePathStatus = (
  project: gdProject,
  resourceName: string
): string => {
  if (!project.getResourcesManager().hasResource(resourceName)) return '';
  if (!fs) return '';

  const resourcePath = project
    .getResourcesManager()
    .getResource(resourceName)
    .getFile();
  if (isURL(resourcePath)) {
    // This is a URL resource: don't do any check.
    return '';
  } else {
    // This is a local resource. Check the file exists.
    const normalizedResourcePath = path.resolve(
      path.dirname(project.getProjectFile()),
      resourcePath
    );

    // The resource path doesn't exist
    if (!fs.existsSync(normalizedResourcePath)) return 'error';

    // The resource path is outside of the project folder
    if (!isPathInProjectFolder(project, normalizedResourcePath))
      return 'warning';

    // The resource path seems ok
    return '';
  }
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
  const resourcesRenamer = new gd.ResourcesRenamer(
    project.getResourcesManager(),
    renamedResourcesMap
  );
  renamedResourcesMap.delete();
  gd.ResourceExposer.exposeWholeProjectResources(project, resourcesRenamer);
  resourcesRenamer.delete();
};

export const parseLocalFilePathOrExtensionFromMetadata = (
  resource: gdResource
): {|
  localFilePath: ?string,
  extension: ?string,
|} => {
  const metadataAsString = resource.getMetadata();
  if (metadataAsString) {
    try {
      const metadata = JSON.parse(metadataAsString);
      if (metadata && typeof metadata === 'object') {
        return {
          localFilePath:
            metadata.localFilePath && typeof metadata.localFilePath === 'string'
              ? metadata.localFilePath
              : null,
          extension:
            metadata.extension && typeof metadata.extension === 'string'
              ? metadata.extension
              : null,
        };
      }
    } catch (error) {
      console.warn(
        'Malformed metadata for resource with name ' +
          resource.getName() +
          ' - ignoring it.'
      );
    }
  }

  return {
    localFilePath: null,
    extension: null,
  };
};

export const updateResourceJsonMetadata = (
  resource: gdResource,
  newMetadata: { [string]: any }
) => {
  const metadataAsString = resource.getMetadata();
  try {
    const existingMetadata = metadataAsString
      ? JSON.parse(metadataAsString)
      : {};
    resource.setMetadata(
      JSON.stringify({
        ...existingMetadata,
        ...newMetadata,
      })
    );
    return;
  } catch (error) {
    // Ignore the error, the metadata is not valid JSON
    // so we'll just overwrite it entirely instead of merging it.
  }

  resource.setMetadata(JSON.stringify(newMetadata));
};

// Key under which the project-configurable custom resource properties
// (defined in gdevelop-settings.yaml) are stored inside the resource metadata
// JSON. Kept separate from other metadata keys (e.g. localFilePath) to avoid
// collisions.
export const RESOURCE_CUSTOM_PROPERTIES_METADATA_KEY =
  'resourceCustomProperties';

export type ResourceCustomPropertyValue = string | number | boolean;

/**
 * Returns the map of custom property values stored on a resource, or an empty
 * object if none are set or the metadata is malformed.
 */
export const getResourceCustomProperties = (
  resource: gdResource
): { [string]: ResourceCustomPropertyValue } => {
  const metadataAsString = resource.getMetadata();
  if (!metadataAsString) return {};
  try {
    const metadata = JSON.parse(metadataAsString);
    if (
      metadata &&
      typeof metadata === 'object' &&
      metadata[RESOURCE_CUSTOM_PROPERTIES_METADATA_KEY] &&
      typeof metadata[RESOURCE_CUSTOM_PROPERTIES_METADATA_KEY] === 'object'
    ) {
      return metadata[RESOURCE_CUSTOM_PROPERTIES_METADATA_KEY];
    }
  } catch (error) {
    // Malformed metadata: treat as if no custom properties were set.
  }
  return {};
};

/**
 * Returns the stored value for a single custom property, falling back to the
 * provided default value (typically from the YAML schema) if it is not set.
 */
export const getResourceCustomPropertyValue = (
  resource: gdResource,
  name: string,
  defaultValue: ?ResourceCustomPropertyValue
): ?ResourceCustomPropertyValue => {
  const resourceCustomProperties = getResourceCustomProperties(resource);
  if (resourceCustomProperties[name] !== undefined) {
    return resourceCustomProperties[name];
  }
  return defaultValue == null ? null : defaultValue;
};

/**
 * Sets (or merges) a single custom property value on a resource, storing it in
 * the resource metadata JSON under RESOURCE_CUSTOM_PROPERTIES_METADATA_KEY.
 */
export const setResourceCustomPropertyValue = (
  resource: gdResource,
  name: string,
  value: ResourceCustomPropertyValue
) => {
  const resourceCustomProperties = {
    ...getResourceCustomProperties(resource),
    [name]: value,
  };
  updateResourceJsonMetadata(resource, {
    [RESOURCE_CUSTOM_PROPERTIES_METADATA_KEY]: resourceCustomProperties,
  });
};

export const isFetchableUrl = (url: string): boolean => {
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('ftp://')
  );
};

export const isURL = (filename: string): boolean => {
  return (
    filename.startsWith('http://') ||
    filename.startsWith('https://') ||
    filename.startsWith('ftp://') ||
    filename.startsWith('blob:') ||
    filename.startsWith('data:')
  );
};

export const isBlobURL = (filename: string): boolean => {
  return filename.startsWith('blob:');
};
