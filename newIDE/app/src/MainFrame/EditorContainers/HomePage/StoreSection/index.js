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
  project: gdProject,
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
  const { openedAssetPack } = navigationState.getCurrentPage();

  return (
    <SectionContainer flexBody>
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
          disabled={!openedAssetPack || !searchResults}
          label={
            project ? (
              <Trans>Add to the project</Trans>
            ) : (
              <Trans>Create a project with these assets</Trans>
            )
          }
        />
      </Line>
      {project &&
        isAssetPackDialogInstallOpen &&
        searchResults &&
        openedAssetPack && (
          <AssetPackInstallDialog
            assetPack={openedAssetPack}
            assetShortHeaders={searchResults}
            addedAssetIds={[] /* TODO */}
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
