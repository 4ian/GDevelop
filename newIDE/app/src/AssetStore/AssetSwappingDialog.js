// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { AssetStore, type AssetStoreInterface } from '.';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import ErrorBoundary from '../UI/ErrorBoundary';
import LoaderModal from '../UI/LoaderModal';
import { useInstallAsset } from './NewObjectDialog';
import { swapAsset } from './AssetSwapper';
import PixiResourcesLoader from '../ObjectsRendering/PixiResourcesLoader';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import RaisedButton from '../UI/RaisedButton';
import { AssetStoreNavigatorContext } from './AssetStoreNavigator';

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  eventsBasedObject: gdEventsBasedObject | null,
  objectsContainer: gdObjectsContainer,
  object: gdObject,
  resourceManagementProps: ResourceManagementProps,
  onClose: ({ swappingDone: boolean }) => void,
  // Use minimal UI to hide filters & the details page (useful for Quick Customization)
  minimalUI?: boolean,
|};

function AssetSwappingDialog({
  project,
  layout,
  eventsBasedObject,
  objectsContainer,
  object,
  resourceManagementProps,
  onClose,
  minimalUI,
}: Props) {
  const shopNavigationState = React.useContext(AssetStoreNavigatorContext);
  const { openedAssetShortHeader } = shopNavigationState.getCurrentPage();

  const [
    isAssetBeingInstalled,
    setIsAssetBeingInstalled,
  ] = React.useState<boolean>(false);
  const installAsset = useInstallAsset({
    project,
    objectsContainer,
    resourceManagementProps,
  });
  const { showAlert } = useAlertDialog();

  const installOpenedAsset = React.useCallback(
    async (): Promise<void> => {
      if (!openedAssetShortHeader) return;

      setIsAssetBeingInstalled(true);
      try {
        const installAssetOutput = await installAsset(openedAssetShortHeader);
        if (!installAssetOutput) {
          throw new Error('Failed to install asset');
        }

        if (installAssetOutput.createdObjects.length > 0) {
          swapAsset(
            project,
            PixiResourcesLoader,
            object,
            installAssetOutput.createdObjects[0],
            openedAssetShortHeader
          );
        }
        for (const createdObject of installAssetOutput.createdObjects) {
          objectsContainer.removeObject(createdObject.getName());
        }

        onClose({ swappingDone: true });
      } catch (err) {
        showAlert({
          title: t`Could not swap asset`,
          message: t`Something went wrong while swapping the asset. Please try again.`,
        });
        console.error('Error while installing asset:', err);
      } finally {
        // Always go back to the previous page so the asset is unselected.
        shopNavigationState.backToPreviousPage();
        setIsAssetBeingInstalled(false);
      }
    },
    [
      installAsset,
      project,
      object,
      objectsContainer,
      openedAssetShortHeader,
      onClose,
      shopNavigationState,
      showAlert,
    ]
  );

  const mainAction =
    openedAssetShortHeader && !minimalUI ? (
      <RaisedButton
        key="add-asset"
        primary
        label={
          isAssetBeingInstalled ? <Trans>Adding...</Trans> : <Trans>Swap</Trans>
        }
        onClick={installOpenedAsset}
        disabled={isAssetBeingInstalled}
        id="swap-asset-button"
      />
    ) : null;

  // Try to install the asset as soon as selected, if in minimal UI mode.
  React.useEffect(
    () => {
      if (openedAssetShortHeader && !isAssetBeingInstalled && minimalUI) {
        installOpenedAsset();
      }
    },
    // Only run when the asset is selected and not already being installed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAssetBeingInstalled, openedAssetShortHeader]
  );

  const assetStore = React.useRef<?AssetStoreInterface>(null);
  const handleClose = React.useCallback(
    () => {
      assetStore.current && assetStore.current.onClose();
      onClose({ swappingDone: false });
    },
    [onClose]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Dialog
            title={<Trans>Swap {object.getName()} with another asset</Trans>}
            actions={[mainAction]}
            secondaryActions={[
              <FlatButton
                key="close"
                label={<Trans>Back</Trans>}
                onClick={handleClose}
                id="close-button"
                fullWidth
                primary
              />,
            ]}
            onApply={minimalUI ? undefined : installOpenedAsset}
            onRequestClose={handleClose}
            open
            flexBody
            fullHeight
            id="asset-swapping-dialog"
            actionsFullWidthOnMobile
          >
            <AssetStore
              ref={assetStore}
              hideGameTemplates
              assetSwappedObject={object}
              minimalUI={minimalUI}
            />
          </Dialog>
          {isAssetBeingInstalled && <LoaderModal show={true} />}
        </>
      )}
    </I18n>
  );
}

const AssetSwappingDialogWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Asset store dialog</Trans>}
    scope="new-object-dialog"
    onClose={() => props.onClose({ swappingDone: false })}
  >
    <AssetSwappingDialog {...props} />
  </ErrorBoundary>
);

export default AssetSwappingDialogWithErrorBoundary;
