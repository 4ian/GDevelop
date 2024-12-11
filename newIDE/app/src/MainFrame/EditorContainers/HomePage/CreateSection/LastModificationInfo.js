// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import Text from '../../../../UI/Text';
import { LineStackLayout } from '../../../../UI/Layout';
import {
  type FileMetadataAndStorageProviderName,
  type StorageProvider,
} from '../../../../ProjectsStorage';
import { type AuthenticatedUser } from '../../../../Profile/AuthenticatedUserContext';
import { getRelativeOrAbsoluteDisplayDate } from '../../../../Utils/DateDisplay';
import { getGravatarUrl } from '../../../../UI/GravatarUrl';
import { type LastModifiedInfo } from './utils';
import { type FileMetadata } from '../../../../ProjectsStorage';
import AvatarWithStatusAndTooltip from './AvatarWithStatusAndTooltip';

type LastModificationInfoProps = {|
  file: FileMetadataAndStorageProviderName,
  lastModifiedInfo?: LastModifiedInfo | null, // If null, the project has been modified last by the current user.
  storageProvider: ?StorageProvider,
  authenticatedUser: AuthenticatedUser,
  currentFileMetadata: ?FileMetadata,
  textColor?: 'primary' | 'secondary',
  textPrefix?: React.Node,
|};

const LastModificationInfo = ({
  file,
  lastModifiedInfo,
  storageProvider,
  authenticatedUser,
  currentFileMetadata,
  textColor = 'primary',
  textPrefix,
}: LastModificationInfoProps) => {
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
          {textPrefix && (
            <Text color="secondary" noMargin size="body-small">
              {textPrefix}
            </Text>
          )}
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
          <Text noMargin color={textColor} size="body-small">
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

export default LastModificationInfo;
