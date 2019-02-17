// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import assignIn from 'lodash/assignIn';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import { sendExportLaunched } from '../../../Utils/Analytics/EventSender';
import {
  type Build,
  buildElectron,
  getUrl,
} from '../../../Utils/GDevelopServices/Build';
import UserProfileContext, {
  type UserProfile,
} from '../../../Profile/UserProfileContext';
import { Column, Line } from '../../../UI/Grid';
import { showErrorBox } from '../../../UI/Messages/MessageBox';
import { findGDJS } from '../LocalGDJSFinder';
import localFileSystem from '../LocalFileSystem';
import { archiveFolder } from '../../../Utils/Archiver';
import optionalRequire from '../../../Utils/OptionalRequire.js';
import Window from '../../../Utils/Window';
import CreateProfile from '../../../Profile/CreateProfile';
import LimitDisplayer from '../../../Profile/LimitDisplayer';
import {
  displayProjectErrorsBox,
  getErrors,
} from '../../../ProjectManager/ProjectErrorsChecker';
import { type Limit } from '../../../Utils/GDevelopServices/Usage';
import { type TargetName } from '../../../Utils/GDevelopServices/Build';
import BuildsWatcher from '../../Builds/BuildsWatcher';
import BuildStepsProgress, {
  type BuildStep,
} from '../../Builds/BuildStepsProgress';
const path = optionalRequire('path');
const os = optionalRequire('os');
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const gd = global.gd;

type State = {
  exportStep: BuildStep,
  build: ?Build,
  uploadProgress: number,
  uploadMax: number,
  errored: boolean,
  targets: Array<TargetName>,
};

type Props = {
  project: gdProject,
  onChangeSubscription: Function,
};

class LocalOnlineElectronExport extends Component<Props, State> {
  state = {
    exportStep: '',
    build: null,
    uploadProgress: 0,
    uploadMax: 0,
    errored: false,
    targets: ['winExe'],
  };
  buildsWatcher = new BuildsWatcher();

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

  componentWillUnmount() {
    this.buildsWatcher.stop();
  }

  launchExport = (): Promise<string> => {
    const t = str => str; //TODO
    const { project } = this.props;
    if (!project) return Promise.reject();

    return LocalOnlineElectronExport.prepareExporter()
      .then(({ exporter, outputDir }) => {
        const exportOptions = new gd.MapStringBoolean();
        exportOptions.set('exportForElectron', true);
        exporter.exportWholePixiProject(project, outputDir, exportOptions);
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
  ): Promise<Build> => {
    const { getAuthorizationHeader, profile } = userProfile;
    if (!profile) return Promise.reject(new Error('User is not authenticated'));

    return buildElectron(
      getAuthorizationHeader,
      profile.uid,
      uploadBucketKey,
      this.state.targets
    );
  };

  startBuildWatch = (userProfile: UserProfile) => {
    if (!this.state.build) return;

    this.buildsWatcher.start({
      userProfile,
      builds: [this.state.build],
      onBuildUpdated: (build: Build) => this.setState({ build }),
    });
  };

  launchWholeExport = (userProfile: UserProfile) => {
    const t = str => str; //TODO;
    const { project } = this.props;
    sendExportLaunched('local-online-electron');

    if (!displayProjectErrorsBox(t, getErrors(t, project))) return;

    const handleError = (message: string) => err => {
      if (!this.state.errored) {
        this.setState({
          errored: true,
        });
        showErrorBox(message + (err.message ? `\n${err.message}` : ''), {
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
      build: null,
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
      .then(build => {
        this.setState(
          {
            build,
            exportStep: 'build',
          },
          () => {
            this.startBuildWatch(userProfile);
          }
        );
      }, handleError(t('Error while lauching the build of the game.')));
  };

  _download = (key: string) => {
    if (!this.state.build || !this.state.build[key]) return;

    Window.openExternalURL(getUrl(this.state.build[key]));
  };

  _setTarget = (targetName: TargetName, enable: boolean) => {
    if (enable && this.state.targets.indexOf(targetName) === -1) {
      this.setState({
        targets: [...this.state.targets, targetName],
      });
    } else if (!enable && this.state.targets.indexOf(targetName) !== -1) {
      this.setState({
        targets: this.state.targets.filter(name => name !== targetName),
      });
    }
  };

  render() {
    const {
      exportStep,
      build,
      uploadMax,
      uploadProgress,
      errored,
    } = this.state;
    const t = str => str; //TODO;
    const { project } = this.props;
    if (!project) return null;

    const getBuildLimit = (userProfile: UserProfile): ?Limit =>
      userProfile.limits ? userProfile.limits['electron-build'] : null;
    const canLaunchBuild = (userProfile: UserProfile) => {
      if (!errored && exportStep !== '' && exportStep !== 'build') return false;

      const limit: ?Limit = getBuildLimit(userProfile);
      if (limit && limit.limitReached) return false;

      if (!this.state.targets.length) return false;

      return true;
    };

    return (
      <UserProfileContext.Consumer>
        {(userProfile: UserProfile) => (
          <Column noMargin>
            <Line>
              {t(
                'Your game will be exported and packaged online as an stand-alone game for Windows, Linux and/or macOS.'
              )}
            </Line>
            <Checkbox
              label={<Trans>Windows (zip file)</Trans>}
              checked={this.state.targets.indexOf('winZip') !== -1}
              onCheck={(e, checked) => this._setTarget('winZip', checked)}
            />
            <Checkbox
              label={<Trans>Windows (auto-installer file)</Trans>}
              checked={this.state.targets.indexOf('winExe') !== -1}
              onCheck={(e, checked) => this._setTarget('winExe', checked)}
            />
            <Checkbox
              label={<Trans>macOS (zip file)</Trans>}
              checked={this.state.targets.indexOf('macZip') !== -1}
              onCheck={(e, checked) => this._setTarget('macZip', checked)}
            />
            <Checkbox
              label={<Trans>Linux (AppImage)</Trans>}
              checked={this.state.targets.indexOf('linuxAppImage') !== -1}
              onCheck={(e, checked) =>
                this._setTarget('linuxAppImage', checked)
              }
            />
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
            <Line expand>
              <BuildStepsProgress
                exportStep={exportStep}
                build={build}
                onDownload={this._download}
                uploadMax={uploadMax}
                uploadProgress={uploadProgress}
                errored={errored}
                showSeeAllMyBuildsExplanation
              />
            </Line>
          </Column>
        )}
      </UserProfileContext.Consumer>
    );
  }
}

export default LocalOnlineElectronExport;
