// @flow
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans } from '@lingui/macro';
import * as React from 'react';
import RaisedButton from '../../UI/RaisedButton';
import { Spacer, Line, Column } from '../../UI/Grid';
import EmptyMessage from '../../UI/EmptyMessage';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import Text from '../../UI/Text';
import {
  getBuildArtifactUrl,
  type Build,
  type BuildArtifactKeyName,
} from '../../Utils/GDevelopServices/Build';
import { type Game, updateGame } from '../../Utils/GDevelopServices/Game';
import Window from '../../Utils/Window';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import Toggle from '../../UI/Toggle';
import TextButton from '../../UI/TextButton';
import Download from '../../UI/CustomSvgIcons/Download';
import Copy from '../../UI/CustomSvgIcons/Copy';
import { shortenUuidForDisplay } from '../../Utils/GDevelopServices/Play';
import LinearProgress from '../../UI/LinearProgress';
import FlatButton from '../../UI/FlatButton';
import ShareExternal from '../../UI/CustomSvgIcons/ShareExternal';

const buildTypesConfig = {
  'cordova-build': {
    estimatedTimeInSeconds: (build: Build) => 300,
    completeDescription:
      'You can download it on your Android phone and install it.',
  },
  'cordova-ios-build': {
    estimatedTimeInSeconds: (build: Build) => 150,
    completeDescription: '',
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
    icon: <Download />,
  },
  {
    displayName: t`Download (Android App Bundle)`,
    key: 'aabKey',
    icon: <Download />,
  },
  {
    displayName: t`Windows (zip)`,
    key: 'windowsZipKey',
    icon: <Download />,
  },
  {
    displayName: t`Windows (exe)`,
    key: 'windowsExeKey',
    icon: <Download />,
  },
  {
    displayName: t`macOS (zip)`,
    key: 'macosZipKey',
    icon: <Download />,
  },
  {
    displayName: t`IPA for App Store`,
    key: 'iosAppStoreIpaKey',
    icon: <Download />,
  },
  {
    displayName: t`IPA for testing on registered devices`,
    key: 'iosDevelopmentIpaKey',
    icon: <Download />,
  },
  {
    displayName: t`Linux (AppImage)`,
    key: 'linuxAppImageKey',
    icon: <Download />,
  },
  {
    displayName: t`Open build link`,
    key: 's3Key',
    icon: <ShareExternal />,
  },
];

type Props = {|
  build: Build,
  game?: ?Game,
  onGameUpdated?: () => Promise<void>,
  gameUpdating?: boolean,
  setGameUpdating?: boolean => void,
  onCopyToClipboard?: () => void,
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
  onCopyToClipboard,
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

  const onCopyBuildLink = () => {
    const url = getBuildArtifactUrl(build, 's3Key');
    if (url) navigator.clipboard.writeText(url);
    onCopyToClipboard && onCopyToClipboard();
  };

  const onUpdatePublicBuild = React.useCallback(
    async (buildId: ?string, i18n: I18nType) => {
      if (!profile || !game || !onGameUpdated || !setGameUpdating) return;

      const { id } = profile;
      const answer = Window.showConfirmDialog(
        buildId
          ? i18n._(
              t`"${build.name ||
                shortenUuidForDisplay(
                  build.id
                )}" will be the new build of this game published on gd.games. Continue?`
            )
          : i18n._(
              t`"${build.name ||
                shortenUuidForDisplay(
                  build.id
                )}" will be unpublished on gd.games. Continue?`
            )
      );
      if (!answer) return;
      try {
        setGameUpdating(true);
        await updateGame(getAuthorizationHeader, id, game.id, {
          publicWebBuildId: buildId,
        });
        await onGameUpdated();
        setGameUpdating(false);
      } catch (err) {
        console.error('Unable to update the game', err);
        setGameUpdating(false);
      }
    },
    [
      profile,
      game,
      onGameUpdated,
      setGameUpdating,
      build.name,
      build.id,
      getAuthorizationHeader,
    ]
  );

  const isBuildPublished = !!game && game.publicWebBuildId === build.id;

  return (
    <I18n>
      {({ i18n }) =>
        build.status === 'error' ? (
          <ResponsiveLineStackLayout
            alignItems="center"
            justifyContent="space-between"
            expand
          >
            <Column noMargin>
              <Text noMargin>
                <Trans>Something wrong happened :(</Trans>
              </Text>
              <EmptyMessage
                style={{ justifyContent: 'flex-start', padding: 0 }}
              >
                <Trans>
                  Check the logs to see if there is an explanation about what
                  went wrong, or try again later.
                </Trans>
              </EmptyMessage>
            </Column>
            <RaisedButton
              primary
              label={<Trans>Download log files</Trans>}
              onClick={() => onDownload('logsKey')}
            />
          </ResponsiveLineStackLayout>
        ) : build.status === 'pending' ? (
          <>
            <Line alignItems="center" expand justifyContent="center">
              {(isStillWithinEstimatedTime || hasJustOverrun) && (
                <>
                  <LinearProgress
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
              <Column>
                <Line justifyContent="flex-end" noMargin>
                  <Text noMargin>
                    <Trans>Something wrong happened :(</Trans>
                  </Text>
                </Line>
                <Line justifyContent="flex-end" noMargin>
                  <EmptyMessage
                    style={{ justifyContent: 'flex-end', padding: 0 }}
                  >
                    <Trans>
                      It looks like the build has timed out, please try again.
                    </Trans>
                  </EmptyMessage>
                </Line>
              </Column>
            )}
          </>
        ) : build.status === 'complete' ? (
          <ColumnStackLayout noMargin expand>
            <ResponsiveLineStackLayout
              expand
              justifyContent="space-between"
              noMargin
            >
              <ResponsiveLineStackLayout noMargin noColumnMargin>
                {game && !!build.s3Key && (
                  <>
                    <Toggle
                      label={<Trans>Publish this build on gd.games</Trans>}
                      labelPosition="left"
                      toggled={isBuildPublished}
                      onToggle={() => {
                        onUpdatePublicBuild(
                          isBuildPublished ? null : build.id,
                          i18n
                        );
                      }}
                      disabled={gameUpdating}
                    />
                    <Spacer />
                    <TextButton
                      label={<Trans>Copy build link</Trans>}
                      icon={<Copy />}
                      onClick={onCopyBuildLink}
                    />
                  </>
                )}
                {downloadButtons
                  .filter(button => !!build[button.key])
                  .map(button => (
                    <React.Fragment key={button.key}>
                      <RaisedButton
                        primary
                        label={i18n._(button.displayName)}
                        onClick={() => onDownload(button.key)}
                        icon={button.icon}
                      />
                      <Spacer />
                    </React.Fragment>
                  ))}
              </ResponsiveLineStackLayout>
              <FlatButton
                label={<Trans>Download log files</Trans>}
                onClick={() => onDownload('logsKey')}
              />
            </ResponsiveLineStackLayout>
            {config && config.completeDescription && (
              <Line expand justifyContent="flex-start" noMargin>
                <Text noMargin size="body2">
                  {config.completeDescription}
                </Text>
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
