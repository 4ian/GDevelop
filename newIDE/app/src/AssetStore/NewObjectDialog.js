// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import HelpButton from '../UI/HelpButton';
import { Tabs } from '../UI/Tabs';
import { AssetStore, type AssetStoreInterface } from '.';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { sendAssetAddedToProject } from '../Utils/Analytics/EventSender';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import RaisedButton from '../UI/RaisedButton';
import { AssetStoreContext } from './AssetStoreContext';
import AssetPackInstallDialog from './AssetPackInstallDialog';
import { type EnumeratedObjectMetadata } from '../ObjectsList/EnumerateObjects';
import {
  installRequiredExtensions,
  installPublicAsset,
  checkRequiredExtensionsUpdate,
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
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import { enumerateAssetStoreIds } from './EnumerateAssetStoreIds';
import PromisePool from '@supercharge/promise-pool';
import NewObjectFromScratch from './NewObjectFromScratch';
import { getAssetShortHeadersToDisplay } from './AssetsList';

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
  objectsContainer: gdObjectsContainer,
  resourceManagementProps: ResourceManagementProps,
  onClose: () => void,
  onCreateNewObject: (type: string) => void,
  onObjectsAddedFromAssets: (Array<gdObject>) => void,
  canInstallPrivateAsset: () => boolean,
|};

export default function NewObjectDialog({
  project,
  layout,
  objectsContainer,
  resourceManagementProps,
  onClose,
  onCreateNewObject,
  onObjectsAddedFromAssets,
  canInstallPrivateAsset,
}: Props) {
  const windowWidth = useResponsiveWindowWidth();
  const isMobileScreen = windowWidth === 'small';
  const {
    setNewObjectDialogDefaultTab,
    getNewObjectDialogDefaultTab,
  } = React.useContext(PreferencesContext);
  const [currentTab, setCurrentTab] = React.useState(
    getNewObjectDialogDefaultTab()
  );

  React.useEffect(() => setNewObjectDialogDefaultTab(currentTab), [
    setNewObjectDialogDefaultTab,
    currentTab,
  ]);

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
  const [
    selectedCustomObjectEnumeratedMetadata,
    setSelectedCustomObjectEnumeratedMetadata,
  ] = React.useState<?EnumeratedObjectMetadata>(null);
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
            })
          : await installPublicAsset({
              asset,
              project,
              objectsContainer,
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
    ]
  );

  const onInstallEmptyCustomObject = React.useCallback(
    async () => {
      const requiredExtensions =
        selectedCustomObjectEnumeratedMetadata &&
        selectedCustomObjectEnumeratedMetadata.requiredExtensions;
      if (!selectedCustomObjectEnumeratedMetadata || !requiredExtensions)
        return;
      try {
        setIsAssetBeingInstalled(true);
        const requiredExtensionInstallation = await checkRequiredExtensionsUpdate(
          {
            requiredExtensions,
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

        onCreateNewObject(selectedCustomObjectEnumeratedMetadata.name);
      } catch (error) {
        console.error('Error while creating the object:', error);
        showAlert({
          title: t`Could not create the object`,
          message: t`There was an error while creating the object "${
            selectedCustomObjectEnumeratedMetadata.fullName
          }". Verify your internet connection or try again later.`,
        });
      } finally {
        setIsAssetBeingInstalled(false);
      }
    },
    [
      selectedCustomObjectEnumeratedMetadata,
      onCreateNewObject,
      project,
      showExtensionUpdateConfirmation,
      eventsFunctionsExtensionsState,
      showAlert,
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

  const mainAction =
    currentTab === 'asset-store' ? (
      openedAssetPack ? (
        <RaisedButton
          key="add-all-assets"
          primary
          label={<Trans>Add all assets to my scene</Trans>}
          onClick={() => setIsAssetPackDialogInstallOpen(true)}
          disabled={
            !assetShortHeadersSearchResults ||
            assetShortHeadersSearchResults.length === 0
          }
        />
      ) : openedAssetShortHeader ? (
        <RaisedButton
          key="add-asset"
          primary={!isAssetAddedToScene}
          label={
            isAssetBeingInstalled ? (
              <Trans>Adding...</Trans>
            ) : isAssetAddedToScene ? (
              <Trans>Add again</Trans>
            ) : (
              <Trans>Add to the scene</Trans>
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
      ) : null
    ) : !!selectedCustomObjectEnumeratedMetadata &&
      currentTab === 'new-object' ? (
      <RaisedButton
        key="skip-and-create"
        label={
          !isAssetBeingInstalled ? (
            <Trans>Skip and create from scratch</Trans>
          ) : (
            <Trans>Adding...</Trans>
          )
        }
        primary
        onClick={onInstallEmptyCustomObject}
        id="skip-and-create-button"
        disabled={isAssetBeingInstalled}
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
            fixedContent={
              <Tabs
                value={currentTab}
                onChange={setCurrentTab}
                options={[
                  {
                    label: <Trans>Asset Store</Trans>,
                    value: 'asset-store',
                    id: 'asset-store-tab',
                  },
                  {
                    label: <Trans>New object from scratch</Trans>,
                    value: 'new-object',
                    id: 'new-object-from-scratch-tab',
                  },
                ]}
                // Enforce scroll on mobile, because the tabs have long names.
                variant={isMobileScreen ? 'scrollable' : undefined}
              />
            }
          >
            {currentTab === 'asset-store' && (
              <AssetStore ref={assetStore} hideGameTemplates />
            )}
            {currentTab === 'new-object' && (
              <NewObjectFromScratch
                onCreateNewObject={onCreateNewObject}
                onCustomObjectSelected={
                  setSelectedCustomObjectEnumeratedMetadata
                }
                selectedCustomObject={selectedCustomObjectEnumeratedMetadata}
                onInstallAsset={async assetShortHeader => {
                  const result = await onInstallAsset(assetShortHeader);
                  if (result) {
                    handleClose();
                  }
                }}
                isAssetBeingInstalled={isAssetBeingInstalled}
                project={project}
                i18n={i18n}
              />
            )}
          </Dialog>
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
