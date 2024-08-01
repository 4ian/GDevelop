// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import HelpButton from '../UI/HelpButton';
import { AssetStore, type AssetStoreInterface } from '.';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { sendAssetAddedToProject } from '../Utils/Analytics/EventSender';
import RaisedButton from '../UI/RaisedButton';
import { AssetStoreContext } from './AssetStoreContext';
import AssetPackInstallDialog from './AssetPackInstallDialog';
import {
  installRequiredExtensions,
  installPublicAsset,
  checkRequiredExtensionsUpdateForAssets,
} from './InstallAsset';
import {
  type Asset,
  type AssetShortHeader,
  getPublicAsset,
  isPrivateAsset,
} from '../Utils/GDevelopServices/Asset';
import { type ExtensionShortHeader } from '../Utils/GDevelopServices/Extension';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import Window from '../Utils/Window';
import PrivateAssetsAuthorizationContext from './PrivateAssets/PrivateAssetsAuthorizationContext';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { enumerateAssetStoreIds } from './EnumerateAssetStoreIds';
import PromisePool from '@supercharge/promise-pool';
import { getAssetShortHeadersToDisplay } from './AssetsList';
import ErrorBoundary from '../UI/ErrorBoundary';
import type { ObjectFolderOrObjectWithContext } from '../ObjectsList/EnumerateObjectFolderOrObject';
import LoaderModal from '../UI/LoaderModal';

const isDev = Window.isDev();

export const useExtensionUpdateAlertDialog = () => {
  const { showConfirmation } = useAlertDialog();
  return async (
    outOfDateExtensionShortHeaders: Array<ExtensionShortHeader>
  ): Promise<boolean> => {
    return await showConfirmation({
      title: t`Extension update`,
      message: t`Before installing this asset, it's strongly recommended to update these extensions${'\n\n - ' +
        outOfDateExtensionShortHeaders
          .map(extension => extension.fullName)
          .join('\n\n - ') +
        '\n\n'}Do you want to update it now ?`,
      confirmButtonLabel: t`Update the extension`,
      dismissButtonLabel: t`Skip the update`,
    });
  };
};

export const useFetchAssets = () => {
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

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  eventsBasedObject: gdEventsBasedObject | null,
  objectsContainer: gdObjectsContainer,
  object: gdObject,
  resourceManagementProps: ResourceManagementProps,
  onClose: () => void,
  onCreateNewObject: (type: string) => void,
  onObjectsAddedFromAssets: (Array<gdObject>) => void,
  canInstallPrivateAsset: () => boolean,
  targetObjectFolderOrObjectWithContext?: ?ObjectFolderOrObjectWithContext,
|};

function AssetSwappingDialog({
  project,
  layout,
  eventsBasedObject,
  objectsContainer,
  object,
  resourceManagementProps,
  onClose,
  onCreateNewObject,
  onObjectsAddedFromAssets,
  canInstallPrivateAsset,
  targetObjectFolderOrObjectWithContext,
}: Props) {
  const {
    assetShortHeadersSearchResults,
    shopNavigationState,
    environment,
    setEnvironment,
  } = React.useContext(AssetStoreContext);
  const {
    openedAssetPack,
    openedAssetShortHeader,
    selectedFolders,
  } = shopNavigationState.getCurrentPage();
  const [
    isAssetPackDialogInstallOpen,
    setIsAssetPackDialogInstallOpen,
  ] = React.useState(false);
  // Avoid memoizing the result of enumerateAssetStoreIds, as it does not get updated
  // when adding assets.
  const existingAssetStoreIds = enumerateAssetStoreIds(
    project,
    objectsContainer
  );
  const [
    isAssetBeingInstalled,
    setIsAssetBeingInstalled,
  ] = React.useState<boolean>(false);
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const isAssetAddedToScene =
    openedAssetShortHeader &&
    existingAssetStoreIds.has(openedAssetShortHeader.id);
  const { installPrivateAsset } = React.useContext(
    PrivateAssetsAuthorizationContext
  );
  const { showAlert } = useAlertDialog();

  const fetchAssets = useFetchAssets();
  const showExtensionUpdateConfirmation = useExtensionUpdateAlertDialog();

  const onInstallAsset = React.useCallback(
    async (assetShortHeader): Promise<boolean> => {
      if (!assetShortHeader) return false;
      setIsAssetBeingInstalled(true);
      try {
        const isPrivate = isPrivateAsset(assetShortHeader);
        if (isPrivate) {
          const canUserInstallPrivateAsset = await canInstallPrivateAsset();
          if (!canUserInstallPrivateAsset) {
            await showAlert({
              title: t`Save your project`,
              message: t`You need to save this project as a cloud project to install this asset. Please save your project and try again.`,
            });
            setIsAssetBeingInstalled(false);
            return false;
          }
        }
        const assets = await fetchAssets([assetShortHeader]);
        const asset = assets[0];
        const requiredExtensionInstallation = await checkRequiredExtensionsUpdateForAssets(
          {
            assets,
            project,
          }
        );
        const shouldUpdateExtension =
          requiredExtensionInstallation.outOfDateExtensionShortHeaders.length >
            0 &&
          (await showExtensionUpdateConfirmation(
            requiredExtensionInstallation.outOfDateExtensionShortHeaders
          ));
        await installRequiredExtensions({
          requiredExtensionInstallation,
          shouldUpdateExtension,
          eventsFunctionsExtensionsState,
          project,
        });
        const installOutput = isPrivate
          ? await installPrivateAsset({
              asset,
              project,
              objectsContainer,
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
              targetObjectFolderOrObject:
                targetObjectFolderOrObjectWithContext &&
                !targetObjectFolderOrObjectWithContext.global
                  ? targetObjectFolderOrObjectWithContext.objectFolderOrObject
                  : null,
            });
        if (!installOutput) {
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

        onObjectsAddedFromAssets(installOutput.createdObjects);

        await resourceManagementProps.onFetchNewlyAddedResources();
        setIsAssetBeingInstalled(false);
        return true;
      } catch (error) {
        console.error('Error while installing the asset:', error);
        showAlert({
          title: t`Could not install the asset`,
          message: t`There was an error while installing the asset "${
            assetShortHeader.name
          }". Verify your internet connection or try again later.`,
        });
        setIsAssetBeingInstalled(false);
        return false;
      }
    },
    [
      fetchAssets,
      project,
      showExtensionUpdateConfirmation,
      installPrivateAsset,
      eventsFunctionsExtensionsState,
      objectsContainer,
      openedAssetPack,
      resourceManagementProps,
      canInstallPrivateAsset,
      showAlert,
      onObjectsAddedFromAssets,
      targetObjectFolderOrObjectWithContext,
    ]
  );

  const displayedAssetShortHeaders = React.useMemo(
    () => {
      return assetShortHeadersSearchResults
        ? getAssetShortHeadersToDisplay(
            assetShortHeadersSearchResults,
            selectedFolders
          )
        : [];
    },
    [assetShortHeadersSearchResults, selectedFolders]
  );

  const mainAction = openedAssetShortHeader ? (
    <RaisedButton
      key="add-asset"
      primary={!isAssetAddedToScene}
      label={
        isAssetBeingInstalled ? (
          <Trans>Adding...</Trans>
        ) : isAssetAddedToScene ? (
          <Trans>Swap</Trans>
        ) : (
          <Trans>Get and swap</Trans>
        )
      }
      onClick={async () => {
        onInstallAsset(openedAssetShortHeader);
      }}
      disabled={isAssetBeingInstalled}
      id="add-asset-button"
    />
  ) : isDev ? (
    <RaisedButton
      key="show-dev-assets"
      label={
        environment === 'staging' ? (
          <Trans>Show live assets</Trans>
        ) : (
          <Trans>Show staging assets</Trans>
        )
      }
      onClick={() => {
        setEnvironment(environment === 'staging' ? 'live' : 'staging');
      }}
    />
  ) : null;

  const assetStore = React.useRef<?AssetStoreInterface>(null);
  const handleClose = React.useCallback(
    () => {
      assetStore.current && assetStore.current.onClose();
      onClose();
    },
    [onClose]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Dialog
            title={<Trans>Asset swapping of {object.getName()}</Trans>}
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
              mainAction,
            ]}
            onRequestClose={handleClose}
            onApply={
              openedAssetPack
                ? () => setIsAssetPackDialogInstallOpen(true)
                : openedAssetShortHeader
                ? async () => {
                    await onInstallAsset(openedAssetShortHeader);
                  }
                : undefined
            }
            open
            flexBody
            fullHeight
            id="new-object-dialog"
          >
            <AssetStore
              ref={assetStore}
              hideGameTemplates
              assetSwappedObject={object}
            />
          </Dialog>
          {isAssetBeingInstalled && <LoaderModal show={true} />}
          {isAssetPackDialogInstallOpen &&
            displayedAssetShortHeaders &&
            openedAssetPack && (
              <AssetPackInstallDialog
                assetPack={openedAssetPack}
                assetShortHeaders={displayedAssetShortHeaders}
                addedAssetIds={existingAssetStoreIds}
                onClose={() => setIsAssetPackDialogInstallOpen(false)}
                onAssetsAdded={() => {
                  setIsAssetPackDialogInstallOpen(false);
                }}
                project={project}
                objectsContainer={objectsContainer}
                onObjectsAddedFromAssets={onObjectsAddedFromAssets}
                canInstallPrivateAsset={canInstallPrivateAsset}
                resourceManagementProps={resourceManagementProps}
              />
            )}
        </>
      )}
    </I18n>
  );
}

const AssetSwappingDialogWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Asset store dialog</Trans>}
    scope="new-object-dialog"
    onClose={props.onClose}
  >
    <AssetSwappingDialog {...props} />
  </ErrorBoundary>
);

export default AssetSwappingDialogWithErrorBoundary;
