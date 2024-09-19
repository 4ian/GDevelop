// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { AssetStore, type AssetStoreInterface } from '.';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { AssetStoreContext } from './AssetStoreContext';
import ErrorBoundary from '../UI/ErrorBoundary';
import LoaderModal from '../UI/LoaderModal';
import { useInstallAsset } from './NewObjectDialog';
import { swapAsset } from './AssetSwapper';
import PixiResourcesLoader from '../ObjectsRendering/PixiResourcesLoader';
import useAlertDialog from '../UI/Alert/useAlertDialog';

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  eventsBasedObject: gdEventsBasedObject | null,
  objectsContainer: gdObjectsContainer,
  object: gdObject,
  resourceManagementProps: ResourceManagementProps,
  onClose: ({ swappingDone: boolean }) => void,
|};

function AssetSwappingDialog({
  project,
  layout,
  eventsBasedObject,
  objectsContainer,
  object,
  resourceManagementProps,
  onClose,
}: Props) {
  const { shopNavigationState } = React.useContext(AssetStoreContext);
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

  // Try to install the asset as soon as selected.
  React.useEffect(
    () => {
      if (openedAssetShortHeader && !isAssetBeingInstalled) {
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
