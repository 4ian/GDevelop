// @flow
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import * as React from 'react';
import RaisedButton from '../../UI/RaisedButton';
import FlatButton from '../../UI/FlatButton';
import { Spacer, Line } from '../../UI/Grid';
import EmptyMessage from '../../UI/EmptyMessage';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import LinearProgress from '@material-ui/core/LinearProgress';
import Text from '../../UI/Text';
import {
  getBuildArtifactUrl,
  type Build,
  type BuildArtifactKeyName,
} from '../../Utils/GDevelopServices/Build';
import { type Game, updateGame } from '../../Utils/GDevelopServices/Game';
import Window from '../../Utils/Window';
import { ColumnStackLayout } from '../../UI/Layout';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';

const buildTypesConfig = {
  'cordova-build': {
    estimatedTimeInSeconds: (build: Build) => 300,
    completeDescription:
      'You can download it on your Android phone and install it.',
  },
  'electron-build': {
    estimatedTimeInSeconds: (build: Build) =>
      90 + 130 * (build.targets ? build.targets.length : 0),
    completeDescription: '',
  },
  'web-build': {
    estimatedTimeInSeconds: (build: Build) => 5,
    completeDescription: '',
  },
};

const downloadButtons = [
  {
    displayName: t`Download (APK)`,
    key: 'apkKey',
  },
  {
    displayName: t`Download (Android App Bundle)`,
    key: 'aabKey',
  },
  {
    displayName: t`Windows (zip)`,
    key: 'windowsZipKey',
  },
  {
    displayName: t`Windows (exe)`,
    key: 'windowsExeKey',
  },
  {
    displayName: t`macOS (zip)`,
    key: 'macosZipKey',
  },
  {
    displayName: t`Linux (AppImage)`,
    key: 'linuxAppImageKey',
  },
  {
    displayName: t`Open`,
    key: 's3Key',
  },
];

type Props = {|
  build: Build,
  game?: ?Game,
  onGameUpdated?: (Game) => void,
  gameUpdating?: boolean,
  setGameUpdating?: (boolean) => void,
|};

/**
 * Show an estimate of the progress of a build or the button
 * to download the artifacts.
 */
const BuildProgressAndActions = ({
  build,
  game,
  onGameUpdated,
  gameUpdating,
  setGameUpdating,
}: Props) => {
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );
  const config = buildTypesConfig[build.type];
  const estimatedTime = config.estimatedTimeInSeconds(build);
  const secondsSinceLastUpdate = Math.abs(
    differenceInSeconds(build.updatedAt, Date.now())
  );
  const estimatedRemainingTime = estimatedTime - secondsSinceLastUpdate;
  const isStillWithinEstimatedTime = estimatedRemainingTime > 0;
  const hasJustOverrun =
    !isStillWithinEstimatedTime && estimatedRemainingTime >= -estimatedTime;
  const hasTimedOut =
    !isStillWithinEstimatedTime && estimatedRemainingTime < -estimatedTime;

  const onDownload = (key: BuildArtifactKeyName) => {
    const url = getBuildArtifactUrl(build, key);
    if (url) Window.openExternalURL(url);
  };

  const onUpdatePublicBuild = React.useCallback(
    async (buildId: ?string) => {
      if (!profile || !game || !onGameUpdated || !setGameUpdating) return;

      const { id } = profile;
      try {
        setGameUpdating(true);
        const updatedGame = await updateGame(
          getAuthorizationHeader,
          id,
          game.id,
          {
            publicWebBuildId: buildId,
          }
        );
        onGameUpdated(updatedGame);
        setGameUpdating(false);
      } catch (err) {
        console.error('Unable to update the game', err);
        setGameUpdating(false);
      }
    },
    [game, getAuthorizationHeader, profile, onGameUpdated, setGameUpdating]
  );

  const isBuildPublished = game && game.publicWebBuildId === build.id;

  return (
    <I18n>
      {({ i18n }) =>
        build.status === 'error' ? (
          <ColumnStackLayout>
            <Line alignItems="center" justifyContent="flex-end">
              <Text>
                <Trans>Something wrong happened :(</Trans>
              </Text>
              <Spacer />
              <RaisedButton
                label={<Trans>See logs</Trans>}
                onClick={() => onDownload('logsKey')}
              />
            </Line>
            <Line alignItems="center" justifyContent="flex-end">
              <EmptyMessage style={{ justifyContent: 'flex-end' }}>
                <Trans>
                  Check the logs to see if there is an explanation about what
                  went wrong, or try again later.
                </Trans>
              </EmptyMessage>
            </Line>
          </ColumnStackLayout>
        ) : build.status === 'pending' ? (
          <>
            <Line alignItems="center" expand justifyContent="center">
              {(isStillWithinEstimatedTime || hasJustOverrun) && (
                <>
                  <LinearProgress
                    style={{ flex: 1 }}
                    value={
                      isStillWithinEstimatedTime
                        ? ((estimatedTime - estimatedRemainingTime) /
                            estimatedTime) *
                          100
                        : 0
                    }
                    variant={
                      isStillWithinEstimatedTime
                        ? 'determinate'
                        : 'indeterminate'
                    }
                  />
                  <Spacer />
                </>
              )}
              {isStillWithinEstimatedTime && (
                <Text>
                  <Trans>
                    ~{Math.round(estimatedRemainingTime / 60)} minutes.
                  </Trans>
                </Text>
              )}
              {hasJustOverrun && (
                <Text>
                  <Trans>Should finish soon.</Trans>
                </Text>
              )}
            </Line>
            {hasTimedOut && (
              <ColumnStackLayout>
                <Line justifyContent="flex-end">
                  <Text>
                    <Trans>Something wrong happened :(</Trans>
                  </Text>
                </Line>
                <Line justifyContent="flex-end">
                  <EmptyMessage style={{ justifyContent: 'flex-end' }}>
                    <Trans>
                      It looks like the build has timed out, please try again.
                    </Trans>
                  </EmptyMessage>
                </Line>
              </ColumnStackLayout>
            )}
          </>
        ) : build.status === 'complete' ? (
          <ColumnStackLayout>
            <Line expand justifyContent="flex-end">
              {game && !!build.s3Key && !isBuildPublished && (
                <RaisedButton
                  label={<Trans>Publish this build on Liluo.io</Trans>}
                  onClick={() => onUpdatePublicBuild(build.id)}
                  disabled={gameUpdating}
                />
              )}
              {game && !!build.s3Key && isBuildPublished && (
                <FlatButton
                  label={<Trans>Unpublish this build from Liluo.io</Trans>}
                  onClick={() => onUpdatePublicBuild(null)}
                  disabled={gameUpdating}
                />
              )}
              <Spacer />
              {downloadButtons
                .filter((button) => !!build[button.key])
                .map((button) => (
                  <React.Fragment key={button.key}>
                    <RaisedButton
                      label={i18n._(button.displayName)}
                      primary
                      onClick={() => onDownload(button.key)}
                    />
                    <Spacer />
                  </React.Fragment>
                ))}
              <FlatButton
                label={<Trans>See logs</Trans>}
                onClick={() => onDownload('logsKey')}
              />
            </Line>
            {config && config.completeDescription && (
              <Line expand justifyContent="flex-end">
                <Text>{config.completeDescription}</Text>
              </Line>
            )}
          </ColumnStackLayout>
        ) : (
          <Line>
            <Trans>Unknown status</Trans>
          </Line>
        )
      }
    </I18n>
  );
};

export default BuildProgressAndActions;
