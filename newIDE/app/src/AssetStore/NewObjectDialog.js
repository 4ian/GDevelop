// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import HelpButton from '../UI/HelpButton';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { sendAssetAddedToProject } from '../Utils/Analytics/EventSender';
import { AssetStoreContext } from './AssetStoreContext';
import {
  installPublicAsset,
  checkRequiredExtensionsUpdateForAssets,
  type InstallAssetOutput,
  complyVariantsToEventsBasedObjectOf,
} from './InstallAsset';
import { checkRequiredExtensionsUpdate } from './ExtensionStore/InstallExtension';
import {
  type Asset,
  type AssetShortHeader,
  getPublicAsset,
  isPrivateAsset,
} from '../Utils/GDevelopServices/Asset';
import PrivateAssetsAuthorizationContext from './PrivateAssets/PrivateAssetsAuthorizationContext';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import PromisePool from '@supercharge/promise-pool';
import NewObjectFromScratch from './NewObjectFromScratch';
import ErrorBoundary from '../UI/ErrorBoundary';
import type { ObjectFolderOrObjectWithContext } from '../ObjectsList/EnumerateObjectFolderOrObject';
import LoaderModal from '../UI/LoaderModal';
import { AssetStoreNavigatorContext } from './AssetStoreNavigator';
import uniq from 'lodash/uniq';
import { useInstallExtension } from './ExtensionStore/InstallExtension';
import { ExtensionStoreContext } from './ExtensionStore/ExtensionStoreContext';
import { type ObjectShortHeader } from '../Utils/GDevelopServices/Extension';

const gd: libGDevelop = global.gd;

export const useProjectNeedToBeSavedAlertDialog = (
  canInstallPrivateAsset: () => boolean
): ((assetShortHeader: AssetShortHeader) => Promise<boolean>) => {
  const { showAlert } = useAlertDialog();
  return async (assetShortHeader: AssetShortHeader): Promise<boolean> => {
    const isPrivate = isPrivateAsset(assetShortHeader);
    if (isPrivate) {
      const canUserInstallPrivateAsset = await canInstallPrivateAsset();
      if (!canUserInstallPrivateAsset) {
        await showAlert({
          title: t`Save your project`,
          message: t`You need to save this project as a cloud project to install this asset. Please save your project and try again.`,
        });
        return true;
      }
    }
    return false;
  };
};

export const useFetchAssets = (): ((
  assetShortHeaders: Array<AssetShortHeader>
) => Promise<Array<Asset>>) => {
  const { environment } = React.useContext(AssetStoreContext);

  const { fetchPrivateAsset } = React.useContext(
    PrivateAssetsAuthorizationContext
  );

  return async (
    assetShortHeaders: Array<AssetShortHeader>
  ): Promise<Array<Asset>> => {
    const fetchedAssets = await PromisePool.withConcurrency(6)
      .for(assetShortHeaders)
      .process<Asset>(async assetShortHeader => {
        const asset = isPrivateAsset(assetShortHeader)
          ? await fetchPrivateAsset(assetShortHeader, {
              environment,
            })
          : await getPublicAsset(assetShortHeader, { environment });
        if (!asset) {
          throw new Error(
            'Unable to install the asset because it could not be fetched.'
          );
        }
        return asset;
      });
    if (fetchedAssets.errors.length) {
      throw new Error(
        'Error(s) while installing assets. The first error is: ' +
          fetchedAssets.errors[0].message
      );
    }
    const assets = fetchedAssets.results;
    return assets;
  };
};

export const useInstallAsset = ({
  project,
  targetObjectFolderOrObjectWithContext,
  resourceManagementProps,
  onWillInstallExtension,
  onExtensionInstalled,
}: {|
  project: ?gdProject,
  targetObjectFolderOrObjectWithContext?: ?ObjectFolderOrObjectWithContext,
  resourceManagementProps: ResourceManagementProps,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
|}): (({
  assetShortHeader: AssetShortHeader,
  objectsContainer: gdObjectsContainer,
  requestedObjectName?: string,
  setIsAssetBeingInstalled: boolean => void,
}) => Promise<InstallAssetOutput | null>) => {
  const shopNavigationState = React.useContext(AssetStoreNavigatorContext);
  const { openedAssetPack } = shopNavigationState.getCurrentPage();
  const { installPrivateAsset } = React.useContext(
    PrivateAssetsAuthorizationContext
  );
  const { showAlert } = useAlertDialog();
  const fetchAssets = useFetchAssets();
  const showProjectNeedToBeSaved = useProjectNeedToBeSavedAlertDialog(
    resourceManagementProps.canInstallPrivateAsset
  );
  const {
    translatedExtensionShortHeadersByName: extensionShortHeadersByName,
  } = React.useContext(ExtensionStoreContext);
  const installExtension = useInstallExtension();

  return async ({
    assetShortHeader,
    objectsContainer,
    requestedObjectName,
    setIsAssetBeingInstalled,
  }: {|
    assetShortHeader: AssetShortHeader,
    objectsContainer: gdObjectsContainer,
    requestedObjectName?: string,
    setIsAssetBeingInstalled: boolean => void,
  |}): Promise<InstallAssetOutput | null> => {
    if (!project) {
      return null;
    }
    try {
      setIsAssetBeingInstalled(false);
      if (await showProjectNeedToBeSaved(assetShortHeader)) {
        return null;
      }
      setIsAssetBeingInstalled(true);
      const assets = await fetchAssets([assetShortHeader]);
      const asset = assets[0];

      const requiredExtensionInstallation = await checkRequiredExtensionsUpdateForAssets(
        {
          assets,
          project,
          extensionShortHeadersByName,
        }
      );
      // Disable the loader because it is above the dialogs opened by `installExtension`.
      setIsAssetBeingInstalled(false);
      const wasExtensionsInstalled = await installExtension({
        project,
        requiredExtensionInstallation,
        importedSerializedExtensions: [],
        onWillInstallExtension,
        onExtensionInstalled,
        updateMode: 'all',
        reason: 'asset',
      });
      setIsAssetBeingInstalled(true);
      if (!wasExtensionsInstalled) {
        return null;
      }

      const isTheFirstOfItsTypeInProject = uniq(
        asset.objectAssets.map(objectAsset => objectAsset.object.type)
      ).some(
        objectType => !gd.UsedObjectTypeFinder.scanProject(project, objectType)
      );

      const isPrivate = isPrivateAsset(assetShortHeader);
      const addAssetOutput = isPrivate
        ? await installPrivateAsset({
            asset,
            project,
            objectsContainer,
            requestedObjectName,
            targetObjectFolderOrObject:
              targetObjectFolderOrObjectWithContext &&
              !targetObjectFolderOrObjectWithContext.global
                ? targetObjectFolderOrObjectWithContext.objectFolderOrObject
                : null,
          })
        : await installPublicAsset({
            asset,
            project,
            objectsContainer,
            requestedObjectName,
            targetObjectFolderOrObject:
              targetObjectFolderOrObjectWithContext &&
              !targetObjectFolderOrObjectWithContext.global
                ? targetObjectFolderOrObjectWithContext.objectFolderOrObject
                : null,
          });
      if (!addAssetOutput) {
        throw new Error('Unable to install private Asset.');
      }
      sendAssetAddedToProject({
        id: assetShortHeader.id,
        name: assetShortHeader.name,
        assetPackName: openedAssetPack ? openedAssetPack.name : null,
        assetPackTag: openedAssetPack ? openedAssetPack.tag : null,
        assetPackId:
          openedAssetPack && openedAssetPack.id ? openedAssetPack.id : null,
        assetPackKind: isPrivate ? 'private' : 'public',
      });
      complyVariantsToEventsBasedObjectOf(
        project,
        addAssetOutput.createdObjects
      );

      await resourceManagementProps.onFetchNewlyAddedResources();
      resourceManagementProps.onNewResourcesAdded();

      return {
        createdObjects: addAssetOutput.createdObjects,
        isTheFirstOfItsTypeInProject,
      };
    } catch (error) {
      console.error('Error while installing the asset:', error);
      showAlert({
        title: t`Could not install the asset`,
        message: t`There was an error while installing the asset "${
          assetShortHeader.name
        }". Verify your internet connection or try again later.`,
      });
      return null;
    }
  };
};

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  eventsBasedObject: gdEventsBasedObject | null,
  objectsContainer: gdObjectsContainer,
  resourceManagementProps: ResourceManagementProps,
  onClose: () => void,
  onCreateNewObject: (type: string) => void,
  targetObjectFolderOrObjectWithContext?: ?ObjectFolderOrObjectWithContext,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
|};

function NewObjectDialog({
  project,
  eventsFunctionsExtension,
  eventsBasedObject,
  onClose,
  onCreateNewObject,
  onWillInstallExtension,
  onExtensionInstalled,
}: Props) {
  const [
    isAssetBeingInstalled,
    setIsAssetBeingInstalled,
  ] = React.useState<boolean>(false);
  const { showAlert } = useAlertDialog();

  const {
    translatedExtensionShortHeadersByName: extensionShortHeadersByName,
  } = React.useContext(ExtensionStoreContext);
  const installExtension = useInstallExtension();

  const onInstallEmptyCustomObject = React.useCallback(
    async (enumeratedObjectMetadata: ObjectShortHeader) => {
      const { requiredExtensions } = enumeratedObjectMetadata;
      if (!requiredExtensions) return;
      try {
        setIsAssetBeingInstalled(true);
        const requiredExtensionInstallation = await checkRequiredExtensionsUpdate(
          {
            requiredExtensions,
            project,
            extensionShortHeadersByName,
          }
        );
        const wasExtensionsInstalled = await installExtension({
          project,
          requiredExtensionInstallation,
          importedSerializedExtensions: [],
          onWillInstallExtension,
          onExtensionInstalled,
          // Users must be able to create an object from scratch without being
          // forced to update extensions that may break their projects.
          updateMode: 'safeOnly',
          reason: 'asset',
        });
        if (!wasExtensionsInstalled) {
          return;
        }
        onCreateNewObject(enumeratedObjectMetadata.type);
      } catch (error) {
        console.error('Error while creating the object:', error);
        showAlert({
          title: t`Could not create the object`,
          message: t`There was an error while creating the object "${
            enumeratedObjectMetadata.fullName
          }". Verify your internet connection or try again later.`,
        });
      } finally {
        setIsAssetBeingInstalled(false);
      }
    },
    [
      project,
      extensionShortHeadersByName,
      installExtension,
      onWillInstallExtension,
      onExtensionInstalled,
      onCreateNewObject,
      showAlert,
    ]
  );

  const handleClose = React.useCallback(
    () => {
      onClose();
    },
    [onClose]
  );

  const onObjectTypeSelected = React.useCallback(
    (enumeratedObjectMetadata: ObjectShortHeader) => {
      if (
        enumeratedObjectMetadata.requiredExtensions &&
        enumeratedObjectMetadata.requiredExtensions.length
      ) {
        onInstallEmptyCustomObject(enumeratedObjectMetadata);
      } else {
        onCreateNewObject(enumeratedObjectMetadata.name);
      }
    },
    [onCreateNewObject, onInstallEmptyCustomObject]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Dialog
            title={<Trans>New object</Trans>}
            secondaryActions={[
              <HelpButton helpPagePath="/objects" key="help" />,
            ]}
            actions={[
              <FlatButton
                key="close"
                label={<Trans>Close</Trans>}
                primary={false}
                onClick={handleClose}
                id="close-button"
              />,
            ]}
            onRequestClose={handleClose}
            open
            flexBody
            fullHeight
            id="new-object-dialog"
          >
            <NewObjectFromScratch
              project={project}
              eventsFunctionsExtension={eventsFunctionsExtension}
              eventsBasedObject={eventsBasedObject}
              onObjectTypeSelected={onObjectTypeSelected}
              i18n={i18n}
            />
          </Dialog>
          {isAssetBeingInstalled && <LoaderModal showImmediately />}
        </>
      )}
    </I18n>
  );
}

const NewObjectDialogWithErrorBoundary = (props: Props): React.Node => (
  <ErrorBoundary
    componentTitle={<Trans>New Object dialog</Trans>}
    scope="new-object-dialog"
    onClose={props.onClose}
  >
    <NewObjectDialog {...props} />
  </ErrorBoundary>
);

export default NewObjectDialogWithErrorBoundary;
