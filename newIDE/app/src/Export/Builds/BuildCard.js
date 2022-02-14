// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { Line } from '../../UI/Grid';
import { type Build } from '../../Utils/GDevelopServices/Build';
import { type Game } from '../../Utils/GDevelopServices/Game';
import { Card, CardActions, CardHeader } from '@material-ui/core';
import BuildProgressAndActions from './BuildProgressAndActions';
import EmptyMessage from '../../UI/EmptyMessage';
import Chrome from '../../UI/CustomSvgIcons/Chrome';
import PhoneIphone from '@material-ui/icons/PhoneIphone';
import LaptopMac from '@material-ui/icons/LaptopMac';

const styles = {
  icon: {
    height: 30,
    width: 30,
    marginRight: 5,
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
      return <Trans>Web Build</Trans>;
    default:
      return buildType;
  }
};

const getIcon = (
  buildType: 'cordova-build' | 'electron-build' | 'web-build'
) => {
  switch (buildType) {
    case 'cordova-build':
      return <PhoneIphone style={styles.icon} />;
    case 'electron-build':
      return <LaptopMac style={styles.icon} />;
    case 'web-build':
      return <Chrome style={styles.icon} />;
    default:
      return <Chrome style={styles.icon} />;
  }
};

type Props = {|
  build: Build,
  game: Game,
  onGameUpdated?: Game => void,
  gameUpdating: boolean,
  setGameUpdating: boolean => void,
|};

export const BuildCard = ({
  build,
  game,
  onGameUpdated,
  gameUpdating,
  setGameUpdating,
}: Props) => {
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
            {getIcon(build.type)}
            <Trans>
              {formatBuildText(build.type)} -{' '}
              {format(build.updatedAt, 'yyyy-MM-dd HH:mm:ss')}
            </Trans>
          </Line>
        }
      />
      <CardActions>
        <Line expand noMargin justifyContent="flex-end">
          {!isOld && (
            <BuildProgressAndActions
              build={build}
              game={game}
              onGameUpdated={onGameUpdated}
              gameUpdating={gameUpdating}
              setGameUpdating={setGameUpdating}
            />
          )}
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
