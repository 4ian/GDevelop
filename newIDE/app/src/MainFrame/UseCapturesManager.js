// @flow

import * as React from 'react';

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

  const onGameScreenshotsTaken = React.useCallback(
    ({
      unverifiedScreenshotPublicUrls,
    }: {
      unverifiedScreenshotPublicUrls: string[],
    }) => {
      if (!project) return;

      setUnverifiedGameScreenshots(unverifiedScreenshots => [
        ...unverifiedScreenshots,
        ...unverifiedScreenshotPublicUrls.map(unverifiedPublicUrl => ({
          projectUuid: project.getProjectUuid(),
          unverifiedPublicUrl,
        })),
      ]);
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
    onGameScreenshotsTaken,
    getGameUnverifiedScreenshotUrls,
    onGameScreenshotsClaimed,
  };
};

export default useCapturesManager;
