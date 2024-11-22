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
import {
  getGameMainImageUrl,
  getGameUrl,
  updateGame,
  type Game,
} from '../../../Utils/GDevelopServices/Game';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import CircularProgress from '../../../UI/CircularProgress';
import RouterContext from '../../../MainFrame/RouterContext';
import ShareOnlineGameDialog from './ShareOnlineGameDialog';

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
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState<boolean>(
    false
  );
  const isPublishingNewVersion = React.useRef<boolean>(false);
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
  const gameThumbnailUrl = game ? getGameMainImageUrl(game) : null;

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
            <ShareOnlineGameDialog
              gameThumbnailUrl={gameThumbnailUrl}
              gameName={game ? game.gameName : undefined} // This can happen if the game is not owned.
              buildOrGameUrl={buildOrGameUrl}
              isBuildPublished={!!isBuildPublished}
              loadingText={
                !isGameLoading &&
                buildOrGameUrl ? null : automaticallyPublishNewBuild ? (
                  <Trans>Loading the game...</Trans>
                ) : (
                  <Trans>Loading the game link...</Trans>
                )
              }
              onClose={() => setIsShareDialogOpen(false)}
              onOpenGameDashboard={game ? openGameDashboard : undefined}
            />
          )}
        </>
      )}
    </I18n>
  );
};

export default OnlineGameLink;
