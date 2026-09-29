// @flow
import { Trans, t } from '@lingui/macro';
import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import { Column } from '../UI/Grid';
import { ColumnStackLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import Text from '../UI/Text';
import Upload from '../UI/CustomSvgIcons/Upload';
import { listArchiveFiles, openArchive } from '../Utils/BrowserArchiver';
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
import semverValid from 'semver/functions/valid';
import { addSerializedExtensionsToProject } from '../AssetStore/ExtensionStore/InstallExtension';
import newNameGenerator from '../Utils/NewNameGenerator';
import { GenericRetryableProcessWithProgressDialog } from '../Utils/UseGenericRetryableProcessWithProgress';
import AlertMessage from '../UI/AlertMessage';
import { getOrCreate } from '../Utils/Map';
import { unserializeResourceFromJSObject } from '../Utils/Serializer';
import { complyVariantsToEventsBasedObjectOf } from '../AssetStore/InstallAsset';
import { isURL, isBlobURL } from '../ResourcesList/ResourceUtils';
import useAlertDialog from '../UI/Alert/useAlertDialog';

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

  getObjectCount(): number {
    let objectCount = this.objects.length;
    for (const folder of this.folders.values()) {
      objectCount += folder.getObjectCount();
    }
    return objectCount;
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
          label={extensionUpdate.label || extensionUpdate.name}
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
  complyVariantsToEventsBasedObjectOf(project, [
    ...variantsByObjectType.keys(),
  ]);
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
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  onClose: () => void,
|};

/**
 * Return the path of a resource file inside the archive.
 * Resources stored as URLs are exported under their URL, but zip entries
 * can't contain consecutive slashes ("https://" is stored as "https:/").
 */
const getResourceArchivePath = (resourceFile: string): string =>
  ('resources/' + resourceFile).replace(/\\/g, '/').replace(/\/+/g, '/');

type LoadingStep =
  | 'opening-pack'
  | 'reading-pack-objects'
  | 'reading-selected-objects'
  | 'importing-resources'
  | 'installing-extensions'
  | 'adding-objects';

type LoadingProgress = {|
  step: LoadingStep,
  /** Number of the item being processed in the step, starting at 1. */
  loadedCount: number,
  totalCount: number,
  /**
   * Progress of the whole action, from 0 to 100. Import steps share it,
   * so that the bar doesn't go back to 0 between them.
   */
  progress: number,
|};

const getProgress = (processedCount: number, totalCount: number): number =>
  (100 * processedCount) / Math.max(1, totalCount);

const getLoadingMessage = ({
  step,
  loadedCount,
  totalCount,
}: LoadingProgress): React.Node => {
  switch (step) {
    case 'opening-pack':
      return <Trans>Opening the pack...</Trans>;
    case 'reading-pack-objects':
      return (
        <Trans>
          Reading the objects of the pack ({loadedCount}/{totalCount})
        </Trans>
      );
    case 'reading-selected-objects':
      return (
        <Trans>
          Reading the selected objects ({loadedCount}/{totalCount})
        </Trans>
      );
    case 'importing-resources':
      return (
        <Trans>
          Importing the files used by the objects ({loadedCount}/{totalCount})
        </Trans>
      );
    case 'installing-extensions':
      return (
        <Trans>
          Installing extensions ({loadedCount}/{totalCount})
        </Trans>
      );
    case 'adding-objects':
    default:
      return (
        <Trans>
          Adding objects ({loadedCount}/{totalCount})
        </Trans>
      );
  }
};

class ImportCancelledError extends Error {}

const ObjectImporterDialog = ({
  project,
  objectsContainer,
  resourceManagementProps,
  onEventsBasedObjectChildrenEdited,
  onWillInstallExtension,
  onExtensionInstalled,
  onClose,
}: Props): React.Node => {
  const openAssetFile = useOpenAssetFile();
  const forceUpdate = useForceUpdate();
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );

  const { showAlert } = useAlertDialog();
  const [isLoading, setLoading] = React.useState(false);
  const [
    loadingProgress,
    setLoadingProgress,
  ] = React.useState<?LoadingProgress>(null);
  const [isCancelable, setCancelable] = React.useState(false);
  const isCancelRequestedRef = React.useRef(false);
  const throwIfCancelRequested = React.useCallback(() => {
    if (isCancelRequestedRef.current) {
      throw new ImportCancelledError();
    }
  }, []);

  /**
   * Run a step of the import and display any error in a dialog
   * instead of leaving an unhandled promise rejection.
   */
  const runWithErrorAlert = React.useCallback(
    (step: () => Promise<void>) => async () => {
      isCancelRequestedRef.current = false;
      setCancelable(true);
      try {
        await step();
      } catch (error) {
        setLoading(false);
        setLoadingProgress(null);
        if (error instanceof ImportCancelledError) {
          console.info('[ObjectImporter] Cancelled by the user.');
          return;
        }
        console.error('Error while importing assets:', error);
        await showAlert({
          title: t`Could not import assets`,
          message:
            t`An error happened while importing the assets:` +
            '\n' +
            String((error && error.message) || error),
        });
      } finally {
        setCancelable(false);
      }
    },
    [showAlert]
  );
  const [assetPackBlob, setAssetPackBlob] = React.useState<Blob | null>(null);
  const [
    archiveFilePaths,
    setArchiveFilePaths,
  ] = React.useState<Set<string> | null>(null);
  const [missingFilePaths, setMissingFilePaths] = React.useState<Array<string>>(
    []
  );
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
      // The file count is unknown until the archive is listed.
      setLoadingProgress({
        step: 'opening-pack',
        loadedCount: 0,
        totalCount: 0,
        progress: 0,
      });
      console.info(
        `[ObjectImporter] Listing the files of the pack (${
          assetPackBlob.size
        } bytes)...`
      );
      const allFilePaths = await listArchiveFiles({
        archiveBlob: assetPackBlob,
        onProgress: (count, total) => {},
      });
      console.info(`[ObjectImporter] ${allFilePaths.length} files listed.`);
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
      const archiveReader = await openArchive(assetPackBlob);
      console.info('[ObjectImporter] Pack opened, reading its objects...');
      const allFilePathsSet = new Set<string>(allFilePaths);
      const missingFilePathsSet = new Set<string>();
      let readAssetCount = 0;
      for (const { filePath } of allObjectsList) {
        throwIfCancelRequested();
        readAssetCount++;
        setLoadingProgress({
          step: 'reading-pack-objects',
          loadedCount: readAssetCount,
          totalCount: allObjectsList.length,
          progress: getProgress(readAssetCount, allObjectsList.length),
        });
        try {
          const assetBlob: Blob = await archiveReader.getFileBlob(
            filePath,
            'application/json'
          );
          const assetContainer: {
            objectAssets: Array<ObjectAsset>,
          } = JSON.parse(await assetBlob.text());
          for (const objectAsset of assetContainer.objectAssets) {
            for (const resource of objectAsset.resources || []) {
              const resourceFilePath = getResourceArchivePath(resource.file);
              // A resource stored as a URL can still be loaded from its URL.
              if (
                !isURL(resource.file) &&
                !allFilePathsSet.has(resourceFilePath)
              ) {
                missingFilePathsSet.add(resourceFilePath);
              }
            }
            for (const { extensionName } of objectAsset.requiredExtensions ||
              []) {
              const extensionFilePath = `extensions/${extensionName}.json`;
              if (
                !allFilePathsSet.has(extensionFilePath) &&
                !project.hasEventsFunctionsExtensionNamed(extensionName)
              ) {
                missingFilePathsSet.add(extensionFilePath);
              }
            }
          }
        } catch (error) {
          console.error(`Unable to read the asset "${filePath}":`, error);
          missingFilePathsSet.add(filePath);
        }
      }
      await archiveReader.close();
      setArchiveFilePaths(allFilePathsSet);
      setMissingFilePaths([...missingFilePathsSet]);
      if (missingFilePathsSet.size > 0) {
        showAlert({
          title: t`Some files are missing from this pack`,
          message:
            t`The assets using these files will be imported without them:` +
            '\n' +
            [...missingFilePathsSet]
              .map(filePath => '- ' + filePath)
              .join('\n'),
        });
      }

      const objectTreeRoot = new ObjectTreeNode();
      for (const { objectFolderPath, objects } of objectsByFolder) {
        const subFolder = objectTreeRoot.getOrCreateSubFolders(
          objectFolderPath
        );
        // Archive entries are not sorted by folder: the same folder can come
        // back several times, so its objects must be appended.
        subFolder.objects.push(...objects);
      }
      console.info('[ObjectImporter] Pack opened:', {
        archiveFileCount: allFilePaths.length,
        assetFileCount: allObjectsList.length,
        assetFilePaths: allObjectsList.map(({ filePath }) => filePath),
        missingFilePaths: [...missingFilePathsSet],
      });
      setLoadingProgress(null);
      setAssetPackBlob(assetPackBlob);
      setObjectTreeRoot(objectTreeRoot);
      setLoading(false);
    },
    [onClose, openAssetFile, project, showAlert, throwIfCancelRequested]
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
      console.info('[ObjectImporter] Reading the selected assets...');
      setLoading(true);
      const objectAssets: Array<{|
        objectAsset: ObjectAsset,
        folderPathElements: Array<string>,
      |}> = [];
      const archiveReader = await openArchive(assetPackBlob);
      const selectedObjects = objectTreeRoot.getAllSelectedObjects();
      let readSelectedAssetCount = 0;
      for (const { filePath, folderPathElements } of selectedObjects) {
        throwIfCancelRequested();
        readSelectedAssetCount++;
        setLoadingProgress({
          step: 'reading-selected-objects',
          loadedCount: readSelectedAssetCount,
          totalCount: selectedObjects.length,
          progress: getProgress(readSelectedAssetCount, selectedObjects.length),
        });
        const assetBlob: Blob = await archiveReader.getFileBlob(
          filePath,
          'application/json'
        );
        const assetContainer: { objectAssets: [ObjectAsset] } = JSON.parse(
          await assetBlob.text()
        );
        for (const objectAsset of assetContainer.objectAssets) {
          objectAssets.push({ objectAsset, folderPathElements });
        }
      }

      await archiveReader.close();
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
          const isExtensionUpdate =
            semverValid(extensionVersion) &&
            semverValid(eventsFunctionsExtension.getVersion()) &&
            semverGreaterThan(
              extensionVersion,
              eventsFunctionsExtension.getVersion()
            );
          if (isExtensionUpdate) {
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
      console.info('[ObjectImporter] Selected assets analyzed:', {
        selectedObjectCount: objectAssets.length,
        selectedObjects: objectAssets.map(
          ({ objectAsset, folderPathElements }) =>
            [...folderPathElements, objectAsset.object.name].join('/')
        ),
        newExtensionNames,
        conflictedExtensions,
        newVariantTypes: [...newVariantsByObjectType.keys()],
        conflictedVariantTypes: [...conflictedVariantsByObjectType.keys()],
      });
      setLoadingProgress(null);
      setAssetPackContent({
        objectAssets,
        newVariantsByObjectType,
        conflictedVariantsByObjectType,
        newExtensionNames,
        conflictedExtensions,
      });
      setLoading(false);
    },
    [assetPackBlob, objectTreeRoot, onClose, project, throwIfCancelRequested]
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
      console.info('[ObjectImporter] Importing the assets...');
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
      const extensionNamesToInstall = [
        ...newExtensionNames,
        ...replacingExtensionNames,
      ];
      // Resources are only added to the project once every file is read,
      // so that cancelling the import leaves the project untouched.
      const pendingResources: Array<{|
        resourceName: string,
        resource: gdResource,
      |}> = [];
      const releasePendingResources = () => {
        for (const { resource } of pendingResources) {
          if (isBlobURL(resource.getFile())) {
            URL.revokeObjectURL(resource.getFile());
          }
          resource.delete();
        }
        pendingResources.length = 0;
      };
      /** List of serialized `gdEventsFunctionsExtension` */
      const serializedExtensions: Array<any> = [];
      const importItemCount =
        allRequiredResources.size +
        extensionNamesToInstall.length +
        objectAssets.length;
      let importedItemCount = 0;
      const getImportProgress = () =>
        getProgress(++importedItemCount, importItemCount);
      const archiveReader = await openArchive(assetPackBlob);
      try {
        let importedResourceCount = 0;
        for (const [resourceName, serializedResource] of allRequiredResources) {
          throwIfCancelRequested();
          setLoadingProgress({
            step: 'importing-resources',
            loadedCount: ++importedResourceCount,
            totalCount: allRequiredResources.size,
            progress: getImportProgress(),
          });
          if (resourcesManager.hasResource(resourceName)) {
            continue;
          }
          const resourceKindMetadata = allResourceKindsAndMetadata.find(
            resourceKind => resourceKind.kind === serializedResource.kind
          );
          if (!resourceKindMetadata) {
            console.error(
              `Resource of kind "${serializedResource.kind}" is not supported.`
            );
            continue;
          }
          // The resource does not exist yet, add it. Note that the "origin" will be preserved.
          const newResource = resourceKindMetadata.createNewResource();
          unserializeResourceFromJSObject(newResource, serializedResource);

          const resourceFilePath = getResourceArchivePath(
            newResource.getFile()
          );
          if (archiveFilePaths && archiveFilePaths.has(resourceFilePath)) {
            const resourceBlob: Blob = await archiveReader.getFileBlob(
              resourceFilePath,
              ''
            );
            newResource.setFile(URL.createObjectURL(resourceBlob));
          } else if (!isURL(newResource.getFile())) {
            console.warn(
              `The archive doesn't contain the file of the resource "${resourceName}": ${resourceFilePath}`
            );
          }
          // Otherwise, the resource is kept with its URL.

          pendingResources.push({ resourceName, resource: newResource });
        }

        let readExtensionCount = 0;
        for (const extensionName of extensionNamesToInstall) {
          throwIfCancelRequested();
          setLoadingProgress({
            step: 'installing-extensions',
            loadedCount: ++readExtensionCount,
            totalCount: extensionNamesToInstall.length,
            progress: getImportProgress(),
          });
          const extensionFilePath = `extensions/${extensionName}.json`;
          if (!archiveFilePaths || !archiveFilePaths.has(extensionFilePath)) {
            console.warn(
              `The archive doesn't contain the extension: ${extensionFilePath}`
            );
            continue;
          }
          const extensionBlob: Blob = await archiveReader.getFileBlob(
            extensionFilePath,
            ''
          );
          const serializedExtension = JSON.parse(await extensionBlob.text());
          serializedExtensions.push(serializedExtension);
        }
        throwIfCancelRequested();
      } catch (error) {
        releasePendingResources();
        throw error;
      } finally {
        await archiveReader.close();
      }

      // From here, the project is modified: the import can't be cancelled.
      setCancelable(false);
      for (const { resourceName, resource } of pendingResources) {
        console.info(
          '[ObjectImporter] Resource added:',
          resourceName,
          resource.getFile()
        );
        resourcesManager.addResource(resource);
        resource.delete();
        hasAddedAnyResource = true;
      }
      pendingResources.length = 0;
      const installedExtensionNames = serializedExtensions.map(
        extensions => extensions.name
      );
      onWillInstallExtension(installedExtensionNames);
      console.info(
        '[ObjectImporter] Installing extensions:',
        installedExtensionNames
      );
      await addSerializedExtensionsToProject(
        eventsFunctionsExtensionsState,
        project,
        serializedExtensions,
        []
      );
      onExtensionInstalled(installedExtensionNames);

      console.info('[ObjectImporter] Adding variants.');
      addOrReplaceVariants(project, newVariantsByObjectType);
      addOrReplaceVariants(project, replacingVariantsByObjectType);

      let addedObjectCount = 0;
      for (const { objectAsset, folderPathElements } of objectAssets) {
        setLoadingProgress({
          step: 'adding-objects',
          loadedCount: ++addedObjectCount,
          totalCount: objectAssets.length,
          progress: getImportProgress(),
        });
        const objectType: ?string = objectAsset.object.type;
        if (!objectType) {
          console.log('An object has no type specified');
          continue;
        }

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
        console.info('[ObjectImporter] Object added:', newName, objectType);
        object.resetPersistentUuid();
      }

      console.info('[ObjectImporter] Import done.');
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
      archiveFilePaths,
      assetPackContent,
      eventsFunctionsExtensionsState,
      objectsContainer,
      onClose,
      onEventsBasedObjectChildrenEdited,
      throwIfCancelRequested,
      onExtensionInstalled,
      onWillInstallExtension,
      project,
      resourceManagementProps,
    ]
  );

  React.useEffect(
    () => {
      runWithErrorAlert(chooseAndListAssetPackFile)();
    },
    // Open the file chooser dialog only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const selectedObjectCount = objectTreeRoot
    ? objectTreeRoot.getAllSelectedObjects().length
    : 0;
  const totalObjectCount = objectTreeRoot ? objectTreeRoot.getObjectCount() : 0;

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
            onClick={runWithErrorAlert(importAssets)}
            key="import"
          />
        ) : (
          <RaisedButton
            label={<Trans>Next</Trans>}
            primary
            keyboardFocused={true}
            onClick={runWithErrorAlert(checkAssetsConflictWithProject)}
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
        {missingFilePaths.length > 0 && (
          <AlertMessage kind="warning">
            <Text noMargin>
              <Trans>
                Some files are missing from this pack. The assets using them
                will be imported without these files:
              </Trans>
            </Text>
            {missingFilePaths.map(missingFilePath => (
              <Text noMargin key={missingFilePath}>
                {'- ' + missingFilePath}
              </Text>
            ))}
          </AlertMessage>
        )}
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
            <Text>
              <Trans>
                Choose the assets to import ({selectedObjectCount}/
                {totalObjectCount} selected).
              </Trans>
            </Text>
            <SelectableObjectTreeNode
              node={objectTreeRoot}
              onSelectionChanged={forceUpdate}
            />
          </ColumnStackLayout>
        ) : (
          <Column alignItems="center">
            <RaisedButton
              icon={<Upload />}
              primary
              label={<Trans>Choose a pack</Trans>}
              onClick={runWithErrorAlert(chooseAndListAssetPackFile)}
            />
          </Column>
        )}
        {isLoading ? (
          <GenericRetryableProcessWithProgressDialog
            title={<Trans>Importing assets</Trans>}
            message={
              loadingProgress ? getLoadingMessage(loadingProgress) : null
            }
            progress={loadingProgress ? loadingProgress.progress : 0}
            result={null}
            genericError={null}
            onAbandon={null}
            onRetry={null}
            onCancel={
              isCancelable
                ? () => {
                    isCancelRequestedRef.current = true;
                  }
                : null
            }
          />
        ) : null}
      </ColumnStackLayout>
    </Dialog>
  );
};

export default ObjectImporterDialog;
