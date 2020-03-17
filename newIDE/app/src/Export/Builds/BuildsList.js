// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import {
  type Build,
  type BuildArtifactKeyName,
} from '../../Utils/GDevelopServices/Build';
import { Column, Line } from '../../UI/Grid';
import EmptyMessage from '../../UI/EmptyMessage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import BuildProgress from './BuildProgress';
import { type UserProfile } from '../../Profile/UserProfileContext';
import format from 'date-fns/format';
import difference_in_calendar_days from 'date-fns/difference_in_calendar_days';
import Text from '../../UI/Text';

type Props = {|
  builds: ?Array<Build>,
  userProfile: UserProfile,
  onDownload: (build: Build, key: BuildArtifactKeyName) => void,
|};

const styles = {
  buildContainer: {
    padding: 10,
  },
};

const formatBuildText = (
  buildType: 'cordova-build' | 'electron-build' | 'web-build'
) => {
  switch (buildType) {
    case 'cordova-build':
      return <Trans>Android Build</Trans>;
    case 'electron-build':
      return <Trans>Windows/macOS/Linux Build</Trans>;
    case 'web-build':
      return <Trans>Web (upload online) Build</Trans>;
    default:
      return buildType;
  }
};

export default ({ builds, userProfile, onDownload }: Props) => {
  return (
    <Column noMargin expand>
      <Line>
        <Column>
          <EmptyMessage>
            <Trans>
              This is the list of builds that you've done. Note that you can
              download games generated during the last 7 days, after which they
              are removed.
            </Trans>
          </EmptyMessage>
        </Column>
      </Line>
      <Line>
        {!userProfile.authenticated ? (
          <EmptyMessage>
            <Trans>You need to login first to see your builds.</Trans>
          </EmptyMessage>
        ) : !builds ? (
          <PlaceholderLoader />
        ) : builds.length === 0 ? (
          <EmptyMessage>
            <Trans>
              You don't have any builds on the online services for now.
            </Trans>
          </EmptyMessage>
        ) : (
          <Column noMargin expand>
            {builds.map((build: Build) => {
              const isOld =
                build &&
                difference_in_calendar_days(Date.now(), build.updatedAt) > 6;

              return (
                <Paper style={styles.buildContainer} key={build.id}>
                  <Text>
                    {formatBuildText(build.type)} -{' '}
                    <Trans>Last updated on</Trans>{' '}
                    {format(build.updatedAt, 'YYYY-MM-DD HH:mm:ss')}
                  </Text>
                  {!isOld && (
                    <BuildProgress
                      build={build}
                      onDownload={key => onDownload(build, key)}
                    />
                  )}
                  {isOld && (
                    <EmptyMessage>
                      <Trans>
                        This build is old and the generated games can't be
                        downloaded anymore.
                      </Trans>
                    </EmptyMessage>
                  )}
                </Paper>
              );
            })}
          </Column>
        )}
      </Line>
    </Column>
  );
};
