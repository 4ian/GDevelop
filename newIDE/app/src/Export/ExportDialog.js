import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import nodeFileSystem from './NodeFileSystem';
import assignIn from 'lodash/assignIn';
const gd = global.gd;

export default class ExportDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };
  }

  show() {
    this.setState({
      open: true,
    });
  }

  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  launchExport = () => {
    const { project } = this.props;
    if (!project) return;

    const fileSystem = assignIn(new gd.AbstractFileSystemJS(), nodeFileSystem);
    const outputDir = '/Users/florian/desktop/testexport';
    const gdjsRoot = '/Users/florian/Projects/F/GD/Binaries/Output/Release_Darwin/JsPlatform';
    const exportForCordova = false;
    const exporter = new gd.Exporter(
      fileSystem,
      gdjsRoot,
    );
    exporter.exportWholePixiProject(
      project,
      outputDir,
      false,
      exportForCordova
    );
    console.log(exporter.getLastError());
    exporter.delete();
  };

  render() {
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
      />
    );
  }
}
