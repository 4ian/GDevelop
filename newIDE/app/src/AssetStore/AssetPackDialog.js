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
import { LinearProgress } from '@material-ui/core';
import { installAsset } from './InstallAsset';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { useResourceFetcher } from '../ProjectsStorage/ResourceFetcher';
import { showErrorBox } from '../UI/Messages/MessageBox';

const styles = {
  linearProgress: {
    flex: 1,
  },
};

type Props = {|
  assetPack: AssetPack,
  assetShortHeaders: Array<AssetShortHeader>,
  addedAssetIds: Array<string>,
  onClose: () => void,
  onAssetPackAdded: () => void,
  project: gdProject,
  objectsContainer: gdObjectsContainer,
  events: gdEventsList,
  onObjectAddedFromAsset: (object: gdObject) => void,
|};

export const AssetPackDialog = ({
  assetPack,
  assetShortHeaders,
  addedAssetIds,
  onClose,
  onAssetPackAdded,
  project,
  objectsContainer,
  events,
  onObjectAddedFromAsset,
}: Props) => {
  const missingAssetShortHeaders = assetShortHeaders.filter(
    assetShortHeader => !addedAssetIds.includes(assetShortHeader.id)
  );

  const resourcesFetcher = useResourceFetcher();
  const [
    isAssetPackBeingInstalled,
    setIsAssetPackBeingInstalled,
  ] = React.useState<boolean>(false);

  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );

  const onInstallAssetPack = React.useCallback(
    async (assetShortHeaders: Array<AssetShortHeader>) => {
      if (!assetShortHeaders || !assetShortHeaders.length) return;
      setIsAssetPackBeingInstalled(true);
      try {
        const installOutputs = await Promise.all(
          assetShortHeaders.map(assetShortHeader =>
            installAsset({
              assetShortHeader,
              eventsFunctionsExtensionsState,
              project,
              objectsContainer,
              events,
            })
          )
        );
        installOutputs.forEach(installOutput => {
          installOutput.createdObjects.forEach(object => {
            onObjectAddedFromAsset(object);
          });
        });

        await resourcesFetcher.ensureResourcesAreFetched(project);

        setIsAssetPackBeingInstalled(false);
        onAssetPackAdded();
      } catch (error) {
        setIsAssetPackBeingInstalled(false);
        console.error('Error while installing the asset pack', error);
        showErrorBox({
          message:
            'There was an error while installing the asset pack. Verify your internet connection or try again later.',
          rawError: error,
          errorId: 'install-asset-pack-error',
        });
      }
    },
    [
      resourcesFetcher,
      eventsFunctionsExtensionsState,
      project,
      objectsContainer,
      events,
      onObjectAddedFromAsset,
      onAssetPackAdded,
    ]
  );

  return (
    <Dialog
      title={<Trans>{assetPack.name}</Trans>}
      open
      cannotBeDismissed
      actions={[
        <TextButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          disabled={isAssetPackBeingInstalled}
          onClick={onClose}
        />,
        // Loading.
        isAssetPackBeingInstalled && (
          <TextButton
            key="loading"
            label={<Trans>Please wait...</Trans>}
            disabled
            onClick={() => {}}
          />
        ),
        // All assets already installed.
        !isAssetPackBeingInstalled && missingAssetShortHeaders.length === 0 && (
          <RaisedButton
            key="install-again"
            label={<Trans>Install again</Trans>}
            primary={false}
            onClick={() => onInstallAssetPack(assetShortHeaders)}
          />
        ),
        // No assets installed.
        !isAssetPackBeingInstalled &&
          missingAssetShortHeaders.length === assetShortHeaders.length && (
            <RaisedButton
              key="continue"
              label={<Trans>Continue</Trans>}
              primary
              onClick={() => onInstallAssetPack(assetShortHeaders)}
            />
          ),
        // Some assets installed.
        !isAssetPackBeingInstalled &&
          missingAssetShortHeaders.length !== 0 &&
          missingAssetShortHeaders.length !== assetShortHeaders.length && (
            <RaisedButtonWithSplitMenu
              label={<Trans>Install the missing assets</Trans>}
              key="install-missing"
              primary
              onClick={() => {
                onInstallAssetPack(missingAssetShortHeaders);
              }}
              buildMenuTemplate={i18n => [
                {
                  label: i18n._(t`Install all the assets`),
                  click: () => onInstallAssetPack(assetShortHeaders),
                },
              ]}
            />
          ),
      ]}
      onApply={() => {
        missingAssetShortHeaders.length === assetShortHeaders.length
          ? onInstallAssetPack(assetShortHeaders)
          : onInstallAssetPack(missingAssetShortHeaders);
      }}
    >
      <Column>
        {isAssetPackBeingInstalled ? (
          <>
            <Text>
              <Trans>Installing assets...</Trans>
            </Text>
            <Line expand>
              <LinearProgress style={styles.linearProgress} />
            </Line>
          </>
        ) : (
          <Text>
            {missingAssetShortHeaders.length === 0 ? (
              <Trans>
                You already have this asset pack installed, do you want to add
                the {assetShortHeaders.length} assets again?
              </Trans>
            ) : missingAssetShortHeaders.length === assetShortHeaders.length ? (
              <Trans>
                You're about to add {assetShortHeaders.length} assets from the
                asset pack. Continue?
              </Trans>
            ) : (
              <Trans>
                You already have{' '}
                {assetShortHeaders.length - missingAssetShortHeaders.length}{' '}
                asset(s) from this pack in your scene. Do you want to add the
                remaining {missingAssetShortHeaders.length} asset(s)?
              </Trans>
            )}
          </Text>
        )}
      </Column>
    </Dialog>
  );
};
