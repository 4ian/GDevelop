// @flow

import React, { Component } from 'react';
import assignIn from 'lodash/assignIn';
import RaisedButton from 'material-ui/RaisedButton';
import { sendExportLaunched } from '../../Utils/Analytics/EventSender';
import {
  type Build,
  buildCordovaAndroid,
  getUrl,
  getBuild,
} from '../../Utils/GDevelopServices/Build';
import {
  withUserProfile,
  type WithUserProfileProps,
} from '../../Profile/UserProfileContainer';
import { Column, Line } from '../../UI/Grid';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import { findGDJS } from '../LocalGDJSFinder';
import localFileSystem from '../LocalFileSystem';
import Progress from './Progress';
import { archiveFolder } from './Archiver';
import optionalRequire from '../../Utils/OptionalRequire.js';
import Window from '../../Utils/Window';
import { delay } from '../../Utils/Delay';
import CreateProfile from '../../Profile/CreateProfile';
import LimitDisplayer from '../../Profile/LimitDisplayer';
const path = optionalRequire('path');
const os = optionalRequire('os');
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

const gd = global.gd;

export type LocalOnlineCordovaExportStep =
  | ''
  | 'export'
  | 'compress'
  | 'upload'
  | 'waiting-for-build'
  | 'build'
  | 'done';

type State = {
  exportStep: LocalOnlineCordovaExportStep,
  build: ?Build,
  uploadProgress: number,
  uploadMax: number,
  buildMax: number,
  buildProgress: number,
  errored: boolean,
};

type Props = WithUserProfileProps & {
  project: gdProject,
};

class LocalOnlineCordovaExport extends Component<Props, State> {
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
          'OnlineCordovaExport'
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
    const { project } = this.props;
    if (!project) return Promise.reject();

    return LocalOnlineCordovaExport.prepareExporter()
      .then(({ exporter, outputDir }) => {
        const exportForCordova = true;
        exporter.exportWholePixiProject(
          project,
          outputDir,
          false,
          exportForCordova
        );
        exporter.delete();

        return outputDir;
      })
      .catch(err => {
        showErrorBox('Unable to export the game', err);
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

  launchBuild = (uploadBucketKey: string): Promise<string> => {
    const { authentification, profile } = this.props;
    if (!profile || !authentification) return Promise.reject();

    return buildCordovaAndroid(
      authentification,
      profile.sub,
      uploadBucketKey
    ).then(build => {
      return build.id;
    });
  };

  pollBuild = async (buildId: string): Promise<Build> => {
    const { authentification, profile } = this.props;
    if (!profile || !authentification) return Promise.reject();

    try {
      let build = null;
      let tries = 0;
      const waitTime = 1000;
      const maxWaitTime = 100000;
      do {
        await delay(waitTime);
        build = await getBuild(authentification, profile.sub, buildId);
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

  launchWholeExport = () => {
    sendExportLaunched('local-online-cordova');

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
      }, handleError('Error while exporting the game.'))
      .then(outputFile => {
        this.setState({
          exportStep: 'upload',
        });
        return this.launchUpload(outputFile);
      }, handleError('Error while compressing the game.'))
      .then((uploadBucketKey: string) => {
        this.setState({
          exportStep: 'waiting-for-build',
        });
        return this.launchBuild(uploadBucketKey);
      }, handleError('Error while uploading the game. Check your internet connection or try again later.'))
      .then(buildId => {
        this.setState({
          exportStep: 'build',
        });

        return this.pollBuild(buildId);
      }, handleError('Error while lauching for the build of the game.'))
      .then(build => {
        this.setState({
          exportStep: 'done',
          build,
        });
        this.props.onRefreshUserProfile();
      }, handleError('Error while building the game.'));
  };

  _download = () => {
    const { build } = this.state;
    if (!build || !build.apkKey) return;

    Window.openExternalURL(getUrl(build.apkKey));
  };

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
    const {
      project,
      authenticated,
      onLogin,
      subscription,
      limits,
    } = this.props;
    if (!project) return null;

    const buildLimit = limits ? limits['cordova-build'] : null;
    const disableBuild =
      (!errored && exportStep !== '' && exportStep !== 'done') ||
      (buildLimit && buildLimit.limitReached);

    return (
      <Column noMargin>
        <Line>
          Packaging your game for Android will create an APK file that can be
          installed on Android phones, based on Cordova framework.
        </Line>
        {authenticated && (
          <Line justifyContent="center">
            <RaisedButton
              label="Package for Android"
              primary
              onClick={this.launchWholeExport}
              disabled={disableBuild}
            />
          </Line>
        )}
        {authenticated && (
          <LimitDisplayer
            subscription={subscription}
            limit={buildLimit}
            onChangeSubscription={() => console.log('TODO')}
          />
        )}
        {!authenticated && (
          <CreateProfile
            message="Create an account to build your game for Android in one-click:"
            onLogin={onLogin}
          />
        )}
        <Line>
          <Progress
            exportStep={exportStep}
            downloadUrl={build && build.apkKey ? getUrl(build.apkKey) : null}
            logsUrl={build && build.logsKey ? getUrl(build.logsKey) : null}
            onDownload={this._download}
            uploadMax={uploadMax}
            uploadProgress={uploadProgress}
            buildMax={buildMax}
            buildProgress={buildProgress}
            errored={errored}
          />
        </Line>
      </Column>
    );
  }
}

export default withUserProfile({ fetchLimits: true, fetchSubscription: true })(
  LocalOnlineCordovaExport
);
