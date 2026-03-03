// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import { Column } from '../UI/Grid';
import { ColumnStackLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import Text from '../UI/Text';
import Upload from '../UI/CustomSvgIcons/Upload';
import { listArchiveFiles, getFileBlob } from '../Utils/BrowserArchiver';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import path from 'path-browserify';
import Checkbox from '../UI/Checkbox';
import useForceUpdate from '../Utils/UseForceUpdate';
import { type ObjectAsset } from '../Utils/GDevelopServices/Asset';
import { unserializeFromJSObject } from '../Utils/Serializer';
import { allResourceKindsAndMetadata } from '../ResourcesList/ResourceSource';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { type ExtensionDependency } from '../Utils/GDevelopServices/Extension';
import semverGreaterThan from 'semver/functions/gt';
import { addSerializedExtensionsToProject } from '../AssetStore/ExtensionStore/InstallExtension';
import newNameGenerator from '../Utils/NewNameGenerator';
import LoaderModal from '../UI/LoaderModal';
import AlertMessage from '../UI/AlertMessage';
import { getOrCreate } from '../Utils/Map';

const gd: libGDevelop = global.gd;

export const useOpenAssetFile = (): (() => Promise<{|
  assetPackBlob: Blob | null,
|}>) => {
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );

  return async (): Promise<{| assetPackBlob: Blob | null |}> => {
    const eventsFunctionsExtensionOpener = eventsFunctionsExtensionsState.getEventsFunctionsExtensionOpener();
    if (!eventsFunctionsExtensionOpener) {
      return { assetPackBlob: null };
    }
    const pathOrUrl = await eventsFunctionsExtensionOpener.chooseAssetPackFile();
    if (!pathOrUrl) {
      return { assetPackBlob: null };
    }
    const assetPackBlob = await eventsFunctionsExtensionOpener.readAssetPackFile(
      pathOrUrl
    );
    return { assetPackBlob };
  };
};

type ObjectAssetReference = {|
  filePath: string,
  folderPathElements: Array<string>,
  objectName: string,
  isSelected: boolean,
|};

/**
 * A Model of selectable tree of objects.
 */
class ObjectTreeNode {
  // eslint-disable-next-line no-use-before-define
  folders: Map<string, ObjectTreeNode>;
  objects: Array<ObjectAssetReference>;

  constructor() {
    this.folders = new Map<string, ObjectTreeNode>();
    this.objects = [];
  }

  isNodeSelected(): boolean | null {
    let hasAnyUnselectedNode = false;
    let hasAnySelectedNode = false;
    for (const object of this.objects) {
      if (object.isSelected) {
        hasAnySelectedNode = true;
      } else {
        hasAnyUnselectedNode = true;
      }
    }
    for (const folder of this.folders.values()) {
      const areChildrenSelected = folder.isNodeSelected();
      if (areChildrenSelected === null) {
        return null;
      } else if (areChildrenSelected) {
        hasAnySelectedNode = true;
      } else {
        hasAnyUnselectedNode = true;
      }
    }
    return hasAnySelectedNode && hasAnyUnselectedNode
      ? null
      : hasAnySelectedNode;
  }

  setSelected(isSelected: boolean): void {
    for (const object of this.objects) {
      object.isSelected = isSelected;
    }
    for (const folder of this.folders.values()) {
      folder.setSelected(isSelected);
    }
  }

  getAllSelectedObjects(
    objects: Array<ObjectAssetReference> = []
  ): Array<ObjectAssetReference> {
    for (const folder of this.folders.values()) {
      folder.getAllSelectedObjects(objects);
    }
    for (const object of this.objects) {
      if (object.isSelected) {
        objects.push(object);
      }
    }
    return objects;
  }

  // eslint-disable-next-line no-use-before-define
  getOrCreateSubFolders(objectFolderPath: Array<string>): ObjectTreeNode {
    let objectTreeNode: ObjectTreeNode = this;
    for (const folderName of objectFolderPath) {
      objectTreeNode = getOrCreate(
        objectTreeNode.folders,
        folderName,
        () => new ObjectTreeNode()
      );
    }
    return objectTreeNode;
  }
}

const getOrCreateObjectFolder = (
  objectFolder: gdObjectFolderOrObject,
  folderPathElements: Array<string>
) => {
  let currentFolder = objectFolder;
  for (const folderName of folderPathElements) {
    currentFolder = currentFolder.getOrCreateFolderChild(folderName);
  }
  return currentFolder;
};

/**
 * A tree of objects that can be selected with checkboxes.
 */
const SelectableObjectTreeNode = ({
  node,
  onSelectionChanged,
}: {|
  node: ObjectTreeNode,
  onSelectionChanged: () => void,
|}): React.Node => {
  const forceUpdate = useForceUpdate();

  return (
    <ColumnStackLayout>
      {[...node.folders.entries()].map(([folderName, folderNode]) => {
        const isSelected = folderNode.isNodeSelected();
        return (
          <ColumnStackLayout noMargin key={folderName}>
            <Checkbox
              label={folderName}
              checked={!!isSelected}
              indeterminate={isSelected === null}
              onCheck={(e, checked) => {
                folderNode.setSelected(checked);
                onSelectionChanged();
                forceUpdate();
              }}
            />
            <SelectableObjectTreeNode
              node={folderNode}
              onSelectionChanged={() => {
                onSelectionChanged();
                forceUpdate();
              }}
            />
          </ColumnStackLayout>
        );
      })}
      {node.objects.map(object => (
        <Checkbox
          key={object.objectName}
          label={object.objectName}
          checked={object.isSelected}
          onCheck={(e, checked) => {
            object.isSelected = checked;
            onSelectionChanged();
            forceUpdate();
          }}
        />
      ))}
    </ColumnStackLayout>
  );
};

type ExtensionUpdate = {| name: string, label: string, isSelected: boolean |};
type VariantUpdate = {| variant: any, isSelected: boolean |};

class VariantsUpdate {
  objectFullName: string;
  variantUpdates: Map<string, VariantUpdate>;

  constructor(objectFullName: string) {
    this.objectFullName = objectFullName;
    this.variantUpdates = new Map<string, VariantUpdate>();
  }

  isNodeSelected(): boolean | null {
    let hasAnyUnselectedNode = false;
    let hasAnySelectedNode = false;
    for (const variantUpdate of this.variantUpdates.values()) {
      if (variantUpdate.isSelected) {
        hasAnySelectedNode = true;
      } else {
        hasAnyUnselectedNode = true;
      }
    }
    return hasAnySelectedNode && hasAnyUnselectedNode
      ? null
      : hasAnySelectedNode;
  }

  setSelected(isSelected: boolean): void {
    for (const variantUpdate of this.variantUpdates.values()) {
      variantUpdate.isSelected = isSelected;
    }
  }

  /**
   * @returns Map of serialized `gdEventsBasedObjectVariant`
   */
  getAllSelectedVariants(): Map<string, any> {
    const replacingVariants = new Map<string, any>();
    for (const [variantName, { variant, isSelected }] of this.variantUpdates) {
      if (isSelected) {
        replacingVariants.set(variantName, variant);
      }
    }
    return replacingVariants;
  }
}

/**
 * A list of extensions and variants that can be selected with checkboxes.
 */
const ExtensionAndVariantChooser = ({
  conflictedExtensions,
  conflictedVariantsByObjectType,
}: {|
  conflictedExtensions: Array<ExtensionUpdate>,
  conflictedVariantsByObjectType: Map<string, VariantsUpdate>,
|}): React.Node => {
  const forceUpdate = useForceUpdate();

  return (
    <ColumnStackLayout>
      <Text size="block-title">
        <Trans>Extension updates</Trans>
      </Text>
      {conflictedExtensions.length === 0 ? (
        <Text>
          <Trans>There is no extension to update.</Trans>
        </Text>
      ) : (
        <Text>
          <Trans>
            Some extensions already exist in the project. Please select the ones
            you want to replace.
          </Trans>
        </Text>
      )}
      {conflictedExtensions.map(extensionUpdate => (
        <Checkbox
          key={extensionUpdate.name}
          label={extensionUpdate.label}
          checked={extensionUpdate.isSelected}
          onCheck={(e, checked) => {
            extensionUpdate.isSelected = checked;
            forceUpdate();
          }}
        />
      ))}
      <Text size="block-title">
        <Trans>Variant updates</Trans>
      </Text>
      {conflictedVariantsByObjectType.size === 0 ? (
        <Text>
          <Trans>There is no variant to update.</Trans>
        </Text>
      ) : (
        <Text>
          <Trans>
            Some variants already exist in the project. Please select the ones
            you want to replace.
          </Trans>
        </Text>
      )}
      {[...conflictedVariantsByObjectType.entries()].map(
        ([objectType, variantsUpdate]) => {
          const { objectFullName, variantUpdates } = variantsUpdate;
          const isSelected = variantsUpdate.isNodeSelected();
          return (
            <ColumnStackLayout noMargin key={objectType}>
              <Checkbox
                label={objectFullName}
                checked={!!isSelected}
                indeterminate={isSelected === null}
                onCheck={(e, checked) => {
                  variantsUpdate.setSelected(checked);
                  forceUpdate();
                }}
              />
              <ColumnStackLayout>
                {[...variantUpdates.entries()].map(
                  ([variantName, variantUpdate]) => (
                    <Checkbox
                      key={variantName}
                      label={variantName}
                      checked={variantUpdate.isSelected}
                      onCheck={(e, checked) => {
                        variantUpdate.isSelected = checked;
                        forceUpdate();
                      }}
                    />
                  )
                )}
              </ColumnStackLayout>
            </ColumnStackLayout>
          );
        }
      )}
    </ColumnStackLayout>
  );
};

/**
 * @param project project where the variants are added
 * @param variantsByObjectType Map of serialized `gdEventsBasedObjectVariant`
 */
const addOrReplaceVariants = (
  project: gdProject,
  variantsByObjectType: Map<string, Map<string, any>>
) => {
  for (const [objectType, serializedVariants] of variantsByObjectType) {
    if (project.hasEventsBasedObject(objectType)) {
      const eventsBasedObject = project.getEventsBasedObject(objectType);
      const variants = eventsBasedObject.getVariants();
      for (const [variantName, serializedVariant] of serializedVariants) {
        const variant = variants.hasVariantNamed(variantName)
          ? variants.getVariant(variantName)
          : variants.insertNewVariant(variantName, variants.getVariantsCount());
        unserializeFromJSObject(
          variant,
          serializedVariant,
          'unserializeFrom',
          project
        );
      }
    }
  }
};

type AssetPackContent = {|
  objectAssets: Array<{|
    objectAsset: ObjectAsset,
    folderPathElements: Array<string>,
  |}>,
  /** Map of serialized `gdEventsBasedObjectVariant` */
  newVariantsByObjectType: Map<string, Map<string, any>>,
  conflictedVariantsByObjectType: Map<string, VariantsUpdate>,
  newExtensionNames: Array<string>,
  conflictedExtensions: Array<ExtensionUpdate>,
|};

type Props = {|
  project: gdProject,
  objectsContainer: gdObjectsContainer,
  resourceManagementProps: ResourceManagementProps,
  onEventsBasedObjectChildrenEdited: (
    eventsBasedObject: gdEventsBasedObject
  ) => void,
  onClose: () => void,
|};

const ObjectImporterDialog = ({
  project,
  objectsContainer,
  resourceManagementProps,
  onEventsBasedObjectChildrenEdited,
  onClose,
}: Props): React.Node => {
  const openAssetFile = useOpenAssetFile();
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );

  const [isLoading, setLoading] = React.useState(false);
  const [assetPackBlob, setAssetPackBlob] = React.useState<Blob | null>(null);
  const [
    objectTreeRoot,
    setObjectTreeRoot,
  ] = React.useState<ObjectTreeNode | null>(null);
  const [
    assetPackContent,
    setAssetPackContent,
  ] = React.useState<AssetPackContent | null>(null);

  /**
   * A GDO file is chosen by the user.
   * We read its content to be able to display a tree of objects to select from.
   */
  const chooseAndListAssetPackFile = React.useCallback(
    async () => {
      setLoading(true);
      const { assetPackBlob } = await openAssetFile();
      if (!assetPackBlob) {
        onClose();
        return;
      }
      const allFilePaths = await listArchiveFiles({
        archiveBlob: assetPackBlob,
        onProgress: (count, total) => {},
      });
      const allObjectsList = allFilePaths
        .filter(
          filePath =>
            filePath.startsWith('objects/') && filePath.endsWith('.asset.json')
        )
        .map(filePath => ({
          objectName: path.basename(filePath, '.asset.json'),
          objectFolderPath: path.dirname(filePath).substring('objects/'.length),
          filePath,
        }));
      const objectsByFolder: Array<{|
        objectFolderPath: Array<string>,
        objects: Array<ObjectAssetReference>,
      |}> = [];
      let currentFolderPath: string = allObjectsList[0].objectFolderPath;
      let currentFolderPathElements = currentFolderPath
        .split('/')
        .filter(Boolean);
      let currentObjectList: Array<ObjectAssetReference> = [];
      objectsByFolder.push({
        objectFolderPath: currentFolderPathElements,
        objects: currentObjectList,
      });
      for (const { objectName, objectFolderPath, filePath } of allObjectsList) {
        if (objectFolderPath !== currentFolderPath) {
          currentFolderPath = objectFolderPath;
          currentFolderPathElements = currentFolderPath
            .split('/')
            .filter(Boolean);
          currentObjectList = [];
          objectsByFolder.push({
            objectFolderPath: currentFolderPathElements,
            objects: currentObjectList,
          });
        }
        currentObjectList.push({
          objectName,
          filePath,
          folderPathElements: currentFolderPathElements,
          isSelected: true,
        });
      }
      const objectTreeRoot = new ObjectTreeNode();
      for (const { objectFolderPath, objects } of objectsByFolder) {
        const subFolder = objectTreeRoot.getOrCreateSubFolders(
          objectFolderPath
        );
        subFolder.objects = objects;
      }
      setAssetPackBlob(assetPackBlob);
      setObjectTreeRoot(objectTreeRoot);
      setLoading(false);
    },
    [onClose, openAssetFile]
  );

  /**
   * The user selected the objects to import.
   * We check the object content to list extension and variant updates to select from.
   * It gives a choice between:
   * - keeping the extensions and variants from the project which may have local changes
   * - replace the extensions and variants to get the new revisions or features
   *   from the asset pack
   */
  const checkAssetsConflictWithProject = React.useCallback(
    async () => {
      if (!objectTreeRoot || !assetPackBlob) {
        onClose();
        return;
      }
      setLoading(true);
      const objectAssets: Array<{|
        objectAsset: ObjectAsset,
        folderPathElements: Array<string>,
      |}> = [];
      for (const {
        filePath,
        folderPathElements,
      } of objectTreeRoot.getAllSelectedObjects()) {
        const assetBlob: Blob = await getFileBlob({
          archiveBlob: assetPackBlob,
          filePath,
          contentType: 'application/json',
          onProgress: () => {},
        });
        const assetContainer: { objectAssets: [ObjectAsset] } = JSON.parse(
          await assetBlob.text()
        );
        for (const objectAsset of assetContainer.objectAssets) {
          objectAssets.push({ objectAsset, folderPathElements });
        }
      }

      const conflictedVariantsByObjectType = new Map<string, VariantsUpdate>();
      /** Map of serialized `gdEventsBasedObjectVariant` */
      const newVariantsByObjectType = new Map<string, Map<string, any>>();
      for (const { objectAsset } of objectAssets) {
        const serializedVariants = objectAsset.variants;
        if (serializedVariants) {
          for (const {
            objectType,
            variant: serializedVariant,
          } of serializedVariants) {
            const variantName = serializedVariant.name;
            if (variantName.length === 0) {
              // Variants exported with empty names are default variant.
              // They are ignored because:
              // - They are only a copy of the one from the extension.
              // - User can chose to update them by selecting their extension update.
              // - We must not add variants with empty names.
              continue;
            }
            if (project.hasEventsBasedObject(objectType)) {
              const eventsBasedObject = project.getEventsBasedObject(
                objectType
              );
              const variants = eventsBasedObject.getVariants();
              if (variants.hasVariantNamed(variantName)) {
                const variant = variants.getVariant(variantName);
                if (!variant.getAssetStoreAssetId()) {
                  const conflictedVariants = getOrCreate(
                    conflictedVariantsByObjectType,
                    objectType,
                    () => new VariantsUpdate(eventsBasedObject.getFullName())
                  );
                  conflictedVariants.variantUpdates.set(variantName, {
                    variant: serializedVariant,
                    isSelected: true,
                  });
                }
              } else {
                const newVariants = getOrCreate(
                  newVariantsByObjectType,
                  objectType,
                  () => new Map<string, any>()
                );
                newVariants.set(variantName, serializedVariant);
              }
            } else {
              const newVariants = getOrCreate(
                newVariantsByObjectType,
                objectType,
                () => new Map<string, any>()
              );
              newVariants.set(variantName, serializedVariant);
            }
          }
        }
      }
      const allRequiredExtensionNames = new Map<string, ExtensionDependency>();
      for (const { objectAsset } of objectAssets) {
        const requiredExtensions: Array<ExtensionDependency> =
          objectAsset.requiredExtensions || [];
        if (requiredExtensions) {
          for (const extensionDependency of requiredExtensions) {
            allRequiredExtensionNames.set(
              extensionDependency.extensionName,
              extensionDependency
            );
          }
        }
      }
      const newExtensionNames: Array<string> = [];
      const conflictedExtensions: Array<ExtensionUpdate> = [];
      for (const extensionDependency of allRequiredExtensionNames.values()) {
        const { extensionName, extensionVersion } = extensionDependency;
        if (!project.hasEventsFunctionsExtensionNamed(extensionName)) {
          newExtensionNames.push(extensionName);
        } else {
          const eventsFunctionsExtension = project.getEventsFunctionsExtension(
            extensionName
          );
          if (
            semverGreaterThan(
              extensionVersion,
              eventsFunctionsExtension.getVersion()
            )
          ) {
            conflictedExtensions.push({
              name: extensionName,
              label: `${eventsFunctionsExtension.getFullName()} (${eventsFunctionsExtension.getVersion()} → ${extensionVersion})`,
              isSelected: true,
            });
          } else if (
            extensionVersion === eventsFunctionsExtension.getVersion()
          ) {
            conflictedExtensions.push({
              name: extensionName,
              label: `${eventsFunctionsExtension.getFullName()}`,
              isSelected: false,
            });
          }
        }
      }
      setAssetPackContent({
        objectAssets,
        newVariantsByObjectType,
        conflictedVariantsByObjectType,
        newExtensionNames,
        conflictedExtensions,
      });
      setLoading(false);
    },
    [assetPackBlob, objectTreeRoot, onClose, project]
  );

  /**
   * Import the selected objects, extensions and variants into the project.
   * This is the only step that actually modifies the project.
   */
  const importAssets = React.useCallback(
    async () => {
      if (!assetPackBlob || !assetPackContent) {
        return;
      }
      setLoading(true);
      const {
        objectAssets,
        newVariantsByObjectType,
        conflictedVariantsByObjectType,
        newExtensionNames,
        conflictedExtensions,
      } = assetPackContent;

      /** Map of serialized `gdEventsBasedObjectVariant` */
      const replacingVariantsByObjectType = new Map<string, Map<string, any>>();
      for (const [
        objectType,
        { variantUpdates: conflictedVariants },
      ] of conflictedVariantsByObjectType) {
        const replacingVariants = new Map<string, any>();
        for (const [variantName, { variant }] of conflictedVariants) {
          replacingVariants.set(variantName, variant);
        }
        replacingVariantsByObjectType.set(objectType, replacingVariants);
      }
      const replacingExtensionNames = conflictedExtensions
        .filter(({ isSelected }) => isSelected)
        .map(({ name }) => name);

      /** Map of serialized `gdResource` */
      const allRequiredResources = new Map<string, any>();
      for (const { objectAsset } of objectAssets) {
        const resources: Array<any> = objectAsset.resources;
        for (const resource of resources) {
          allRequiredResources.set(resource.name, resource);
        }
      }
      let hasAddedAnyResource = false;
      const resourcesManager: gdResourcesContainer = project.getResourcesManager();
      for (const [resourceName, serializedResource] of allRequiredResources) {
        if (resourcesManager.hasResource(resourceName)) {
          continue;
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
        newResource.setName(serializedResource.name);

        const resourceBlob: Blob = await getFileBlob({
          archiveBlob: assetPackBlob,
          filePath: 'resources/' + newResource.getFile().replace('\\', '/'),
          contentType: '',
          onProgress: () => {},
        });
        newResource.setFile(URL.createObjectURL(resourceBlob));

        resourcesManager.addResource(newResource);
        hasAddedAnyResource = true;
        newResource.delete();
      }

      /** List of serialized `gdEventsFunctionsExtension` */
      const serializedExtensions: Array<any> = [];
      for (const extensionName of [
        ...newExtensionNames,
        ...replacingExtensionNames,
      ]) {
        const extensionBlob: Blob = await getFileBlob({
          archiveBlob: assetPackBlob,
          filePath: `extensions/${extensionName}.json`,
          contentType: '',
          onProgress: () => {},
        });
        const serializedExtension = JSON.parse(await extensionBlob.text());
        serializedExtensions.push(serializedExtension);
      }
      await addSerializedExtensionsToProject(
        eventsFunctionsExtensionsState,
        project,
        serializedExtensions,
        []
      );

      addOrReplaceVariants(project, newVariantsByObjectType);
      addOrReplaceVariants(project, replacingVariantsByObjectType);

      for (const { objectAsset, folderPathElements } of objectAssets) {
        const objectType: ?string = objectAsset.object.type;
        if (!objectType) throw new Error('An object has no type specified');

        const originalName = gd.Project.getSafeName(objectAsset.object.name);
        const newName = newNameGenerator(originalName, name =>
          objectsContainer.hasObjectNamed(name)
        );

        const objectFolder = getOrCreateObjectFolder(
          objectsContainer.getRootFolder(),
          folderPathElements
        );
        const object = objectsContainer.insertNewObjectInFolder(
          project,
          objectType,
          newName,
          objectFolder,
          objectsContainer.getObjectsCount()
        );
        unserializeFromJSObject(
          object,
          objectAsset.object,
          'unserializeFrom',
          project
        );
        // The name was overwritten after unserialization.
        object.setName(newName);
        object.resetPersistentUuid();
      }

      onClose();
      setLoading(false);
      if (hasAddedAnyResource) {
        await resourceManagementProps.onFetchNewlyAddedResources();
        resourceManagementProps.onNewResourcesAdded();
      }
      for (const objectType of replacingVariantsByObjectType.keys()) {
        if (project.hasEventsBasedObject(objectType)) {
          const eventsBasedObject = project.getEventsBasedObject(objectType);
          onEventsBasedObjectChildrenEdited(eventsBasedObject);
        }
      }
    },
    [
      assetPackBlob,
      assetPackContent,
      eventsFunctionsExtensionsState,
      objectsContainer,
      onClose,
      onEventsBasedObjectChildrenEdited,
      project,
      resourceManagementProps,
    ]
  );

  React.useEffect(
    () => {
      chooseAndListAssetPackFile();
    },
    // Open the file chooser dialog only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Dialog
      title={<Trans>Import assets</Trans>}
      actions={[
        <FlatButton
          label={<Trans>Cancel</Trans>}
          onClick={onClose}
          key="cancel"
        />,
        assetPackContent ? (
          <RaisedButton
            label={<Trans>Import</Trans>}
            primary
            keyboardFocused={true}
            onClick={importAssets}
            key="import"
          />
        ) : (
          <RaisedButton
            label={<Trans>Next</Trans>}
            primary
            keyboardFocused={true}
            onClick={checkAssetsConflictWithProject}
            key="check-assets"
          />
        ),
      ]}
      open
      onRequestClose={onClose}
      maxWidth="sm"
      fullHeight
    >
      <ColumnStackLayout expand>
        <AlertMessage kind="warning">
          <Trans>
            Assets import can't be undone. Make sure to backup your project
            beforehand.
          </Trans>
        </AlertMessage>
        {assetPackContent ? (
          <ExtensionAndVariantChooser
            conflictedExtensions={assetPackContent.conflictedExtensions}
            conflictedVariantsByObjectType={
              assetPackContent.conflictedVariantsByObjectType
            }
          />
        ) : objectTreeRoot ? (
          <ColumnStackLayout expand noMargin>
            <Text size="block-title">
              <Trans>Assets</Trans>
            </Text>
            <Text>Choose the assets to import.</Text>
            <SelectableObjectTreeNode
              node={objectTreeRoot}
              onSelectionChanged={() => {}}
            />
          </ColumnStackLayout>
        ) : (
          <Column alignItems="center">
            <RaisedButton
              icon={<Upload />}
              primary
              label={<Trans>Choose a pack</Trans>}
              onClick={chooseAndListAssetPackFile}
            />
          </Column>
        )}
        {isLoading ? <LoaderModal showImmediately /> : null}
      </ColumnStackLayout>
    </Dialog>
  );
};

export default ObjectImporterDialog;
