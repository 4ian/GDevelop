// @flow

import * as React from 'react';
import {
  type LaunchCaptureOptions,
  type CaptureOptions,
} from '../ExportAndShare/PreviewLauncher.flow';
import {
  createGameResourceSignedUrls,
  updateGame,
} from '../Utils/GDevelopServices/Game';
import { type GamesList } from '../GameDashboard/UseGamesList';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import PreferencesContext from './Preferences/PreferencesContext';

export const TIME_BETWEEN_PREVIEW_SCREENSHOTS = 1000 * 60 * 3; // 3 minutes

const useCapturesManager = ({
  project,
  gamesList,
}: {
  project: ?gdProject,
  gamesList: GamesList,
}) => {
  const [
    unverifiedGameScreenshots,
    setUnverifiedGameScreenshots,
  ] = React.useState<
    Array<{|
      projectUuid: string,
      unverifiedPublicUrl: string,
    |}>
  >([]);
  const [
    lastPreviewScreenshotsTakenAt,
    setLastPreviewScreenshotsTakenAt,
  ] = React.useState<{ [projectUuid: string]: number }>({});
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );
  const preferences = React.useContext(PreferencesContext);

  const createCaptureOptionsForPreview = React.useCallback(
    async (
      launchCaptureOptions: ?LaunchCaptureOptions
    ): Promise<CaptureOptions> => {
      const captureOptions: CaptureOptions = {
        screenshots: [],
      };

      try {
        if (launchCaptureOptions && launchCaptureOptions.screenshots.length) {
          const screenshotOptions = launchCaptureOptions.screenshots;
          const response = await createGameResourceSignedUrls({
            uploadType: 'game-screenshot',
            files: screenshotOptions.map(screenshotOption => ({
              contentType: 'image/png',
            })),
          });
          const signedUrls = response.signedUrls;
          if (!signedUrls || signedUrls.length === 0) {
            throw new Error('No signed url returned');
          }

          captureOptions.screenshots = screenshotOptions
            .map((screenshotOption, index) => {
              const signedUrlInfo = signedUrls[index];
              if (!signedUrlInfo) {
                return null;
              }

              return {
                delayTimeInSeconds: screenshotOption.delayTimeInSeconds,
                signedUrl: signedUrlInfo.signedUrl,
                publicUrl: signedUrlInfo.publicUrl,
              };
            })
            .filter(Boolean);
        }
      } catch (error) {
        console.error(
          'Error caught while creating signed URLs for game resources. Skipping.',
          error
        );
      }

      return captureOptions;
    },
    []
  );

  const onCaptureFinished = React.useCallback(
    async (captureOptions: CaptureOptions) => {
      if (!project) return;
      const projectId = project.getProjectUuid();

      try {
        const screenshots = captureOptions.screenshots;
        if (!screenshots) return;

        const screenshotPublicUrls: string[] = screenshots.map(
          screenshot => screenshot.publicUrl
        );

        // Check if they have been properly uploaded.
        const responseUploadedScreenshotPublicUrls: Array<
          string | null
        > = await Promise.all(
          screenshotPublicUrls.map(
            async (screenshotUrl): Promise<string | null> => {
              const response = await fetch(screenshotUrl, { method: 'HEAD' });
              if (!response.ok) {
                return null;
              }

              return screenshotUrl;
            }
          )
        );

        const uploadedScreenshotPublicUrls = responseUploadedScreenshotPublicUrls.filter(
          Boolean
        );

        if (!uploadedScreenshotPublicUrls.length) return;

        const game = gamesList.games
          ? gamesList.games.find(game => game.id === projectId)
          : null;

        setLastPreviewScreenshotsTakenAt(lastPreviewScreenshotsTakenAt => ({
          ...lastPreviewScreenshotsTakenAt,
          [projectId]: Date.now(),
        }));

        // The game is registered, let's update it.
        if (game && profile) {
          try {
            const currentGameScreenshotUrls = game.screenshotUrls || [];
            const newGameScreenshotUrls = [
              ...currentGameScreenshotUrls,
              ...uploadedScreenshotPublicUrls,
            ];
            const updatedGame = await updateGame(
              getAuthorizationHeader,
              profile.id,
              game.id,
              {
                screenshotUrls: newGameScreenshotUrls,
              }
            );
            gamesList.onGameUpdated(updatedGame);
          } catch (error) {
            console.error(
              'Error while updating game with new screenshots:',
              error
            );
            // Do not throw or save the screenshots.
          }
          return;
        }

        setUnverifiedGameScreenshots(unverifiedScreenshots => [
          ...unverifiedScreenshots,
          ...uploadedScreenshotPublicUrls.map(unverifiedPublicUrl => ({
            projectUuid: projectId,
            unverifiedPublicUrl,
          })),
        ]);
      } catch (error) {
        console.error('Error while handling finished capture options:', error);
      }
    },
    [project, gamesList, getAuthorizationHeader, profile]
  );

  const getGameUnverifiedScreenshotUrls = React.useCallback(
    (gameId: string): string[] => {
      return unverifiedGameScreenshots
        .filter(screenshot => screenshot.projectUuid === gameId)
        .map(screenshot => screenshot.unverifiedPublicUrl);
    },
    [unverifiedGameScreenshots]
  );

  const onGameScreenshotsClaimed = React.useCallback(
    () => {
      // Assume the current project is the one that screenshots were taken for.
      if (!project) return;

      setUnverifiedGameScreenshots(unverifiedScreenshots =>
        unverifiedScreenshots.filter(
          screenshot => screenshot.projectUuid !== project.getProjectUuid()
        )
      );
    },
    [project]
  );

  const getHotReloadPreviewLaunchCaptureOptions = React.useCallback(
    (gameId: string): LaunchCaptureOptions | void => {
      const shouldTakeScreenshotOnPreview =
        preferences.values.takeScreenshotOnPreview &&
        Date.now() >
          (lastPreviewScreenshotsTakenAt[gameId] || 0) +
            TIME_BETWEEN_PREVIEW_SCREENSHOTS;
      return shouldTakeScreenshotOnPreview
        ? { screenshots: [{ delayTimeInSeconds: 3000 }] }
        : undefined;
    },
    [preferences.values.takeScreenshotOnPreview, lastPreviewScreenshotsTakenAt]
  );

  return {
    createCaptureOptionsForPreview,
    onCaptureFinished,
    getGameUnverifiedScreenshotUrls,
    onGameScreenshotsClaimed,
    getHotReloadPreviewLaunchCaptureOptions,
  };
};

export default useCapturesManager;
