// @flow

import React, { Component } from 'react';
import assignIn from 'lodash/assignIn';
import RaisedButton from 'material-ui/RaisedButton';
import { sendExportLaunched } from '../../Utils/Analytics/EventSender';
import {
  buildCordovaAndroid,
  getUrl,
} from '../../Utils/GDevelopServices/Build';
import { Column, Line, Spacer } from '../../UI/Grid';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import { findGDJS } from '../LocalGDJSFinder';
import localFileSystem from '../LocalFileSystem';
import Progress from './Progress';
import { archiveFolder } from './Archiver';
import optionalRequire from '../../Utils/OptionalRequire.js';
import Window from '../../Utils/Window';
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
  | 'build'
  | 'done';

type State = {
  exportStep: LocalOnlineCordovaExportStep,
  downloadUrl: string,
  logsUrl: string,
  uploadProgress: number,
  uploadMax: number,
  errored: boolean,
};

export default class LocalOnlineCordovaExport extends Component<*, State> {
  state = {
    exportStep: '',
    downloadUrl: '',
    logsUrl: '',
    uploadProgress: 0,
    uploadMax: 0,
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

  launchBuild = (uploadBucketKey: string): Promise<Object> => {
    const { authentification } = this.props;

    //TODO: get user id
    return buildCordovaAndroid(
      authentification,
      'TODO',
      uploadBucketKey
    ).then(build => {
      const { apkKey, logsKey } = build;

      if (build.status !== 'complete') throw new Error('Build errored');
      if (!apkKey || !logsKey) {
        throw new Error('Missing artifacts');
      }

      return {
        downloadUrl: getUrl(apkKey),
        logsUrl: getUrl(logsKey),
      };
    });
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
          exportStep: 'build',
        });
        return this.launchBuild(uploadBucketKey);
      }, handleError('Error while uploading the game. Check your internet connection or try again later.'))
      .then(({ downloadUrl, logsUrl }) => {
        this.setState({
          exportStep: 'done',
          downloadUrl,
          logsUrl,
        });
      }, handleError('Error while building the game.'));
  };

  _download = () => {
    Window.openExternalURL(this.state.downloadUrl);
  }

  render() {
    const {
      exportStep,
      downloadUrl,
      logsUrl,
      uploadMax,
      uploadProgress,
    } = this.state;
    const { project } = this.props;
    if (!project) return null;

    return (
      <Column noMargin>
        <Line>
          <RaisedButton
            label="Build for Android"
            primary
            onClick={this.launchWholeExport}
          />
        </Line>
        <Line>
          <Progress
            exportStep={exportStep}
            downloadUrl={downloadUrl}
            logsUrl={logsUrl}
            onDownload={this._download}
            uploadMax={uploadMax}
            uploadProgress={uploadProgress}
          />
        </Line>
      </Column>
    );
  }
}
