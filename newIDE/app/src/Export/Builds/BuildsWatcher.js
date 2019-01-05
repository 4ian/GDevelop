// @flow
import { type Build, getBuild } from '../../Utils/GDevelopServices/Build';
import { delay } from '../../Utils/Delay';
import { type UserProfile } from '../../Profile/UserProfileContext';

const waitTime = 1500;
const bulkWaitTime = 5000;

export default class BuildsWatcher {
  runningWatchers: { [string]: boolean } = {};
  nextWatcherId = 0;
  onBuildUpdated: ?(build: Build) => void;
  userProfile: ?UserProfile;

  start({
    userProfile,
    builds,
    onBuildUpdated,
  }: {
    userProfile: UserProfile,
    builds: Array<Build>,
    onBuildUpdated: (build: Build) => void,
  }) {
    this.stop();
    this.userProfile = userProfile;
    this.onBuildUpdated = onBuildUpdated;

    builds.forEach(build => {
      if (build.status === 'pending') {
        this._pollBuild(build.id, builds.length > 1 ? bulkWaitTime : waitTime);
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
      if (!this.userProfile) return;
      const { getAuthorizationHeader, profile } = this.userProfile;
      try {
        console.info(`Checking progress of build ${buildId}...`);
        build = await getBuild(getAuthorizationHeader, profile.uid, buildId);
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
