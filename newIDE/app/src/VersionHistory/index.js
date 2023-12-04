// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { type FilledCloudProjectVersion } from '../Utils/GDevelopServices/Project';
import {
  getUserPublicProfilesByIds,
  type UserPublicProfileByIds,
} from '../Utils/GDevelopServices/User';
import { Column, Line } from '../UI/Grid';
import Text from '../UI/Text';
import Avatar from '@material-ui/core/Avatar';
import { LineStackLayout } from '../UI/Layout';

const styles = {
  avatar: {
    width: 20,
    height: 20,
  },
  username: { opacity: 0.7 },
};

type ProjectVersionRowProps = {|
  version: FilledCloudProjectVersion,
  usersPublicProfileByIds: UserPublicProfileByIds,
|};

const ProjectVersionRow = ({
  version,
  usersPublicProfileByIds,
}: ProjectVersionRowProps) => {
  const authorPublicProfile = version.userId
    ? usersPublicProfileByIds[version.userId]
    : null;
  return (
    <I18n>
      {({ i18n }) => (
        <Line justifyContent="space-between" alignItems="flex-start">
          <Column>
            <Text noMargin>
              {i18n.date(version.createdAt, {
                hour: 'numeric',
                minute: 'numeric',
              })}
            </Text>

            {authorPublicProfile && (
              <LineStackLayout noMargin>
                <Avatar
                  src={authorPublicProfile.iconUrl}
                  style={styles.avatar}
                />
                <Text noMargin style={styles.username}>
                  {authorPublicProfile.username}
                </Text>
              </LineStackLayout>
            )}
          </Column>
        </Line>
      )}
    </I18n>
  );
};

type VersionsGroupedByDay = {|
  [day: number]: Array<FilledCloudProjectVersion>,
|};

const groupVersionsByDay = (
  versions: Array<FilledCloudProjectVersion>
): VersionsGroupedByDay => {
  if (versions.length === 0) return {};

  const versionsGroupedByDay = {};
  versions.forEach(version => {
    const dayDate = new Date(version.createdAt.slice(0, 10)).getTime();
    if (!versionsGroupedByDay[dayDate]) {
      versionsGroupedByDay[dayDate] = [version];
    } else {
      versionsGroupedByDay[dayDate].push(version);
    }
  });
  return versionsGroupedByDay;
};

type Props = {|
  versions: Array<FilledCloudProjectVersion>,
|};

const VersionHistory = ({ versions }: Props) => {
  const [
    usersPublicProfileByIds,
    setUsersPublicProfileByIds,
  ] = React.useState<?UserPublicProfileByIds>();

  const userIdsToFetch = React.useMemo(
    () => versions.map(version => version.userId).filter(Boolean),
    [versions]
  );

  const versionsGroupedByDay = React.useMemo(
    () => groupVersionsByDay(versions),
    [versions]
  );
  const days = Object.keys(versionsGroupedByDay)
    .map(dayStr => Number(dayStr))
    .sort()
    .reverse();

  React.useEffect(
    () => {
      (async () => {
        if (!userIdsToFetch) return;
        if (userIdsToFetch.length === 0) {
          setUsersPublicProfileByIds({});
          return;
        }
        const _usersPublicProfileByIds = await getUserPublicProfilesByIds(
          userIdsToFetch
        );
        setUsersPublicProfileByIds(_usersPublicProfileByIds);
      })();
    },
    [userIdsToFetch]
  );

  if (!usersPublicProfileByIds) return null;
  const now = new Date();

  return (
    <I18n>
      {({ i18n }) => (
        <Column>
          {days.map(day => {
            const dayVersions = versionsGroupedByDay[day];
            if (!dayVersions || dayVersions.length === 0) return null;
            const displayYear =
              new Date(day).getFullYear() !== now.getFullYear();
            return (
              <React.Fragment key={day}>
                <div>
                  <Text>
                    {i18n.date(day, {
                      month: 'short',
                      day: 'numeric',
                      year: displayYear ? 'numeric' : undefined,
                    })}
                  </Text>
                </div>
                {dayVersions.map(version => (
                  <ProjectVersionRow
                    key={version.id}
                    version={version}
                    usersPublicProfileByIds={usersPublicProfileByIds}
                  />
                ))}
              </React.Fragment>
            );
          })}
        </Column>
      )}
    </I18n>
  );
};

export default VersionHistory;
