// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import PublishIcon from '@material-ui/icons/Publish';

import { ExampleStore } from '../AssetStore/ExampleStore';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { Tabs, Tab } from '../UI/Tabs';
import { TutorialsList } from '../Tutorial';
import { Column } from '../UI/Grid';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';
import { GamesShowcase } from '../GamesShowcase';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import Window from '../Utils/Window';
import ProjectPreCreationDialog from './ProjectPreCreationDialog';

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

export type ProjectCreationSettings = {|
  projectName: string,
  outputPath?: string,
|};

export type OnCreateBlankFunction = ({|
  i18n: I18nType,
  settings: ProjectCreationSettings,
|}) => Promise<?{|
  project: gdProject,
  storageProvider: ?StorageProvider,
  projectName?: string,
  fileMetadata: ?FileMetadata,
|}>;

export type OnCreateFromExampleShortHeaderFunction = ({|
  i18n: I18nType,
  exampleShortHeader: ExampleShortHeader,
  settings: ProjectCreationSettings,
|}) => Promise<?{|
  storageProvider: StorageProvider,
  projectName: string,
  fileMetadata: FileMetadata,
|}>;

type Props = {|
  ...CreateProjectDialogWithComponentsProps,
  onCreateBlank: OnCreateBlankFunction,
  onCreateFromExampleShortHeader: OnCreateFromExampleShortHeaderFunction,
|};

const CreateProjectDialog = ({
  open,
  onClose,
  onOpen,
  onCreateFromExampleShortHeader,
  onCreateBlank,
  initialTab,
}: Props) => {
  const [currentTab, setCurrentTab] = React.useState<CreateProjectDialogTabs>(
    initialTab
  );
  const [isOpening, setIsOpening] = React.useState<boolean>(false);
  const [
    selectedExampleShortHeader,
    setSelectedExampleShortShortHeader,
  ] = React.useState<?ExampleShortHeader>(null);
  const [
    preCreationDialogOpen,
    setPreCreationDialogOpen,
  ] = React.useState<boolean>(false);

  const actions = React.useMemo(
    () => [
      <DialogPrimaryButton
        key="create-blank"
        label={<Trans>Create a blank project</Trans>}
        primary={false}
        onClick={() => setPreCreationDialogOpen(true)}
      />,
      <FlatButton
        key="close"
        label={<Trans>Close</Trans>}
        primary={false}
        onClick={onClose}
      />,
    ],
    [onClose, setPreCreationDialogOpen]
  );

  const secondaryActions = React.useMemo(
    () => {
      if (currentTab === 'games-showcase')
        return [
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
          />,
        ];
      if (currentTab === 'examples')
        return [
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
          />,
        ];
    },
    [currentTab]
  );

  if (!open) return null;

  const createProject = async (
    i18n: I18nType,
    settings: ProjectCreationSettings
  ) => {
    setIsOpening(true);

    try {
      let projectMetadata;

      if (selectedExampleShortHeader) {
        projectMetadata = await onCreateFromExampleShortHeader({
          i18n,
          exampleShortHeader: selectedExampleShortHeader,
          settings,
        });
      } else {
        projectMetadata = await onCreateBlank({
          i18n,
          settings,
        });
      }

      if (!projectMetadata) return;

      setPreCreationDialogOpen(false);
      setSelectedExampleShortShortHeader(null);
      onOpen({ ...projectMetadata });
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Dialog
            title={<Trans>Create a new project</Trans>}
            actions={actions}
            secondaryActions={secondaryActions}
            onRequestClose={onClose}
            onApply={() => setPreCreationDialogOpen(true)}
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
                <Tab
                  label={<Trans>Games showcase</Trans>}
                  value="games-showcase"
                />
              </Tabs>
              {currentTab === 'examples' && (
                <Column noMargin expand useFullHeight>
                  <ExampleStore
                    focusOnMount
                    isOpening={isOpening}
                    onOpen={async (example: ?ExampleShortHeader) => {
                      setSelectedExampleShortShortHeader(example);
                      setPreCreationDialogOpen(true);
                    }}
                  />
                </Column>
              )}
              {currentTab === 'tutorials' && <TutorialsList />}
              {currentTab === 'games-showcase' && <GamesShowcase />}
            </Column>
          </Dialog>
          {preCreationDialogOpen && (
            <ProjectPreCreationDialog
              open
              isOpening={isOpening}
              onClose={() => setPreCreationDialogOpen(false)}
              onCreate={projectName => createProject(i18n, projectName)}
            />
          )}
        </>
      )}
    </I18n>
  );
};

export default CreateProjectDialog;
