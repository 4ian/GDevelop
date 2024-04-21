// @flow
import {
  type Asset,
  isPixelArt,
  isPublicAssetResourceUrl,
  extractDecodedFilenameWithExtensionFromPublicAssetResourceUrl,
} from '../Utils/GDevelopServices/Asset';
import newNameGenerator from '../Utils/NewNameGenerator';
import { unserializeFromJSObject } from '../Utils/Serializer';
import flatten from 'lodash/flatten';
import uniqBy from 'lodash/uniqBy';
import uniq from 'lodash/uniq';
import {
  getExtensionsRegistry,
  getExtension,
  type SerializedExtension,
  type ExtensionShortHeader,
} from '../Utils/GDevelopServices/Extension';
import { type EventsFunctionsExtensionsState } from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { mapVector } from '../Utils/MapFor';
import { toNewGdMapStringString } from '../Utils/MapStringString';

const gd: libGDevelop = global.gd;

const toPascalCase = (str: string) => {
  if (!str) return '';
  return str
    .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, '$')
    .replace(/[^A-Za-z0-9]+/g, '$')
    .replace(/([a-z])([A-Z])/g, function(m, a, b) {
      return a + '$' + b;
    })
    .toLowerCase()
    .replace(/(\$)(\w?)/g, function(m, a, b) {
      return b.toUpperCase();
    });
};

export const sanitizeObjectName = (objectName: string) => {
  const trimmedObjectName = objectName.trim();
  if (!trimmedObjectName) return 'UnnamedObject';

  const pascalCaseName = toPascalCase(trimmedObjectName);

  let prefixedObjectName = pascalCaseName;
  if (prefixedObjectName[0] >= '0' && prefixedObjectName[0] <= '9') {
    prefixedObjectName = '_' + prefixedObjectName;
  }

  return prefixedObjectName;
};

/**
 * Adds the specified resource to the resources manager, avoiding to duplicate
 * if it was already added.
 */
export const installResource = (
  project: gdProject,
  asset: Asset,
  serializedResource: any,
  resourceNewNames: { [string]: string }
) => {
  const originalResourceName: string = serializedResource.name;

  if (resourceNewNames[originalResourceName]) {
    // The resource was already added previously - don't
    // bother adding it again.
    return;
  }

  const resourcesManager: gdResourcesManager = project.getResourcesManager();

  // Check if the resource that must be installed is already present. Use the "origin"
  // of the resource (if present), otherwise for compatibility we use the URL.
  const resourceFileUrl: string = serializedResource.file;
  const resourceOriginRawName: string = serializedResource.origin
    ? serializedResource.origin.name
    : '';
  // We clean up the name of the resource, to avoid having a resource with a name
  // too long (for instance, a resource with a SHA for public assets).
  const resourceOriginCleanedName: string = isPublicAssetResourceUrl(
    resourceFileUrl
  )
    ? extractDecodedFilenameWithExtensionFromPublicAssetResourceUrl(
        resourceFileUrl
      )
    : resourceOriginRawName;
  const resourceOriginIdentifier: string = serializedResource.origin
    ? serializedResource.origin.identifier
    : '';
  const existingResourceNameFromSameOrigin =
    resourceOriginCleanedName && resourceOriginIdentifier
      ? resourcesManager.getResourceNameWithOrigin(
          resourceOriginCleanedName,
          resourceOriginIdentifier
        )
      : '';
  const existingResourceNameWithSameFile = resourcesManager.getResourceNameWithFile(
    resourceFileUrl
  );

  if (existingResourceNameFromSameOrigin) {
    // There is a resource with the same origin, use it.
    resourceNewNames[originalResourceName] = existingResourceNameFromSameOrigin;
    return;
  } else if (existingResourceNameWithSameFile) {
    // For compatibility with resources without origins, also check the file directly.
    resourceNewNames[originalResourceName] = existingResourceNameWithSameFile;
    return;
  }

  // The resource does not exist yet, add it. Note that the "origin" will be preserved.
  let newResource = null;
  if (serializedResource.kind === 'image') {
    newResource = new gd.ImageResource();
  } else if (serializedResource.kind === 'audio') {
    newResource = new gd.AudioResource();
  } else if (serializedResource.kind === 'font') {
    newResource = new gd.FontResource();
  } else if (serializedResource.kind === 'video') {
    newResource = new gd.VideoResource();
  } else if (serializedResource.kind === 'json') {
    newResource = new gd.JsonResource();
  } else if (serializedResource.kind === 'model3D') {
    newResource = new gd.Model3DResource();
  } else if (serializedResource.kind === 'atlas') {
    newResource = new gd.AtlasResource();
  } else if (serializedResource.kind === 'spine') {
    newResource = new gd.SpineResource();
  } else {
    throw new Error(
      `Resource of kind "${serializedResource.kind}" is not supported.`
    );
  }

  unserializeFromJSObject(newResource, serializedResource);

  if (newResource.getKind() === 'image') {
    // $FlowExpectedError[prop-missing] - We know the resource is an ImageResource and has the setSmooth method.
    newResource.setSmooth(
      project.getScaleMode() !== 'nearest' && !isPixelArt(asset)
    );
  }

  const newName = newNameGenerator(originalResourceName, name =>
    resourcesManager.hasResource(name)
  );
  newResource.setName(newName);
  newResource.setOrigin(resourceOriginCleanedName, resourceOriginIdentifier);
  resourcesManager.addResource(newResource);
  newResource.delete();

  resourceNewNames[originalResourceName] = newName;
};

export type InstallAssetOutput = {|
  createdObjects: Array<gdObject>,
|};

export type InstallAssetArgs = {|
  asset: Asset,
  project: gdProject,
  objectsContainer: gdObjectsContainer,
|};

export const addAssetToProject = async ({
  asset,
  project,
  objectsContainer,
}: InstallAssetArgs): Promise<InstallAssetOutput> => {
  const objectNewNames = {};
  const resourceNewNames = {};
  const createdObjects: Array<gdObject> = [];

  // Create objects (and their behaviors)
  asset.objectAssets.forEach(objectAsset => {
    const type: ?string = objectAsset.object.type;
    if (!type) throw new Error('An object has no type specified');

    // Insert the object
    const originalName = sanitizeObjectName(objectAsset.object.name);
    const newName = newNameGenerator(originalName, name =>
      objectsContainer.hasObjectNamed(name)
    );
    const object = objectsContainer.insertNewObject(
      project,
      type,
      newName,
      objectsContainer.getObjectsCount()
    );
    objectNewNames[originalName] = newName;

    unserializeFromJSObject(
      object,
      objectAsset.object,
      'unserializeFrom',
      project
    );

    object.setAssetStoreId(asset.id);
    // The name was overwritten after unserialization.
    object.setName(newName);

    // Add resources used by the object
    objectAsset.resources.forEach(serializedResource => {
      installResource(project, asset, serializedResource, resourceNewNames);
    });

    // TODO: Check how multiple objects are handled

    // Resources may have been renamed to be added to the project.
    // In this case, rename them in the object.
    const renamedResourcesMap = toNewGdMapStringString(resourceNewNames);
    const resourcesRenamer = new gd.ResourcesRenamer(
      project.getResourcesManager(),
      renamedResourcesMap
    );
    renamedResourcesMap.delete();
    object.getConfiguration().exposeResources(resourcesRenamer);
    resourcesRenamer.delete();

    createdObjects.push(object);
  });

  return {
    createdObjects,
  };
};

export const installPublicAsset = addAssetToProject;

export type RequiredExtension = {|
  extensionName: string,
  extensionVersion: string,
|};

export const getRequiredExtensionsFromAsset = (
  asset: Asset
): Array<RequiredExtension> => {
  return uniqBy(
    flatten(
      asset.objectAssets.map(
        objectAsset => objectAsset.requiredExtensions || []
      )
    ),
    ({ extensionName }) => extensionName
  );
};

const filterMissingExtensions = (
  gd: libGDevelop,
  requiredExtensions: Array<ExtensionShortHeader>
): Array<ExtensionShortHeader> => {
  const loadedExtensionNames = mapVector(
    gd.asPlatform(gd.JsPlatform.get()).getAllPlatformExtensions(),
    extension => {
      return extension.getName();
    }
  );

  return requiredExtensions.filter(extension => {
    return !loadedExtensionNames.includes(extension.name);
  });
};

export type RequiredExtensionInstallation = {|
  requiredExtensionShortHeaders: Array<ExtensionShortHeader>,
  missingExtensionShortHeaders: Array<ExtensionShortHeader>,
  outOfDateExtensionShortHeaders: Array<ExtensionShortHeader>,
|};

export type InstallRequiredExtensionsArgs = {|
  requiredExtensionInstallation: RequiredExtensionInstallation,
  shouldUpdateExtension: boolean,
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  project: gdProject,
|};

export const installRequiredExtensions = async ({
  requiredExtensionInstallation,
  shouldUpdateExtension,
  eventsFunctionsExtensionsState,
  project,
}: InstallRequiredExtensionsArgs): Promise<void> => {
  const {
    requiredExtensionShortHeaders,
    missingExtensionShortHeaders,
    outOfDateExtensionShortHeaders,
  } = requiredExtensionInstallation;

  if (
    missingExtensionShortHeaders.length === 0 &&
    outOfDateExtensionShortHeaders.length === 0
  ) {
    return;
  }

  const neededExtensions = shouldUpdateExtension
    ? [...missingExtensionShortHeaders, ...outOfDateExtensionShortHeaders]
    : missingExtensionShortHeaders;

  const serializedExtensions = await Promise.all(
    uniq(neededExtensions).map(extensionShortHeader =>
      getExtension(extensionShortHeader)
    )
  );

  await addSerializedExtensionsToProject(
    eventsFunctionsExtensionsState,
    project,
    serializedExtensions
  );

  const stillMissingExtensions = filterMissingExtensions(
    gd,
    requiredExtensionShortHeaders
  );
  if (stillMissingExtensions.length) {
    throw new Error(
      'These extensions could not be installed: ' +
        missingExtensionShortHeaders.map(extension => extension.name).join(', ')
    );
  }
};

/**
 * Add a serialized (JS object) events function extension to the project,
 * triggering reload of extensions.
 */
export const addSerializedExtensionsToProject = (
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  project: gdProject,
  serializedExtensions: Array<SerializedExtension>,
  fromExtensionStore: boolean = true
): Promise<void> => {
  serializedExtensions.forEach(serializedExtension => {
    const { name } = serializedExtension;
    if (!name)
      return Promise.reject(new Error('Malformed extension (missing name).'));

    const newEventsFunctionsExtension = project.hasEventsFunctionsExtensionNamed(
      name
    )
      ? project.getEventsFunctionsExtension(name)
      : project.insertNewEventsFunctionsExtension(name, 0);

    unserializeFromJSObject(
      newEventsFunctionsExtension,
      serializedExtension,
      'unserializeFrom',
      project
    );

    if (fromExtensionStore) {
      newEventsFunctionsExtension.setOrigin('gdevelop-extension-store', name);
    }
  });

  return eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
    project
  );
};

type CheckRequiredExtensionsArgs = {|
  requiredExtensions: RequiredExtension[],
  project: gdProject,
|};

export const checkRequiredExtensionsUpdate = async ({
  requiredExtensions,
  project,
}: CheckRequiredExtensionsArgs): Promise<RequiredExtensionInstallation> => {
  if (requiredExtensions.length === 0) {
    return {
      requiredExtensionShortHeaders: [],
      missingExtensionShortHeaders: [],
      outOfDateExtensionShortHeaders: [],
    };
  }

  const extensionsRegistry = await getExtensionsRegistry();

  const requiredExtensionShortHeaders = requiredExtensions.map(
    requiredExtension => {
      const extensionShortHeader = extensionsRegistry.headers.find(
        extensionShortHeader => {
          return extensionShortHeader.name === requiredExtension.extensionName;
        }
      );
      if (!extensionShortHeader) {
        throw new Error(
          'Unable to find extension ' +
            requiredExtension.extensionName +
            ' in the registry.'
        );
      }

      return extensionShortHeader;
    }
  );

  const outOfDateExtensionShortHeaders = requiredExtensionShortHeaders.filter(
    requiredExtensionShortHeader =>
      project.hasEventsFunctionsExtensionNamed(
        requiredExtensionShortHeader.name
      ) &&
      project
        .getEventsFunctionsExtension(requiredExtensionShortHeader.name)
        .getVersion() !== requiredExtensionShortHeader.version
  );

  const missingExtensionShortHeaders = filterMissingExtensions(
    gd,
    requiredExtensionShortHeaders
  );

  return {
    requiredExtensionShortHeaders,
    missingExtensionShortHeaders,
    outOfDateExtensionShortHeaders,
  };
};

type CheckRequiredExtensionsForAssetsArgs = {|
  assets: Array<Asset>,
  project: gdProject,
|};

export const checkRequiredExtensionsUpdateForAssets = async ({
  assets,
  project,
}: CheckRequiredExtensionsForAssetsArgs): Promise<RequiredExtensionInstallation> => {
  const requiredExtensions: Array<RequiredExtension> = [];
  assets.forEach(asset => {
    getRequiredExtensionsFromAsset(asset).forEach(requiredExtensionForAsset => {
      if (
        !requiredExtensions.some(
          requiredExtension =>
            requiredExtension.extensionName ===
            requiredExtensionForAsset.extensionName
        )
      ) {
        requiredExtensions.push(requiredExtensionForAsset);
      }
    });
  });

  return checkRequiredExtensionsUpdate({ requiredExtensions, project });
};
