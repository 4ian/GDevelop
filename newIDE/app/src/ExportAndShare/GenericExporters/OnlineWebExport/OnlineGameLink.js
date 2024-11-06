// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Text from '../../../UI/Text';
import { Column, Line } from '../../../UI/Grid';
import {
  getBuildArtifactUrl,
  type Build,
} from '../../../Utils/GDevelopServices/Build';
import { type BuildStep } from '../../Builds/BuildStepsProgress';
import InfoBar from '../../../UI/Messages/InfoBar';
import FlatButton from '../../../UI/FlatButton';
import Dialog from '../../../UI/Dialog';
import {
  getGameUrl,
  updateGame,
  type Game,
} from '../../../Utils/GDevelopServices/Game';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import AlertMessage from '../../../UI/AlertMessage';
import ShareLink from '../../../UI/ShareDialog/ShareLink';
import SocialShareButtons from '../../../UI/ShareDialog/SocialShareButtons';
import ShareButton from '../../../UI/ShareDialog/ShareButton';
import { ColumnStackLayout } from '../../../UI/Layout';
import CircularProgress from '../../../UI/CircularProgress';
import { GameRegistration } from '../../../GameDashboard/GameRegistration';
import QrCode from '../../../UI/QrCode';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import RouterContext from '../../../MainFrame/RouterContext';

type OnlineGameLinkProps = {|
  build: ?Build,
  game: ?Game,
  project: gdProject,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
  errored: boolean,
  exportStep: BuildStep,
  onRefreshGame: () => Promise<void>,
  onGameUpdated: (game: Game) => void,
  automaticallyPublishNewBuild?: boolean,
  shouldShowShareDialog: boolean,
|};

const timeForExport = 5; // seconds.

const OnlineGameLink = ({
  build,
  game,
  project,
  onSaveProject,
  isSavingProject,
  errored,
  exportStep,
  onRefreshGame,
  onGameUpdated,
  automaticallyPublishNewBuild,
  shouldShowShareDialog,
}: OnlineGameLinkProps) => {
  const [showCopiedInfoBar, setShowCopiedInfoBar] = React.useState<boolean>(
    false
  );
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState<boolean>(
    false
  );
  const isPublishingNewVersion = React.useRef<boolean>(false);
  const { isMobile } = useResponsiveWindowSize();
  const [isGameLoading, setIsGameLoading] = React.useState<boolean>(false);
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );
  const [
    timeBeforeExportFinished,
    setTimeBeforeExportFinished,
  ] = React.useState<number>(timeForExport);
  const { addRouteArguments } = React.useContext(RouterContext);
  const exportPending = !errored && exportStep !== '' && exportStep !== 'done';
  const isBuildComplete = !!build && build.status === 'complete';
  const buildId = build ? build.id : null;
  const userId = profile ? profile.id : null;
  const gameId = game ? game.id : null;
  const isBuildPublished = build && game && build.id === game.publicWebBuildId;
  const gameUrl = getGameUrl(game);
  const buildOrGameUrl =
    exportPending || !isBuildComplete
      ? null
      : isBuildPublished
      ? gameUrl
      : getBuildArtifactUrl(build, 's3Key');

  // When export is started, start a timer to give information
  // about the build being ready after a few seconds.
  React.useEffect(
    () => {
      if (exportPending) {
        const timeout = setTimeout(() => {
          const newTimeBeforeExportFinished = timeBeforeExportFinished
            ? timeBeforeExportFinished - 1
            : 0;
          setTimeBeforeExportFinished(newTimeBeforeExportFinished);
        }, 1000);
        return () => clearTimeout(timeout);
      }
    },
    [exportPending, timeBeforeExportFinished]
  );

  React.useEffect(
    () => {
      if (exportStep === 'done') {
        setTimeBeforeExportFinished(timeForExport); // reset.
        if (shouldShowShareDialog) {
          setIsShareDialogOpen(true);
        }
      }
    },
    [exportStep, shouldShowShareDialog]
  );

  const automaticallyUpdateGameWithNewBuild = React.useCallback(
    async () => {
      if (
        !userId ||
        !gameId ||
        !buildId ||
        isBuildPublished ||
        isPublishingNewVersion.current
      ) {
        return;
      }
      if (isBuildComplete && automaticallyPublishNewBuild) {
        try {
          isPublishingNewVersion.current = true;
          setIsGameLoading(true);
          const updatedGame = await updateGame(
            getAuthorizationHeader,
            userId,
            gameId,
            {
              publicWebBuildId: buildId,
            }
          );
          onGameUpdated(updatedGame);
        } finally {
          setIsGameLoading(false);
          isPublishingNewVersion.current = false;
        }
      }
    },
    [
      isBuildComplete,
      automaticallyPublishNewBuild,
      buildId,
      gameId,
      userId,
      getAuthorizationHeader,
      isBuildPublished,
      onGameUpdated,
    ]
  );

  const openGameDashboard = React.useCallback(
    () => {
      if (!gameId) return;

      addRouteArguments({
        'initial-dialog': 'games-dashboard',
        'game-id': gameId,
      });
    },
    [gameId, addRouteArguments]
  );

  React.useEffect(
    () => {
      automaticallyUpdateGameWithNewBuild();
    },
    [automaticallyUpdateGameWithNewBuild]
  );

  if (!build && !exportStep) return null;

  const dialogActions = [
    // Ensure there is a game loaded, meaning the user owns the game.
    game && buildOrGameUrl && !isGameLoading && (
      <FlatButton
        key="publish"
        label={<Trans>Open Game dashboard</Trans>}
        onClick={openGameDashboard}
      />
    ),

    <FlatButton
      key="close"
      label={<Trans>Close</Trans>}
      primary={false}
      onClick={() => setIsShareDialogOpen(false)}
    />,
  ];
  return (
    <I18n>
      {({ i18n }) => (
        <>
          {exportPending && (
            <Column alignItems="center">
              <Text>
                <Trans>Uploading your game...</Trans>
              </Text>
              <Line expand>
                <CircularProgress
                  value={
                    ((timeForExport - timeBeforeExportFinished) /
                      timeForExport) *
                    100
                  }
                  variant={
                    timeBeforeExportFinished === 0
                      ? 'indeterminate'
                      : 'determinate'
                  }
                />
              </Line>
            </Column>
          )}
          {isShareDialogOpen && (
            <Dialog
              title={<Trans>Share your game</Trans>}
              id="export-game-share-dialog"
              minHeight="sm"
              maxWidth="md"
              actions={dialogActions}
              open
              onRequestClose={() => setIsShareDialogOpen(false)}
              onApply={() => {
                openGameDashboard();
              }}
              flexColumnBody
            >
              {buildOrGameUrl && !isGameLoading ? (
                <ColumnStackLayout noMargin>
                  <ShareLink url={buildOrGameUrl} />
                  <ColumnStackLayout noMargin expand>
                    {navigator.share ? (
                      <ShareButton url={buildOrGameUrl} />
                    ) : (
                      <Column
                        expand
                        justifyContent="flex-end"
                        noMargin
                        alignItems="flex-end"
                      >
                        <SocialShareButtons url={buildOrGameUrl} />
                      </Column>
                    )}
                    <Line noMargin justifyContent="center">
                      <QrCode
                        url={buildOrGameUrl}
                        size={isMobile ? 100 : 150}
                      />
                    </Line>
                  </ColumnStackLayout>
                  {isBuildPublished ? (
                    <GameRegistration
                      project={project}
                      hideLoader
                      suggestAdditionalActions
                    />
                  ) : game ? (
                    <AlertMessage kind="info">
                      <Trans>
                        This link is private. You can share it with
                        collaborators, friends or testers. When you're ready you
                        can publish it so that your game has its own page on
                        gd.games - GDevelop gaming platform.
                      </Trans>
                    </AlertMessage>
                  ) : null}
                </ColumnStackLayout>
              ) : (
                <ColumnStackLayout
                  alignItems="center"
                  justifyContent="center"
                  expand
                >
                  <Line>
                    <CircularProgress size={40} />
                  </Line>
                  <Text>
                    {automaticallyPublishNewBuild ? (
                      <Trans>Loading the game...</Trans>
                    ) : (
                      <Trans>Loading the game link...</Trans>
                    )}
                  </Text>
                </ColumnStackLayout>
              )}
              <InfoBar
                message={<Trans>Copied to clipboard!</Trans>}
                visible={showCopiedInfoBar}
                hide={() => setShowCopiedInfoBar(false)}
              />
            </Dialog>
          )}
        </>
      )}
    </I18n>
  );
};

export default OnlineGameLink;
