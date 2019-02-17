// @flow

import React, { Component } from 'react';
import assignIn from 'lodash/assignIn';
import RaisedButton from 'material-ui/RaisedButton';
import { sendExportLaunched } from '../../../Utils/Analytics/EventSender';
import { Column, Line, Spacer } from '../../../UI/Grid';
import LocalFilePicker from '../../../UI/LocalFilePicker';
import { showErrorBox } from '../../../UI/Messages/MessageBox';
import { findGDJS } from '../LocalGDJSFinder';
import localFileSystem from '../LocalFileSystem';
import Progress from './Progress';
import { archiveFolder } from '../../../Utils/Archiver';
import optionalRequire from '../../../Utils/OptionalRequire.js';
import Window from '../../../Utils/Window';
import { getHelpLink } from '../../../Utils/HelpLink';
const path = optionalRequire('path');
const electron = optionalRequire('electron');
const app = electron ? electron.remote.app : null;
const shell = electron ? electron.shell : null;

const gd = global.gd;

export type LocalFacebookInstantGamesExportStep =
  | ''
  | 'export'
  | 'compress'
  | 'done';

type State = {|
  archiveOutputFilename: string,
  exportStep: LocalFacebookInstantGamesExportStep,
  errored: boolean,
|};

type Props = {
  project: gdProject,
  onChangeSubscription: Function,
};

class LocalFacebookInstantGamesExport extends Component<Props, State> {
  state = {
    archiveOutputFilename: app
      ? path.join(app.getPath('documents'), 'fb-instant-game.zip')
      : '',
    exportStep: '',
    errored: false,
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
        const outputDir = path.join(
          fileSystem.getTempDir(),
          'FacebookInstantGamesExport'
        );
        fileSystem.mkDir(outputDir);
        fileSystem.clearDir(outputDir);

        resolve({
          exporter,
          outputDir,
        });
      });
    });
  };

  launchExport = (): Promise<string> => {
    const t = str => str; //TODO;
    const { project } = this.props;
    if (!project) return Promise.reject();

    return LocalFacebookInstantGamesExport.prepareExporter()
      .then(({ exporter, outputDir }) => {
        const exportOptions = new gd.MapStringBoolean();
        exportOptions.set('exportForFacebookInstantGames', true);
        exporter.exportWholePixiProject(project, outputDir, exportOptions);
        exportOptions.delete();
        exporter.delete();

        return outputDir;
      })
      .catch(err => {
        showErrorBox(t('Unable to export the game'), err);
        throw err;
      });
  };

  launchCompression = (outputDir: string): Promise<string> => {
    return archiveFolder({
      path: outputDir,
      outputFilename: this.state.archiveOutputFilename,
    });
  };

  launchWholeExport = () => {
    const t = str => str; //TODO
    sendExportLaunched('local-facebook-instant-games');

    const handleError = (message: string) => err => {
      if (!this.state.errored) {
        this.setState({
          errored: true,
        });
        showErrorBox(message, {
          exportStep: this.state.exportStep,
          rawError: err,
        });
      }

      throw err;
    };

    this.setState({
      exportStep: 'export',
      errored: false,
    });
    this.launchExport()
      .then(outputDir => {
        this.setState({
          exportStep: 'compress',
        });
        return this.launchCompression(outputDir);
      }, handleError(t('Error while exporting the game.')))
      .then(() => {
        this.setState({
          exportStep: 'done',
        });
      }, handleError(t('Error while building the game.')));
  };

  openExportFolder = () => {
    if (shell) shell.openItem(path.dirname(this.state.archiveOutputFilename));
  };

  openLearnMore = () => {
    Window.openExternalURL(
      getHelpLink('/publishing/publishing-to-facebook-instant-games')
    );
  };

  render() {
    const { exportStep, errored } = this.state;
    const t = str => str; //TODO;
    const { project } = this.props;
    if (!project) return null;

    return (
      <Column noMargin>
        <Line>
          {t(
            'Prepare your game for Facebook Instant Games so that it can be play on Facebook Messenger. GDevelop will create a compressed file that you can upload on your Facebook Developer account.'
          )}
        </Line>
        <Line>
          <LocalFilePicker
            title={t('Facebook Instant Games export zip file')}
            message={t(
              'Choose where to save the exported file for Facebook Instant Games'
            )}
            filters={[
              {
                name: t('Compressed file for Facebook Instant Games'),
                extensions: ['zip'],
              },
            ]}
            value={this.state.archiveOutputFilename}
            defaultPath={app ? app.getPath('documents') : ''}
            onChange={value => this.setState({ archiveOutputFilename: value })}
            fullWidth
          />
        </Line>
        <Line>
          <Spacer expand />
          <RaisedButton
            label={t('Export')}
            primary
            onClick={this.launchWholeExport}
            disabled={!this.state.archiveOutputFilename}
          />
        </Line>
        <Line>
          <Progress
            exportStep={exportStep}
            errored={errored}
            onOpenExportFolder={this.openExportFolder}
            onOpenLearnMore={this.openLearnMore}
          />
        </Line>
      </Column>
    );
  }
}

export default LocalFacebookInstantGamesExport;
