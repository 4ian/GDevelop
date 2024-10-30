// @flow

import * as React from 'react';
import {
  type LaunchCaptureOptions,
  type CaptureOptions,
} from '../ExportAndShare/PreviewLauncher.flow';
import { createGameResourceSignedUrls } from '../Utils/GDevelopServices/Game';

const useCapturesManager = ({ project }: { project: ?gdProject }) => {
  const [
    unverifiedGameScreenshots,
    setUnverifiedGameScreenshots,
  ] = React.useState<
    Array<{|
      projectUuid: string,
      unverifiedPublicUrl: string,
    |}>
  >([]);

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

        setUnverifiedGameScreenshots(unverifiedScreenshots => [
          ...unverifiedScreenshots,
          ...uploadedScreenshotPublicUrls.map(unverifiedPublicUrl => ({
            projectUuid: project.getProjectUuid(),
            unverifiedPublicUrl,
          })),
        ]);
      } catch (error) {
        console.error('Error while handling finished capture options:', error);
      }
    },
    [project]
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

  return {
    createCaptureOptionsForPreview,
    onCaptureFinished,
    getGameUnverifiedScreenshotUrls,
    onGameScreenshotsClaimed,
  };
};

export default useCapturesManager;
