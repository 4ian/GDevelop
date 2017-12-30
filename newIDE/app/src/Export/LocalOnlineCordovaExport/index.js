// @flow

import React, { Component } from 'react';
import assignIn from 'lodash/assignIn';
import RaisedButton from 'material-ui/RaisedButton';
import { sendExportLaunched } from '../../Utils/Analytics/EventSender';
import { Column, Line, Spacer } from '../../UI/Grid';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import { findGDJS } from '../LocalGDJSFinder';
import localFileSystem from '../LocalFileSystem';
import Progress from './Progress';
import { archiveFolder } from './Archiver';
import optionalRequire from '../../Utils/OptionalRequire.js';
const path = optionalRequire('path');
const os = optionalRequire('os');

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
};

export default class LocalOnlineCordovaExport extends Component<*, State> {
  state = {
    exportStep: '',
    downloadUrl: '',
    logsUrl: '',
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

        resolve({
          exporter,
          outputDir: path.join(fileSystem.getTempDir(), 'OnlineCordovaExport'),
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

  launchUpload = (exportDir: string): Promise<string> => {
    return Promise.resolve('TODO');
  };

  launchBuild = (uploadBucketKey: string): Promise<Object> => {
    return Promise.resolve({
      downloadUrl: 'http://test.com',
      logsUrl: 'http://test.com/logs',
    });
  };

  launchWholeExport = () => {
    sendExportLaunched('local-online-cordova');

    this.setState({
      exportStep: 'export',
    });
    this.launchExport()
      .then(outputDir => {
        this.setState({
          exportStep: 'compress',
        });
        return this.launchCompression(outputDir);
      })
      .then(outputFile => {
        this.setState({
          exportStep: 'upload',
        });
        return this.launchUpload(outputFile);
      })
      .then((uploadBucketKey: string) => {
        this.setState({
          exportStep: 'build',
        });
        return this.launchBuild(uploadBucketKey);
      })
      .then(({ downloadUrl, logsUrl }) => {
        this.setState({
          exportStep: 'done',
          downloadUrl,
          logsUrl,
        });
      });
  };

  render() {
    const { exportStep, downloadUrl, logsUrl } = this.state;
    const { project } = this.props;
    if (!project) return null;

    return (
      <Column noMargin>
        <Line>
          <Spacer expand />
          <RaisedButton
            label="Build for Android"
            primary={true}
            onClick={this.launchWholeExport}
          />
        </Line>
        <Line>
          <Progress
            exportStep={exportStep}
            downloadUrl={downloadUrl}
            logsUrl={logsUrl}
          />
        </Line>
      </Column>
    );
  }
}
