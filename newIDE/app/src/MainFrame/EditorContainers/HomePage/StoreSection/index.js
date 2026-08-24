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
import {
  type AssetShortHeader,
  type Course,
} from '../../../../Utils/GDevelopServices/Asset';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import { getAssetShortHeadersToDisplay } from '../../../../AssetStore/AssetsList';
import { AssetStoreNavigatorContext } from '../../../../AssetStore/AssetStoreNavigator';
import { type CourseCompletion } from '../UseCourses';

type Props = {|
  project: ?gdProject,
  resourceManagementProps: ResourceManagementProps,
  onOpenPrivateGameTemplateListingData: (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ) => void,
  onOpenProfile: () => void,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  onCourseOpen: (courseId: string) => void,
  courses?: ?Array<Course>,
  getCourseCompletion: (courseId: string) => CourseCompletion | null,
|};

const StoreSection = ({
  project,
  resourceManagementProps,
  onOpenPrivateGameTemplateListingData,
  onOpenProfile,
  onWillInstallExtension,
  onExtensionInstalled,
  onCourseOpen,
  courses,
  getCourseCompletion,
}: Props) => {
  const [
    assetShortHeadersToInstall,
    setAssetShortHeadersToInstall,
  ] = React.useState<?Array<AssetShortHeader>>(null);
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
      if (!project || !assetShortHeadersToInstall) {
        return new Set<string>();
      }

      return enumerateAssetStoreIds(project);
    },
    [
      project,
      // Force recompute existing installed asset ids when the dialog to install them is
      // opened/closed, so that this list of ids is always up-to-date (but not recomputed at each render,
      // just when you're likely to need it).
      assetShortHeadersToInstall,
    ]
  );

  const openAssetPackInstallDialog = React.useCallback(
    () => {
      const currentPage = shopNavigationState.getCurrentPage();
      setAssetShortHeadersToInstall(
        openedAssetShortHeader
          ? [openedAssetShortHeader]
          : assetShortHeadersSearchResults
          ? getAssetShortHeadersToDisplay(
              assetShortHeadersSearchResults,
              currentPage.selectedFolders,
              currentPage.pageBreakIndex || 0
            )
          : []
      );
    },
    [
      shopNavigationState,
      openedAssetShortHeader,
      assetShortHeadersSearchResults,
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
        courses={courses}
        onCourseOpen={onCourseOpen}
        getCourseCompletion={getCourseCompletion}
      />
      {(openedAssetPack || openedAssetShortHeader) && (
        <Line justifyContent="flex-end">
          <RaisedButton
            primary
            onClick={() => {
              if (!project) {
                return; // TODO: create a project, await, and then show dialog.
              }

              openAssetPackInstallDialog();
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
        assetShortHeadersToInstall &&
        !!assetShortHeadersToInstall.length && (
          <AssetPackInstallDialog
            assetPack={openedAssetPack}
            assetShortHeaders={assetShortHeadersToInstall}
            addedAssetIds={existingAssetStoreIds}
            onClose={() => setAssetShortHeadersToInstall(null)}
            onAssetsAdded={() => {
              setAssetShortHeadersToInstall(null);
            }}
            project={project}
            objectsContainer={null}
            resourceManagementProps={resourceManagementProps}
            onWillInstallExtension={onWillInstallExtension}
            onExtensionInstalled={onExtensionInstalled}
          />
        )}
    </SectionContainer>
  );
};

const StoreSectionWithErrorBoundary = (props: Props): React.Node => (
  <ErrorBoundary
    componentTitle={<Trans>Shop section</Trans>}
    scope="start-page-shop"
  >
    <StoreSection {...props} />
  </ErrorBoundary>
);

export default StoreSectionWithErrorBoundary;
