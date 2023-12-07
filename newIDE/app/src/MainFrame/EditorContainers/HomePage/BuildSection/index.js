// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans } from '@lingui/macro';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import Text from '../../../../UI/Text';
import TextButton from '../../../../UI/TextButton';
import RaisedButton from '../../../../UI/RaisedButton';
import { Line, Column, Spacer } from '../../../../UI/Grid';
import { useResponsiveWindowWidth } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
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
import {
  getExampleAndTemplateItemsForCarousel,
  getLastModifiedInfoByProjectId,
  getProjectLineHeight,
  transformCloudProjectsIntoFileMetadataWithStorageProviderName,
} from './utils';
import ErrorBoundary from '../../../../UI/ErrorBoundary';

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
};

type Props = {|
  project: ?gdProject,
  currentFileMetadata: ?FileMetadata,
  canOpen: boolean,
  onChooseProject: () => void,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => void,
  onOpenNewProjectSetupDialog: () => void,
  onShowAllExamples: () => void,
  onSelectExampleShortHeader: (exampleShortHeader: ExampleShortHeader) => void,
  onSelectPrivateGameTemplateListingData: (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ) => void,
  storageProviders: Array<StorageProvider>,
  i18n: I18nType,
  onManageGame: ({ gameId: string }) => void,
  canManageGame: ({ gameId: string }) => boolean,
|};

const BuildSection = ({
  project,
  currentFileMetadata,
  canOpen,
  onChooseProject,
  onOpenNewProjectSetupDialog,
  onShowAllExamples,
  onSelectExampleShortHeader,
  onSelectPrivateGameTemplateListingData,
  onOpenRecentFile,
  storageProviders,
  i18n,
  onManageGame,
  canManageGame,
}: Props) => {
  const { getRecentProjectFiles } = React.useContext(PreferencesContext);
  const { exampleShortHeaders } = React.useContext(ExampleStoreContext);
  const { privateGameTemplateListingDatas } = React.useContext(
    PrivateGameTemplateStoreContext
  );
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  const {
    profile,
    cloudProjects,
    limits,
    cloudProjectsFetchingErrorLabel,
    onCloudProjectsChanged,
  } = authenticatedUser;
  const windowWidth = useResponsiveWindowWidth();
  const isMobile = windowWidth === 'small';
  const [
    lastModifiedInfoByProjectId,
    setLastModifiedInfoByProjectId,
  ] = React.useState({});

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

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const refreshCloudProjects = React.useCallback(
    async () => {
      if (isRefreshing) return;
      try {
        setIsRefreshing(true);
        await onCloudProjectsChanged();
      } finally {
        // Wait a bit to avoid spam as we don't have a "loading" state.
        setTimeout(() => setIsRefreshing(false), 2000);
      }
    },
    [onCloudProjectsChanged, isRefreshing]
  );

  projectFiles.sort((a, b) => {
    if (!a.fileMetadata.lastModifiedDate) return 1;
    if (!b.fileMetadata.lastModifiedDate) return -1;
    return b.fileMetadata.lastModifiedDate - a.fileMetadata.lastModifiedDate;
  });

  const skeletonLineHeight = getProjectLineHeight(windowWidth);

  // Show a premium game template every 3 examples.
  const examplesAndTemplatesToDisplay = React.useMemo(
    () =>
      getExampleAndTemplateItemsForCarousel({
        authenticatedUser,
        privateGameTemplateListingDatas,
        exampleShortHeaders,
        onSelectPrivateGameTemplateListingData,
        onSelectExampleShortHeader,
        i18n,
      }),
    [
      authenticatedUser,
      exampleShortHeaders,
      onSelectExampleShortHeader,
      onSelectPrivateGameTemplateListingData,
      privateGameTemplateListingDatas,
      i18n,
    ]
  );

  return (
    <>
      <SectionContainer
        title={<Trans>My projects</Trans>}
        renderFooter={
          limits && hasTooManyCloudProjects
            ? () => (
                <Line>
                  <Column expand>
                    <MaxProjectCountAlertMessage
                      limits={limits}
                      onUpgrade={() =>
                        openSubscriptionDialog({
                          reason: 'Cloud Project limit reached',
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
            title={<Trans>Game templates</Trans>}
            displayItemTitles={false}
            browseAllLabel={<Trans>Browse all templates</Trans>}
            onBrowseAllClick={onShowAllExamples}
            items={examplesAndTemplatesToDisplay}
            browseAllIcon={<ChevronArrowRight fontSize="small" />}
            roundedImages
            hideArrows
          />
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
                >
                  <div style={styles.refreshIconContainer}>
                    <Refresh fontSize="inherit" />
                  </div>
                </IconButton>
              </LineStackLayout>
            </Column>
            <Column noMargin>
              <LineStackLayout noMargin>
                <RaisedButton
                  primary
                  fullWidth={!canOpen}
                  label={
                    isMobile ? (
                      <Trans>Create</Trans>
                    ) : (
                      <Trans>Create a project</Trans>
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
                      primary
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
                  projectFiles.map(file => (
                    <ProjectFileListItem
                      key={file.fileMetadata.fileIdentifier}
                      file={file}
                      currentFileMetadata={currentFileMetadata}
                      storageProviders={storageProviders}
                      isWindowWidthMediumOrLarger={!isMobile}
                      onOpenRecentFile={onOpenRecentFile}
                      lastModifiedInfo={
                        lastModifiedInfoByProjectId[
                          file.fileMetadata.fileIdentifier
                        ]
                      }
                      onManageGame={onManageGame}
                      canManageGame={canManageGame}
                    />
                  ))
                ) : (
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
                            Create your first project using one of our templates
                            or start from scratch.
                          </Trans>
                        </BackgroundText>
                      </Paper>
                    </Column>
                  </ListItem>
                )}
              </List>
            </Column>
          </Line>
        </SectionRow>
      </SectionContainer>
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
