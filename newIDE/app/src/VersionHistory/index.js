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
import Collapse from '@material-ui/core/Collapse';
import { LineStackLayout } from '../UI/Layout';
import IconButton from '../UI/IconButton';
import ChevronArrowBottom from '../UI/CustomSvgIcons/ChevronArrowBottom';
import ChevronArrowRight from '../UI/CustomSvgIcons/ChevronArrowRight';

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
          <Column noMargin>
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

type DayGroupRowProps = {|
  day: number,
  versions: FilledCloudProjectVersion[],

  usersPublicProfileByIds: UserPublicProfileByIds,
|};

const DayGroupRow = ({
  day,
  versions,
  usersPublicProfileByIds,
}: DayGroupRowProps) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const displayYear = new Date(day).getFullYear() !== thisYear;

  return (
    <I18n>
      {({ i18n }) => (
        <React.Fragment>
          <Line alignItems="center">
            <IconButton onClick={() => setIsOpen(!isOpen)} size="small">
              {isOpen ? <ChevronArrowBottom /> : <ChevronArrowRight />}
            </IconButton>
            <Text>
              {i18n.date(day, {
                month: 'short',
                day: 'numeric',
                year: displayYear ? 'numeric' : undefined,
              })}
            </Text>
          </Line>
          <Collapse in={isOpen}>
            <div style={styles.versionsContainer}>
              {versions.map(version => (
                <ProjectVersionRow
                  key={version.id}
                  version={version}
                  usersPublicProfileByIds={usersPublicProfileByIds}
                />
              ))}
            </div>
          </Collapse>
        </React.Fragment>
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

  return (
    <I18n>
      {({ i18n }) => (
        <Column>
          {days.map(day => {
            const dayVersions = versionsGroupedByDay[day];
            if (!dayVersions || dayVersions.length === 0) return null;
            return (
              <DayGroupRow
                key={day}
                versions={dayVersions}
                day={day}
                usersPublicProfileByIds={usersPublicProfileByIds}
              />
            );
          })}
        </Column>
      )}
    </I18n>
  );
};

export default VersionHistory;
