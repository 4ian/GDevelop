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
import { enumerateAssetStoreIds } from '../../../../AssetStore/EnumerateAssetStoreIds';
import { type PrivateGameTemplateListingData } from '../../../../Utils/GDevelopServices/Shop';
import { type Course } from '../../../../Utils/GDevelopServices/Asset';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import { getAssetShortHeadersToDisplay } from '../../../../AssetStore/AssetsList';
import { AssetStoreNavigatorContext } from '../../../../AssetStore/AssetStoreNavigator';

type Props = {|
  project: ?gdProject,
  resourceManagementProps: ResourceManagementProps,
  onOpenPrivateGameTemplateListingData: (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ) => void,
  onOpenProfile: () => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  onCourseOpen: (courseId: string) => void,
  receivedCourses?: ?Array<Course>,
|};

const StoreSection = ({
  project,
  resourceManagementProps,
  onOpenPrivateGameTemplateListingData,
  onOpenProfile,
  onExtensionInstalled,
  onCourseOpen,
  receivedCourses,
}: Props) => {
  const [
    isAssetPackDialogInstallOpen,
    setIsAssetPackDialogInstallOpen,
  ] = React.useState(false);
  const shopNavigationState = React.useContext(AssetStoreNavigatorContext);
  const { assetShortHeadersSearchResults } = React.useContext(
    AssetStoreContext
  );
  const {
    openedAssetPack,
    openedAssetShortHeader,
    selectedFolders,
  } = shopNavigationState.getCurrentPage();

  const displayedAssetShortHeaders = React.useMemo(
    () => {
      return openedAssetShortHeader
        ? [openedAssetShortHeader]
        : assetShortHeadersSearchResults
        ? getAssetShortHeadersToDisplay(
            assetShortHeadersSearchResults,
            selectedFolders
          )
        : [];
    },
    [openedAssetShortHeader, assetShortHeadersSearchResults, selectedFolders]
  );

  const existingAssetStoreIds = React.useMemo(
    () => {
      if (!project || !isAssetPackDialogInstallOpen) {
        return new Set<string>();
      }

      return enumerateAssetStoreIds(project);
    },
    [
      project,
      // Force recompute existing installed asset ids when the dialog to install them is
      // opened/closed, so that this list of ids is always up-to-date (but not recomputed at each render,
      // just when you're likely to need it).
      isAssetPackDialogInstallOpen,
    ]
  );

  return (
    <SectionContainer flexBody noScroll>
      <AssetStore
        onOpenPrivateGameTemplateListingData={
          onOpenPrivateGameTemplateListingData
        }
        displayPromotions
        onOpenProfile={onOpenProfile}
        receivedCourses={receivedCourses}
        onCourseOpen={onCourseOpen}
      />
      {(openedAssetPack || openedAssetShortHeader) && (
        <Line justifyContent="flex-end">
          <RaisedButton
            primary
            onClick={() => {
              if (!project) {
                return; // TODO: create a project, await, and then show dialog.
              }

              setIsAssetPackDialogInstallOpen(true);
            }}
            disabled={!project || !displayedAssetShortHeaders.length}
            label={
              project ? (
                openedAssetShortHeader ||
                displayedAssetShortHeaders.length === 1 ? (
                  <Trans>Add this asset to the project</Trans>
                ) : (
                  <Trans>Add these assets to the project</Trans>
                )
              ) : openedAssetShortHeader ||
                displayedAssetShortHeaders.length === 1 ? (
                <Trans>Create a project first to add this asset</Trans>
              ) : (
                <Trans>
                  Create a project first to add assets from the asset store
                </Trans>
              )
            }
          />
        </Line>
      )}
      {project &&
        isAssetPackDialogInstallOpen &&
        !!displayedAssetShortHeaders.length && (
          <AssetPackInstallDialog
            assetPack={openedAssetPack}
            assetShortHeaders={displayedAssetShortHeaders}
            addedAssetIds={existingAssetStoreIds}
            onClose={() => setIsAssetPackDialogInstallOpen(false)}
            onAssetsAdded={() => {
              setIsAssetPackDialogInstallOpen(false);
            }}
            project={project}
            objectsContainer={null}
            resourceManagementProps={resourceManagementProps}
            onExtensionInstalled={onExtensionInstalled}
          />
        )}
    </SectionContainer>
  );
};

const StoreSectionWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Shop section</Trans>}
    scope="start-page-shop"
  >
    <StoreSection {...props} />
  </ErrorBoundary>
);

export default StoreSectionWithErrorBoundary;
