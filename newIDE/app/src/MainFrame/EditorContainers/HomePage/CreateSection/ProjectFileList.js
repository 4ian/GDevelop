// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans, t } from '@lingui/macro';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import Text from '../../../../UI/Text';
import { Line, Column } from '../../../../UI/Grid';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import {
  type FileMetadataAndStorageProviderName,
  type FileMetadata,
  type StorageProvider,
} from '../../../../ProjectsStorage';
import { type Game } from '../../../../Utils/GDevelopServices/Game';
import PreferencesContext from '../../../Preferences/PreferencesContext';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import {
  checkIfHasTooManyCloudProjects,
  MaxProjectCountAlertMessage,
} from './MaxProjectCountAlertMessage';
import { SubscriptionSuggestionContext } from '../../../../Profile/Subscription/SubscriptionSuggestionContext';
import Skeleton from '@material-ui/lab/Skeleton';
import BackgroundText from '../../../../UI/BackgroundText';
import Paper from '../../../../UI/Paper';
import PlaceholderError from '../../../../UI/PlaceholderError';
import AlertMessage from '../../../../UI/AlertMessage';
import ProjectFileListItem from './ProjectFileListItem';
import { type MenuItemTemplate } from '../../../../UI/Menu/Menu.flow';
import {
  getLastModifiedInfoByProjectId,
  getProjectLineHeight,
  useProjectsListFor,
} from './utils';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import useAlertDialog from '../../../../UI/Alert/useAlertDialog';
import optionalRequire from '../../../../Utils/OptionalRequire';
import { deleteCloudProject } from '../../../../Utils/GDevelopServices/Project';
import { extractGDevelopApiErrorStatusAndCode } from '../../../../Utils/GDevelopServices/Errors';
import ContextMenu, {
  type ContextMenuInterface,
} from '../../../../UI/Menu/ContextMenu';
import type { ClientCoordinates } from '../../../../Utils/UseLongTouch';
const electron = optionalRequire('electron');
const path = optionalRequire('path');

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
  i18n: I18nType,

  game: ?Game,
  onOpenProject: (file: FileMetadataAndStorageProviderName) => Promise<void>,
  storageProviders: Array<StorageProvider>,

  project: ?gdProject,
  currentFileMetadata: ?FileMetadata,
  closeProject: () => Promise<void>,
|};

const locateProjectFile = (file: FileMetadataAndStorageProviderName) => {
  if (!electron) return;
  electron.shell.showItemInFolder(
    path.resolve(file.fileMetadata.fileIdentifier)
  );
};

const ProjectFileList = ({
  project,
  currentFileMetadata,
  game,
  onOpenProject,
  storageProviders,
  i18n,
  closeProject,
}: Props) => {
  const {
    showDeleteConfirmation,
    showConfirmation,
    showAlert,
  } = useAlertDialog();
  const projectFiles = useProjectsListFor(game);
  const { removeRecentProjectFile } = React.useContext(PreferencesContext);
  const [pendingProject, setPendingProject] = React.useState<?string>(null);
  const contextMenu = React.useRef<?ContextMenuInterface>(null);
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
  const { isMobile } = useResponsiveWindowSize();
  const [
    lastModifiedInfoByProjectId,
    setLastModifiedInfoByProjectId,
  ] = React.useState({});

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
      { label: i18n._(t`Open`), click: () => onOpenProject(file) },
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

  const skeletonLineHeight = getProjectLineHeight({ isMobile });

  if (cloudProjectsFetchingErrorLabel) {
    return (
      <Line>
        <PlaceholderError onRetry={onCloudProjectsChanged}>
          <AlertMessage kind="warning">
            {cloudProjectsFetchingErrorLabel}
          </AlertMessage>
        </PlaceholderError>
      </Line>
    );
  }

  return (
    <>
      {authenticatedUser.loginState === 'loggingIn' &&
      projectFiles.length === 0 ? ( // Only show skeleton on first load
        new Array(3).fill(0).map((_, index) => (
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
                  onOpenProject={onOpenProject}
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
                {game ? (
                  <BackgroundText>
                    <Trans>
                      No projects found for this game. Open manually a local
                      project to have it added to the game dashboard.
                    </Trans>
                  </BackgroundText>
                ) : (
                  <>
                    <BackgroundText>
                      <Trans>No projects yet.</Trans>
                    </BackgroundText>
                    <BackgroundText>
                      <Trans>
                        Create your first project using one of our templates or
                        start from scratch.
                      </Trans>
                    </BackgroundText>
                  </>
                )}
              </Paper>
            </Column>
          </ListItem>
        </Line>
      )}
      <ContextMenu
        ref={contextMenu}
        buildMenuTemplate={(_i18n, { file }) => buildContextMenu(_i18n, file)}
      />
    </>
  );
};

const ProjectFileListWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Project file list</Trans>}
    scope="project-file-list"
  >
    <ProjectFileList {...props} />
  </ErrorBoundary>
);

export default ProjectFileListWithErrorBoundary;
