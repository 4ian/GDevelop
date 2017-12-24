import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { sendExportLaunched } from '../Utils/Analytics/EventSender';
import { Column, Line, Spacer } from '../UI/Grid';
import { showErrorBox } from '../UI/Messages/MessageBox';
import { findGDJS } from './LocalGDJSFinder';
import localFileSystem from './LocalFileSystem';
import LocalFolderPicker from '../UI/LocalFolderPicker';
import HelpButton from '../UI/HelpButton';
import assignIn from 'lodash/assignIn';
import optionalRequire from '../Utils/OptionalRequire';
import Window from '../Utils/Window';
const electron = optionalRequire('electron');
const shell = electron ? electron.shell : null;

const gd = global.gd;

export default class LocalCordovaExport extends Component {
  state = {
    exportFinishedDialogOpen: false,
    outputDir: '',
  };

  componentDidMount() {
    const { project } = this.props;
    this.setState({
      outputDir: project ? project.getLastCompilationDirectory() : '',
    });
  }

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
        });
      });
    });
  };

  launchExport = () => {
    const { project } = this.props;
    if (!project) return;

    sendExportLaunched('local-cordova');

    const outputDir = this.state.outputDir;
    project.setLastCompilationDirectory(outputDir);

    LocalCordovaExport.prepareExporter()
      .then(({ exporter }) => {
        const exportForCordova = true;
        exporter.exportWholePixiProject(
          project,
          outputDir,
          false,
          exportForCordova
        );
        exporter.delete();
        this.setState({
          exportFinishedDialogOpen: true,
        });
      })
      .catch(err => {
        showErrorBox('Unable to export the game', err);
      });
  };

  openExportFolder = () => {
    shell.openItem(this.state.outputDir);
  };

  openPhoneGapBuild = () => {
    Window.openExternalURL('https://build.phonegap.com');
  };

  render() {
    const { project } = this.props;
    if (!project) return null;

    return (
      <Column noMargin>
        <Line>
          <Column noMargin>
            <p>
              This will export your game as a Cordova project. Cordova is a
              technology that enables HTML5 games to be packaged for <b>iOS</b>,{' '}
              <b>Android</b> and more.
            </p>
            <p>
              Third-party tools like <b>Adobe PhoneGap Build</b> allow game
              developers to bundle their games using Cordova.
            </p>
          </Column>
        </Line>
        <Line>
          <LocalFolderPicker
            value={this.state.outputDir}
            defaultPath={project.getLastCompilationDirectory()}
            onChange={value => this.setState({ outputDir: value })}
            fullWidth
          />
        </Line>
        <Line>
          <Spacer expand />
          <RaisedButton
            label="Export"
            primary={true}
            onClick={this.launchExport}
            disabled={!this.state.outputDir}
          />
        </Line>
        <Dialog
          title="Export finished"
          actions={[
            <FlatButton
              key="open"
              label="Open folder"
              primary={true}
              onClick={this.openExportFolder}
            />,
            <FlatButton
              key="close"
              label="Close"
              primary={false}
              onClick={() =>
                this.setState({
                  exportFinishedDialogOpen: false,
                })}
            />,
          ]}
          secondaryActions={
            <HelpButton key="help" helpPagePath="/publishing" />
          }
          modal
          open={this.state.exportFinishedDialogOpen}
        >
          <p>
            You can now compress and upload the game to <b>PhoneGap Build</b>{' '}
            which will compile it for you to an iOS and Android app.
          </p>
          <p>
            You can also compile the game by yourself using Cordova command-line
            tool to iOS (XCode is required) or Android (Android SDK is
            required).
          </p>
          <RaisedButton
            fullWidth
            primary
            onClick={() => this.openPhoneGapBuild()}
            label="Open PhoneGap Build"
          />
        </Dialog>
      </Column>
    );
  }
}
