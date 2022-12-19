// @flow
import * as React from 'react';
import SectionContainer from '../SectionContainer';
import { AssetStore } from '../../../../AssetStore';
import { Line } from '../../../../UI/Grid';
import RaisedButton from '../../../../UI/RaisedButton';
import { type ResourceManagementProps } from '../../../../ResourcesList/ResourceSource';
import { Trans } from '@lingui/macro';
import { AssetStoreContext } from '../../../../AssetStore/AssetStoreContext';
import AssetPackInstallDialog from '../../../../AssetStore/AssetPackInstallDialog';

type Props = {|
  project: ?gdProject,
  resourceManagementProps: ResourceManagementProps,
  canInstallPrivateAsset: () => boolean,
|};

const StoreSection = ({
  project,
  resourceManagementProps,
  canInstallPrivateAsset,
}: Props) => {
  const [
    isAssetPackDialogInstallOpen,
    setIsAssetPackDialogInstallOpen,
  ] = React.useState(false);
  const { searchResults, navigationState } = React.useContext(
    AssetStoreContext
  );
  const {
    openedAssetPack,
    openedAssetShortHeader,
  } = navigationState.getCurrentPage();

  const assetShortHeadersToInstall = openedAssetShortHeader
    ? [openedAssetShortHeader]
    : openedAssetPack
    ? searchResults
    : [];

  return (
    <SectionContainer
      title={null /* Give the asset store the full space to display */}
      flexBody
    >
      <AssetStore />
      <Line justifyContent="flex-end">
        <RaisedButton
          primary
          onClick={() => {
            if (!project) {
              return; // TODO: create a project, await, and then show dialog.
            }

            setIsAssetPackDialogInstallOpen(true);
          }}
          disabled={!project || !assetShortHeadersToInstall.length}
          label={
            project ? (
              openedAssetPack ? (
                <Trans>Add assets from this pack to the project</Trans>
              ) : assetShortHeadersToInstall.length === 1 ? (
                <Trans>Add this asset to the project</Trans>
              ) : (
                <Trans>Add these assets to the project</Trans>
              )
            ) : (
              <Trans>
                Create a project first to add assets from the asset store
              </Trans>
            )
          }
        />
      </Line>
      {project &&
        isAssetPackDialogInstallOpen &&
        !!assetShortHeadersToInstall.length && (
          <AssetPackInstallDialog
            assetPack={openedAssetPack}
            assetShortHeaders={assetShortHeadersToInstall}
            addedAssetIds={
              [] /* Don't check if assets are already installed in the project. */
            }
            onClose={() => setIsAssetPackDialogInstallOpen(false)}
            onAssetsAdded={() => {
              setIsAssetPackDialogInstallOpen(false);
            }}
            project={project}
            objectsContainer={null}
            onObjectAddedFromAsset={() => {}}
            canInstallPrivateAsset={canInstallPrivateAsset}
            resourceManagementProps={resourceManagementProps}
          />
        )}
    </SectionContainer>
  );
};

export default StoreSection;
