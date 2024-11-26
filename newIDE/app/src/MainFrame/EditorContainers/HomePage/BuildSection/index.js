// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans, t } from '@lingui/macro';

import Text from '../../../../UI/Text';
import TextButton from '../../../../UI/TextButton';
import RaisedButton from '../../../../UI/RaisedButton';
import { Line, Column, Spacer } from '../../../../UI/Grid';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import {
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
import Carousel from '../../../../UI/Carousel';
import {
  type FileMetadataAndStorageProviderName,
  type FileMetadata,
  type StorageProvider,
} from '../../../../ProjectsStorage';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import SectionContainer, { SectionRow } from '../SectionContainer';
import {
  checkIfHasTooManyCloudProjects,
  MaxProjectCountAlertMessage,
} from '../CreateSection/MaxProjectCountAlertMessage';
import { ExampleStoreContext } from '../../../../AssetStore/ExampleStore/ExampleStoreContext';
import { SubscriptionSuggestionContext } from '../../../../Profile/Subscription/SubscriptionSuggestionContext';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';
import Add from '../../../../UI/CustomSvgIcons/Add';
import PlaceholderError from '../../../../UI/PlaceholderError';
import AlertMessage from '../../../../UI/AlertMessage';
import IconButton from '../../../../UI/IconButton';
import { type PrivateGameTemplateListingData } from '../../../../Utils/GDevelopServices/Shop';
import { PrivateGameTemplateStoreContext } from '../../../../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';
import ChevronArrowRight from '../../../../UI/CustomSvgIcons/ChevronArrowRight';
import Refresh from '../../../../UI/CustomSvgIcons/Refresh';
import { getExampleAndTemplateTiles } from '../CreateSection/utils';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import InfoBar from '../../../../UI/Messages/InfoBar';
import GridList from '@material-ui/core/GridList';
import type { WindowSizeType } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import PromotionsSlideshow from '../../../../Promotions/PromotionsSlideshow';
import ExampleStore from '../../../../AssetStore/ExampleStore';
import ProjectFileList from '../CreateSection/ProjectFileList';

const cellSpacing = 2;

const getItemsColumns = (windowSize: WindowSizeType, isLandscape: boolean) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 4 : 2;
    case 'medium':
      return 3;
    case 'large':
      return 4;
    case 'xlarge':
      return 5;
    default:
      return 3;
  }
};

const styles = {
  listItem: {
    padding: 0,
    marginTop: 2,
    marginBottom: 2,
    borderRadius: 8,
    overflowWrap: 'anywhere', // Ensure everything is wrapped on small devices.
  },
  projectSkeleton: { borderRadius: 6 },
  noProjectsContainer: { padding: 10 },
  refreshIconContainer: { fontSize: 20, display: 'flex', alignItems: 'center' },
  grid: {
    margin: 0,
    // Remove the scroll capability of the grid, the scroll view handles it.
    overflow: 'unset',
  },
};

type Props = {|
  project: ?gdProject,
  currentFileMetadata: ?FileMetadata,
  canOpen: boolean,
  onChooseProject: () => void,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => Promise<void>,
  onOpenNewProjectSetupDialog: () => void,
  onSelectExampleShortHeader: (exampleShortHeader: ExampleShortHeader) => void,
  onSelectPrivateGameTemplateListingData: (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ) => void,
  storageProviders: Array<StorageProvider>,
  i18n: I18nType,
  onManageGame: (gameId: string) => void,
  canManageGame: (gameId: string) => boolean,
  closeProject: () => Promise<void>,
|};

const BuildSection = ({
  project,
  currentFileMetadata,
  canOpen,
  onChooseProject,
  onOpenNewProjectSetupDialog,
  onSelectExampleShortHeader,
  onSelectPrivateGameTemplateListingData,
  onOpenRecentFile,
  storageProviders,
  i18n,
  onManageGame,
  canManageGame,
  closeProject,
}: Props) => {
  const { exampleShortHeaders } = React.useContext(ExampleStoreContext);
  const [
    showAllGameTemplates,
    setShowAllGameTemplates,
  ] = React.useState<boolean>(false);
  const { privateGameTemplateListingDatas } = React.useContext(
    PrivateGameTemplateStoreContext
  );
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [
    showCloudProjectsInfoIfNotLoggedIn,
    setShowCloudProjectsInfoIfNotLoggedIn,
  ] = React.useState<boolean>(false);
  const {
    authenticated,
    limits,
    cloudProjectsFetchingErrorLabel,
    onCloudProjectsChanged,
    onOpenLoginDialog,
  } = authenticatedUser;
  const { windowSize, isMobile, isLandscape } = useResponsiveWindowSize();

  const columnsCount = getItemsColumns(windowSize, isLandscape);

  const hasTooManyCloudProjects = checkIfHasTooManyCloudProjects(
    authenticatedUser
  );

  const refreshCloudProjects = React.useCallback(
    async () => {
      if (isRefreshing) return;
      if (!authenticated) {
        setShowCloudProjectsInfoIfNotLoggedIn(true);
        return;
      }
      try {
        setIsRefreshing(true);
        await onCloudProjectsChanged();
      } finally {
        // Wait a bit to avoid spam as we don't have a "loading" state.
        setTimeout(() => setIsRefreshing(false), 2000);
      }
    },
    [onCloudProjectsChanged, isRefreshing, authenticated]
  );

  const shouldDisplayPremiumGameTemplates =
    !authenticatedUser ||
    !authenticatedUser.limits ||
    !authenticatedUser.limits.capabilities.classrooms ||
    !authenticatedUser.limits.capabilities.classrooms.hidePremiumProducts;

  const examplesAndTemplatesToDisplay = React.useMemo(
    () =>
      getExampleAndTemplateTiles({
        receivedGameTemplates: authenticatedUser.receivedGameTemplates,
        privateGameTemplateListingDatas,
        exampleShortHeaders,
        onSelectPrivateGameTemplateListingData,
        onSelectExampleShortHeader,
        i18n,
        numberOfItemsExclusivelyInCarousel: isMobile ? 3 : 5,
        numberOfItemsInCarousel: isMobile ? 8 : 12,
        privateGameTemplatesPeriodicity: shouldDisplayPremiumGameTemplates
          ? 2
          : 0,
      }),
    [
      authenticatedUser.receivedGameTemplates,
      exampleShortHeaders,
      onSelectExampleShortHeader,
      onSelectPrivateGameTemplateListingData,
      privateGameTemplateListingDatas,
      i18n,
      isMobile,
      shouldDisplayPremiumGameTemplates,
    ]
  );

  const shouldDisplayAnnouncements =
    !authenticatedUser.limits ||
    !authenticatedUser.limits.capabilities.classrooms ||
    !authenticatedUser.limits.capabilities.classrooms.hidePlayTab;

  const pageContent = showAllGameTemplates ? (
    <SectionContainer
      backAction={() => setShowAllGameTemplates(false)}
      flexBody
    >
      <SectionRow expand>
        <ExampleStore
          onSelectExampleShortHeader={onSelectExampleShortHeader}
          onSelectPrivateGameTemplateListingData={
            onSelectPrivateGameTemplateListingData
          }
          i18n={i18n}
          columnsCount={getItemsColumns(windowSize, isLandscape)}
        />
      </SectionRow>
    </SectionContainer>
  ) : (
    <SectionContainer
      showUrgentAnnouncements={shouldDisplayAnnouncements}
      renderFooter={
        !isMobile && limits && hasTooManyCloudProjects
          ? () => (
              <Line>
                <Column expand>
                  <MaxProjectCountAlertMessage
                    limits={limits}
                    onUpgrade={() =>
                      openSubscriptionDialog({
                        analyticsMetadata: {
                          reason: 'Cloud Project limit reached',
                        },
                      })
                    }
                  />
                </Column>
              </Line>
            )
          : undefined
      }
    >
      <SectionRow>
        <Carousel
          title={<Trans>Ready-made games</Trans>}
          displayItemTitles={false}
          browseAllLabel={<Trans>Browse all templates</Trans>}
          onBrowseAllClick={() => setShowAllGameTemplates(true)}
          items={examplesAndTemplatesToDisplay.carouselThumbnailItems}
          browseAllIcon={<ChevronArrowRight fontSize="small" />}
          roundedImages
          displayArrowsOnDesktop
        />
        {shouldDisplayAnnouncements && (
          <>
            <Spacer />
            <Column noMargin>
              <PromotionsSlideshow />
            </Column>
          </>
        )}
      </SectionRow>
      <SectionRow>
        <ResponsiveLineStackLayout
          justifyContent="space-between"
          alignItems="center"
          noMargin
          expand
        >
          <Column noMargin>
            <LineStackLayout noMargin alignItems="center">
              <Text size="section-title">
                <Trans>My projects</Trans>
              </Text>
              <IconButton
                size="small"
                onClick={refreshCloudProjects}
                disabled={isRefreshing}
                tooltip={t`Refresh cloud projects`}
              >
                <div style={styles.refreshIconContainer}>
                  <Refresh fontSize="inherit" />
                </div>
              </IconButton>
            </LineStackLayout>
          </Column>
          <Column noMargin>
            <LineStackLayout noMargin alignItems="center">
              <RaisedButton
                primary
                size="medium"
                fullWidth={!canOpen}
                label={
                  isMobile ? (
                    <Trans>Create</Trans>
                  ) : (
                    <Trans>Create new game</Trans>
                  )
                }
                onClick={onOpenNewProjectSetupDialog}
                icon={<Add fontSize="small" />}
                id="home-create-project-button"
              />
              {canOpen && (
                <>
                  <Text>
                    <Trans>or</Trans>
                  </Text>
                  <Spacer />
                  <TextButton
                    secondary
                    label={
                      isMobile ? (
                        <Trans>Open</Trans>
                      ) : (
                        <Trans>Open a project</Trans>
                      )
                    }
                    onClick={onChooseProject}
                  />
                </>
              )}
            </LineStackLayout>
          </Column>
        </ResponsiveLineStackLayout>
        {cloudProjectsFetchingErrorLabel && (
          <Line>
            <PlaceholderError onRetry={onCloudProjectsChanged}>
              <AlertMessage kind="warning">
                {cloudProjectsFetchingErrorLabel}
              </AlertMessage>
            </PlaceholderError>
          </Line>
        )}
        <ProjectFileList
          i18n={i18n}
          game={null}
          onOpenProject={onOpenRecentFile}
          storageProviders={storageProviders}
          project={project}
          currentFileMetadata={currentFileMetadata}
          closeProject={closeProject}
        />
      </SectionRow>
      <SectionRow>
        <Line alignItems="center" noMargin expand>
          <Column noMargin>
            <Text size="section-title">
              <Trans>Start with a template</Trans>
            </Text>
          </Column>
        </Line>
        <GridList
          cols={columnsCount}
          style={styles.grid}
          cellHeight="auto"
          spacing={cellSpacing}
        >
          {examplesAndTemplatesToDisplay.gridItemsCompletingCarousel}
        </GridList>
      </SectionRow>
    </SectionContainer>
  );

  return (
    <>
      {pageContent}
      <InfoBar
        message={<Trans>Log in to see your cloud projects.</Trans>}
        visible={showCloudProjectsInfoIfNotLoggedIn}
        hide={() => setShowCloudProjectsInfoIfNotLoggedIn(false)}
        duration={5000}
        onActionClick={onOpenLoginDialog}
        actionLabel={<Trans>Log in</Trans>}
      />
    </>
  );
};

const BuildSectionWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Build section</Trans>}
    scope="start-page-build"
  >
    <BuildSection {...props} />
  </ErrorBoundary>
);

export default BuildSectionWithErrorBoundary;
