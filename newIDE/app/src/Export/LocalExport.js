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
import assignIn from 'lodash/assignIn';
import optionalRequire from '../Utils/OptionalRequire';
import Window from '../Utils/Window';
import { getHelpLink } from '../Utils/HelpLink';
const electron = optionalRequire('electron');
const shell = electron ? electron.shell : null;

const gd = global.gd;

export default class LocalExport extends Component {
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

    sendExportLaunched('local');

    const outputDir = this.state.outputDir;
    project.setLastCompilationDirectory(outputDir);

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

  openItchioHelp = () => {
    Window.openExternalURL(getHelpLink('/publishing/publishing-to-itch-io'));
  };

  openLearnMore = () => {
    Window.openExternalURL(getHelpLink('/publishing'));
  };

  render() {
    const { project } = this.props;
    if (!project) return null;

    return (
      <Column noMargin>
        <Line>
          This will export your game to a folder that you can then upload on a
          website or on game hosting like itch.io.
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
          modal
          open={this.state.exportFinishedDialogOpen}
        >
          <p>
            You can now upload the game to a web hosting to play to the game.
          </p>
          <RaisedButton
            fullWidth
            primary
            onClick={() => this.openItchioHelp()}
            label="Publish your game on Itch.io"
          />
          <FlatButton
            fullWidth
            onClick={() => this.openLearnMore()}
            label="Learn more about publishing"
          />
        </Dialog>
      </Column>
    );
  }
}
