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
            <Text noMargin>{i18n.date(version.createdAt)}</Text>

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
    <Column>
      {versions.map(version => (
        <ProjectVersionRow
          key={version.id}
          version={version}
          usersPublicProfileByIds={usersPublicProfileByIds}
        />
      ))}
    </Column>
  );
};

export default VersionHistory;
