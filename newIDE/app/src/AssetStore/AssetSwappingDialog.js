// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import HelpButton from '../UI/HelpButton';
import { AssetStore, type AssetStoreInterface } from '.';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import RaisedButton from '../UI/RaisedButton';
import { AssetStoreContext } from './AssetStoreContext';
import Window from '../Utils/Window';
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
  const { shopNavigationState, environment, setEnvironment } = React.useContext(
    AssetStoreContext
  );
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

  const onInstallOpenedAsset = React.useCallback(
    async (): Promise<void> => {
      if (!openedAssetShortHeader) return;

      setIsAssetBeingInstalled(true);
      const installAssetOutput = await installAsset(openedAssetShortHeader);
      if (!installAssetOutput) {
        setIsAssetBeingInstalled(false);
        return;
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

      setIsAssetBeingInstalled(false);
      onClose({ swappingDone: true });
    },
    [
      installAsset,
      project,
      object,
      objectsContainer,
      openedAssetShortHeader,
      onClose,
    ]
  );

  const mainAction = openedAssetShortHeader ? (
    <RaisedButton
      key="add-asset"
      primary
      label={
        isAssetBeingInstalled ? <Trans>Adding...</Trans> : <Trans>Swap</Trans>
      }
      onClick={onInstallOpenedAsset}
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
            onApply={onInstallOpenedAsset}
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
