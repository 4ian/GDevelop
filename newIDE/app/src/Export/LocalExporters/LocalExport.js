import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { sendExportLaunched } from '../../Utils/Analytics/EventSender';
import { Column, Line, Spacer } from '../../UI/Grid';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import { findGDJS } from './LocalGDJSFinder';
import localFileSystem from './LocalFileSystem';
import LocalFolderPicker from '../../UI/LocalFolderPicker';
import assignIn from 'lodash/assignIn';
import optionalRequire from '../../Utils/OptionalRequire';
import Window from '../../Utils/Window';
import { getHelpLink } from '../../Utils/HelpLink';
import AlertMessage from '../../UI/AlertMessage';
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
        const exportOptions = new gd.MapStringBoolean();
        exporter.exportWholePixiProject(project, outputDir, exportOptions);
        exportOptions.delete();
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
    if (shell) shell.openItem(this.state.outputDir);
  };

  render() {
    const { project } = this.props;
    if (!project) return null;

    return (
      <Column noMargin>
        <Line>
          <Trans>
            This will export your game to a folder that you can then upload on a
            website or on game hosting like itch.io.
          </Trans>
        </Line>
        <Line>
          <LocalFolderPicker
            type="export"
            value={this.state.outputDir}
            defaultPath={project.getLastCompilationDirectory()}
            onChange={value => this.setState({ outputDir: value })}
            fullWidth
          />
        </Line>
        <Line>
          <Spacer expand />
          <RaisedButton
            label={<Trans>Export</Trans>}
            primary={true}
            onClick={this.launchExport}
            disabled={!this.state.outputDir}
          />
        </Line>
        <Dialog
          title={<Trans>Export finished</Trans>}
          actions={[
            <FlatButton
              key="open"
              label={<Trans>Open folder</Trans>}
              primary={true}
              onClick={this.openExportFolder}
            />,
            <FlatButton
              key="close"
              label={<Trans>Close</Trans>}
              primary={false}
              onClick={() =>
                this.setState({
                  exportFinishedDialogOpen: false,
                })
              }
            />,
          ]}
          modal
          open={this.state.exportFinishedDialogOpen}
        >
          <p>
            <Trans>
              You can now upload the game to a web hosting to play to the game.
            </Trans>
          </p>
          <AlertMessage kind="warning">
            <Trans>
              Your game won't work if you open index.html on your computer. You
              must upload it to a web hosting (Kongregate, Itch.io, etc...) or a
              web server to run it.
            </Trans>
          </AlertMessage>
          <Spacer />
          <RaisedButton
            fullWidth
            primary
            onClick={() =>
              Window.openExternalURL(
                getHelpLink('/publishing/publishing-to-gamejolt-store')
              )
            }
            label={<Trans>Publish your game on Game Jolt</Trans>}
          />
          <RaisedButton
            fullWidth
            primary
            onClick={() =>
              Window.openExternalURL(
                getHelpLink('/publishing/publishing-to-kongregate-store')
              )
            }
            label={<Trans>Publish your game on Kongregate</Trans>}
          />
          <RaisedButton
            fullWidth
            primary
            onClick={() =>
              Window.openExternalURL(
                getHelpLink('/publishing/publishing-to-itch-io')
              )
            }
            label={<Trans>Publish your game on Itch.io</Trans>}
          />
          <FlatButton
            fullWidth
            onClick={() => Window.openExternalURL(getHelpLink('/publishing'))}
            label={<Trans>Learn more about publishing</Trans>}
          />
        </Dialog>
      </Column>
    );
  }
}
