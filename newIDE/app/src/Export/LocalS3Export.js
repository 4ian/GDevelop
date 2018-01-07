import React, { Component } from 'react';
import axios from 'axios';
import { sleep } from 'wait-promise';
import RaisedButton from 'material-ui/RaisedButton';
import { sendExportLaunched } from '../Utils/Analytics/EventSender';
import LocalExport from './LocalExport';
import optionalRequire from '../Utils/OptionalRequire';
import { Column, Line, Spacer } from '../UI/Grid';
import LinearProgress from 'material-ui/LinearProgress';
import { GDevelopHostingApi } from '../Utils/GDevelopServices/ApiConfigs';
import TextField from 'material-ui/TextField';
const os = optionalRequire('os');
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const shell = electron ? electron.shell : null;

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
      ipcRenderer.on('s3-folder-upload-progress', (event, uploadProgress, uploadMax) =>
        this.setState({
          uploadProgress,
          uploadMax,
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
      .then(() => //TODO: Move this to a GDevelopServices/Hosting.js file
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

    const outputDir = os.tmpdir() + '/GDS3Export';
    LocalExport.prepareExporter()
      .then(({ exporter }) => {
        const exportForCordova = false;
        exporter.exportWholePixiProject(
          project,
          outputDir,
          false,
          exportForCordova
        );
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
        console.error(err);
        /*TODO: error*/
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
        You game is available here:
        <Spacer />
        <TextField value={this.state.url} style={{ flex: 1 }} />
        <Spacer />
        <RaisedButton label="Open" primary={true} onClick={this.openURL} />
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
      uploadProgress,
      uploadMax,
      uploadDone,
      deployDone,
    } = this.state;

    return (
      <Column noMargin>
        <Line>
          This will export your game and upload it on GDevelop games hosting.
          The game will be free and available for a few days.
        </Line>
        <Line alignItems="center">
          <LinearProgress
            style={{ flex: 1 }}
            max={uploadMax}
            value={uploadProgress}
            mode={
              (exportStarted && !exportDone) || (uploadDone && !deployDone)
                ? 'indeterminate'
                : 'determinate'
            }
          />
          <Spacer />
          <RaisedButton
            label="Export and upload my game"
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
