// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Paper from 'material-ui/Paper';
import { type Build } from '../../Utils/GDevelopServices/Build';
import { Column, Line } from '../../UI/Grid';
import EmptyMessage from '../../UI/EmptyMessage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import BuildProgress from './BuildProgress';
import format from 'date-fns/format';
import difference_in_calendar_days from 'date-fns/difference_in_calendar_days';

type Props = {|
  builds: ?Array<Build>,
  onDownload: (build: Build, key: string) => void,
|};

const styles = {
  buildContainer: {
    padding: 10,
  },
};

export default ({ builds, onDownload }: Props) => {
  return (
    <Column noMargin expand>
      <Line>
        <Column>
          <EmptyMessage>
            <Trans>
              This is the list of builds that you've done. Note that you can
              download games generated during to 7 days, after which they are
              removed.
            </Trans>
          </EmptyMessage>
        </Column>
      </Line>
      <Line>
        {!builds ? (
          <PlaceholderLoader />
        ) : builds.length === 0 ? (
          <EmptyMessage>
            <Trans>
              You don't have any builds on the online services for now
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
                  <p>
                    {build.type} - Last updated on{' '}
                    {format(build.updatedAt, 'YYYY-MM-DD HH:mm:ss')}
                  </p>
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
