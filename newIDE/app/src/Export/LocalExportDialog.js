import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { findGDJS } from './LocalGDJSFinder';
import localFileSystem from './LocalFileSystem';
import LocalFolderPicker from '../UI/LocalFolderPicker';
import assignIn from 'lodash/assignIn';
import optionalRequire from '../Utils/OptionalRequire';
const electron = optionalRequire('electron');
const shell = electron ? electron.shell : null;

const gd = global.gd;

export default class LocalExportDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      exportFinishedDialogOpen: false,
      outputDir: '',
    };
  }

  show() {
    const { project } = this.props;
    this.setState({
      open: true,
      outputDir: project ? project.getLastCompilationDirectory() : '',
    });
  }

  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  static _prepareExporter = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      findGDJS(gdjsRoot => {
        if (!gdjsRoot) {
          //TODO
          console.error('Could not find GDJS');
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

    const outputDir = this.state.outputDir;
    project.setLastCompilationDirectory(outputDir);

    LocalExportDialog._prepareExporter()
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
        /*TODO: error*/
      });
  };

  openExportFolder = () => {
    shell.openItem(this.state.outputDir);
  }

  render() {
    const { project } = this.props;
    if (!this.state.open || !project) return null;

    const actions = [
      <FlatButton
        label="Export"
        primary={true}
        onTouchTap={this.launchExport}
      />,
      <FlatButton
        label="Close"
        primary={false}
        onTouchTap={this.handleClose}
      />,
    ];

    return (
      <Dialog
        title="Export project to a standalone game"
        actions={actions}
        modal={true}
        open={this.state.open}
      >
        <LocalFolderPicker
          value={this.state.outputDir}
          defaultPath={project.getLastCompilationDirectory()}
          onChange={value => this.setState({ outputDir: value })}
        />
        <Dialog
          title="Export finished"
          actions={[
            <FlatButton
              label="Open folder"
              primary={true}
              onTouchTap={this.openExportFolder}
            />,
            <FlatButton
              label="Close"
              primary={false}
              onTouchTap={() => this.setState({
                exportFinishedDialogOpen: false,
              })}
            />
          ]}
          modal={true}
          open={this.state.exportFinishedDialogOpen}
        >
          You can now upload the game to a web hosting to play to the game.
        </Dialog>
      </Dialog>
    );
  }
}
