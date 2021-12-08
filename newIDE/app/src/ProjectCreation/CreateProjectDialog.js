// @flow
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { Tabs, Tab } from '../UI/Tabs';
import { TutorialsList } from '../Tutorial';
import { Column } from '../UI/Grid';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';
import { GamesShowcase } from '../GamesShowcase';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import Window from '../Utils/Window';
import PublishIcon from '@material-ui/icons/Publish';
import { findEmptyPath } from './LocalPathFinder';
import optionalRequire from '../Utils/OptionalRequire.js';
const path = optionalRequire('path');
const electron = optionalRequire('electron');
const app = electron ? electron.remote.app : null;

export type CreateProjectDialogTabs =
  | 'examples'
  | 'tutorials'
  | 'games-showcase';

type State = {|
  currentTab: CreateProjectDialogTabs,
  outputPath: string,
|};

export type CreateProjectDialogWithComponentsProps = {|
  open: boolean,
  onClose: () => void,
  onOpen: (
    storageProvider: StorageProvider,
    fileMetadata: FileMetadata
  ) => Promise<void>,
  initialTab: CreateProjectDialogTabs,
|};

export type OnCreateBlankFunction = ({|
  i18n: I18nType,
  outputPath?: string,
|}) => Promise<?{|
  project: gdProject,
  storageProvider: ?StorageProvider,
  fileMetadata: ?FileMetadata,
|}>;

export type OnCreateFromExampleShortHeaderFunction = ({|
  i18n: I18nType,
  exampleShortHeader: ExampleShortHeader,
  outputPath?: string,
|}) => Promise<?{|
  storageProvider: StorageProvider,
  fileMetadata: FileMetadata,
|}>;

type Props = {|
  ...CreateProjectDialogWithComponentsProps,
  examplesComponent: any,
  onCreateFromExampleShortHeader: OnCreateFromExampleShortHeaderFunction,
|};

export default class CreateProjectDialog extends React.Component<Props, State> {
  state = {
    currentTab: this.props.initialTab,
    outputPath: app
      ? findEmptyPath(path.join(app.getPath('documents'), 'GDevelop projects'))
      : '',
  };

  _onChangeTab = (newTab: CreateProjectDialogTabs) => {
    this.setState({
      currentTab: newTab,
    });
  };

  _showExamples = () => this._onChangeTab('examples');

  render() {
    const {
      open,
      onClose,
      onOpen,
      onCreateFromExampleShortHeader,
    } = this.props;
    if (!open) return null;

    const ExamplesComponent = this.props.examplesComponent;

    return (
      <Dialog
        title={<Trans>Create a new project</Trans>}
        actions={[
          <FlatButton
            key="close"
            label={<Trans>Close</Trans>}
            primary={false}
            onClick={onClose}
          />,
        ]}
        secondaryActions={[
          this.state.currentTab === 'games-showcase' ? (
            <FlatButton
              key="submit-game-showcase"
              onClick={() => {
                Window.openExternalURL(
                  'https://docs.google.com/forms/d/e/1FAIpQLSfjiOnkbODuPifSGuzxYY61vB5kyMWdTZSSqkJsv3H6ePRTQA/viewform?usp=sf_link'
                );
              }}
              primary
              icon={<PublishIcon />}
              label={<Trans>Submit your game to the showcase</Trans>}
            />
          ) : null,
          this.state.currentTab === 'examples' ? (
            <FlatButton
              key="submit-example"
              onClick={() => {
                Window.openExternalURL(
                  'https://github.com/GDevelopApp/GDevelop-examples/issues/new/choose'
                );
              }}
              primary
              icon={<PublishIcon />}
              label={<Trans>Submit your project as an example</Trans>}
            />
          ) : null,
        ]}
        cannotBeDismissed={false}
        onRequestClose={onClose}
        open={open}
        noMargin
        fullHeight
        flexBody
      >
        <Column expand noMargin>
          <Tabs value={this.state.currentTab} onChange={this._onChangeTab}>
            <Tab label={<Trans>Examples</Trans>} value="examples" />
            <Tab label={<Trans>Tutorials</Trans>} value="tutorials" />
            <Tab label={<Trans>Games showcase</Trans>} value="games-showcase" />
          </Tabs>
          {this.state.currentTab === 'examples' && (
            <ExamplesComponent
              onOpen={onOpen}
              onChangeOutputPath={outputPath => this.setState({ outputPath })}
              outputPath={this.state.outputPath}
              onCreateFromExampleShortHeader={onCreateFromExampleShortHeader}
            />
          )}
          {this.state.currentTab === 'tutorials' && <TutorialsList />}
          {this.state.currentTab === 'games-showcase' && <GamesShowcase />}
        </Column>
      </Dialog>
    );
  }
}
