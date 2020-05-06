// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import React, { Component } from 'react';
import Divider from '@material-ui/core/Divider';
import LocalFolderPicker from '../UI/LocalFolderPicker';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import { Column, Line } from '../UI/Grid';
import Text from '../UI/Text';
import { findExamples } from './LocalExamplesFinder';
import optionalRequire from '../Utils/OptionalRequire.js';
import { findEmptyPath } from './LocalPathFinder';
import ExamplesList from './ExamplesList';
import { showWarningBox } from '../UI/Messages/MessageBox';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';
import LocalFileStorageProvider from '../ProjectsStorage/LocalFileStorageProvider';
const path = optionalRequire('path');
const electron = optionalRequire('electron');
const app = electron ? electron.remote.app : null;
var fs = optionalRequire('fs-extra');

// To add a new example, add it first in resources/examples (at which point you can see it
// in the desktop version), then run these scripts:
// * scripts/update-examples-information-from-resources-examples.js (update metadata)
// * scripts/update-fixtures-from-resources-examples.js (update web-app examples)
// and upload the examples to `gdevelop-resources` s3.

type Props = {|
  onOpen: (
    storageProvider: StorageProvider,
    fileMetadata: FileMetadata
  ) => void,
  onExamplesLoaded: () => void,
|};

type State = {|
  outputPath: string,
  exampleNames: ?Array<string>,
|};

export const showGameFileCreationError = (
  i18n: I18nType,
  outputPath: string,
  error: Error
) => {
  showWarningBox(
    i18n._(
      t`Unable to create the game in the specified folder. Check that you have permissions to write in this folder: ${outputPath} or choose another folder.`
    ),
    error
  );
};

export default class LocalExamples extends Component<Props, State> {
  state = {
    outputPath: findEmptyPath(
      path && app
        ? path.join(app.getPath('documents'), 'GDevelop projects')
        : ''
    ),
    exampleNames: null,
  };

  componentDidMount() {
    findExamples(examplesPath => {
      fs.readdir(examplesPath, (error, exampleNames) => {
        if (error) {
          console.error('Unable to read examples:', error);
          return;
        }

        this.setState(
          {
            exampleNames: exampleNames.filter(name => name !== '.DS_Store'),
          },
          () => this.props.onExamplesLoaded()
        );
      });
    });
  }

  _handleChangePath = (outputPath: string) =>
    this.setState({
      outputPath,
    });

  createFromExample = (i18n: I18nType, exampleName: string) => {
    const { outputPath } = this.state;
    if (!fs || !outputPath) return;

    findExamples(examplesPath => {
      try {
        fs.mkdirsSync(outputPath);
        fs.copySync(path.join(examplesPath, exampleName), outputPath);
      } catch (error) {
        showGameFileCreationError(i18n, outputPath, error);
        return;
      }

      this.props.onOpen(LocalFileStorageProvider, {
        fileIdentifier: path.join(outputPath, exampleName + '.json'),
      });
      sendNewGameCreated(exampleName);
    });
  };

  render() {
    return (
      <I18n>
        {({ i18n }) => (
          <Column noMargin>
            <Line expand>
              <Column expand>
                <LocalFolderPicker
                  fullWidth
                  value={this.state.outputPath}
                  onChange={this._handleChangePath}
                  type="create-game"
                />
              </Column>
            </Line>
            <Divider />
            <Line>
              <Column>
                <Text>
                  <Trans>Choose or search for an example to open:</Trans>
                </Text>
              </Column>
            </Line>
            <Line>
              <ExamplesList
                exampleNames={this.state.exampleNames}
                onCreateFromExample={exampleName =>
                  this.createFromExample(i18n, exampleName)
                }
              />
            </Line>
          </Column>
        )}
      </I18n>
    );
  }
}
