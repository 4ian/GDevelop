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
import { type PartialGameChange } from '../../../GameDashboard/PublicGamePropertiesDialog';
import ShareLink from '../../../UI/ShareDialog/ShareLink';
import SocialShareButtons from '../../../UI/ShareDialog/SocialShareButtons';
import ShareButton from '../../../UI/ShareDialog/ShareButton';
import { ColumnStackLayout } from '../../../UI/Layout';
import useAlertDialog from '../../../UI/Alert/useAlertDialog';
import CircularProgress from '../../../UI/CircularProgress';
import { GameRegistration } from '../../../GameDashboard/GameRegistration';
import QrCode from '../../../UI/QrCode';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';

type OnlineGameLinkProps = {|
  build: ?Build,
  game: ?Game,
  project: gdProject,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
  errored: boolean,
  exportStep: BuildStep,
  onGameUpdated: () => Promise<void>,
  automaticallyOpenGameProperties?: boolean,
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
  onGameUpdated,
  automaticallyOpenGameProperties,
}: OnlineGameLinkProps) => {
  const [showCopiedInfoBar, setShowCopiedInfoBar] = React.useState<boolean>(
    false
  );
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState<boolean>(
    false
  );
  const { isMobile } = useResponsiveWindowSize();
  const [
    isOnlineGamePropertiesDialogOpen,
    setIsOnlineGamePropertiesDialogOpen,
  ] = React.useState<boolean>(false);
  const [isGameLoading, setIsGameLoading] = React.useState<boolean>(false);
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );
  const [
    timeBeforeExportFinished,
    setTimeBeforeExportFinished,
  ] = React.useState<number>(timeForExport);
  const { showAlert } = useAlertDialog();

  const exportPending = !errored && exportStep !== '' && exportStep !== 'done';
  const isBuildComplete = build && build.status === 'complete';
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
        await showAlert({
          title: t`Unable to update the authors of the project.`,
          message: t`Verify your internet connection or try again later.`,
        });
        return false;
      }

      return true;
    },
    [build, game, getAuthorizationHeader, profile, project, showAlert]
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
          await showAlert({
            title: t`Unable to update the game slug.`,
            message: t`Remember that a slug must be 6 to 30 characters long and only contains letters, digits or dashes. Verify your internet connection or try again later.`,
          });
          return false;
        }
      }

      return true;
    },
    [build, game, getAuthorizationHeader, profile, showAlert]
  );

  React.useEffect(
    () => {
      if (exportStep === 'done') {
        setTimeBeforeExportFinished(timeForExport); // reset.
        setIsShareDialogOpen(true);
      }
    },
    [exportStep, automaticallyOpenGameProperties]
  );

  React.useEffect(
    () => {
      if (isBuildComplete && automaticallyOpenGameProperties) {
        setIsOnlineGamePropertiesDialogOpen(true);
      }
    },
    [isBuildComplete, automaticallyOpenGameProperties]
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
        await onGameUpdated();
        // If one of the update failed, return false so that the dialog is not closed.
        if (!authorsUpdated || !slugUpdated) {
          return false;
        }
      } catch (err) {
        await showAlert({
          title: t`Unable to update the game.`,
          message: t`Verify that your internet connection is working or try again later.`,
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
      onGameUpdated,
      showAlert,
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
    game && buildOrGameUrl && !isBuildPublished && (
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
                if (game && buildOrGameUrl && !isBuildPublished) {
                  setIsOnlineGamePropertiesDialogOpen(true);
                }
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
                    <Line noMargin>
                      <Text>
                        <Trans>Share it with this QR code:</Trans>
                      </Text>
                    </Line>
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
                    {automaticallyOpenGameProperties ? (
                      <Trans>Loading your game...</Trans>
                    ) : (
                      <Trans>Loading your link...</Trans>
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
          {game && build && isOnlineGamePropertiesDialogOpen && (
            <OnlineGamePropertiesDialog
              project={project}
              onSaveProject={onSaveProject}
              buildId={build.id}
              onClose={() => {
                setIsOnlineGamePropertiesDialogOpen(false);
                if (automaticallyOpenGameProperties) {
                  // If the dialog was automatically opened,
                  // Also close the share dialog, as they are probably not
                  // looking for a new link.
                  setIsShareDialogOpen(false);
                }
              }}
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
              isLoading={isSavingProject || isGameLoading}
              i18n={i18n}
            />
          )}
        </>
      )}
    </I18n>
  );
};

export default OnlineGameLink;
