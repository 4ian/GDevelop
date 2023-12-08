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
import { LineStackLayout } from '../UI/Layout';
import IconButton from '../UI/IconButton';
import ChevronArrowBottom from '../UI/CustomSvgIcons/ChevronArrowBottom';
import ChevronArrowRight from '../UI/CustomSvgIcons/ChevronArrowRight';
import ThreeDotsMenu from '../UI/CustomSvgIcons/ThreeDotsMenu';
import {
  shouldCloseOrCancel,
  shouldValidate,
} from '../UI/KeyboardShortcuts/InteractionKeys';
import TextField, { type TextFieldInterface } from '../UI/TextField';
import FileWithLines from '../UI/CustomSvgIcons/FileWithLines';
import type { OpenedVersionStatus } from '.';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import Chip from '../UI/Chip';

const thisYear = new Date().getFullYear();

const styles = {
  avatar: {
    width: 20,
    height: 20,
  },
  username: { opacity: 0.7 },
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
};

const StatusChip = ({
  status,
}: {|
  status: 'unsavedChanges' | 'saving' | 'saved',
|}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const label =
    status === 'unsavedChanges' ? (
      <Trans>Unsaved changes</Trans>
    ) : status === 'saving' ? (
      <Trans>Saving...</Trans>
    ) : (
      <Trans>Changes saved</Trans>
    );
  const backgroundColor =
    status === 'unsavedChanges'
      ? gdevelopTheme.statusIndicator.error
      : status === 'saving'
      ? gdevelopTheme.statusIndicator.warning
      : gdevelopTheme.statusIndicator.success;

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
      '&:focus': {
        backgroundColor: theme.palette.action.hover,
      },
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
      '&.selected': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  })
);

type Props = {|
  version: FilledCloudProjectVersion,
  usersPublicProfileByIds: UserPublicProfileByIds,
  isEditing: boolean,
  onRename: (FilledCloudProjectVersion, string) => void,
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
  const anonymousAvatar = getAnonymousAvatar();

  return (
    <I18n>
      {({ i18n }) => (
        <div
          className={`${classes.root}${
            openedVersionStatus && openedVersionStatus.id === version.id
              ? ' selected'
              : ''
          }`}
        >
          <Column noMargin expand>
            {openedVersionStatus &&
              openedVersionStatus.status !== 'opened' &&
              openedVersionStatus.id === version.id && (
                <>
                  <Line noMargin>
                    <StatusChip status={openedVersionStatus.status} />
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
                <div style={styles.dateContainer}>
                  <Text noMargin style={styles.username}>
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
                    <FileWithLines fontSize="inherit" />
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
                <Text noMargin style={styles.username}>
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
                <Text noMargin style={styles.username}>
                  <Trans>Anonymous </Trans>
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
    },
  })
);

type DayGroupRowProps = {|
  day: number,
  versions: FilledCloudProjectVersion[],
  editedVersionId: ?string,
  onRenameVersion: (FilledCloudProjectVersion, string) => void,
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
  editedVersionId,
  onRenameVersion,
  onCancelRenaming,
  onContextMenu,
  openedVersionStatus,
  usersPublicProfileByIds,
  getAnonymousAvatar,
}: DayGroupRowProps) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const displayYear = new Date(day).getFullYear() !== thisYear;
  const namedVersions = [];
  const unnamedVersions = [];
  for (let i = 0; i < versions.length; i++) {
    const version = versions[i];
    if (version.label) {
      namedVersions.push(version);
    } else {
      unnamedVersions.push(version);
    }
  }

  const classes = useClassesForDayCollapse();

  return (
    <I18n>
      {({ i18n }) => (
        <React.Fragment>
          {namedVersions.map(version => (
            <ProjectVersionRow
              key={version.id}
              version={version}
              onRename={onRenameVersion}
              onCancelRenaming={onCancelRenaming}
              usersPublicProfileByIds={usersPublicProfileByIds}
              isEditing={version.id === editedVersionId}
              onContextMenu={onContextMenu}
              getAnonymousAvatar={getAnonymousAvatar}
              openedVersionStatus={openedVersionStatus}
              displayFullDate
            />
          ))}
          {unnamedVersions.length > 0 && (
            <>
              <ButtonBase
                onClick={() => setIsOpen(!isOpen)}
                className={classes.root}
              >
                <Line alignItems="center" noMargin>
                  {isOpen ? <ChevronArrowBottom /> : <ChevronArrowRight />}
                  <Text noMargin>
                    {i18n.date(day, {
                      month: 'short',
                      day: 'numeric',
                      year: displayYear ? 'numeric' : undefined,
                    })}
                  </Text>
                </Line>
              </ButtonBase>
              <Collapse in={isOpen}>
                <div style={styles.versionsContainer}>
                  {unnamedVersions.map(version => (
                    <ProjectVersionRow
                      key={version.id}
                      version={version}
                      onRename={onRenameVersion}
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
            </>
          )}
        </React.Fragment>
      )}
    </I18n>
  );
};
