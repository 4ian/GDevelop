// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import ListItem from '@material-ui/core/ListItem';

import Text from '../../../../UI/Text';
import { Line, Column, Spacer } from '../../../../UI/Grid';
import { LineStackLayout } from '../../../../UI/Layout';
import {
  type FileMetadataAndStorageProviderName,
  type StorageProvider,
} from '../../../../ProjectsStorage';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../../../../Profile/AuthenticatedUserContext';
import CircularProgress from '../../../../UI/CircularProgress';
import { getRelativeOrAbsoluteDisplayDate } from '../../../../Utils/DateDisplay';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '../../../../UI/IconButton';
import ThreeDotsMenu from '../../../../UI/CustomSvgIcons/ThreeDotsMenu';
import {
  useLongTouch,
  type ClientCoordinates,
} from '../../../../Utils/UseLongTouch';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import { getGravatarUrl } from '../../../../UI/GravatarUrl';
import { type LastModifiedInfo } from './utils';
import DotBadge from '../../../../UI/DotBadge';
import { type FileMetadata } from '../../../../ProjectsStorage';
import StatusIndicator from './StatusIndicator';

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
              getRelativeOrAbsoluteDisplayDate({
                i18n,
                dateAsNumber: lastModifiedAt,
                sameDayFormat: 'todayAndHour',
                dayBeforeFormat: 'yesterdayAndHour',
                relativeLimit: 'currentWeek',
                sameWeekFormat: 'thisWeek',
              })
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
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => Promise<void>,
  isWindowSizeMediumOrLarger: boolean,
  isLoading: boolean,
  onOpenContextMenu: (
    event: ClientCoordinates,
    file: FileMetadataAndStorageProviderName
  ) => void,
|};

export const ProjectFileListItem = ({
  file,
  currentFileMetadata,
  lastModifiedInfo, // If null, the project has been modified last by the current user.
  storageProviders,
  onOpenRecentFile,
  isWindowSizeMediumOrLarger,
  isLoading,
  onOpenContextMenu,
}: ProjectFileListItemProps) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);

  const storageProvider = getStorageProviderByInternalName(
    storageProviders,
    file.storageProviderName
  );

  const longTouchForContextMenuProps = useLongTouch(
    React.useCallback(
      event => {
        onOpenContextMenu(event, file);
      },
      [onOpenContextMenu, file]
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
            onContextMenu={event => onOpenContextMenu(event, file)}
            {...longTouchForContextMenuProps}
          >
            {isWindowSizeMediumOrLarger ? (
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

                    {isLoading && (
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
                      onOpenContextMenu(event, file);
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
                  {isLoading && <CircularProgress size={24} />}
                </LineStackLayout>
              </Column>
            )}
          </ListItem>
        </>
      )}
    </I18n>
  );
};

export default ProjectFileListItem;
