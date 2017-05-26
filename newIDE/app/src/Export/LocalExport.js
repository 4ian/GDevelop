import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import { findGDJS } from './LocalGDJSFinder';
import localFileSystem from './LocalFileSystem';
import LocalFolderPicker from '../UI/LocalFolderPicker';
import assignIn from 'lodash/assignIn';
import optionalRequire from '../Utils/OptionalRequire';
const electron = optionalRequire('electron');
const shell = electron ? electron.shell : null;

const gd = global.gd;

const styles = {
  container:{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  }
}

export default class LocalExport extends Component {
  constructor(props) {
    super(props);

    this.state = {
      exportFinishedDialogOpen: false,
      outputDir: '',
    };
  }

  componentDidMount() {
    const { project } = this.props;
    this.setState({
      outputDir: project ? project.getLastCompilationDirectory() : '',
    });
  }

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

    LocalExport._prepareExporter()
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
    if (!project) return null;

    return (
      <div style={styles.container}>
        This will export your game to a folder that you can then upload on a website
        <Divider />
        <LocalFolderPicker
          value={this.state.outputDir}
          defaultPath={project.getLastCompilationDirectory()}
          onChange={value => this.setState({ outputDir: value })}
          fullWidth
        />
        <RaisedButton
          label="Export"
          primary={true}
          onTouchTap={this.launchExport}
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
      </div>
    );
  }
}
