// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

import Text from '../../../../UI/Text';
import TextButton from '../../../../UI/TextButton';
import RaisedButton from '../../../../UI/RaisedButton';
import { Line, Column, Spacer, marginsSize } from '../../../../UI/Grid';
import { useResponsiveWindowWidth } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import {
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';

import {
  type FileMetadataAndStorageProviderName,
  type StorageProvider,
} from '../../../../ProjectsStorage';
import PreferencesContext from '../../../Preferences/PreferencesContext';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import SectionContainer, { SectionRow } from '../SectionContainer';
import ContextMenu, {
  type ContextMenuInterface,
} from '../../../../UI/Menu/ContextMenu';
import CircularProgress from '../../../../UI/CircularProgress';
import { type MenuItemTemplate } from '../../../../UI/Menu/Menu.flow';
import useAlertDialog from '../../../../UI/Alert/useAlertDialog';
import { deleteCloudProject } from '../../../../Utils/GDevelopServices/Project';
import {
  checkIfHasTooManyCloudProjects,
  MaxProjectCountAlertMessage,
} from './MaxProjectCountAlertMessage';
import optionalRequire from '../../../../Utils/OptionalRequire';
import { showErrorBox } from '../../../../UI/Messages/MessageBox';
import { getRelativeOrAbsoluteDisplayDate } from '../../../../Utils/DateDisplay';
import useForceUpdate from '../../../../Utils/UseForceUpdate';
import { ExampleStoreContext } from '../../../../AssetStore/ExampleStore/ExampleStoreContext';
import { SubscriptionSuggestionContext } from '../../../../Profile/Subscription/SubscriptionSuggestionContext';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';
import { type WidthType } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import Add from '../../../../UI/CustomSvgIcons/Add';
import ImageTileRow from '../../../../UI/ImageTileRow';
import { prepareExamples } from '../../../../AssetStore/ExampleStore';
import Skeleton from '@material-ui/lab/Skeleton';
import BackgroundText from '../../../../UI/BackgroundText';
import Paper from '../../../../UI/Paper';
import PlaceholderError from '../../../../UI/PlaceholderError';
import AlertMessage from '../../../../UI/AlertMessage';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '../../../../UI/IconButton';
import ThreeDotsMenu from '../../../../UI/CustomSvgIcons/ThreeDotsMenu';
import RouterContext from '../../../RouterContext';
import { useLongTouch } from '../../../../Utils/UseLongTouch';
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
};

const getTemplatesGridSizeFromWidth = (width: WidthType) => {
  switch (width) {
    case 'small':
      return 2;
    case 'medium':
      return 4;
    case 'large':
    default:
      return 6;
  }
};

const getProjectLineHeight = (width: WidthType) => {
  const lineHeight = width === 'small' ? 52 : 36;

  return lineHeight - 2 * marginsSize;
};

type Props = {|
  project: ?gdProject,
  canOpen: boolean,
  onChooseProject: () => void,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => void,
  onOpenNewProjectSetupDialog: (?ExampleShortHeader) => void,
  onShowAllExamples: () => void,
  onSelectExample: (exampleShortHeader: ExampleShortHeader) => void,
  storageProviders: Array<StorageProvider>,
|};

export type BuildSectionInterface = {|
  forceUpdate: () => void,
|};

const PrettyBreakablePath = ({ path }: {| path: string |}) => {
  const separatorIndices = Array.from(path)
    .map((char, index) => (['/', '\\'].includes(char) ? index : null))
    .filter(Boolean);
  if (separatorIndices.length === 0) return path;

  return separatorIndices.reduce((acc, separatorIndex, listIndex) => {
    const nextSeparatorIndex = separatorIndices[listIndex + 1];
    return [
      ...acc,
      <wbr key={separatorIndex} />,
      path.substring(separatorIndex, nextSeparatorIndex || path.length),
    ];
  }, []);
};

const getStorageProviderByInternalName = (
  storageProviders: Array<StorageProvider>,
  internalName: string
): ?StorageProvider => {
  return storageProviders.find(
    storageProvider => storageProvider.internalName === internalName
  );
};

const useStylesForListItemIcon = makeStyles({
  root: {
    minWidth: 0,
  },
});

const ProjectFileListItem = ({
  file,
  storageProviders,
  onOpenRecentFile,
  isWindowWidthMediumOrLarger,
}: {|
  file: FileMetadataAndStorageProviderName,
  storageProviders: Array<StorageProvider>,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => void,
  isWindowWidthMediumOrLarger: boolean,
|}) => {
  const contextMenu = React.useRef<?ContextMenuInterface>(null);
  const iconClasses = useStylesForListItemIcon();
  const { showDeleteConfirmation } = useAlertDialog();
  const { navigateToRoute } = React.useContext(RouterContext);
  const [pendingProject, setPendingProject] = React.useState<?string>(null);
  const { removeRecentProjectFile } = React.useContext(PreferencesContext);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);

  const storageProvider = getStorageProviderByInternalName(
    storageProviders,
    file.storageProviderName
  );

  const locateProjectFile = (file: FileMetadataAndStorageProviderName) => {
    electron.shell.showItemInFolder(
      path.resolve(file.fileMetadata.fileIdentifier)
    );
  };

  const onDeleteCloudProject = async (
    i18n: I18nType,
    { fileMetadata, storageProviderName }: FileMetadataAndStorageProviderName
  ) => {
    if (storageProviderName !== 'Cloud') return;
    const projectName = fileMetadata.name;
    if (!projectName) return; // Only cloud projects can be deleted, and all cloud projects have names.

    // Extract word translation to ensure it is not wrongly translated in the sentence.
    const translatedConfirmText = i18n._(t`delete`);

    const deleteAnswer = await showDeleteConfirmation({
      title: t`Do you really want to permanently delete your project ${projectName}?`,
      message: t`You’re about to permanently delete your project ${projectName}. You will no longer be able to access it.`,
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
      showErrorBox({
        message: i18n._(
          t`An error occurred when deleting cloud project ${projectName}. Please try again later.`
        ),
        rawError: error,
        errorId: 'cloud-project-delete-error',
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
    let actions = [
      { label: i18n._(t`Open`), click: () => onOpenRecentFile(file) },
    ];
    if (file.storageProviderName === 'Cloud') {
      actions = actions.concat([
        {
          label: i18n._(t`Delete`),
          click: () => onDeleteCloudProject(i18n, file),
        },
      ]);
    } else if (file.storageProviderName === 'LocalFile') {
      actions = actions.concat([
        {
          label: i18n._(t`Show in local folder`),
          click: () => locateProjectFile(file),
        },
        {
          label: i18n._(t`Remove from list`),
          click: () => removeRecentProjectFile(file),
        },
      ]);
    } else {
      actions = actions.concat([
        {
          label: i18n._(t`Remove from list`),
          click: () => removeRecentProjectFile(file),
        },
      ]);
    }

    const gameId = file.fileMetadata.gameId;
    if (gameId) {
      actions = actions.concat([
        { type: 'separator' },
        {
          label: i18n._(t`Manage game`),
          click: () =>
            navigateToRoute('games-dashboard', {
              'game-id': gameId,
            }),
        },
      ]);
    }

    return actions;
  };

  const openContextMenu = (
    event: MouseEvent,
    file: FileMetadataAndStorageProviderName
  ) => {
    if (contextMenu.current) {
      contextMenu.current.open(event.clientX, event.clientY, { file });
    }
  };

  const longTouchForContextMenuProps = useLongTouch(
    React.useCallback(
      event => {
        if (contextMenu.current) {
          contextMenu.current.open(event.clientX, event.clientY, { file });
        }
      },
      [contextMenu, file]
    )
  );
  return (
    <I18n>
      {({ i18n }) => (
        <>
          <ListItem
            button
            key={file.fileMetadata.fileIdentifier}
            onClick={() => {
              onOpenRecentFile(file);
            }}
            style={styles.listItem}
            onContextMenu={event => openContextMenu(event, file)}
            {...longTouchForContextMenuProps}
          >
            <>
              {storageProvider &&
                storageProvider.renderIcon &&
                !isWindowWidthMediumOrLarger && (
                  <ListItemAvatar
                    classes={iconClasses}
                    style={{
                      marginTop: 8,
                      alignSelf: 'flex-start',
                    }}
                  >
                    {storageProvider.renderIcon({
                      size: 'small',
                    })}
                  </ListItemAvatar>
                )}
              {isWindowWidthMediumOrLarger ? (
                <LineStackLayout justifyContent="flex-start" expand>
                  <Column expand>
                    <Line noMargin alignItems="center">
                      {storageProvider && storageProvider.renderIcon && (
                        <>
                          {storageProvider.renderIcon({
                            size: 'small',
                          })}
                          <Spacer />
                        </>
                      )}
                      <Text noMargin>
                        {file.fileMetadata.name || (
                          <PrettyBreakablePath
                            path={file.fileMetadata.fileIdentifier}
                          />
                        )}
                      </Text>

                      {pendingProject === file.fileMetadata.fileIdentifier && (
                        <>
                          <Spacer />
                          <CircularProgress size={16} />
                        </>
                      )}
                    </Line>
                  </Column>
                  <Column expand>
                    <Text noMargin>
                      {storageProvider ? i18n._(storageProvider.name) : ''}
                    </Text>
                  </Column>
                  <Column expand>
                    {file.fileMetadata.lastModifiedDate && (
                      <Text noMargin>
                        {getRelativeOrAbsoluteDisplayDate(
                          i18n,
                          file.fileMetadata.lastModifiedDate
                        )}
                      </Text>
                    )}
                  </Column>
                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      edge="end"
                      aria-label="menu"
                      onClick={event => {
                        // prevent triggering the click on the list item.
                        event.stopPropagation();
                        openContextMenu(event, file);
                      }}
                    >
                      <ThreeDotsMenu />
                    </IconButton>
                  </ListItemSecondaryAction>
                </LineStackLayout>
              ) : (
                <Column expand>
                  <Line
                    noMargin
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <ListItemText
                      primary={
                        file.fileMetadata.name || (
                          <PrettyBreakablePath
                            path={file.fileMetadata.fileIdentifier}
                          />
                        )
                      }
                      secondary={
                        file.fileMetadata.lastModifiedDate
                          ? getRelativeOrAbsoluteDisplayDate(
                              i18n,
                              file.fileMetadata.lastModifiedDate
                            )
                          : undefined
                      }
                      onContextMenu={event => openContextMenu(event, file)}
                      {...longTouchForContextMenuProps}
                    />
                    {pendingProject === file.fileMetadata.fileIdentifier && (
                      <CircularProgress size={24} />
                    )}
                  </Line>
                </Column>
              )}
            </>
          </ListItem>
          <ContextMenu
            ref={contextMenu}
            buildMenuTemplate={(_i18n, { file }) =>
              buildContextMenu(_i18n, file)
            }
          />
        </>
      )}
    </I18n>
  );
};

const BuildSection = React.forwardRef<Props, BuildSectionInterface>(
  (
    {
      project,
      canOpen,
      onChooseProject,
      onOpenNewProjectSetupDialog,
      onShowAllExamples,
      onSelectExample,
      onOpenRecentFile,
      storageProviders,
    },
    ref
  ) => {
    const { getRecentProjectFiles } = React.useContext(PreferencesContext);
    const { allExamples } = React.useContext(ExampleStoreContext);
    const authenticatedUser = React.useContext(AuthenticatedUserContext);
    const { openSubscriptionDialog } = React.useContext(
      SubscriptionSuggestionContext
    );
    const {
      cloudProjects,
      limits,
      cloudProjectsFetchingErrorLabel,
      onCloudProjectsChanged,
    } = authenticatedUser;
    const windowWidth = useResponsiveWindowWidth();
    const forceUpdate = useForceUpdate();

    React.useImperativeHandle(ref, () => ({
      forceUpdate,
    }));

    let projectFiles: Array<FileMetadataAndStorageProviderName> = getRecentProjectFiles().filter(
      file => file.fileMetadata
    );

    if (cloudProjects) {
      projectFiles = projectFiles.concat(
        cloudProjects
          .map(cloudProject => {
            if (cloudProject.deletedAt) return null;
            const file: FileMetadataAndStorageProviderName = {
              storageProviderName: 'Cloud',
              fileMetadata: {
                fileIdentifier: cloudProject.id,
                lastModifiedDate: Date.parse(cloudProject.lastModifiedAt),
                name: cloudProject.name,
                gameId: cloudProject.gameId,
              },
            };
            return file;
          })
          .filter(Boolean)
      );
    }
    const hasTooManyCloudProjects = checkIfHasTooManyCloudProjects(
      authenticatedUser
    );

    projectFiles.sort((a, b) => {
      if (!a.fileMetadata.lastModifiedDate) return 1;
      if (!b.fileMetadata.lastModifiedDate) return -1;
      return b.fileMetadata.lastModifiedDate - a.fileMetadata.lastModifiedDate;
    });

    const isWindowWidthMediumOrLarger = windowWidth !== 'small';
    const skeletonLineHeight = getProjectLineHeight(windowWidth);

    return (
      <>
        <SectionContainer
          title={<Trans>My projects</Trans>}
          renderFooter={() =>
            limits && hasTooManyCloudProjects ? (
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
            ) : null
          }
        >
          <SectionRow>
            <ImageTileRow
              isLoading={!allExamples}
              items={
                allExamples
                  ? prepareExamples(allExamples).map(example => ({
                      onClick: () => onSelectExample(example),
                      imageUrl: example.previewImageUrls[0],
                    }))
                  : []
              }
              title={<Trans>Recommended templates</Trans>}
              onShowAll={onShowAllExamples}
              showAllIcon={<Add fontSize="small" />}
              getColumnsFromWidth={getTemplatesGridSizeFromWidth}
              getLimitFromWidth={getTemplatesGridSizeFromWidth}
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
                <Text size="section-title">
                  <Trans>Existing projects</Trans>
                </Text>
              </Column>
              <Column noMargin>
                <LineStackLayout noMargin>
                  <RaisedButton
                    primary
                    fullWidth={!canOpen}
                    label={<Trans>Create a project</Trans>}
                    onClick={() =>
                      onOpenNewProjectSetupDialog(/*exampleShortHeader=*/ null)
                    }
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
                        label={<Trans>Open a project</Trans>}
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
                {isWindowWidthMediumOrLarger && (
                  <LineStackLayout justifyContent="space-between">
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
                  </LineStackLayout>
                )}
                <List>
                  {authenticatedUser.loginState === 'loggingIn' &&
                  projectFiles.length === 0 ? ( // Only show skeleton on first load
                    new Array(10).fill(0).map((_, index) => (
                      <ListItem
                        style={styles.listItem}
                        key={`skeleton-${index}`}
                      >
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
                        storageProviders={storageProviders}
                        isWindowWidthMediumOrLarger={
                          isWindowWidthMediumOrLarger
                        }
                        onOpenRecentFile={onOpenRecentFile}
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
                              Create your first project using one of our
                              templates or start from scratch.
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
  }
);

export default BuildSection;
