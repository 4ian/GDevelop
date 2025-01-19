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
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
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
import optionalRequire from '../../../../Utils/OptionalRequire';
import ContextMenu, {
  type ContextMenuInterface,
} from '../../../../UI/Menu/ContextMenu';
import type { ClientCoordinates } from '../../../../Utils/UseLongTouch';
import PreferencesContext from '../../../Preferences/PreferencesContext';
import useAlertDialog from '../../../../UI/Alert/useAlertDialog';
// It's important to use remote and not electron for folder actions,
// otherwise they will be opened in the background.
// See https://github.com/electron/electron/issues/4349#issuecomment-777475765
const remote = optionalRequire('@electron/remote');
const shell = remote ? remote.shell : null;
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
  game: Game,
  onOpenProject: (file: FileMetadataAndStorageProviderName) => Promise<void>,
  storageProviders: Array<StorageProvider>,
  onDeleteCloudProject: (
    i18n: I18nType,
    file: FileMetadataAndStorageProviderName
  ) => Promise<void>,
  disabled: boolean,

  project: ?gdProject,
  currentFileMetadata: ?FileMetadata,
  closeProject: () => Promise<void>,
|};

const locateProjectFile = (file: FileMetadataAndStorageProviderName) => {
  if (!shell) return;
  shell.showItemInFolder(path.resolve(file.fileMetadata.fileIdentifier));
};

const ProjectFileList = ({
  project,
  currentFileMetadata,
  game,
  onOpenProject,
  storageProviders,
  closeProject,
  onDeleteCloudProject,
  disabled,
}: Props) => {
  const projectFiles = useProjectsListFor(game);
  const contextMenu = React.useRef<?ContextMenuInterface>(null);
  const [loadingProjectId, setLoadingProjectId] = React.useState<?string>(null);
  const { removeRecentProjectFile } = React.useContext(PreferencesContext);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const {
    profile,
    cloudProjects,
    cloudProjectsFetchingErrorLabel,
    onCloudProjectsChanged,
  } = authenticatedUser;
  const { isMobile } = useResponsiveWindowSize();
  const [
    lastModifiedInfoByProjectId,
    setLastModifiedInfoByProjectId,
  ] = React.useState({});
  const { showConfirmation } = useAlertDialog();

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

  const onRemoveRecentProjectFile = React.useCallback(
    async (file: FileMetadataAndStorageProviderName) => {
      const result = await showConfirmation({
        title: t`Remove project from list`,
        message: t`You are about to remove "${
          file.fileMetadata.name
        }" from the list of your projects.${'\n\n'}It will not delete it from your disk and you can always re-open it later. Do you want to proceed?`,
        confirmButtonLabel: t`Remove`,
      });
      if (!result) return;
      removeRecentProjectFile(file);
    },
    [removeRecentProjectFile, showConfirmation]
  );

  const onWillDeleteCloudProject = React.useCallback(
    async (i18n, file: FileMetadataAndStorageProviderName) => {
      setLoadingProjectId(file.fileMetadata.fileIdentifier);
      try {
        await onDeleteCloudProject(i18n, file);
      } finally {
        setLoadingProjectId(null);
      }
    },
    [onDeleteCloudProject]
  );

  const buildContextMenu = (
    i18n: I18nType,
    file: ?FileMetadataAndStorageProviderName
  ): Array<MenuItemTemplate> => {
    if (!file) return [];

    const actions = [
      { label: i18n._(t`Open`), click: () => onOpenProject(file) },
    ];
    if (file.storageProviderName === 'Cloud') {
      actions.push(
        { type: 'separator' },
        {
          label: i18n._(t`Delete`),
          click: () => onWillDeleteCloudProject(i18n, file),
        }
      );
    } else if (file.storageProviderName === 'LocalFile') {
      actions.push(
        ...[
          {
            label: i18n._(t`Show in local folder`),
            click: () => locateProjectFile(file),
          },
          { type: 'separator' },
          {
            label: i18n._(t`Remove from list`),
            click: () => onRemoveRecentProjectFile(file),
          },
        ]
      );
    } else {
      actions.push(
        { type: 'separator' },
        {
          label: i18n._(t`Remove from list`),
          click: () => onRemoveRecentProjectFile(file),
        }
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
        <Line noMargin>
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
                  disabled={disabled}
                  isLoading={
                    file.fileMetadata.fileIdentifier === loadingProjectId
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
