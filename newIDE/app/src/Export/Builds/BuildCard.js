// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { Line } from '../../UI/Grid';
import { type Build } from '../../Utils/GDevelopServices/Build';
import { Card, CardActions, CardHeader } from '@material-ui/core';
import BuildProgress from './BuildProgress';
import EmptyMessage from '../../UI/EmptyMessage';

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

type Props = {|
  build: Build,
|};

export const BuildCard = ({ build }: Props) => {
  const isOld =
    build &&
    build.type !== 'web-build' &&
    differenceInCalendarDays(Date.now(), build.updatedAt) > 6;
  return (
    <Card>
      <CardHeader
        title={build.id}
        subheader={
          <Line alignItems="center" noMargin>
            <Trans>
              {formatBuildText(build.type)} - <Trans>Last updated on</Trans>{' '}
              {format(build.updatedAt, 'yyyy-MM-dd HH:mm:ss')}
            </Trans>
          </Line>
        }
      />
      <CardActions>
        <Line expand noMargin justifyContent="flex-end">
          {!isOld && <BuildProgress build={build} />}
          {isOld && (
            <EmptyMessage>
              <Trans>
                This build is old and the generated games can't be downloaded
                anymore.
              </Trans>
            </EmptyMessage>
          )}
        </Line>
      </CardActions>
    </Card>
  );
};
