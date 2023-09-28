// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

import Text from '../../../../UI/Text';
import { Line, Column, Spacer } from '../../../../UI/Grid';
import { LineStackLayout } from '../../../../UI/Layout';
import {
  type FileMetadataAndStorageProviderName,
  type StorageProvider,
} from '../../../../ProjectsStorage';
import PreferencesContext from '../../../Preferences/PreferencesContext';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../../../../Profile/AuthenticatedUserContext';
import ContextMenu, {
  type ContextMenuInterface,
} from '../../../../UI/Menu/ContextMenu';
import CircularProgress from '../../../../UI/CircularProgress';
import { type MenuItemTemplate } from '../../../../UI/Menu/Menu.flow';
import useAlertDialog from '../../../../UI/Alert/useAlertDialog';
import { deleteCloudProject } from '../../../../Utils/GDevelopServices/Project';
import optionalRequire from '../../../../Utils/OptionalRequire';
import { getRelativeOrAbsoluteDisplayDate } from '../../../../Utils/DateDisplay';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '../../../../UI/IconButton';
import ThreeDotsMenu from '../../../../UI/CustomSvgIcons/ThreeDotsMenu';
import RouterContext from '../../../RouterContext';
import { useLongTouch } from '../../../../Utils/UseLongTouch';
import { Avatar, Tooltip } from '@material-ui/core';
import { getGravatarUrl } from '../../../../UI/GravatarUrl';
import { type LastModifiedInfo } from './utils';
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

const ListItemLastModification = ({
  file,
  lastModifiedInfo,
  storageProvider,
  authenticatedUser,
}: {|
  file: FileMetadataAndStorageProviderName,
  lastModifiedInfo?: LastModifiedInfo | null,
  storageProvider: ?StorageProvider,
  authenticatedUser: AuthenticatedUser,
|}) => {
  const userEmail =
    authenticatedUser.profile && authenticatedUser.profile.email;
  const userUsername =
    authenticatedUser.profile && authenticatedUser.profile.username;
  const projectIsCloud =
    !!storageProvider && storageProvider.internalName === 'Cloud';
  const avatarUrl = lastModifiedInfo
    ? lastModifiedInfo.lastModifiedByIconUrl
    : projectIsCloud && userEmail
    ? getGravatarUrl(userEmail, {
        size: 40,
      })
    : null;
  const lastModifiedByUsername = lastModifiedInfo
    ? lastModifiedInfo.lastModifiedByUsername
    : userUsername;
  const lastModifiedAt = lastModifiedInfo
    ? lastModifiedInfo.lastModifiedAt
    : file.fileMetadata.lastModifiedDate
    ? file.fileMetadata.lastModifiedDate
    : null;

  if (!lastModifiedAt) return null;

  return (
    <I18n>
      {({ i18n }) => (
        <LineStackLayout noMargin alignItems="center">
          {avatarUrl ? (
            lastModifiedByUsername ? (
              <Tooltip title={lastModifiedByUsername}>
                <Avatar src={avatarUrl} style={{ width: 20, height: 20 }} />
              </Tooltip>
            ) : (
              <Avatar src={avatarUrl} style={{ width: 20, height: 20 }} />
            )
          ) : null}
          <Text noMargin>
            {getRelativeOrAbsoluteDisplayDate(i18n, lastModifiedAt)}
          </Text>
        </LineStackLayout>
      )}
    </I18n>
  );
};

type ProjectFileListItemProps = {|
  file: FileMetadataAndStorageProviderName,
  lastModifiedInfo?: LastModifiedInfo | null,
  storageProviders: Array<StorageProvider>,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => void,
  isWindowWidthMediumOrLarger: boolean,
  hideDeleteContextMenuAction?: boolean,
|};

export const ProjectFileListItem = ({
  file,
  lastModifiedInfo, // If null, the project has been modified last by the current user.
  storageProviders,
  onOpenRecentFile,
  isWindowWidthMediumOrLarger,
  hideDeleteContextMenuAction,
}: ProjectFileListItemProps) => {
  const contextMenu = React.useRef<?ContextMenuInterface>(null);
  const iconClasses = useStylesForListItemIcon();
  const { showDeleteConfirmation, showAlert } = useAlertDialog();
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
      const message =
        error.response && error.response.status === 403
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
    let actions = [
      { label: i18n._(t`Open`), click: () => onOpenRecentFile(file) },
    ];
    if (file.storageProviderName === 'Cloud') {
      if (!hideDeleteContextMenuAction) {
        actions = actions.concat([
          {
            label: i18n._(t`Delete`),
            click: () => onDeleteCloudProject(i18n, file),
          },
        ]);
      }
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
                    <ListItemLastModification
                      file={file}
                      lastModifiedInfo={lastModifiedInfo}
                      storageProvider={storageProvider}
                      authenticatedUser={authenticatedUser}
                    />
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

export default ProjectFileListItem;
