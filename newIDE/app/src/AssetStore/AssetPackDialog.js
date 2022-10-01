// @flow
import * as React from 'react';
import {
  type AssetShortHeader,
  type AssetPack,
} from '../Utils/GDevelopServices/Asset';
import Text from '../UI/Text';
import { t, Trans } from '@lingui/macro';
import Dialog from '../UI/Dialog';
import TextButton from '../UI/TextButton';
import RaisedButton from '../UI/RaisedButton';
import RaisedButtonWithSplitMenu from '../UI/RaisedButtonWithSplitMenu';
import { Column, Line } from '../UI/Grid';
import { installAsset } from './InstallAsset';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { showErrorBox } from '../UI/Messages/MessageBox';
import LinearProgress from '../UI/LinearProgress';
import { AssetStoreContext } from './AssetStoreContext';
import { type OnFetchNewlyAddedResourcesFunction } from '../ProjectsStorage/ResourceFetcher';

type Props = {|
  assetPack: AssetPack,
  assetShortHeaders: Array<AssetShortHeader>,
  addedAssetIds: Array<string>,
  onClose: () => void,
  onAssetsAdded: () => void,
  project: gdProject,
  objectsContainer: gdObjectsContainer,
  onObjectAddedFromAsset: (object: gdObject) => void,
  onFetchNewlyAddedResources: OnFetchNewlyAddedResourcesFunction,
|};

export const AssetPackDialog = ({
  assetPack,
  assetShortHeaders,
  addedAssetIds,
  onClose,
  onAssetsAdded,
  project,
  objectsContainer,
  onObjectAddedFromAsset,
  onFetchNewlyAddedResources,
}: Props) => {
  const missingAssetShortHeaders = assetShortHeaders.filter(
    assetShortHeader => !addedAssetIds.includes(assetShortHeader.id)
  );
  const allAssetsInstalled = missingAssetShortHeaders.length === 0;
  const noAssetsInstalled =
    !allAssetsInstalled &&
    missingAssetShortHeaders.length === assetShortHeaders.length;

  const [
    areAssetsBeingInstalled,
    setAreAssetsBeingInstalled,
  ] = React.useState<boolean>(false);

  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );

  const { environment } = React.useContext(AssetStoreContext);

  const onInstallAssets = React.useCallback(
    async (assetShortHeaders: Array<AssetShortHeader>) => {
      if (!assetShortHeaders || !assetShortHeaders.length) return;
      setAreAssetsBeingInstalled(true);
      try {
        const installOutputs = await Promise.all(
          assetShortHeaders.map(assetShortHeader =>
            installAsset({
              assetShortHeader,
              eventsFunctionsExtensionsState,
              project,
              objectsContainer,
              environment,
            })
          )
        );
        installOutputs.forEach(installOutput => {
          installOutput.createdObjects.forEach(object => {
            onObjectAddedFromAsset(object);
          });
        });

        await onFetchNewlyAddedResources();

        setAreAssetsBeingInstalled(false);
        onAssetsAdded();
      } catch (error) {
        setAreAssetsBeingInstalled(false);
        console.error('Error while installing the assets', error);
        showErrorBox({
          message:
            'There was an error while installing the assets. Verify your internet connection or try again later.',
          rawError: error,
          errorId: 'install-asset-pack-error',
        });
      }
    },
    [
      eventsFunctionsExtensionsState,
      project,
      objectsContainer,
      onObjectAddedFromAsset,
      onAssetsAdded,
      environment,
      onFetchNewlyAddedResources,
    ]
  );

  const dialogContent = areAssetsBeingInstalled
    ? {
        actionButton: (
          <TextButton
            key="loading"
            label={<Trans>Please wait...</Trans>}
            disabled
            onClick={() => {}}
          />
        ),
        onApply: () => {},
        content: (
          <>
            <Text>
              <Trans>Installing assets...</Trans>
            </Text>
            <Line expand>
              <LinearProgress />
            </Line>
          </>
        ),
      }
    : allAssetsInstalled
    ? {
        actionButton: (
          <RaisedButton
            key="install-again"
            label={<Trans>Install again</Trans>}
            primary={false}
            onClick={() => onInstallAssets(assetShortHeaders)}
          />
        ),
        onApply: () => onInstallAssets(assetShortHeaders),
        content: (
          <Text>
            <Trans>
              You already have these {assetShortHeaders.length} assets
              installed, do you want to add them again?
            </Trans>
          </Text>
        ),
      }
    : noAssetsInstalled
    ? {
        actionButton: (
          <RaisedButton
            key="continue"
            label={<Trans>Continue</Trans>}
            primary
            onClick={() => onInstallAssets(assetShortHeaders)}
          />
        ),
        onApply: () => onInstallAssets(assetShortHeaders),
        content: (
          <Text>
            <Trans>
              You're about to add {assetShortHeaders.length} assets. Continue?
            </Trans>
          </Text>
        ),
      }
    : {
        actionButton: (
          <RaisedButtonWithSplitMenu
            label={<Trans>Install the missing assets</Trans>}
            key="install-missing"
            primary
            onClick={() => {
              onInstallAssets(missingAssetShortHeaders);
            }}
            buildMenuTemplate={i18n => [
              {
                label: i18n._(t`Install all the assets`),
                click: () => onInstallAssets(assetShortHeaders),
              },
            ]}
          />
        ),
        onApply: () => onInstallAssets(missingAssetShortHeaders),
        content: (
          <Text>
            <Trans>
              You already have{' '}
              {assetShortHeaders.length - missingAssetShortHeaders.length}{' '}
              asset(s) in your scene. Do you want to add the remaining{' '}
              {missingAssetShortHeaders.length} one(s)?
            </Trans>
          </Text>
        ),
      };

  return (
    <Dialog
      maxWidth="sm"
      title={assetPack.name}
      open
      onRequestClose={() => {
        if (!areAssetsBeingInstalled) onClose();
      }}
      cannotBeDismissed
      actions={[
        // Installing a list of assets is not cancelable, so we hide the button while installing.
        !areAssetsBeingInstalled ? (
          <TextButton
            key="cancel"
            label={<Trans>Cancel</Trans>}
            onClick={onClose}
          />
        ) : null,
        dialogContent.actionButton,
      ]}
      onApply={dialogContent.onApply}
    >
      <Column>{dialogContent.content}</Column>
    </Dialog>
  );
};
