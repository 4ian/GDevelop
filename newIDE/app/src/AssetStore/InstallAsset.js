// @flow
import {
  type Asset,
  isPixelArt,
  isPublicAssetResourceUrl,
  extractDecodedFilenameWithExtensionFromPublicAssetResourceUrl,
} from '../Utils/GDevelopServices/Asset';
import { getIDEVersion } from '../Version';
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
import { getInsertionParentAndPositionFromSelection } from '../Utils/ObjectFolders';
import { allResourceKindsAndMetadata } from '../ResourcesList/ResourceSource';
import {
  getBreakingChanges,
  isCompatibleWithGDevelopVersion,
} from '../Utils/Extension/ExtensionCompatibilityChecker.js';

const gd: libGDevelop = global.gd;

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

  const resourceKindMetadata = allResourceKindsAndMetadata.find(
    resourceKind => resourceKind.kind === serializedResource.kind
  );
  if (!resourceKindMetadata) {
    throw new Error(
      `Resource of kind "${serializedResource.kind}" is not supported.`
    );
  }

  // The resource does not exist yet, add it. Note that the "origin" will be preserved.
  const newResource = resourceKindMetadata.createNewResource();
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
  targetObjectFolderOrObject?: ?gdObjectFolderOrObject,
  requestedObjectName?: string,
|};

const findVariant = (
  container: gdEventsBasedObjectVariantsContainer,
  assetStoreAssetId: string,
  assetStoreOriginalName: string
): gdEventsBasedObjectVariant | null => {
  for (let index = 0; index < container.getVariantsCount(); index++) {
    const variant = container.getVariantAt(index);
    if (
      variant.getAssetStoreAssetId() === assetStoreAssetId &&
      variant.getAssetStoreOriginalName() === assetStoreOriginalName
    ) {
      return variant;
    }
  }
  return null;
};

export const addAssetToProject = async ({
  asset,
  project,
  objectsContainer,
  targetObjectFolderOrObject,
  requestedObjectName,
}: InstallAssetArgs): Promise<InstallAssetOutput> => {
  const objectNewNames = {};
  const resourceNewNames = {};
  const createdObjects: Array<gdObject> = [];

  // Create objects (and their behaviors)
  asset.objectAssets.forEach(objectAsset => {
    const type: ?string = objectAsset.object.type;
    if (!type) throw new Error('An object has no type specified');

    const variantRenamings: Array<{
      objectType: string,
      oldVariantName: string,
      newVariantName: string,
    }> = [];
    const serializedVariants = objectAsset.variants;
    if (serializedVariants) {
      // Install variants
      for (const {
        objectType,
        variant: serializedVariant,
      } of serializedVariants) {
        if (project.hasEventsBasedObject(objectType)) {
          const eventsBasedObject = project.getEventsBasedObject(objectType);
          const variants = eventsBasedObject.getVariants();
          let variant = findVariant(variants, asset.id, serializedVariant.name);
          if (!variant) {
            // TODO Forbid name with `::`
            const uniqueNewName = newNameGenerator(
              serializedVariant.name || asset.name,
              tentativeNewName => variants.hasVariantNamed(tentativeNewName)
            );
            variant = variants.insertNewVariant(
              uniqueNewName,
              variants.getVariantsCount()
            );
            const variantName = variant.getName();
            unserializeFromJSObject(
              variant,
              serializedVariant,
              'unserializeFrom',
              project
            );
            variant.setName(variantName);
            variant.setAssetStoreAssetId(asset.id);
            variant.setAssetStoreOriginalName(serializedVariant.name);
          }
          if (variant.getName() !== serializedVariant.name) {
            variantRenamings.push({
              objectType,
              oldVariantName: serializedVariant.name,
              newVariantName: variant.getName(),
            });
          }
        }
      }
      // Update variant names into variants object configurations.
      for (const {
        objectType,
        variant: serializedVariant,
      } of serializedVariants) {
        if (project.hasEventsBasedObject(objectType)) {
          const eventsBasedObject = project.getEventsBasedObject(objectType);
          const variants = eventsBasedObject.getVariants();
          let variant = findVariant(variants, asset.id, serializedVariant.name);
          if (variant) {
            for (
              let index = 0;
              index < variant.getObjects().getObjectsCount();
              index++
            ) {
              const object = variant.getObjects().getObjectAt(index);

              if (project.hasEventsBasedObject(object.getType())) {
                const customObjectConfiguration = gd.asCustomObjectConfiguration(
                  object.getConfiguration()
                );
                const customObjectVariantRenaming = variantRenamings.find(
                  renaming => renaming.objectType === object.getType()
                );
                if (customObjectVariantRenaming) {
                  customObjectConfiguration.setVariantName(
                    customObjectVariantRenaming.newVariantName
                  );
                }
              }
            }
          }
        }
      }
    }

    // Insert the object.
    const originalName = gd.Project.getSafeName(
      requestedObjectName || objectAsset.object.name
    );
    const newName = newNameGenerator(originalName, name =>
      objectsContainer.hasObjectNamed(name)
    );

    let object: gdObject;
    if (targetObjectFolderOrObject) {
      const { folder, position } = getInsertionParentAndPositionFromSelection(
        targetObjectFolderOrObject
      );
      object = objectsContainer.insertNewObjectInFolder(
        project,
        type,
        newName,
        folder,
        position
      );
    } else {
      object = objectsContainer.insertNewObject(
        project,
        type,
        newName,
        objectsContainer.getObjectsCount()
      );
    }
    objectNewNames[originalName] = newName;

    unserializeFromJSObject(
      object,
      objectAsset.object,
      'unserializeFrom',
      project
    );
    // The name was overwritten after unserialization.
    object.setName(newName);
    object.setAssetStoreId(asset.id);
    if (project.hasEventsBasedObject(object.getType())) {
      const customObjectConfiguration = gd.asCustomObjectConfiguration(
        object.getConfiguration()
      );
      if (customObjectConfiguration.getVariantName()) {
        customObjectConfiguration.setMarkedAsOverridingEventsBasedObjectChildrenConfiguration(
          false
        );
      }
      const customObjectVariantRenaming = variantRenamings.find(
        renaming => renaming.objectType === object.getType()
      );
      if (customObjectVariantRenaming) {
        customObjectConfiguration.setVariantName(
          customObjectVariantRenaming.newVariantName
        );
      }
    }

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
  breakingChangesExtensionShortHeaders: Array<ExtensionShortHeader>,
  incompatibleWithIdeExtensionShortHeaders: Array<ExtensionShortHeader>,
  safeToUpdateExtensions: Array<ExtensionShortHeader>,
  isGDevelopUpdateNeeded: boolean,
|};

export type InstallRequiredExtensionsArgs = {|
  requiredExtensionInstallation: RequiredExtensionInstallation,
  shouldUpdateExtension: boolean,
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  project: gdProject,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
|};

export const installRequiredExtensions = async ({
  requiredExtensionInstallation,
  shouldUpdateExtension,
  eventsFunctionsExtensionsState,
  project,
  onExtensionInstalled,
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
  onExtensionInstalled(
    neededExtensions.map(extensionShortHeader => extensionShortHeader.name)
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
export const addSerializedExtensionsToProject = async (
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  project: gdProject,
  serializedExtensions: Array<SerializedExtension>,
  fromExtensionStore: boolean = true
): Promise<void> => {
  const extensionNames = serializedExtensions.map(serializedExtension => {
    const { name } = serializedExtension;
    if (!name) throw new Error('Malformed extension (missing name).');

    return name;
  });

  // Unserialize the extensions in the project. Let the project do it
  // (rather than adding extensions one by one) to allow dependencies between extensions.
  const serializedExtensionsElement = gd.Serializer.fromJSObject(
    serializedExtensions
  );
  project.unserializeAndInsertExtensionsFrom(serializedExtensionsElement);
  serializedExtensionsElement.delete();

  // Keep track of extensions added from the extension store.
  if (fromExtensionStore) {
    extensionNames.forEach(extensionName => {
      if (!project.hasEventsFunctionsExtensionNamed(extensionName)) {
        return;
      }

      const eventsFunctionsExtension = project.getEventsFunctionsExtension(
        extensionName
      );
      eventsFunctionsExtension.setOrigin(
        'gdevelop-extension-store',
        extensionName
      );
    });
  }

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
      breakingChangesExtensionShortHeaders: [],
      incompatibleWithIdeExtensionShortHeaders: [],
      safeToUpdateExtensions: [],
      isGDevelopUpdateNeeded: false,
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

  const incompatibleWithIdeExtensionShortHeaders = requiredExtensionShortHeaders.filter(
    requiredExtensionShortHeader =>
      !isCompatibleWithGDevelopVersion(
        getIDEVersion(),
        requiredExtensionShortHeader.gdevelopVersion
      )
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

  const breakingChangesExtensionShortHeaders = outOfDateExtensionShortHeaders.filter(
    requiredExtensionShortHeader =>
      project.hasEventsFunctionsExtensionNamed(
        requiredExtensionShortHeader.name
      ) &&
      getBreakingChanges(
        project
          .getEventsFunctionsExtension(requiredExtensionShortHeader.name)
          .getVersion(),
        requiredExtensionShortHeader
      ).length > 0
  );

  const missingExtensionShortHeaders = filterMissingExtensions(
    gd,
    requiredExtensionShortHeaders
  );

  const safeToUpdateExtensions = outOfDateExtensionShortHeaders.filter(
    extension =>
      !incompatibleWithIdeExtensionShortHeaders.includes(extension) &&
      !breakingChangesExtensionShortHeaders.includes(extension)
  );

  // Overridden by `checkRequiredExtensionsUpdateForAssets`
  const isGDevelopUpdateNeeded = incompatibleWithIdeExtensionShortHeaders.some(
    extension => missingExtensionShortHeaders.includes(extension)
  );

  return {
    requiredExtensionShortHeaders,
    missingExtensionShortHeaders,
    outOfDateExtensionShortHeaders,
    breakingChangesExtensionShortHeaders,
    incompatibleWithIdeExtensionShortHeaders,
    safeToUpdateExtensions,
    isGDevelopUpdateNeeded,
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

  const requiredExtensionsUpdate = await checkRequiredExtensionsUpdate({
    requiredExtensions,
    project,
  });
  // Even if the asset may work with already installed extensions,
  // we don't risk it since the asset may use the new features of the extension.
  requiredExtensionsUpdate.isGDevelopUpdateNeeded =
    requiredExtensionsUpdate.isGDevelopUpdateNeeded ||
    requiredExtensionsUpdate.incompatibleWithIdeExtensionShortHeaders.length >
      0;
  return requiredExtensionsUpdate;
};

export const complyVariantsToEventsBasedObjectOf = (
  project: gdProject,
  createdObjects: Array<gdObject>
) => {
  const installedVariantObjectTypes = new Set<string>();
  for (const createdObject of createdObjects) {
    if (project.hasEventsBasedObject(createdObject.getType())) {
      installedVariantObjectTypes.add(createdObject.getType());
    }
  }
  for (const installedVariantObjectType of installedVariantObjectTypes) {
    gd.EventsBasedObjectVariantHelper.complyVariantsToEventsBasedObject(
      project,
      project.getEventsBasedObject(installedVariantObjectType)
    );
  }
};
