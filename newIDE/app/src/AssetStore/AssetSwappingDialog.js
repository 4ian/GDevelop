// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import HelpButton from '../UI/HelpButton';
import { AssetStore, type AssetStoreInterface } from '.';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import RaisedButton from '../UI/RaisedButton';
import { AssetStoreContext } from './AssetStoreContext';
import AssetPackInstallDialog from './AssetPackInstallDialog';
import Window from '../Utils/Window';
import { enumerateAssetStoreIds } from './EnumerateAssetStoreIds';
import { getAssetShortHeadersToDisplay } from './AssetsList';
import ErrorBoundary from '../UI/ErrorBoundary';
import LoaderModal from '../UI/LoaderModal';
import { useInstallAsset } from './NewObjectDialog';
import { swapAsset } from './AssetSwapper';
import PixiResourcesLoader from '../ObjectsRendering/PixiResourcesLoader';

const isDev = Window.isDev();

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  eventsBasedObject: gdEventsBasedObject | null,
  objectsContainer: gdObjectsContainer,
  object: gdObject,
  resourceManagementProps: ResourceManagementProps,
  onClose: () => void,
  onObjectsConfigurationSwapped: () => void,
  canInstallPrivateAsset: () => boolean,
|};

function AssetSwappingDialog({
  project,
  layout,
  eventsBasedObject,
  objectsContainer,
  object,
  resourceManagementProps,
  onClose,
  onObjectsConfigurationSwapped,
  canInstallPrivateAsset,
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
  const isAssetAddedToScene =
    openedAssetShortHeader &&
    existingAssetStoreIds.has(openedAssetShortHeader.id);
  const installAsset = useInstallAsset({
    project,
    objectsContainer,
    resourceManagementProps,
    canInstallPrivateAsset,
    onObjectsAddedFromAssets: onObjectsConfigurationSwapped,
  });

  const onInstallAsset = React.useCallback(
    async (assetShortHeader): Promise<boolean> => {
      if (!assetShortHeader) return false;

      setIsAssetBeingInstalled(true);
      const installAssetOutput = await installAsset(assetShortHeader);
      if (!installAssetOutput) {
        setIsAssetBeingInstalled(false);
        return false;
      }

      if (installAssetOutput.createdObjects.length > 0) {
        swapAsset(
          project,
          PixiResourcesLoader,
          object,
          installAssetOutput.createdObjects[0],
          assetShortHeader
        );
      }
      for (const createdObject of installAssetOutput.createdObjects) {
        objectsContainer.removeObject(createdObject.getName());
      }

      setIsAssetBeingInstalled(false);
      return true;
    },
    [installAsset, project, object, objectsContainer]
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
        isAssetBeingInstalled ? <Trans>Adding...</Trans> : <Trans>Swap</Trans>
      }
      onClick={async () => {
        onInstallAsset(openedAssetShortHeader);
      }}
      disabled={isAssetBeingInstalled}
      id="swap-asset-button"
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
            id="asset-swapping-dialog"
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
                onObjectsAddedFromAssets={onObjectsConfigurationSwapped}
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
