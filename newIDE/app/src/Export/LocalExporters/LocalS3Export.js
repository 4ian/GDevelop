import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import axios from 'axios';
import { sleep } from 'wait-promise';
import RaisedButton from '../../UI/RaisedButton';
import { sendExportLaunched } from '../../Utils/Analytics/EventSender';
import optionalRequire from '../../Utils/OptionalRequire';
import { Column, Line, Spacer } from '../../UI/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import { GDevelopHostingApi } from '../../Utils/GDevelopServices/ApiConfigs';
import { makeTimestampedId } from '../../Utils/TimestampedId';
import TextField from '../../UI/TextField';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import Text from '../../UI/Text';
import { findGDJS } from './LocalGDJSFinder';
import localFileSystem from './LocalFileSystem';
import assignIn from 'lodash/assignIn';
const os = optionalRequire('os');
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const shell = electron ? electron.shell : null;
const gd = global.gd;

export default class LocalS3Export extends Component {
  constructor(props) {
    super(props);

    this.state = {
      exportStarted: false,
      exportDone: false,
      uploadDone: false,
      deployDone: false,
    };
  }

  _uploadToS3 = localDir => {
    ipcRenderer.removeAllListeners('s3-folder-upload-progress');
    ipcRenderer.removeAllListeners('s3-folder-upload-done');

    return new Promise((resolve, reject) => {
      ipcRenderer.on(
        's3-folder-upload-progress',
        (event, stepCurrentProgress, stepMaxProgress) =>
          this.setState({
            stepCurrentProgress,
            stepMaxProgress,
          })
      );
      ipcRenderer.on('s3-folder-upload-done', (event, err, prefix) => {
        if (err) return reject(err);

        this.setState({
          uploadDone: true,
        });
        resolve(prefix);
      });
      ipcRenderer.send('s3-folder-upload', localDir);
    });
  };

  _deploy = prefix => {
    return sleep(200)
      .then(() =>
        //TODO: Move this to a GDevelopServices/Hosting.js file
        axios(GDevelopHostingApi.deployEndpoint, {
          method: 'post',
          params: {
            name: prefix,
          },
        })
      )
      .then(response => {
        this.setState({
          deployDone: true,
        });
        return response.data.deployedPrefix;
      });
  };

  prepareExporter = (): Promise<PreparedExporter> => {
    return findGDJS().then(({ gdjsRoot }) => {
      console.info('GDJS found in ', gdjsRoot);

      // TODO: Memory leak? Check for other exporters too.
      const fileSystem = assignIn(
        new gd.AbstractFileSystemJS(),
        localFileSystem
      );
      const exporter = new gd.Exporter(fileSystem, gdjsRoot);

      return {
        exporter,
      };
    });
  };

  launchExport = () => {
    const { project } = this.props;
    if (!project) return;

    sendExportLaunched('s3');
    this.setState({
      exportStarted: true,
      exportDone: false,
      uploadDone: false,
      deployDone: false,
    });

    const outputDir = os.tmpdir() + '/GDS3Export-' + makeTimestampedId();
    this.prepareExporter()
      .then(({ exporter }) => {
        const exportOptions = new gd.MapStringBoolean();
        exporter.exportWholePixiProject(project, outputDir, exportOptions);
        exportOptions.delete();
        exporter.delete();

        this.setState({
          exportDone: true,
        });
      })
      .then(() => this._uploadToS3(outputDir))
      .then(uploadPrefix => this._deploy(uploadPrefix))
      .then(deployPrefix => {
        //TODO: Move this to a function getURL in a GDevelopServices/Hosting.js file.
        this.setState({
          url: `${GDevelopHostingApi.gamesHost}/${deployPrefix}`,
        });
      })
      .catch(err => {
        showErrorBox(
          'An error occured while exporting the game online. Please check your internet connection and try again.',
          err
        );
      })
      .then(() =>
        this.setState({
          exportStarted: false,
        })
      );
  };

  openURL = () => {
    shell.openExternal(this.state.url);
  };

  renderUrl = () => {
    return (
      <Line alignItems="baseline">
        <Trans>You game is available here:</Trans>
        <Spacer />
        <TextField value={this.state.url} style={{ flex: 1 }} />
        <Spacer />
        <RaisedButton
          label={<Trans>Open</Trans>}
          primary={true}
          onClick={this.openURL}
        />
      </Line>
    );
  };

  render() {
    const { project } = this.props;
    if (!project) return null;

    const {
      url,
      exportStarted,
      exportDone,
      stepCurrentProgress,
      stepMaxProgress,
      uploadDone,
      deployDone,
    } = this.state;

    return (
      <Column noMargin>
        <Line>
          <Text>
            <Trans>
              This will export your game and upload it on GDevelop games
              hosting. The game will be free and available for a few days.
            </Trans>
          </Text>
        </Line>
        <Line alignItems="center">
          <LinearProgress
            style={{ flex: 1 }}
            value={
              stepMaxProgress > 0
                ? (stepCurrentProgress / stepMaxProgress) * 100
                : 0
            }
            variant={
              (exportStarted && !exportDone) || (uploadDone && !deployDone)
                ? 'indeterminate'
                : 'determinate'
            }
          />
          <Spacer />
          <RaisedButton
            label={<Trans>Export and upload my game</Trans>}
            primary={true}
            onClick={this.launchExport}
            disabled={exportStarted}
          />
        </Line>
        {!!url && this.renderUrl()}
      </Column>
    );
  }
}
