// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans, t } from '@lingui/macro';
import Avatar from '@material-ui/core/Avatar';
import Collapse from '@material-ui/core/Collapse';
import ButtonBase from '@material-ui/core/ButtonBase';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import {
  CLOUD_PROJECT_VERSION_LABEL_MAX_LENGTH,
  type FilledCloudProjectVersion,
} from '../Utils/GDevelopServices/Project';
import { type UserPublicProfileByIds } from '../Utils/GDevelopServices/User';
import { Column, Line, Spacer } from '../UI/Grid';
import Text from '../UI/Text';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import IconButton from '../UI/IconButton';
import ChevronArrowBottom from '../UI/CustomSvgIcons/ChevronArrowBottom';
import ChevronArrowRight from '../UI/CustomSvgIcons/ChevronArrowRight';
import ThreeDotsMenu from '../UI/CustomSvgIcons/ThreeDotsMenu';
import {
  shouldCloseOrCancel,
  shouldValidate,
} from '../UI/KeyboardShortcuts/InteractionKeys';
import TextField, { type TextFieldInterface } from '../UI/TextField';
import HistoryIcon from '../UI/CustomSvgIcons/History';
import type { OpenedVersionStatus } from '.';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import type { GDevelopTheme } from '../UI/Theme';
import Chip from '../UI/Chip';
import CircularProgress from '../UI/CircularProgress';

const thisYear = new Date().getFullYear();

const styles = {
  avatar: {
    width: 20,
    height: 20,
  },
  greyed: { opacity: 0.7 },
  versionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 30, // Width of the collapse icon button.
  },
  dateContainer: {
    flexShrink: 0,
  },
  iconContainer: {
    fontSize: 20,
    display: 'flex',
    alignItems: 'center',
  },
  restoredVersionContainer: {
    opacity: 0.7,
  },
  sharedRowStyle: {
    display: 'flex',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
  },
  labelTextfield: { width: '100%' },
  datSubRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px 12px 2px 2px',
    borderRadius: 4,
  },
  versionSubRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2px 12px 2px 32px',
    borderRadius: 4,
  },
  statusIndicator: {
    height: 6,
    width: 6,
    borderRadius: 3,
  },
};

const getStatusColor = (
  gdevelopTheme: GDevelopTheme,
  status: 'unsavedChanges' | 'saving' | 'saved' | 'latest'
) => {
  console.log(gdevelopTheme);
  return status === 'unsavedChanges'
    ? gdevelopTheme.statusIndicator.error
    : status === 'saving'
    ? gdevelopTheme.statusIndicator.warning
    : status === 'latest'
    ? gdevelopTheme.palette.secondary
    : gdevelopTheme.statusIndicator.success;
};

const StatusIndicator = ({
  status,
}: {|
  status: 'unsavedChanges' | 'saving' | 'saved' | 'latest' | 'opened',
|}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  if (status === 'opened') return null;
  const backgroundColor = getStatusColor(gdevelopTheme, status);
  return <span style={{ ...styles.statusIndicator, backgroundColor }} />;
};

const useOutline = (
  version: FilledCloudProjectVersion,
  openedVersionStatus: ?OpenedVersionStatus
) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  if (
    !openedVersionStatus ||
    openedVersionStatus.id !== version.id ||
    openedVersionStatus.status !== 'unsavedChanges'
  )
    return undefined;

  return { outline: `1px solid ${gdevelopTheme.statusIndicator.error}` };
};

const StatusChip = ({
  status,
}: {|
  status: 'unsavedChanges' | 'saving' | 'saved' | 'latest',
|}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const label =
    status === 'unsavedChanges' ? (
      <Trans>Unsaved changes</Trans>
    ) : status === 'saving' ? (
      <Trans>Saving...</Trans>
    ) : status === 'latest' ? (
      <Trans>Latest save</Trans>
    ) : (
      <Trans>Changes saved</Trans>
    );
  const backgroundColor = getStatusColor(gdevelopTheme, status);

  return (
    <Chip
      style={{
        backgroundColor,
        color: '#111111',
        padding: '3px 0',
        height: 'auto',
      }}
      label={label}
    />
  );
};

const useClassesForRowContainer = makeStyles(theme =>
  createStyles({
    root: {
      ...styles.sharedRowStyle,
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
      '&.selected': {
        backgroundColor: theme.palette.action.focus,
      },
    },
  })
);

type Props = {|
  version: FilledCloudProjectVersion,
  usersPublicProfileByIds: UserPublicProfileByIds,
  isEditing: boolean,
  isLatest: boolean,
  onRename: (FilledCloudProjectVersion, string) => Promise<void>,
  isLoading: boolean,
  onCancelRenaming: () => void,
  onContextMenu: (
    event: PointerEvent,
    version: FilledCloudProjectVersion
  ) => void,
  displayFullDate?: boolean,
  openedVersionStatus: ?OpenedVersionStatus,
  getAnonymousAvatar: () => {| src: string, alt: string |},
|};

const ProjectVersionRow = ({
  version,
  usersPublicProfileByIds,
  isEditing,
  isLatest,
  isLoading,
  onRename,
  onCancelRenaming,
  onContextMenu,
  displayFullDate,
  openedVersionStatus,
  getAnonymousAvatar,
}: Props) => {
  const textFieldRef = React.useRef<?TextFieldInterface>(null);
  const [newLabel, setNewLabel] = React.useState<string>(version.label || '');
  const authorPublicProfile = version.userId
    ? usersPublicProfileByIds[version.userId]
    : null;

  const validateNewLabel = () => {
    onRename(version, newLabel);
  };

  const classes = useClassesForRowContainer();
  const outlineStyle = useOutline(version, openedVersionStatus);
  const anonymousAvatar = getAnonymousAvatar();
  const versionStatus =
    openedVersionStatus &&
    openedVersionStatus.status !== 'opened' &&
    openedVersionStatus.id === version.id
      ? openedVersionStatus.status
      : isLatest
      ? 'latest'
      : null;

  return (
    <I18n>
      {({ i18n }) => (
        <div
          className={`${classes.root}${
            openedVersionStatus && openedVersionStatus.id === version.id
              ? ' selected'
              : ''
          }`}
          style={outlineStyle}
        >
          <Column noMargin expand>
            {versionStatus && (
              <>
                <Line noMargin>
                  <StatusChip status={versionStatus} />
                </Line>
                <Spacer />
              </>
            )}
            {isEditing ? (
              <TextField
                ref={textFieldRef}
                margin="none"
                value={newLabel}
                translatableHintText={t`End of jam`}
                onChange={(event, text) =>
                  setNewLabel(
                    text.slice(0, CLOUD_PROJECT_VERSION_LABEL_MAX_LENGTH)
                  )
                }
                autoFocus="desktopAndMobileDevices"
                onKeyPress={event => {
                  if (shouldValidate(event)) {
                    validateNewLabel();
                  }
                }}
                onKeyDown={event => {
                  // Prevent parent drawer to be closed when Esc is hit.
                  event.stopPropagation();
                }}
                onKeyUp={event => {
                  if (shouldCloseOrCancel(event)) {
                    setNewLabel(version.label || '');
                    onCancelRenaming();
                  }
                }}
                style={styles.labelTextfield}
              />
            ) : version.label ? (
              <LineStackLayout noMargin>
                <Text noMargin>{version.label}</Text>
                {isLoading && (
                  <Column noMargin>
                    <CircularProgress size={20} />
                  </Column>
                )}
                <div style={styles.dateContainer}>
                  <Text noMargin style={styles.greyed}>
                    {i18n.date(
                      version.createdAt,
                      displayFullDate
                        ? {
                            dateStyle: 'long',
                            timeStyle: 'short',
                          }
                        : {
                            hour: 'numeric',
                            minute: 'numeric',
                          }
                    )}
                  </Text>
                </div>
              </LineStackLayout>
            ) : (
              <Text noMargin>
                {i18n.date(version.createdAt, {
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </Text>
            )}
            {version.restoredFromVersion && (
              <div style={styles.restoredVersionContainer}>
                <LineStackLayout noMargin alignItems="center">
                  <div style={styles.iconContainer}>
                    <HistoryIcon fontSize="inherit" />
                  </div>
                  <Text noMargin>
                    {version.restoredFromVersion.label ||
                      i18n.date(version.restoredFromVersion.createdAt, {
                        dateStyle: 'long',
                        timeStyle: 'short',
                      })}
                  </Text>
                </LineStackLayout>
              </div>
            )}
            {authorPublicProfile ? (
              <LineStackLayout noMargin alignItems="center">
                <Avatar
                  src={authorPublicProfile.iconUrl}
                  style={styles.avatar}
                />
                <Text noMargin style={styles.greyed}>
                  {authorPublicProfile.username}
                </Text>
              </LineStackLayout>
            ) : (
              <LineStackLayout noMargin alignItems="center">
                <img
                  src={anonymousAvatar.src}
                  alt={anonymousAvatar.alt}
                  style={styles.avatar}
                />
                <Text noMargin style={styles.greyed}>
                  <Trans>Anonymous</Trans>
                </Text>
              </LineStackLayout>
            )}
          </Column>
          <IconButton
            size="small"
            onClick={event => {
              onContextMenu(event, version);
            }}
          >
            <ThreeDotsMenu />
          </IconButton>
        </div>
      )}
    </I18n>
  );
};

const useClassesForDayCollapse = makeStyles(theme =>
  createStyles({
    root: {
      ...styles.sharedRowStyle,
      justifyContent: 'flex-start',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
      '&:focus': {
        backgroundColor: theme.palette.action.hover,
      },
    },
    datSubRow: {
      ...styles.datSubRow,
      '&.selected': {
        backgroundColor: theme.palette.action.focus,
      },
    },
    versionSubRow: {
      ...styles.versionSubRow,
      '&.selected': {
        backgroundColor: theme.palette.action.focus,
      },
    },
  })
);

type DayGroupRowProps = {|
  day: number,
  versions: FilledCloudProjectVersion[],
  isOpenedInitially: boolean,
  editedVersionId: ?string,
  latestVersionId: string,
  onRenameVersion: (FilledCloudProjectVersion, string) => Promise<void>,
  loadingVersionId: ?string,
  onCancelRenaming: () => void,
  onContextMenu: (
    event: PointerEvent,
    version: FilledCloudProjectVersion
  ) => void,
  openedVersionStatus: ?OpenedVersionStatus,
  usersPublicProfileByIds: UserPublicProfileByIds,
  getAnonymousAvatar: () => {| src: string, alt: string |},
|};

export const DayGroupRow = ({
  day,
  versions,
  isOpenedInitially,
  editedVersionId,
  latestVersionId,
  loadingVersionId,
  onRenameVersion,
  onCancelRenaming,
  onContextMenu,
  openedVersionStatus,
  usersPublicProfileByIds,
  getAnonymousAvatar,
}: DayGroupRowProps) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(isOpenedInitially);
  const displayYear = new Date(day).getFullYear() !== thisYear;
  const namedVersions = [];
  let openedVersion = null;
  let latestVersion = null;

  for (let i = 0; i < versions.length; i++) {
    const version = versions[i];
    if (version.label) {
      namedVersions.push(version);
    }
    if (openedVersionStatus && version.id === openedVersionStatus.id) {
      openedVersion = version;
    } else if (version.id === latestVersionId) {
      latestVersion = version;
    }
  }

  const shouldHighlightDay = !!openedVersion && !openedVersion.label && !isOpen;
  const shouldDisplayLatestIndicatorOnDay =
    !!latestVersion && !latestVersion.label && !isOpen;

  const classes = useClassesForDayCollapse();

  return (
    <I18n>
      {({ i18n }) => (
        <React.Fragment>
          <ButtonBase
            onClick={() => setIsOpen(!isOpen)}
            className={classes.root}
          >
            <Column noMargin expand>
              <div
                className={`${classes.datSubRow}${
                  shouldHighlightDay ? ' selected' : ''
                }`}
              >
                {isOpen ? <ChevronArrowBottom /> : <ChevronArrowRight />}
                <Line
                  noMargin
                  justifyContent="space-between"
                  expand
                  alignItems="center"
                >
                  <Text noMargin>
                    {i18n.date(day, {
                      month: 'short',
                      day: 'numeric',
                      year: displayYear ? 'numeric' : undefined,
                    })}
                  </Text>
                  {shouldHighlightDay && openedVersionStatus ? (
                    <StatusIndicator status={openedVersionStatus.status} />
                  ) : shouldDisplayLatestIndicatorOnDay ? (
                    <StatusIndicator status="latest" />
                  ) : null}
                </Line>
              </div>
              {namedVersions && (
                <Collapse in={!isOpen}>
                  <ColumnStackLayout noMargin>
                    {namedVersions.map(version => {
                      const shouldHighlightVersion =
                        openedVersion && openedVersion.id === version.id;
                      const isLatestVersion =
                        latestVersion && latestVersion.id === version.id;
                      return (
                        <div
                          key={version.id}
                          className={`${classes.versionSubRow}${
                            shouldHighlightVersion ? ' selected' : ''
                          }`}
                        >
                          <div style={styles.greyed}>
                            <Text size="body-small" noMargin>
                              {version.label}
                            </Text>
                          </div>
                          {shouldHighlightVersion && openedVersionStatus ? (
                            <StatusIndicator
                              status={openedVersionStatus.status}
                            />
                          ) : isLatestVersion ? (
                            <StatusIndicator status="latest" />
                          ) : null}
                        </div>
                      );
                    })}
                  </ColumnStackLayout>
                </Collapse>
              )}
            </Column>
          </ButtonBase>
          <Collapse in={isOpen}>
            <div style={styles.versionsContainer}>
              {versions.map(version => (
                <ProjectVersionRow
                  key={version.id}
                  isLatest={latestVersionId === version.id}
                  version={version}
                  onRename={onRenameVersion}
                  isLoading={loadingVersionId === version.id}
                  onCancelRenaming={onCancelRenaming}
                  usersPublicProfileByIds={usersPublicProfileByIds}
                  isEditing={version.id === editedVersionId}
                  onContextMenu={onContextMenu}
                  getAnonymousAvatar={getAnonymousAvatar}
                  openedVersionStatus={openedVersionStatus}
                />
              ))}
            </div>
          </Collapse>
        </React.Fragment>
      )}
    </I18n>
  );
};
