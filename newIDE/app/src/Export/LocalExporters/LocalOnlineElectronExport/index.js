// @flow

import React, { Component } from 'react';
import assignIn from 'lodash/assignIn';
import RaisedButton from 'material-ui/RaisedButton';
import { sendExportLaunched } from '../../../Utils/Analytics/EventSender';
import {
  type Build,
  buildElectron,
  getUrl,
  getBuild,
} from '../../../Utils/GDevelopServices/Build';
import UserProfileContext, {
  type UserProfile,
} from '../../../Profile/UserProfileContext';
import { Column, Line } from '../../../UI/Grid';
import { showErrorBox } from '../../../UI/Messages/MessageBox';
import { findGDJS } from '../LocalGDJSFinder';
import localFileSystem from '../LocalFileSystem';
import Progress from './Progress';
import { archiveFolder } from '../../../Utils/Archiver';
import optionalRequire from '../../../Utils/OptionalRequire.js';
import Window from '../../../Utils/Window';
import { delay } from '../../../Utils/Delay';
import CreateProfile from '../../../Profile/CreateProfile';
import LimitDisplayer from '../../../Profile/LimitDisplayer';
import { displayProjectErrorsBox, getErrors } from '../../../ProjectManager/ProjectErrorsChecker';
import { translate, type TranslatorProps } from 'react-i18next';
import { type Limit } from '../../../Utils/GDevelopServices/Usage';
const path = optionalRequire('path');
const os = optionalRequire('os');
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

const gd = global.gd;

export type LocalOnlineElectronExportStep =
  | ''
  | 'export'
  | 'compress'
  | 'upload'
  | 'waiting-for-build'
  | 'build'
  | 'done';

type State = {
  exportStep: LocalOnlineElectronExportStep,
  build: ?Build,
  uploadProgress: number,
  uploadMax: number,
  buildMax: number,
  buildProgress: number,
  errored: boolean,
};

type Props = TranslatorProps & {
  project: gdProject,
  onChangeSubscription: Function,
};

class LocalOnlineElectronExport extends Component<Props, State> {
  state = {
    exportStep: '',
    build: null,
    uploadProgress: 0,
    uploadMax: 0,
    buildProgress: 0,
    buildMax: 0,
    errored: false,
  };

  static prepareExporter = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      findGDJS(gdjsRoot => {
        if (!gdjsRoot) {
          showErrorBox('Could not find GDJS');
          return reject();
        }
        console.info('GDJS found in ', gdjsRoot);

        const fileSystem = assignIn(
          new gd.AbstractFileSystemJS(),
          localFileSystem
        );
        const exporter = new gd.Exporter(fileSystem, gdjsRoot);
        const outputDir = path.join(
          fileSystem.getTempDir(),
          'OnlineElectronExport'
        );
        fileSystem.mkDir(outputDir);
        fileSystem.clearDir(outputDir);

        resolve({
          exporter,
          outputDir,
        });
      });
    });
  };

  launchExport = (): Promise<string> => {
    const { project, t } = this.props;
    if (!project) return Promise.reject();

    return LocalOnlineElectronExport.prepareExporter()
      .then(({ exporter, outputDir }) => {
        const exportOptions = new gd.MapStringBoolean();
        exportOptions.set('exportForElectron', true);
        exporter.exportWholePixiProject(
          project,
          outputDir,
          exportOptions
        );
        exportOptions.delete();
        exporter.delete();

        return outputDir;
      })
      .catch(err => {
        showErrorBox(t('Unable to export the game'), err);
        throw err;
      });
  };

  launchCompression = (outputDir: string): Promise<string> => {
    const archiveOutputDir = os.tmpdir();
    return archiveFolder({
      path: outputDir,
      outputFilename: path.join(archiveOutputDir, 'game-archive.zip'),
    });
  };

  launchUpload = (outputFile: string): Promise<string> => {
    if (!ipcRenderer) return Promise.reject('No support for upload');

    ipcRenderer.removeAllListeners('s3-file-upload-progress');
    ipcRenderer.removeAllListeners('s3-file-upload-done');

    return new Promise((resolve, reject) => {
      ipcRenderer.on(
        's3-file-upload-progress',
        (event, uploadProgress, uploadMax) => {
          this.setState({
            uploadProgress,
            uploadMax,
          });
        }
      );
      ipcRenderer.on('s3-file-upload-done', (event, err, prefix) => {
        if (err) return reject(err);
        resolve(prefix);
      });
      ipcRenderer.send('s3-file-upload', outputFile);
    });
  };

  launchBuild = (
    userProfile: UserProfile,
    uploadBucketKey: string
  ): Promise<string> => {
    const { getAuthorizationHeader, profile } = userProfile;
    if (!profile) return Promise.reject(new Error('User is not authenticated'));

    return buildElectron(
      getAuthorizationHeader,
      profile.uid,
      uploadBucketKey
    ).then(build => {
      return build.id;
    });
  };

  pollBuild = async (
    userProfile: UserProfile,
    buildId: string
  ): Promise<Build> => {
    const { getAuthorizationHeader, profile } = userProfile;
    if (!profile) return Promise.reject(new Error('User is not authenticated'));

    try {
      let build = null;
      let tries = 0;
      const waitTime = 1000;
      const maxWaitTime = 540000; //Wait up to 9 minutes
      do {
        await delay(waitTime);
        build = await getBuild(getAuthorizationHeader, profile.uid, buildId);
        this.setState({
          build,
          buildMax: maxWaitTime,
          buildProgress: tries * waitTime,
        });
        tries += 1;
      } while (
        build &&
        build.status === 'pending' &&
        tries * waitTime < maxWaitTime
      );

      if (build.status !== 'complete') throw build;
      return build;
    } catch (err) {
      throw err;
    }
  };

  launchWholeExport = (userProfile: UserProfile) => {
    const { t, project } = this.props;
    sendExportLaunched('local-online-electron');

    if (!displayProjectErrorsBox(t, getErrors(t, project))) return;

    const handleError = (message: string) => err => {
      if (!this.state.errored) {
        this.setState({
          errored: true,
        });
        showErrorBox(message, {
          exportStep: this.state.exportStep,
          rawError: err,
        });
      }

      throw err;
    };

    this.setState({
      exportStep: 'export',
      uploadProgress: 0,
      uploadMax: 0,
      errored: false,
    });
    this.launchExport()
      .then(outputDir => {
        this.setState({
          exportStep: 'compress',
        });
        return this.launchCompression(outputDir);
      }, handleError(t('Error while exporting the game.')))
      .then(outputFile => {
        this.setState({
          exportStep: 'upload',
        });
        return this.launchUpload(outputFile);
      }, handleError(t('Error while compressing the game.')))
      .then((uploadBucketKey: string) => {
        this.setState({
          exportStep: 'waiting-for-build',
        });
        return this.launchBuild(userProfile, uploadBucketKey);
      }, handleError(t('Error while uploading the game. Check your internet connection or try again later.')))
      .then(buildId => {
        this.setState({
          exportStep: 'build',
        });

        return this.pollBuild(userProfile, buildId);
      }, handleError(t('Error while lauching the build of the game.')))
      .then(build => {
        this.setState({
          exportStep: 'done',
          build,
        });
        userProfile.onRefreshUserProfile();
      }, handleError(t('Error while building the game.')));
  };

  _downloadLogs = () => {
    const { build } = this.state;
    if (!build || !build.logsKey) return;

    Window.openExternalURL(getUrl(build.logsKey));
  };

  _downloadWindowsZip = () => {
    const { build } = this.state;
    if (!build || !build.windowsZipKey) return;

    Window.openExternalURL(getUrl(build.windowsZipKey));
  }

  _downloadWindowsExe = () => {
    const { build } = this.state;
    if (!build || !build.windowsExeKey) return;

    Window.openExternalURL(getUrl(build.windowsExeKey));
  }

  _downloadMacOSZip = () => {
    const { build } = this.state;
    if (!build || !build.macosZipKey) return;

    Window.openExternalURL(getUrl(build.macosZipKey));
  }

  _downloadLinuxAppImage = () => {
    const { build } = this.state;
    if (!build || !build.linuxAppImageKey) return;

    Window.openExternalURL(getUrl(build.linuxAppImageKey));
  }

  render() {
    const {
      exportStep,
      build,
      uploadMax,
      uploadProgress,
      buildMax,
      buildProgress,
      errored,
    } = this.state;
    const { project, t } = this.props;
    if (!project) return null;

    const getBuildLimit = (userProfile: UserProfile): ?Limit =>
      userProfile.limits ? userProfile.limits['electron-build'] : null;
    const canLaunchBuild = (userProfile: UserProfile) => {
      if (!errored && exportStep !== '' && exportStep !== 'done') return false;

      const limit: ?Limit = getBuildLimit(userProfile);
      if (limit && limit.limitReached) return false;

      return true;
    };

    return (
      <UserProfileContext.Consumer>
        {(userProfile: UserProfile) => (
          <Column noMargin>
            <Line>
              {t(
                'Your game will be exported and packaged online as an stand-alone game for Windows, Linux and macOS.'
              )}
            </Line>
            {userProfile.authenticated && (
              <Line justifyContent="center">
                <RaisedButton
                  label={t('Export')}
                  primary
                  onClick={() => this.launchWholeExport(userProfile)}
                  disabled={!canLaunchBuild(userProfile)}
                />
              </Line>
            )}
            {userProfile.authenticated && (
              <LimitDisplayer
                subscription={userProfile.subscription}
                limit={getBuildLimit(userProfile)}
                onChangeSubscription={this.props.onChangeSubscription}
              />
            )}
            {!userProfile.authenticated && (
              <CreateProfile
                message={t(
                  'Create an account to build your game for Windows, Linux and macOS in one-click:'
                )}
                onLogin={userProfile.onLogin}
              />
            )}
            <Line>
              <Progress
                exportStep={exportStep}
                downloadUrl={
                  build && build.apkKey ? getUrl(build.apkKey) : null
                }
                logsUrl={build && build.logsKey ? getUrl(build.logsKey) : null}
                onDownloadWindowsZip={this._downloadWindowsZip}
                onDownloadWindowsExe={this._downloadWindowsExe}
                onDownloadMacOSZip={this._downloadMacOSZip}
                onDownloadLinuxAppImage={this._downloadLinuxAppImage}
                onDownloadLogs={this._downloadLogs}
                uploadMax={uploadMax}
                uploadProgress={uploadProgress}
                buildMax={buildMax}
                buildProgress={buildProgress}
                errored={errored}
              />
            </Line>
          </Column>
        )}
      </UserProfileContext.Consumer>
    );
  }
}

export default translate()(LocalOnlineElectronExport);
