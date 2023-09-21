// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import Text from '../../../UI/Text';
import { Column, Line } from '../../../UI/Grid';
import {
  getBuildArtifactUrl,
  getWebBuildThumbnailUrl,
  type Build,
} from '../../../Utils/GDevelopServices/Build';
import { type BuildStep } from '../../Builds/BuildStepsProgress';
import InfoBar from '../../../UI/Messages/InfoBar';
import FlatButton from '../../../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../../../UI/Dialog';
import {
  getGame,
  getGameUrl,
  updateGame,
  setGameSlug,
  type Game,
  getAclsFromUserIds,
  setGameUserAcls,
} from '../../../Utils/GDevelopServices/Game';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import AlertMessage from '../../../UI/AlertMessage';
import OnlineGamePropertiesDialog from './OnlineGamePropertiesDialog';
import { showErrorBox } from '../../../UI/Messages/MessageBox';
import { type PartialGameChange } from '../../../GameDashboard/PublicGamePropertiesDialog';
import ShareLink from '../../../UI/ShareDialog/ShareLink';
import SocialShareButtons from '../../../UI/ShareDialog/SocialShareButtons';
import ShareButton from '../../../UI/ShareDialog/ShareButton';
import LinearProgress from '../../../UI/LinearProgress';
import CircularProgress from '../../../UI/CircularProgress';
import { ResponsiveLineStackLayout } from '../../../UI/Layout';

type OnlineGameLinkProps = {|
  build: ?Build,
  project: gdProject,
  onSaveProject: () => Promise<void>,
  errored: boolean,
  exportStep: BuildStep,
|};

const OnlineGameLink = ({
  build,
  project,
  onSaveProject,
  errored,
  exportStep,
}: OnlineGameLinkProps) => {
  const [showCopiedInfoBar, setShowCopiedInfoBar] = React.useState<boolean>(
    false
  );
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState<boolean>(
    false
  );
  const [
    isOnlineGamePropertiesDialogOpen,
    setIsOnlineGamePropertiesDialogOpen,
  ] = React.useState<boolean>(false);
  const [game, setGame] = React.useState<?Game>(null);
  const [isGameLoading, setIsGameLoading] = React.useState<boolean>(false);
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );

  const exportPending = !errored && exportStep !== '' && exportStep !== 'done';
  const isBuildComplete = build && build.status === 'complete';
  const isBuildPublished = build && game && build.id === game.publicWebBuildId;
  const gameUrl = getGameUrl(game);
  const buildUrl =
    exportPending || !isBuildComplete
      ? null
      : isBuildPublished
      ? gameUrl
      : getBuildArtifactUrl(build, 's3Key');

  const loadGame = React.useCallback(
    async () => {
      const gameId = build && build.gameId;
      if (!profile || !gameId) return;

      const { id } = profile;
      try {
        setIsGameLoading(true);
        const game = await getGame(getAuthorizationHeader, id, gameId);
        setGame(game);
      } catch (err) {
        console.error('Unable to load the game', err);
      } finally {
        setIsGameLoading(false);
      }
    },
    [build, getAuthorizationHeader, profile]
  );

  const tryUpdateAuthors = React.useCallback(
    async (i18n: I18nType) => {
      if (!profile || !game || !build) return false;

      const authorAcls = getAclsFromUserIds(project.getAuthorIds().toJSArray());

      try {
        await setGameUserAcls(
          getAuthorizationHeader,
          profile.id,
          project.getProjectUuid(),
          { author: authorAcls }
        );
      } catch (error) {
        console.error(
          'Unable to update the authors:',
          error.response || error.message
        );
        showErrorBox({
          message:
            i18n._(t`Unable to update the authors of the project.`) +
            ' ' +
            i18n._(t`Verify your internet connection or try again later.`),
          rawError: error,
          errorId: 'author-update-error',
        });
        return false;
      }

      return true;
    },
    [build, game, getAuthorizationHeader, profile, project]
  );

  const tryUpdateSlug = React.useCallback(
    async (partialGameChange: PartialGameChange, i18n: I18nType) => {
      if (!profile || !game || !build) return false;

      const { userSlug, gameSlug } = partialGameChange;

      if (userSlug && gameSlug && userSlug === profile.username) {
        try {
          await setGameSlug(
            getAuthorizationHeader,
            profile.id,
            game.id,
            userSlug,
            gameSlug
          );
        } catch (error) {
          console.error(
            'Unable to update the game slug:',
            error.response || error.message
          );
          showErrorBox({
            message:
              i18n._(
                t`Unable to update the game slug. A slug must be 6 to 30 characters long and only contains letters, digits or dashes.`
              ) +
              ' ' +
              i18n._(t`Verify your internet connection or try again later.`),
            rawError: error,
            errorId: 'game-slug-update-error',
          });
          return false;
        }
      }

      return true;
    },
    [build, game, getAuthorizationHeader, profile]
  );

  React.useEffect(
    () => {
      // Load game only once
      if (!game && isBuildComplete) {
        loadGame();
      }
    },
    [game, loadGame, isBuildComplete]
  );

  React.useEffect(
    () => {
      if (exportStep === 'done') {
        setIsShareDialogOpen(true);
      }
    },
    [exportStep]
  );

  const onGameUpdate = React.useCallback(
    async (
      partialGameChange: PartialGameChange,
      i18n: I18nType
    ): Promise<boolean> => {
      if (!profile || !game || !build) return false;

      const { id } = profile;
      try {
        setIsGameLoading(true);
        // First update the game.
        await updateGame(getAuthorizationHeader, id, game.id, {
          gameName: project.getName(),
          description: project.getDescription(),
          categories: project.getCategories().toJSArray(),
          playWithGamepad: project.isPlayableWithGamepad(),
          playWithKeyboard: project.isPlayableWithKeyboard(),
          playWithMobile: project.isPlayableWithMobile(),
          orientation: project.getOrientation(),
          publicWebBuildId: build.id,
          thumbnailUrl: getWebBuildThumbnailUrl(project, build.id),
          discoverable: partialGameChange.discoverable,
        });
        // Then set authors and slug in parrallel.
        const [authorsUpdated, slugUpdated] = await Promise.all([
          tryUpdateAuthors(i18n),
          tryUpdateSlug(partialGameChange, i18n),
        ]);
        // Update game again as cached values on the game entity might have changed.
        await loadGame();
        // If one of the update failed, return false so that the dialog is not closed.
        if (!authorsUpdated || !slugUpdated) {
          return false;
        }
      } catch (err) {
        showErrorBox({
          message: i18n._(
            t`There was an error updating your game. Verify that your internet connection is working or try again later.`
          ),
          rawError: err,
          errorId: 'update-game-error',
        });
        console.error('Unable to update the game', err);
        return false;
      } finally {
        setIsGameLoading(false);
      }

      return true;
    },
    [
      game,
      getAuthorizationHeader,
      profile,
      build,
      project,
      tryUpdateAuthors,
      tryUpdateSlug,
      loadGame,
    ]
  );

  if (!build && !exportStep) return null;

  const dialogActions = [
    <FlatButton
      key="close"
      label={<Trans>Close</Trans>}
      primary={false}
      onClick={() => setIsShareDialogOpen(false)}
    />,
    // Ensure there is a game loaded, meaning the user owns the game.
    game && buildUrl && !isBuildPublished && (
      <DialogPrimaryButton
        key="publish"
        label={<Trans>Verify and Publish to gd.games</Trans>}
        primary
        onClick={() => setIsOnlineGamePropertiesDialogOpen(true)}
      />
    ),
  ];
  return (
    <I18n>
      {({ i18n }) => (
        <>
          {exportPending && (
            <>
              <Text>
                <Trans>Just a few seconds while we generate the link...</Trans>
              </Text>
              <Line expand>
                <LinearProgress />
              </Line>
            </>
          )}
          {isShareDialogOpen && (
            <Dialog
              title={<Trans>Share your game</Trans>}
              id="export-game-share-dialog"
              actions={dialogActions}
              open
              onRequestClose={() => setIsShareDialogOpen(false)}
              onApply={() => {
                if (game && buildUrl && !isBuildPublished) {
                  setIsOnlineGamePropertiesDialogOpen(true);
                }
              }}
            >
              {buildUrl && !isGameLoading ? (
                <Column noMargin>
                  <ShareLink url={buildUrl} />
                  {isBuildPublished && navigator.share && (
                    <ShareButton url={buildUrl} />
                  )}
                  {isBuildPublished && !navigator.share && (
                    <Line expand>
                      <ResponsiveLineStackLayout
                        expand
                        justifyContent="space-between"
                        noMargin
                      >
                        <Column justifyContent="center" noMargin>
                          <AlertMessage kind="info">
                            <Trans>
                              Your game is published! Share it with the
                              community!
                            </Trans>
                          </AlertMessage>
                        </Column>
                        <Column
                          justifyContent="flex-end"
                          noMargin
                          alignItems="center"
                        >
                          <SocialShareButtons url={buildUrl} />
                        </Column>
                      </ResponsiveLineStackLayout>
                    </Line>
                  )}
                  {!isBuildPublished && game && (
                    <Line>
                      <AlertMessage kind="info">
                        <Trans>
                          This link is private so you can share it with friends
                          and testers. When you're ready you can update your
                          gd.games game page.
                        </Trans>
                      </AlertMessage>
                    </Line>
                  )}
                </Column>
              ) : (
                <Column alignItems="center">
                  <Line>
                    <CircularProgress />
                  </Line>
                  <Text>
                    <Trans>Loading your link...</Trans>
                  </Text>
                </Column>
              )}
              <InfoBar
                message={<Trans>Copied to clipboard!</Trans>}
                visible={showCopiedInfoBar}
                hide={() => setShowCopiedInfoBar(false)}
              />
            </Dialog>
          )}
          {game && build && isOnlineGamePropertiesDialogOpen && (
            <OnlineGamePropertiesDialog
              project={project}
              onSaveProject={onSaveProject}
              buildId={build.id}
              onClose={() => setIsOnlineGamePropertiesDialogOpen(false)}
              onApply={async partialGameChange => {
                const isGameUpdated = await onGameUpdate(
                  partialGameChange,
                  i18n
                );
                if (isGameUpdated) {
                  setIsOnlineGamePropertiesDialogOpen(false);
                }
              }}
              game={game}
              isLoading={isGameLoading}
              i18n={i18n}
            />
          )}
        </>
      )}
    </I18n>
  );
};

export default OnlineGameLink;
