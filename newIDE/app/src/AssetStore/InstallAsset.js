// @flow
import {
  type Asset,
  type AssetShortHeader,
  getAsset,
  isPixelArt,
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
  const resourceOriginName: string = serializedResource.origin
    ? serializedResource.origin.name
    : '';
  const resourceOriginIdentifier: string = serializedResource.origin
    ? serializedResource.origin.identifier
    : '';
  const existingResourceNameFromSameOrigin =
    resourceOriginName && resourceOriginIdentifier
      ? resourcesManager.getResourceNameWithOrigin(
          resourceOriginName,
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
  } else {
    throw new Error(
      `Resource of kind "${serializedResource.kind}" is not supported.`
    );
  }

  unserializeFromJSObject(newResource, serializedResource);

  const newName = newNameGenerator(originalResourceName, name =>
    resourcesManager.hasResource(name)
  );
  newResource.setName(newName);
  newResource.setSmooth(
    project.getScaleMode() !== 'nearest' && !isPixelArt(asset)
  );
  newResource.setOrigin(resourceOriginName, resourceOriginIdentifier);
  resourcesManager.addResource(newResource);
  newResource.delete();

  resourceNewNames[originalResourceName] = newName;
};

export const addAssetToProject = async ({
  asset,
  project,
  events,
  objectsContainer,
}: {|
  asset: Asset,
  project: gdProject,
  events: gdEventsList,
  objectsContainer: gdObjectsContainer,
|}) => {
  const objectNewNames = {};
  const resourceNewNames = {};
  const createdObjects: Array<gdObject> = [];

  asset.objectAssets.forEach(objectAsset => {
    objectAsset.resources.forEach(serializedResource => {});
  });

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
    const resourcesRenamer = new gd.ResourcesRenamer(renamedResourcesMap);
    renamedResourcesMap.delete();
    object.exposeResources(resourcesRenamer);
    resourcesRenamer.delete();

    objectAsset.customization.forEach(customization => {
      if (customization.behaviorName) {
        const { behaviorName, behaviorType } = customization;

        const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
          gd.JsPlatform.get(),
          behaviorType
        );
        if (gd.MetadataProvider.isBadBehaviorMetadata(behaviorMetadata)) {
          throw new Error(
            'Behavior with type ' + behaviorType + ' could not be found.'
          );
        }

        const behavior = behaviorMetadata.get();
        // TODO: When this feature is exposed to users, we might want to use
        // gd.WholeProjectRefactorer.addBehaviorAndRequiredBehaviors instead.
        // And add analytics for this.
        const behaviorContent = object.addNewBehavior(
          project,
          behaviorType,
          behaviorName
        );
        customization.properties.forEach(property => {
          behavior.updateProperty(
            behaviorContent.getContent(),
            property.name,
            property.defaultValue
          );
        });
      }
    });

    createdObjects.push(object);
  });

  // Add the events after adding all objects, as we need to potentially
  // rename the objects in the inserted events.
  asset.objectAssets.forEach(objectAsset => {
    const originalName = objectAsset.object.name;
    const newName = objectNewNames[originalName];

    objectAsset.customization.forEach(customization => {
      if (customization.events) {
        const groupEvent = new gd.GroupEvent();
        groupEvent.setName(newName);

        unserializeFromJSObject(
          groupEvent.getSubEvents(),
          customization.events,
          'unserializeFrom',
          project
        );

        // Find/replace the customization parameters in the events.
        customization.parameters.forEach(parameter => {
          gd.EventsRefactorer.replaceStringInEvents(
            project,
            objectsContainer,
            groupEvent.getSubEvents(),
            parameter.name,
            parameter.defaultValue,
            /*matchCase=*/ true,
            /*inConditions=*/ true,
            /*inActions=*/ true,
            /*inEventStrings=*/ false
          );
        });

        // Rename any object that was renamed when inserted.
        // Do this **after** replacing the customization parameters,
        // as some expressions can be invalid before customization
        // parameters replacements.
        for (const originalName in objectNewNames) {
          const newName = objectNewNames[originalName];
          if (originalName !== newName) {
            gd.EventsRefactorer.renameObjectInEvents(
              project.getCurrentPlatform(),
              project,
              objectsContainer,
              groupEvent.getSubEvents(),
              originalName,
              newName
            );
          }
        }

        events.insertEvent(groupEvent, events.getEventsCount());
      }
    });
  });

  return {
    createdObjects,
  };
};

type RequiredBehavior = {|
  extensionName: string,
  extensionVersion: string,
  behaviorType: string,
|};

export const getRequiredBehaviorsFromAsset = (
  asset: Asset
): Array<RequiredBehavior> => {
  return uniqBy(
    flatten(
      asset.objectAssets.map(objectAsset => {
        return objectAsset.customization
          .map(customization => {
            if (customization.behaviorName) {
              const {
                behaviorType,
                extensionName,
                extensionVersion,
              } = customization;
              return { behaviorType, extensionName, extensionVersion };
            }

            return null;
          })
          .filter(Boolean);
      })
    ),
    ({ behaviorType }) => behaviorType // TODO: Verify if we could use the extension name instead?
  );
};

type RequiredExtension = {|
  extensionName: string,
  extensionVersion: string,
|};

export const filterMissingExtensions = (
  gd: libGDevelop,
  requiredExtensions: Array<RequiredExtension>
): Array<RequiredExtension> => {
  const loadedExtensionNames = mapVector(
    gd.asPlatform(gd.JsPlatform.get()).getAllPlatformExtensions(),
    extension => {
      return extension.getName();
    }
  );

  return requiredExtensions.filter(({ extensionName }) => {
    return !loadedExtensionNames.includes(extensionName);
  });
};

export const getRequiredExtensionsForEventsFromAsset = (
  asset: Asset
): Array<RequiredExtension> => {
  return uniqBy(
    flatten(
      asset.objectAssets.map(objectAsset => {
        return flatten(
          objectAsset.customization
            .map(customization => {
              if (customization.events) {
                return customization.extensions;
              }

              return null;
            })
            .filter(Boolean)
        );
      })
    ),
    ({ extensionName }) => extensionName
  );
};

export const filterMissingBehaviors = (
  gd: libGDevelop,
  requiredBehaviors: Array<RequiredBehavior>
): Array<RequiredBehavior> => {
  return requiredBehaviors.filter(({ behaviorType }) => {
    const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
      gd.JsPlatform.get(),
      behaviorType
    );
    return gd.MetadataProvider.isBadBehaviorMetadata(behaviorMetadata);
  });
};

export const downloadExtensions = async (
  extensionNames: Array<string>
): Promise<Array<SerializedExtension>> => {
  if (!extensionNames.length) return Promise.resolve([]);

  const extensionsRegistry = await getExtensionsRegistry();

  const serializedExtensions = await Promise.all(
    uniq(extensionNames).map(extensionName => {
      const extensionShortHeader = extensionsRegistry.extensionShortHeaders.find(
        extensionShortHeader => {
          return extensionShortHeader.name === extensionName;
        }
      );
      if (!extensionShortHeader) {
        throw new Error(
          'Unable to find extension ' + extensionName + ' in the registry.'
        );
      }

      return getExtension(extensionShortHeader);
    })
  );

  return serializedExtensions;
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

type InstallAssetArgs = {|
  assetShortHeader: AssetShortHeader,
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  project: gdProject,
  events: gdEventsList,
  objectsContainer: gdObjectsContainer,
  isStagingAsset: boolean,
|};

type InstallAssetOutput = {|
  createdObjects: Array<gdObject>,
|};

export const installAsset = async ({
  assetShortHeader,
  eventsFunctionsExtensionsState,
  project,
  events,
  objectsContainer,
  isStagingAsset,
}: InstallAssetArgs): Promise<InstallAssetOutput> => {
  const asset = await getAsset(assetShortHeader, { isStagingAsset });
  const requiredBehaviors = getRequiredBehaviorsFromAsset(asset);
  const requiredExtensions = getRequiredExtensionsForEventsFromAsset(asset);
  const missingBehaviors = filterMissingBehaviors(gd, requiredBehaviors);
  const missingExtensions = filterMissingExtensions(gd, requiredExtensions);
  const serializedExtensions = await downloadExtensions([
    ...missingBehaviors.map(({ extensionName }) => extensionName),
    ...missingExtensions.map(({ extensionName }) => extensionName),
  ]);
  await addSerializedExtensionsToProject(
    eventsFunctionsExtensionsState,
    project,
    serializedExtensions
  );

  const stillMissingBehaviors = filterMissingBehaviors(gd, requiredBehaviors);
  if (stillMissingBehaviors.length) {
    throw new Error(
      'These behaviors could not be installed: ' +
        missingBehaviors
          .map(
            ({ extensionName, behaviorType }) =>
              `${behaviorType} (${extensionName})`
          )
          .join(', ')
    );
  }

  const stillMissingExtensions = filterMissingExtensions(
    gd,
    requiredExtensions
  );
  if (stillMissingExtensions.length) {
    throw new Error(
      'These extensions could not be installed: ' +
        missingExtensions.map(({ extensionName }) => extensionName).join(', ')
    );
  }

  const output = await addAssetToProject({
    project,
    asset,
    events,
    objectsContainer,
  });
  return output;
};
