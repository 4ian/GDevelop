// @flow
import { type Build, getBuild } from '../../Utils/GDevelopServices/Build';
import { delay } from '../../Utils/Delay';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';

const waitTime = 1500;
const bulkWaitTime = 5000;
const maxTimeBeforeIgnoring = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

export const startWatchingBuilds = (
  authenticatedUser: AuthenticatedUser,
  builds: Array<Build>,
  onBuildUpdated: (build: Build) => void,
  runningWatchers: { [string]: boolean } = {},
  setRunningWatchers: ({ [string]: boolean }) => void
) => {
  console.log('starting watching build');
  stopWatchingBuilds(setRunningWatchers);
  builds.forEach(build => {
    if (build.status === 'pending') {
      if (
        (!build.createdAt ||
          build.createdAt < Date.now() - maxTimeBeforeIgnoring) &&
        (!build.updatedAt ||
          build.updatedAt < Date.now() - maxTimeBeforeIgnoring)
      ) {
        console.info(
          "Ignoring a build for polling as it's too old and still pending",
          build
        );
      } else {
        pollBuild(
          build.id,
          builds.length > 1 ? bulkWaitTime : waitTime,
          runningWatchers,
          setRunningWatchers,
          authenticatedUser,
          onBuildUpdated
        );
      }
    }
  });
};

export const stopWatchingBuilds = (
  setRunningWatchers: ({ [string]: boolean }) => void
) => {
  setRunningWatchers({});
};

const pollBuild = async (
  buildId: string,
  waitTime: number,
  runningWatchers: { [string]: boolean },
  setRunningWatchers: ({ [string]: boolean }) => void,
  authenticatedUser: ?AuthenticatedUser,
  onBuildUpdated: ?(build: Build) => void
) => {
  console.log('polling build');
  setRunningWatchers({
    ...runningWatchers,
    [buildId]: true,
  });

  let build = null;
  do {
    if (!authenticatedUser) return;

    const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
    if (!firebaseUser) return;

    try {
      console.info(`Checking progress of build ${buildId}...`);
      build = await getBuild(getAuthorizationHeader, firebaseUser.uid, buildId);
      if (onBuildUpdated) onBuildUpdated(build);
    } catch (e) {
      console.warn('Error while watching build progress:', e);
    }

    await delay(waitTime);
    if (!runningWatchers[buildId]) {
      console.info(`Stopping watch of build ${buildId}.`);
      return;
    }
  } while (build && build.status === 'pending');

  console.info(`Watch of build ${buildId} finished.`);
};
