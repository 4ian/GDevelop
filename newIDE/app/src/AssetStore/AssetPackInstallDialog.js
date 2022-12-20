// @flow
import * as React from 'react';
import {
  type Asset,
  type AssetShortHeader,
  type PublicAssetPack,
  type PrivateAssetPack,
  isPrivateAsset,
  getPublicAsset,
} from '../Utils/GDevelopServices/Asset';
import Text from '../UI/Text';
import { t, Trans } from '@lingui/macro';
import Dialog from '../UI/Dialog';
import TextButton from '../UI/TextButton';
import RaisedButton from '../UI/RaisedButton';
import RaisedButtonWithSplitMenu from '../UI/RaisedButtonWithSplitMenu';
import { Column, Line } from '../UI/Grid';
import {
  installPublicAsset,
  checkRequiredExtensionUpdate,
} from './InstallAsset';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { showErrorBox } from '../UI/Messages/MessageBox';
import LinearProgress from '../UI/LinearProgress';
import { AssetStoreContext } from './AssetStoreContext';
import PrivateAssetsAuthorizationContext from './PrivateAssets/PrivateAssetsAuthorizationContext';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import PromisePool from '@supercharge/promise-pool';
import { ColumnStackLayout } from '../UI/Layout';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { mapFor } from '../Utils/MapFor';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import AlertMessage from '../UI/AlertMessage';
import { useExtensionUpdateAlertDialog } from './NewObjectDialog';
import { type InstallAssetOutput } from './InstallAsset';

type Props = {|
  assetPack: PublicAssetPack | PrivateAssetPack | null,
  assetShortHeaders: Array<AssetShortHeader>,
  addedAssetIds: Set<string>,
  onClose: () => void,
  onAssetsAdded: () => void,
  project: gdProject,
  objectsContainer: ?gdObjectsContainer,
  onObjectAddedFromAsset: (object: gdObject) => void,
  resourceManagementProps: ResourceManagementProps,
  canInstallPrivateAsset: () => boolean,
|};

const AssetPackInstallDialog = ({
  assetPack,
  assetShortHeaders,
  addedAssetIds,
  onClose,
  onAssetsAdded,
  project,
  objectsContainer,
  onObjectAddedFromAsset,
  canInstallPrivateAsset,
  resourceManagementProps,
}: Props) => {
  const missingAssetShortHeaders = assetShortHeaders.filter(
    assetShortHeader => !addedAssetIds.has(assetShortHeader.id)
  );
  const allAssetsInstalled = missingAssetShortHeaders.length === 0;
  const noAssetsInstalled =
    !allAssetsInstalled &&
    missingAssetShortHeaders.length === assetShortHeaders.length;

  const [
    areAssetsBeingInstalled,
    setAreAssetsBeingInstalled,
  ] = React.useState<boolean>(false);
  const hasPrivateAssets = React.useMemo(
    () =>
      assetShortHeaders.some(assetShortHeader =>
        isPrivateAsset(assetShortHeader)
      ),
    [assetShortHeaders]
  );
  const canUserInstallPrivateAsset = React.useMemo(
    () => canInstallPrivateAsset(),
    [canInstallPrivateAsset]
  );

  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const { installPrivateAsset, fetchPrivateAsset } = React.useContext(
    PrivateAssetsAuthorizationContext
  );

  const showExtensionUpdateConfirmation = useExtensionUpdateAlertDialog();

  const { environment } = React.useContext(AssetStoreContext);

  const [selectedLayoutName, setSelectedLayoutName] = React.useState<string>(
    ''
  );
  const layoutNames = mapFor(0, project.getLayoutsCount(), i => {
    return project.getLayoutAt(i).getName();
  });
  const sceneChooser = objectsContainer ? null : ( // The objects container where to add assets objects is already given.
    // Give the choice to the user to choose where to add assets objects.
    <ColumnStackLayout noMargin>
      <Text>
        <Trans>Choose where to add the assets:</Trans>
      </Text>
      <RadioGroup
        aria-label="Associated scene"
        name="associated-layout"
        value={selectedLayoutName}
        onChange={event => setSelectedLayoutName(event.target.value)}
      >
        <FormControlLabel
          value={''}
          control={<Radio color="secondary" />}
          label={<Trans>Global objects in the project</Trans>}
          disabled={areAssetsBeingInstalled}
        />
        {layoutNames.map(name => (
          <FormControlLabel
            key={name}
            value={name}
            control={<Radio color="secondary" />}
            label={name}
            disabled={areAssetsBeingInstalled}
          />
        ))}
      </RadioGroup>
    </ColumnStackLayout>
  );
  const targetObjectsContainer: gdObjectsContainer =
    objectsContainer ||
    (project.hasLayoutNamed(selectedLayoutName)
      ? project.getLayout(selectedLayoutName)
      : project);

  const onInstallAssets = React.useCallback(
    async (assetShortHeaders: Array<AssetShortHeader>) => {
      if (!assetShortHeaders || !assetShortHeaders.length) return;

      setAreAssetsBeingInstalled(true);
      try {
        const assets: Array<Asset> = (await Promise.all(
          assetShortHeaders.map(assetShortHeader => {
            const asset = isPrivateAsset(assetShortHeader)
              ? fetchPrivateAsset(assetShortHeader, {
                  environment,
                })
              : getPublicAsset(assetShortHeader, { environment });
            return asset;
          })
        )).filter(Boolean);
        if (assets.length < assetShortHeaders.length) {
          throw new Error(
            'Unable to install the assets because it could not be fetched.'
          );
        }

        const requiredExtensionInstallation = await checkRequiredExtensionUpdate(
          {
            assets,
            project,
          }
        );
        const shouldUpdateExtension =
          requiredExtensionInstallation.outOfDateExtensions.length > 0 &&
          (await showExtensionUpdateConfirmation(
            requiredExtensionInstallation.outOfDateExtensions
          ));

        // Use a pool to avoid installing an unbounded amount of assets at the same time.
        const { results, errors } = await PromisePool.withConcurrency(6)
          .for(assetShortHeaders)
          .process<InstallAssetOutput>(async assetShortHeader => {
            const installOutput = isPrivateAsset(assetShortHeader)
              ? await installPrivateAsset({
                  assetShortHeader,
                  eventsFunctionsExtensionsState,
                  project,
                  objectsContainer: targetObjectsContainer,
                  environment,
                  requiredExtensionInstallation,
                  shouldUpdateExtension,
                })
              : await installPublicAsset({
                  assetShortHeader,
                  eventsFunctionsExtensionsState,
                  project,
                  objectsContainer: targetObjectsContainer,
                  environment,
                  requiredExtensionInstallation,
                  shouldUpdateExtension,
                });

            if (!installOutput) {
              throw new Error('Unable to install the asset.');
            }

            return installOutput;
          });

        if (errors.length) {
          throw new Error(
            'Error(s) while installing assets. The first error is: ' +
              errors[0].message
          );
        }

        results.forEach(installOutput => {
          installOutput.createdObjects.forEach(object => {
            onObjectAddedFromAsset(object);
          });
        });

        await resourceManagementProps.onFetchNewlyAddedResources();

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
      project,
      showExtensionUpdateConfirmation,
      resourceManagementProps,
      onAssetsAdded,
      fetchPrivateAsset,
      environment,
      installPrivateAsset,
      eventsFunctionsExtensionsState,
      targetObjectsContainer,
      onObjectAddedFromAsset,
    ]
  );

  const dialogContent =
    hasPrivateAssets && !canUserInstallPrivateAsset
      ? {
          actionButton: (
            <RaisedButton
              key="continue"
              label={<Trans>Add the assets</Trans>}
              primary
              disabled
              onClick={() => {}}
            />
          ),
          onApply: () => {},
          content: (
            <AlertMessage kind="warning">
              <Text>
                <Trans>
                  You need to save this project as a cloud project to install
                  premium assets. Please save your project and try again.
                </Trans>
              </Text>
            </AlertMessage>
          ),
        }
      : areAssetsBeingInstalled
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
              label={<Trans>Add the assets</Trans>}
              primary
              onClick={() => onInstallAssets(assetShortHeaders)}
            />
          ),
          onApply: () => onInstallAssets(assetShortHeaders),
          content: (
            <Text>
              <Trans>
                You're about to add {assetShortHeaders.length} assets.
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
      title={assetPack ? assetPack.name : <Trans>Assets</Trans>}
      maxWidth="sm"
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
      <Column noMargin>
        {dialogContent.content}
        {sceneChooser}
      </Column>
    </Dialog>
  );
};

export default AssetPackInstallDialog;
