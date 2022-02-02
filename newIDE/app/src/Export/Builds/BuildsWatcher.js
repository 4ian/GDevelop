// @flow
import { type Build, getBuild } from '../../Utils/GDevelopServices/Build';
import { delay } from '../../Utils/Delay';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';

const waitTime = 1500;
const bulkWaitTime = 5000;
const maxTimeBeforeIgnoring = 30 * 60 * 1000; // 30 mins in milliseconds

export default class BuildsWatcher {
  runningWatchers: { [string]: boolean } = {};
  nextWatcherId = 0;
  onBuildUpdated: ?(build: Build) => void;
  authenticatedUser: ?AuthenticatedUser;

  start({
    authenticatedUser,
    builds,
    onBuildUpdated,
  }: {
    authenticatedUser: AuthenticatedUser,
    builds: Array<Build>,
    onBuildUpdated: (build: Build) => void,
  }) {
    this.stop();
    this.authenticatedUser = authenticatedUser;
    this.onBuildUpdated = onBuildUpdated;

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
          this._pollBuild(
            build.id,
            builds.length > 1 ? bulkWaitTime : waitTime
          );
        }
      }
    });
  }

  stop() {
    this.runningWatchers = {};
  }

  _pollBuild = async (buildId: string, waitTime: number) => {
    const watcherId = this.nextWatcherId.toString();
    this.nextWatcherId++;

    this.runningWatchers[watcherId] = true;

    let build = null;
    do {
      if (!this.authenticatedUser) return;

      const { getAuthorizationHeader, firebaseUser } = this.authenticatedUser;
      if (!firebaseUser) return;

      try {
        console.info(`Checking progress of build ${buildId}...`);
        build = await getBuild(
          getAuthorizationHeader,
          firebaseUser.uid,
          buildId
        );
        if (this.onBuildUpdated) this.onBuildUpdated(build);
      } catch (e) {
        console.warn('Error while watching build progress:', e);
      }

      await delay(waitTime);
      if (!this.runningWatchers[watcherId]) {
        console.info(`Stopping watch of build ${buildId}.`);
        return;
      }
    } while (build && build.status === 'pending');

    console.info(`Watch of build ${buildId} finished.`);
  };
}
