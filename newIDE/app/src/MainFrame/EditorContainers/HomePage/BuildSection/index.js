// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans, t } from '@lingui/macro';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

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
import PreferencesContext from '../../../Preferences/PreferencesContext';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import SectionContainer, { SectionRow } from '../SectionContainer';
import {
  checkIfHasTooManyCloudProjects,
  MaxProjectCountAlertMessage,
} from './MaxProjectCountAlertMessage';
import { ExampleStoreContext } from '../../../../AssetStore/ExampleStore/ExampleStoreContext';
import { SubscriptionSuggestionContext } from '../../../../Profile/Subscription/SubscriptionSuggestionContext';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';
import Add from '../../../../UI/CustomSvgIcons/Add';
import Skeleton from '@material-ui/lab/Skeleton';
import BackgroundText from '../../../../UI/BackgroundText';
import Paper from '../../../../UI/Paper';
import PlaceholderError from '../../../../UI/PlaceholderError';
import AlertMessage from '../../../../UI/AlertMessage';
import IconButton from '../../../../UI/IconButton';
import { type PrivateGameTemplateListingData } from '../../../../Utils/GDevelopServices/Shop';
import { PrivateGameTemplateStoreContext } from '../../../../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';
import ChevronArrowRight from '../../../../UI/CustomSvgIcons/ChevronArrowRight';
import Refresh from '../../../../UI/CustomSvgIcons/Refresh';
import ProjectFileListItem from './ProjectFileListItem';
import { type MenuItemTemplate } from '../../../../UI/Menu/Menu.flow';
import {
  getExampleAndTemplateTiles,
  getLastModifiedInfoByProjectId,
  getProjectLineHeight,
  transformCloudProjectsIntoFileMetadataWithStorageProviderName,
} from './utils';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import InfoBar from '../../../../UI/Messages/InfoBar';
import GridList from '@material-ui/core/GridList';
import type { WindowSizeType } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import useAlertDialog from '../../../../UI/Alert/useAlertDialog';
import optionalRequire from '../../../../Utils/OptionalRequire';
import { deleteCloudProject } from '../../../../Utils/GDevelopServices/Project';
import { extractGDevelopApiErrorStatusAndCode } from '../../../../Utils/GDevelopServices/Errors';
import ContextMenu, {
  type ContextMenuInterface,
} from '../../../../UI/Menu/ContextMenu';
import type { ClientCoordinates } from '../../../../Utils/UseLongTouch';
import PromotionsSlideshow from '../../../../Promotions/PromotionsSlideshow';
import ExampleStore from '../../../../AssetStore/ExampleStore';

const electron = optionalRequire('electron');
const path = optionalRequire('path');

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

const locateProjectFile = (file: FileMetadataAndStorageProviderName) => {
  if (!electron) return;
  electron.shell.showItemInFolder(
    path.resolve(file.fileMetadata.fileIdentifier)
  );
};

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
  const { getRecentProjectFiles } = React.useContext(PreferencesContext);
  const { exampleShortHeaders } = React.useContext(ExampleStoreContext);
  const {
    showDeleteConfirmation,
    showConfirmation,
    showAlert,
  } = useAlertDialog();
  const { removeRecentProjectFile } = React.useContext(PreferencesContext);
  const [pendingProject, setPendingProject] = React.useState<?string>(null);
  const [
    showAllGameTemplates,
    setShowAllGameTemplates,
  ] = React.useState<boolean>(false);
  const { privateGameTemplateListingDatas } = React.useContext(
    PrivateGameTemplateStoreContext
  );
  const contextMenu = React.useRef<?ContextMenuInterface>(null);
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
    profile,
    cloudProjects,
    limits,
    cloudProjectsFetchingErrorLabel,
    onCloudProjectsChanged,
    onOpenLoginDialog,
  } = authenticatedUser;
  const { windowSize, isMobile, isLandscape } = useResponsiveWindowSize();
  const [
    lastModifiedInfoByProjectId,
    setLastModifiedInfoByProjectId,
  ] = React.useState({});

  const columnsCount = getItemsColumns(windowSize, isLandscape);

  let projectFiles: Array<FileMetadataAndStorageProviderName> = getRecentProjectFiles().filter(
    file => file.fileMetadata
  );

  if (cloudProjects) {
    projectFiles = projectFiles.concat(
      transformCloudProjectsIntoFileMetadataWithStorageProviderName(
        cloudProjects
      )
    );
  }

  // Look at projects where lastCommittedBy is not the current user, and fetch
  // public profiles of the users that have modified them.
  React.useEffect(
    () => {
      const updateModificationInfoByProjectId = async () => {
        if (!cloudProjects || !profile) return;

        const _lastModifiedInfoByProjectId = await getLastModifiedInfoByProjectId(
          {
            cloudProjects,
            profile,
          }
        );
        setLastModifiedInfoByProjectId(_lastModifiedInfoByProjectId);
      };

      updateModificationInfoByProjectId();
    },
    [cloudProjects, profile]
  );

  const hasTooManyCloudProjects = checkIfHasTooManyCloudProjects(
    authenticatedUser
  );

  const onDeleteCloudProject = async (
    i18n: I18nType,
    { fileMetadata, storageProviderName }: FileMetadataAndStorageProviderName
  ) => {
    if (storageProviderName !== 'Cloud') return;
    const projectName = fileMetadata.name;
    if (!projectName) return; // Only cloud projects can be deleted, and all cloud projects have names.

    const isCurrentProjectOpened =
      !!currentFileMetadata &&
      currentFileMetadata.fileIdentifier === fileMetadata.fileIdentifier;
    if (isCurrentProjectOpened) {
      const result = await showConfirmation({
        title: t`Project is opened`,
        message: t`You are about to delete the project ${projectName}, which is currently opened. If you proceed, the project will be closed and you will lose any unsaved changes. Do you want to proceed?`,
        confirmButtonLabel: t`Continue`,
      });
      if (!result) return;
      await closeProject();
    }

    // Extract word translation to ensure it is not wrongly translated in the sentence.
    const translatedConfirmText = i18n._(t`delete`);

    const deleteAnswer = await showDeleteConfirmation({
      title: t`Permanently delete the project?`,
      message: t`Project ${projectName} will be deleted. You will no longer be able to access it.`,
      fieldMessage: t`To confirm, type "${translatedConfirmText}"`,
      confirmText: translatedConfirmText,
      confirmButtonLabel: t`Delete project`,
    });
    if (!deleteAnswer) return;

    try {
      setPendingProject(fileMetadata.fileIdentifier);
      await deleteCloudProject(authenticatedUser, fileMetadata.fileIdentifier);
      authenticatedUser.onCloudProjectsChanged();
    } catch (error) {
      const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
        error
      );
      const message =
        extractedStatusAndCode && extractedStatusAndCode.status === 403
          ? t`You don't have permissions to delete this project.`
          : t`An error occurred when saving the project. Please try again later.`;
      showAlert({
        title: t`Unable to delete the project`,
        message,
      });
    } finally {
      setPendingProject(null);
    }
  };

  const buildContextMenu = (
    i18n: I18nType,
    file: ?FileMetadataAndStorageProviderName
  ): Array<MenuItemTemplate> => {
    if (!file) return [];

    const actions = [
      { label: i18n._(t`Open`), click: () => onOpenRecentFile(file) },
    ];
    if (file.storageProviderName === 'Cloud') {
      actions.push({
        label: i18n._(t`Delete`),
        click: () => onDeleteCloudProject(i18n, file),
      });
    } else if (file.storageProviderName === 'LocalFile') {
      actions.push(
        ...[
          {
            label: i18n._(t`Show in local folder`),
            click: () => locateProjectFile(file),
          },
          {
            label: i18n._(t`Remove from list`),
            click: () => removeRecentProjectFile(file),
          },
        ]
      );
    } else {
      actions.push({
        label: i18n._(t`Remove from list`),
        click: () => removeRecentProjectFile(file),
      });
    }

    const gameId = file.fileMetadata.gameId;
    if (gameId) {
      actions.push(
        ...[
          { type: 'separator' },
          {
            label: i18n._(t`Manage game`),
            click: () => onManageGame(gameId),
            enabled: canManageGame(gameId),
          },
        ]
      );
    }

    return actions;
  };

  const openContextMenu = React.useCallback(
    (event: ClientCoordinates, file: FileMetadataAndStorageProviderName) => {
      if (contextMenu.current) {
        contextMenu.current.open(event.clientX, event.clientY, { file });
      }
    },
    []
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

  projectFiles.sort((a, b) => {
    if (!a.fileMetadata.lastModifiedDate) return 1;
    if (!b.fileMetadata.lastModifiedDate) return -1;
    return b.fileMetadata.lastModifiedDate - a.fileMetadata.lastModifiedDate;
  });

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

  const skeletonLineHeight = getProjectLineHeight({ isMobile });
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
        {authenticatedUser.loginState === 'loggingIn' &&
        projectFiles.length === 0 ? ( // Only show skeleton on first load
          new Array(10).fill(0).map((_, index) => (
            <ListItem style={styles.listItem} key={`skeleton-${index}`}>
              <Line expand>
                <Column expand>
                  <Skeleton
                    variant="rect"
                    height={skeletonLineHeight}
                    style={styles.projectSkeleton}
                  />
                </Column>
              </Line>
            </ListItem>
          ))
        ) : projectFiles.length > 0 ? (
          <Line>
            <Column noMargin expand>
              {!isMobile && (
                <Line justifyContent="space-between">
                  <Column expand>
                    <Text color="secondary">
                      <Trans>File name</Trans>
                    </Text>
                  </Column>
                  <Column expand>
                    <Text color="secondary">
                      <Trans>Location</Trans>
                    </Text>
                  </Column>
                  <Column expand>
                    <Text color="secondary">
                      <Trans>Last edited</Trans>
                    </Text>
                  </Column>
                </Line>
              )}
              <List>
                {projectFiles.map(file => (
                  <ProjectFileListItem
                    key={file.fileMetadata.fileIdentifier}
                    file={file}
                    onOpenContextMenu={openContextMenu}
                    isLoading={
                      pendingProject === file.fileMetadata.fileIdentifier
                    }
                    currentFileMetadata={currentFileMetadata}
                    storageProviders={storageProviders}
                    isWindowSizeMediumOrLarger={!isMobile}
                    onOpenRecentFile={onOpenRecentFile}
                    lastModifiedInfo={
                      lastModifiedInfoByProjectId[
                        file.fileMetadata.fileIdentifier
                      ]
                    }
                  />
                ))}
                {isMobile && limits && hasTooManyCloudProjects && (
                  <MaxProjectCountAlertMessage
                    margin="dense"
                    limits={limits}
                    onUpgrade={() =>
                      openSubscriptionDialog({
                        analyticsMetadata: {
                          reason: 'Cloud Project limit reached',
                        },
                      })
                    }
                  />
                )}
              </List>
            </Column>
          </Line>
        ) : (
          <Line>
            <ListItem style={styles.listItem}>
              <Column expand>
                <Paper
                  variant="outlined"
                  background="dark"
                  style={styles.noProjectsContainer}
                >
                  <BackgroundText>
                    <Trans>No projects yet.</Trans>
                  </BackgroundText>
                  <BackgroundText>
                    <Trans>
                      Create your first project using one of our templates or
                      start from scratch.
                    </Trans>
                  </BackgroundText>
                </Paper>
              </Column>
            </ListItem>
          </Line>
        )}
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
      <ContextMenu
        ref={contextMenu}
        buildMenuTemplate={(_i18n, { file }) => buildContextMenu(_i18n, file)}
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
