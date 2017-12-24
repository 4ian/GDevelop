import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';
import { sendExportLaunched } from '../Utils/Analytics/EventSender';
import { Column, Line, Spacer } from '../UI/Grid';
import HelpButton from '../UI/HelpButton';
import { showErrorBox } from '../UI/Messages/MessageBox';
import { findGDJS } from './LocalGDJSFinder';
import localFileSystem from './LocalFileSystem';
import LocalFolderPicker from '../UI/LocalFolderPicker';
import assignIn from 'lodash/assignIn';
import optionalRequire from '../Utils/OptionalRequire';
const electron = optionalRequire('electron');
const shell = electron ? electron.shell : null;

const gd = global.gd;

export default class LocalCocos2dExport extends Component {
  state = {
    exportFinishedDialogOpen: false,
    outputDir: '',
    debugMode: false,
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

    sendExportLaunched('local-cocos2d');

    const { outputDir, debugMode } = this.state;
    project.setLastCompilationDirectory(outputDir);

    LocalCocos2dExport.prepareExporter()
      .then(({ exporter }) => {
        exporter.exportWholeCocos2dProject(project, debugMode, outputDir);
        exporter.delete();
        this.setState({
          exportFinishedDialogOpen: true,
        });
      })
      .catch(err => {
        showErrorBox('Unable to export the game with Cocos2d-JS', err);
      });
  };

  openExportFolder = () => {
    shell.openItem(this.state.outputDir);
  };

  render() {
    const { project } = this.props;
    if (!project) return null;

    return (
      <Column noMargin>
        <Line>
          This will export your game using Cocos2d-JS game engine. The game can
          be compiled for Android or iOS if you install Cocos2d-JS developer
          tools.
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
          <Toggle
            onToggle={(e, check) =>
              this.setState({
                debugMode: check,
              })}
            toggled={this.state.debugMode}
            labelPosition="right"
            label="Debug mode (show FPS counter and stats in the bottom left)"
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
          You can now upload the game to a web hosting or use Cocos2d-JS command
          line tools to export it to other platforms like iOS (XCode is
          required) or Android (Android SDK is required).
        </Dialog>
      </Column>
    );
  }
}
