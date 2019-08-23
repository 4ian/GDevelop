// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import React, { Component } from 'react';
import Divider from 'material-ui/Divider';
import LocalFolderPicker from '../UI/LocalFolderPicker';
import Text from '../UI/Text';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import { Column, Line } from '../UI/Grid';
import { findExamples } from './LocalExamplesFinder';
import optionalRequire from '../Utils/OptionalRequire.js';
import { findEmptyPath } from './LocalPathFinder';
import ExamplesList from './ExamplesList';
import { showWarningBox } from '../UI/Messages/MessageBox';
const path = optionalRequire('path');
const electron = optionalRequire('electron');
const app = electron ? electron.remote.app : null;
var fs = optionalRequire('fs-extra');

type Props = {|
  onOpen: string => void,
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

      this.props.onOpen(path.join(outputPath, exampleName + '.json'));
      sendNewGameCreated(exampleName);
    });
  };

  render() {
    return (
      <I18n>
        {({ i18n }) => (
          <Column noMargin>
            <Column>
              <Text>
                <Trans>Choose or search for an example to open:</Trans>
              </Text>
            </Column>
            <Line>
              <ExamplesList
                exampleNames={this.state.exampleNames}
                onCreateFromExample={exampleName =>
                  this.createFromExample(i18n, exampleName)
                }
              />
            </Line>
            <Divider />
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
          </Column>
        )}
      </I18n>
    );
  }
}
