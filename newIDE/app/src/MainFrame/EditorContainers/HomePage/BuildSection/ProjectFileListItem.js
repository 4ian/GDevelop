// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import ListItem from '@material-ui/core/ListItem';

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
import DotBadge from '../../../../UI/DotBadge';
import { type FileMetadata } from '../../../../ProjectsStorage';
import StatusIndicator from './StatusIndicator';
import { extractGDevelopApiErrorStatusAndCode } from '../../../../Utils/GDevelopServices/Errors';
const electron = optionalRequire('electron');
const path = optionalRequire('path');

const styles = {
  listItem: {
    padding: 0,
    borderRadius: 8,
    overflowWrap: 'anywhere', // Ensure everything is wrapped on small devices.
  },
  projectSkeleton: { borderRadius: 6 },
  noProjectsContainer: { padding: 10 },
  avatar: {
    width: 20,
    height: 20,
  },
  mobileIconContainer: {
    marginTop: 4, // To align with project title.
  },
};

type AvatarWithStatusAndTooltipProps = {|
  avatarUrl: ?string,
  status: 'success' | 'error',
  tooltipMessage: ?string,
  hideStatus?: boolean,
|};

const AvatarWithStatusAndTooltip = ({
  avatarUrl,
  status,
  tooltipMessage,
  hideStatus,
}: AvatarWithStatusAndTooltipProps) =>
  !!avatarUrl ? (
    tooltipMessage ? (
      <DotBadge overlap="circle" color={status} invisible={hideStatus}>
        <Tooltip title={tooltipMessage}>
          <Avatar src={avatarUrl} style={styles.avatar} />
        </Tooltip>
      </DotBadge>
    ) : (
      <DotBadge overlap="circle" color={status} invisible={hideStatus}>
        <Avatar src={avatarUrl} style={styles.avatar} />
      </DotBadge>
    )
  ) : (
    <StatusIndicator status="success" />
  );

type ListItemLastModificationProps = {|
  file: FileMetadataAndStorageProviderName,
  lastModifiedInfo?: LastModifiedInfo | null, // If null, the project has been modified last by the current user.
  storageProvider: ?StorageProvider,
  authenticatedUser: AuthenticatedUser,
  currentFileMetadata: ?FileMetadata,
  textColor?: 'primary' | 'secondary',
|};

const ListItemLastModification = ({
  file,
  lastModifiedInfo,
  storageProvider,
  authenticatedUser,
  currentFileMetadata,
  textColor = 'primary',
}: ListItemLastModificationProps) => {
  const isProjectSavedOnCloud =
    !!storageProvider && storageProvider.internalName === 'Cloud';
  const isCurrentProjectOpened =
    !!currentFileMetadata &&
    currentFileMetadata.fileIdentifier === file.fileMetadata.fileIdentifier;
  const lastModifiedAt = !!lastModifiedInfo
    ? lastModifiedInfo.lastModifiedAt
    : !!file.fileMetadata.lastModifiedDate
    ? file.fileMetadata.lastModifiedDate
    : null;
  if (!lastModifiedAt) return null;

  // Current user info
  const currentUserEmail =
    authenticatedUser.profile && authenticatedUser.profile.email;
  const currentUserUsername =
    authenticatedUser.profile && authenticatedUser.profile.username;
  const currentUserAvatarUrl =
    isProjectSavedOnCloud && currentUserEmail
      ? getGravatarUrl(currentUserEmail, {
          size: 40,
        })
      : null;

  // Last editor info
  const lastEditorUsername = !!lastModifiedInfo
    ? lastModifiedInfo.lastModifiedByUsername
    : currentUserUsername;
  const lastEditorAvatarUrl = !!lastModifiedInfo
    ? lastModifiedInfo.lastModifiedByIconUrl
    : currentUserAvatarUrl;

  const isProjectOpenedNotTheLatestVersion =
    !!isCurrentProjectOpened &&
    !!currentFileMetadata &&
    !!lastModifiedInfo &&
    currentFileMetadata.version !== lastModifiedInfo.lastKnownVersionId;

  return (
    <I18n>
      {({ i18n }) => (
        <LineStackLayout noMargin alignItems="center">
          {isCurrentProjectOpened && (
            <AvatarWithStatusAndTooltip
              avatarUrl={currentUserAvatarUrl}
              tooltipMessage={currentUserUsername}
              status="success"
            />
          )}
          {isProjectSavedOnCloud &&
            (!isCurrentProjectOpened || isProjectOpenedNotTheLatestVersion) && (
              <AvatarWithStatusAndTooltip
                avatarUrl={lastEditorAvatarUrl}
                tooltipMessage={lastEditorUsername}
                status="error"
                hideStatus={!isProjectOpenedNotTheLatestVersion}
              />
            )}
          <Text noMargin color={textColor}>
            {isCurrentProjectOpened ? (
              <Trans>Modifying</Trans>
            ) : (
              getRelativeOrAbsoluteDisplayDate(i18n, lastModifiedAt)
            )}
          </Text>
        </LineStackLayout>
      )}
    </I18n>
  );
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

type ProjectFileListItemProps = {|
  file: FileMetadataAndStorageProviderName,
  currentFileMetadata: ?FileMetadata,
  lastModifiedInfo?: LastModifiedInfo | null,
  storageProviders: Array<StorageProvider>,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => void,
  isWindowWidthMediumOrLarger: boolean,
  hideDeleteContextMenuAction?: boolean,
|};

export const ProjectFileListItem = ({
  file,
  currentFileMetadata,
  lastModifiedInfo, // If null, the project has been modified last by the current user.
  storageProviders,
  onOpenRecentFile,
  isWindowWidthMediumOrLarger,
  hideDeleteContextMenuAction,
}: ProjectFileListItemProps) => {
  const contextMenu = React.useRef<?ContextMenuInterface>(null);
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
                    currentFileMetadata={currentFileMetadata}
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
                <LineStackLayout alignItems="start">
                  {storageProvider && storageProvider.renderIcon && (
                    <Column noMargin>
                      <div style={styles.mobileIconContainer}>
                        {storageProvider.renderIcon({
                          size: 'small',
                        })}
                      </div>
                    </Column>
                  )}
                  <Column noMargin>
                    <Text noMargin>
                      {file.fileMetadata.name || (
                        <PrettyBreakablePath
                          path={file.fileMetadata.fileIdentifier}
                        />
                      )}
                    </Text>

                    <ListItemLastModification
                      file={file}
                      lastModifiedInfo={lastModifiedInfo}
                      storageProvider={storageProvider}
                      authenticatedUser={authenticatedUser}
                      currentFileMetadata={currentFileMetadata}
                      textColor="secondary"
                    />
                  </Column>
                  {pendingProject === file.fileMetadata.fileIdentifier && (
                    <CircularProgress size={24} />
                  )}
                </LineStackLayout>
              </Column>
            )}
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
