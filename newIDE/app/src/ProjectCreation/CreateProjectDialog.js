// @flow
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import PublishIcon from '@material-ui/icons/Publish';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { Tabs, Tab } from '../UI/Tabs';
import { TutorialsList } from '../Tutorial';
import { Column } from '../UI/Grid';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';
import { GamesShowcase } from '../GamesShowcase';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import Window from '../Utils/Window';
import { findEmptyPathInDefaultFolder } from './LocalPathFinder';
import optionalRequire from '../Utils/OptionalRequire.js';
import RaisedButton from '../UI/RaisedButton';
const electron = optionalRequire('electron');
const app = electron ? electron.remote.app : null;

export type CreateProjectDialogTabs =
  | 'examples'
  | 'tutorials'
  | 'games-showcase';

export type OnOpenProjectAfterCreationFunction = ({|
  project?: gdProject,
  storageProvider: ?StorageProvider,
  fileMetadata: ?FileMetadata,
  projectName?: string,
  shouldCloseDialog?: boolean,
|}) => Promise<void>;

export type CreateProjectDialogWithComponentsProps = {|
  open: boolean,
  onClose: () => void,
  onOpen: OnOpenProjectAfterCreationFunction,
  initialTab: CreateProjectDialogTabs,
|};

export type OnCreateBlankFunction = ({|
  i18n: I18nType,
  projectName: string,
  outputPath?: string,
|}) => Promise<?{|
  project: gdProject,
  storageProvider: ?StorageProvider,
  projectName?: string,
  fileMetadata: ?FileMetadata,
|}>;

export type OnCreateFromExampleShortHeaderFunction = ({|
  i18n: I18nType,
  exampleShortHeader: ExampleShortHeader,
  projectName: string,
  outputPath?: string,
|}) => Promise<?{|
  storageProvider: StorageProvider,
  projectName: string,
  fileMetadata: FileMetadata,
|}>;

type Props = {|
  ...CreateProjectDialogWithComponentsProps,
  examplesComponent: any,
  onCreateFromExampleShortHeader: OnCreateFromExampleShortHeaderFunction,
|};

const CreateProjectDialog = ({
  open,
  onClose,
  onOpen,
  onCreateFromExampleShortHeader,
  initialTab,
  examplesComponent: ExamplesComponent,
}: Props) => {
  const [currentTab, setCurrentTab] = React.useState<CreateProjectDialogTabs>(
    initialTab
  );
  const [outputPath, setOutputPath] = React.useState<string>(
    app ? findEmptyPathInDefaultFolder(app) : ''
  );

  if (!open) return null;

  return (
    <Dialog
      title={<Trans>Create a new project</Trans>}
      actions={[
        <RaisedButton
          key="create-blank"
          label={<Trans>Create a blank project</Trans>}
          primary={false}
          onClick={() => console.log('salut')}
        />,
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary={false}
          onClick={onClose}
        />,
      ]}
      secondaryActions={[
        currentTab === 'games-showcase' ? (
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
        currentTab === 'examples' ? (
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
        <Tabs
          value={currentTab}
          onChange={(newTab: CreateProjectDialogTabs) => {
            setCurrentTab(newTab);
          }}
        >
          <Tab label={<Trans>Examples</Trans>} value="examples" />
          <Tab label={<Trans>Tutorials</Trans>} value="tutorials" />
          <Tab label={<Trans>Games showcase</Trans>} value="games-showcase" />
        </Tabs>
        {currentTab === 'examples' && (
          <ExamplesComponent
            onOpen={onOpen}
            onChangeOutputPath={outputPath => setOutputPath(outputPath)}
            outputPath={outputPath}
            onCreateFromExampleShortHeader={onCreateFromExampleShortHeader}
          />
        )}
        {currentTab === 'tutorials' && <TutorialsList />}
        {currentTab === 'games-showcase' && <GamesShowcase />}
      </Column>
    </Dialog>
  );
};

export default CreateProjectDialog;
