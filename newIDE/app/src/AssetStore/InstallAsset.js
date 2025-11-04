// @flow
import {
  type Asset,
  isPixelArt,
  isPublicAssetResourceUrl,
  extractDecodedFilenameWithExtensionFromPublicAssetResourceUrl,
} from '../Utils/GDevelopServices/Asset';
import {
  type ExtensionShortHeader,
  type ExtensionDependency,
} from '../Utils/GDevelopServices/Extension';
import newNameGenerator from '../Utils/NewNameGenerator';
import { unserializeFromJSObject } from '../Utils/Serializer';
import { toNewGdMapStringString } from '../Utils/MapStringString';
import { getInsertionParentAndPositionFromSelection } from '../Utils/ObjectFolders';
import { allResourceKindsAndMetadata } from '../ResourcesList/ResourceSource';
import {
  getRequiredExtensions,
  checkRequiredExtensionsUpdate,
  type RequiredExtensionInstallation,
} from './ExtensionStore/InstallExtension.js';

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
  isTheFirstOfItsTypeInProject: boolean,
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

    // Editor hot-reload is already triggered by onFetchNewlyAddedResources at the
    // end of asset installation. There is no need to trigger it here too.
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
    // This boolean is set by `useInstallAsset`
    isTheFirstOfItsTypeInProject: false,
  };
};

export const installPublicAsset = addAssetToProject;

export const getRequiredExtensionsFromAsset = (
  asset: Asset
): Array<ExtensionDependency> => {
  return getRequiredExtensions(asset.objectAssets);
};

export const getRequiredExtensionsFromAssets = (
  assets: Array<Asset>
): Array<ExtensionDependency> => {
  const requiredExtensions: Array<ExtensionDependency> = [];
  for (const asset of assets) {
    for (const requiredExtensionForAsset of getRequiredExtensionsFromAsset(
      asset
    )) {
      if (
        !requiredExtensions.some(
          requiredExtension =>
            requiredExtension.extensionName ===
            requiredExtensionForAsset.extensionName
        )
      ) {
        requiredExtensions.push(requiredExtensionForAsset);
      }
    }
  }
  return requiredExtensions;
};

type CheckRequiredExtensionsForAssetsArgs = {|
  assets: Array<Asset>,
  project: gdProject,
  extensionShortHeadersByName: {
    [name: string]: ExtensionShortHeader,
  },
|};

export const checkRequiredExtensionsUpdateForAssets = async ({
  assets,
  project,
  extensionShortHeadersByName,
}: CheckRequiredExtensionsForAssetsArgs): Promise<RequiredExtensionInstallation> => {
  const requiredExtensions = getRequiredExtensionsFromAssets(assets);

  const requiredExtensionsUpdate = await checkRequiredExtensionsUpdate({
    requiredExtensions,
    project,
    extensionShortHeadersByName,
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
